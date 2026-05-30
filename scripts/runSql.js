const token = process.env.SUPABASE_TOKEN;
const projectRef = "veiqszialzcmuoxbtabd";
const query = process.argv[2];

if (!query) {
  console.error("Please provide a SQL query as an argument.");
  process.exit(1);
}

async function run() {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("Error executing SQL:", json);
      process.exit(1);
    }

    console.log("Result:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Failed to run SQL:", err);
    process.exit(1);
  }
}

run();
