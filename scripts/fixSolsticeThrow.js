const token = process.env.SUPABASE_TOKEN;
const projectRef = "veiqszialzcmuoxbtabd";

async function run() {
  try {
    // 1. Fetch current product data
    const querySelect = "SELECT custom_tabs FROM products WHERE slug = 'solstice-throw';";
    const resSelect = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: querySelect })
    });
    const jsonSelect = await resSelect.json();
    if (!resSelect.ok || !jsonSelect.length) {
      console.error("Error selecting:", jsonSelect);
      process.exit(1);
    }

    let customTabs = jsonSelect[0].custom_tabs;
    if (Array.isArray(customTabs) && customTabs.length > 0) {
      // Find story tab
      const storyIndex = customTabs.findIndex(t => t.id === 'story');
      if (storyIndex !== -1) {
        customTabs[storyIndex].type = 'custom';
        customTabs[storyIndex].layout = 'split';
      }
    }

    // 2. Update product data
    const queryUpdate = `UPDATE products SET custom_tabs = '${JSON.stringify(customTabs)}' WHERE slug = 'solstice-throw';`;
    const resUpdate = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: queryUpdate })
    });
    const jsonUpdate = await resUpdate.json();
    if (!resUpdate.ok) {
      console.error("Error updating:", jsonUpdate);
      process.exit(1);
    }
    console.log("Success! Updated custom_tabs of solstice-throw in database.");
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();
