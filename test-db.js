// test-db.js
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:l2V4wMMXZq3mgMgx@db.kjichykwvfhbomfhdtax.supabase.co:5432/postgres",
});

async function test() {
  try {
    await client.connect();
    console.log("✅ Connexió establerta amb èxit!");
    await client.end();
  } catch (err) {
    console.error("❌ Error de connexió:", err.message);
  }
}

test();