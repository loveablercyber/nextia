const { Client } = require('pg');

const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-central-1',
  'eu-central-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'me-central-1'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.yyytinalsavikewukfxn:UHdNgQhyRdK17n0t@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000 // 5s timeout
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to region ${region}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED ${region}: ${err.message}`);
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

async function run() {
  console.log('🔍 Testing regions to find the active Supabase Pooler region...');
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\n🎉 Found active region: aws-0-${region}.pooler.supabase.com`);
      break;
    }
  }
}

run();
