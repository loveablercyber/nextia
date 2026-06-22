const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UHdNgQhyRdK17n0t@db.yyytinalsavikewukfxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    
    const queries = [
      "SELECT decrypted_secret, name FROM vault.decrypted_secrets LIMIT 10",
      "SELECT rolname, rolconfig FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'service_role')",
      "SELECT current_setting('request.jwt.claims', true) as claims",
      "SELECT current_setting('app.settings.jwt_secret', true) as jwt_secret",
    ];
    
    for (const q of queries) {
      try {
        const result = await client.query(q);
        console.log(`\n--- ${q.substring(0, 60)} ---`);
        console.log(JSON.stringify(result.rows, null, 2));
      } catch (err) {
        console.log(`\n--- ${q.substring(0, 60)} ---`);
        console.log(`ERROR: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

main();
