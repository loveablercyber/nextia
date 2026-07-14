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

  if (req.method !== 'POST') {
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
    // 1. Verify requester session using Supabase Auth
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

    // 2. Verify requester is admin
    const adminCheckRes = await dbClient.query(
      "SELECT role FROM public.profiles WHERE id = $1",
      [requesterId]
    );

    if (adminCheckRes.rows.length === 0 || adminCheckRes.rows[0].role !== 'admin') {
      res.status(403).json({ error: 'Access denied: administrator role required' });
      return;
    }

    const { type, id } = req.body;

    if (!type || !id) {
      res.status(400).json({ error: 'Missing required parameters: type and id' });
      return;
    }

    // Start transaction
    await dbClient.query('BEGIN');

    let deleteQuery = '';
    let queryParams = [id];

    switch (type) {
      case 'client':
        // Cascade delete on profiles, projects, payments, change_requests, etc.
        // is automatic because of "ON DELETE CASCADE" in profiles -> auth.users.
        // We delete from auth.users directly.
        deleteQuery = 'DELETE FROM auth.users WHERE id = $1';
        break;
      case 'project':
        // Cascade delete milestones, change_requests, payments, files.
        deleteQuery = 'DELETE FROM public.projects WHERE id = $1';
        break;
      case 'quote':
        deleteQuery = 'DELETE FROM public.quotes WHERE id = $1';
        break;
      case 'payment':
        deleteQuery = 'DELETE FROM public.payments WHERE id = $1';
        break;
      default:
        res.status(400).json({ error: `Invalid item type: ${type}` });
        await dbClient.query('ROLLBACK');
        return;
    }

    const dbRes = await dbClient.query(deleteQuery, queryParams);

    await dbClient.query('COMMIT');
    res.status(200).json({ status: 'success', message: `${type} removed successfully`, rowsAffected: dbRes.rowCount });
  } catch (err) {
    console.error('Error executing delete action:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
