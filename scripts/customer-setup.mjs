import fs from "fs";
import path from "path";
import readline from "readline";
import pg from "pg";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function getGitRemote() {
  try {
    return execSync("git remote get-url origin", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function run() {
  console.log("==================================================");
  console.log("  Shree Hari Customer Store Onboarding & Setup    ");
  console.log("==================================================");
  console.log("This script configures the environment, git, and DB");
  console.log("to set up a new customer store from the Core repo.\n");

  const supabaseUrl = await question("Enter Supabase Project URL (e.g. https://xyz.supabase.co): ");
  const anonKey = await question("Enter Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY): ");
  const serviceRoleKey = await question("Enter Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY): ");
  const dbUrl = await question("Enter Supabase Database Connection String (DATABASE_URL):\n(Format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres)\n> ");
  const gitOrigin = await question("Enter New Customer Git Remote URL (leave blank to skip Git remote setup): ");

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !dbUrl) {
    console.error("\nError: All Supabase keys and database connection URL are required.");
    rl.close();
    process.exit(1);
  }

  // 1. Create .env.local file
  console.log("\n1. Writing environment configuration...");
  const envContent = `
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl.trim()}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey.trim()}"
SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey.trim()}"
DATABASE_URL="${dbUrl.trim()}"
DIRECT_URL="${dbUrl.trim()}"
`;
  fs.writeFileSync(path.join(__dirname, "../.env.local"), envContent.trim() + "\n");
  console.log("✓ Created .env.local");

  // 2. Configure Git Remotes
  console.log("\n2. Configuring Git remotes...");
  if (gitOrigin) {
    try {
      const currentOrigin = getGitRemote();
      if (currentOrigin) {
        // Check if upstream already exists, if not, rename origin to upstream
        try {
          execSync("git remote get-url upstream");
          console.log("- Upstream remote already exists.");
        } catch {
          console.log(`- Renaming current origin (${currentOrigin}) to 'upstream'...`);
          execSync("git remote rename origin upstream");
        }

        // Set the new customer repo as origin
        console.log(`- Setting 'origin' remote to ${gitOrigin}...`);
        execSync(`git remote add origin ${gitOrigin.trim()}`);
      } else {
        // Initialize git if it wasn't
        try {
          execSync("git rev-parse --is-inside-work-tree");
        } catch {
          console.log("- Initializing new Git repository...");
          execSync("git init");
        }
        console.log(`- Setting 'origin' remote to ${gitOrigin}...`);
        execSync(`git remote add origin ${gitOrigin.trim()}`);
      }
      console.log("✓ Git remotes configured successfully.");
      console.log("  - 'origin' points to the customer repo (your customizations).");
      console.log("  - 'upstream' points to the core repo (run 'git pull upstream main' to upgrade).");
    } catch (gitErr) {
      console.warn("⚠ Warning: Failed to automate Git configuration. Please check manually:", gitErr.message);
    }
  } else {
    console.log("- Skipped Git remote setup.");
  }

  // 3. Initialize Database Schemas & Migrations
  console.log("\n3. Initializing database schemas & migrations...");
  try {
    // Run the migration script
    execSync("node scripts/db-migrate.mjs", { stdio: "inherit" });
    console.log("✓ Schema migrations completed successfully.");
  } catch (migErr) {
    console.error("✗ Failed to execute database migrations.");
    rl.close();
    process.exit(1);
  }

  // 4. Populate Seed Data (Banners, Categories, Default settings)
  console.log("\n4. Seeding initial setup data...");
  const client = new Client({
    connectionString: dbUrl.trim(),
    ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    const seedsDir = path.join(__dirname, "../db/seeds");
    if (fs.existsSync(seedsDir)) {
      const seedFiles = fs.readdirSync(seedsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const seedFile of seedFiles) {
        console.log(`- Executing seed: ${seedFile}...`);
        const sql = fs.readFileSync(path.join(seedsDir, seedFile), "utf8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("COMMIT");
          console.log(`  ✓ Seeded ${seedFile}`);
        } catch (seedSqlErr) {
          await client.query("ROLLBACK");
          console.warn(`  ⚠ Warning: Seed file ${seedFile} encountered errors: ${seedSqlErr.message}`);
        }
      }
    }

    // Set default storefront cache enabled setting to true
    console.log("- Configuring default cache setting...");
    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ('storefront_cache_enabled', '"true"')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log("✓ Seeding finished successfully.");
  } catch (seedErr) {
    console.error("✗ Failed to apply seed data:", seedErr.message);
  } finally {
    await client.end();
  }

  console.log("\n==================================================");
  console.log("✓ Store onboarding setup completed successfully!  ");
  console.log("==================================================");
  console.log("Next Steps:");
  console.log("1. Run 'npm run dev' to start the development server.");
  console.log("2. Customize theme files by overriding them in: ");
  console.log("   src/themes/[theme_name]/changes/");
  console.log("==================================================\n");

  rl.close();
}

run().catch((err) => {
  console.error("Setup failed:", err);
  rl.close();
  process.exit(1);
});
