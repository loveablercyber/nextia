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
    // 1. Verify requester using Supabase Auth
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
    const requesterEmail = authUser.email;

    await dbClient.connect();
    await dbClient.query('BEGIN');

    // 2. Automatically link any guest tickets matching the user's email that have no user_id associated
    if (requesterEmail) {
      await dbClient.query(
        'UPDATE public.support_tickets SET user_id = $1 WHERE email = $2 AND user_id IS NULL',
        [requesterId, requesterEmail]
      );
    }

    // 3. Select all tickets linked to this user
    const ticketsRes = await dbClient.query(
      'SELECT id, subject, status, created_at, resolved_at FROM public.support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [requesterId]
    );

    await dbClient.query('COMMIT');

    res.status(200).json({
      tickets: ticketsRes.rows
    });
  } catch (err) {
    console.error('Error listing tickets:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
