import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL or DIRECT_URL environment variable is missing in .env.local");
  console.error("Please configure it in .env.local as: DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres");
  process.exit(1);
}

async function run() {
  console.log("Connecting to database...");
  const client = new Client({
    connectionString,
    ssl: connectionString.includes("supabase.co") ? { rejectUnauthorized: false } : false,
  });
  await client.connect();

  try {
    // 1. Create migration table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations_history (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Query already applied migrations
    const { rows } = await client.query("SELECT name FROM _migrations_history");
    const applied = new Set(rows.map((r) => r.name));

    // 3. Scan core migrations
    const coreDir = path.join(__dirname, "../db/migrations/core");
    const coreFiles = fs.readdirSync(coreDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => ({ name: `core/${f}`, path: path.join(coreDir, f) }));

    // 4. Scan custom migrations
    const customDir = path.join(__dirname, "../db/migrations/custom");
    const customFiles = fs.readdirSync(customDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => ({ name: `custom/${f}`, path: path.join(customDir, f) }));

    const allMigrations = [...coreFiles, ...customFiles];
    let appliedCount = 0;

    for (const migration of allMigrations) {
      if (applied.has(migration.name)) {
        continue;
      }

      console.log(`Applying migration: ${migration.name}...`);
      const sql = fs.readFileSync(migration.path, "utf8");

      // Begin transaction
      await client.query("BEGIN");
      try {
        // Execute the migration SQL
        await client.query(sql);
        // Record successful execution
        await client.query("INSERT INTO _migrations_history (name) VALUES ($1)", [migration.name]);
        await client.query("COMMIT");
        console.log(`✓ Migration ${migration.name} applied successfully.`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`✗ Failed to apply migration ${migration.name}:`);
        console.error(err.message);
        process.exit(1);
      }
    }

    if (appliedCount === 0) {
      console.log("No pending database migrations found. Database is up to date.");
    } else {
      console.log(`✓ Completed applying ${appliedCount} migration(s).`);
    }
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
