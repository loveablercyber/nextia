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

  const { ticketId, status } = req.body;

  if (!ticketId || !status) {
    res.status(400).json({ error: 'Missing required parameters: ticketId and status' });
    return;
  }

  const validStatuses = ['aberto', 'respondido', 'fechado'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
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

    // 3. Update the ticket status
    const resolvedAt = status === 'fechado' ? 'NOW()' : 'NULL';
    const updateQuery = `
      UPDATE public.support_tickets 
      SET status = $1, resolved_at = ${resolvedAt}
      WHERE id = $2
    `;
    await dbClient.query(updateQuery, [status, ticketId]);

    res.status(200).json({ status: 'success', message: 'Ticket status updated successfully' });
  } catch (err) {
    console.error('Error updating support ticket status:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
