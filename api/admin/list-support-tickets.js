import { Client } from 'pg';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Supabase URL or Anon Key not configured' });
    return;
  }

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. Verify user identity using Supabase Auth API
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      }
    });

    if (!authRes.ok) {
      res.status(401).json({ error: 'Invalid or expired session token' });
      return;
    }

    const authUser = await authRes.json();
    const requesterId = authUser.id;

    await dbClient.connect();

    // 2. Check if the requester is an admin in profiles table
    const adminCheckRes = await dbClient.query(
      "SELECT role FROM public.profiles WHERE id = $1",
      [requesterId]
    );

    if (adminCheckRes.rows.length === 0 || adminCheckRes.rows[0].role !== 'admin') {
      res.status(403).json({ error: 'Access denied: requires administrator role' });
      return;
    }

    // 3. Fetch all support tickets
    const ticketsRes = await dbClient.query(
      'SELECT id, name, email, phone, company, subject, message, status, created_at, resolved_at, user_id FROM public.support_tickets ORDER BY created_at DESC'
    );

    res.status(200).json({
      tickets: ticketsRes.rows
    });
  } catch (err) {
    console.error('Error listing admin support tickets:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
