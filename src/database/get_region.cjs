const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UHdNgQhyRdK17n0t@db.yyytinalsavikewukfxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    // Query some system info to identify the region or cloud
    const res = await client.query("SELECT inet_server_addr(), inet_client_addr(), version()");
    console.log('Server IP:', res.rows[0].inet_server_addr);
    console.log('Client IP:', res.rows[0].inet_client_addr);
    console.log('Version:', res.rows[0].version);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
