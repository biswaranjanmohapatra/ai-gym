import { Client } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_UG4HoQgDAX9e@ep-purple-lab-a4gydfgm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
  const client = new Client({ connectionString });
  console.log("Attempting to connect to Neon...");
  try {
    await client.connect();
    console.log("SUCCESS: Connected to Neon database!");
    const res = await client.query('SELECT NOW()');
    console.log("Database time:", res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error("FAILURE: Could not connect to Neon.");
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);
    if (err.message.includes("whitelisted")) {
      console.log("\n--- DIAGNOSIS ---");
      console.log("Your IP is likely blocked by Neon's IP Allowlist.");
    }
  }
}

testConnection();
