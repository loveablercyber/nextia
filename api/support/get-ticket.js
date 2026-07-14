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

  const { id, token } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing required query parameter: id' });
    return;
  }

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await dbClient.connect();

    // 1. Fetch support ticket
    const ticketRes = await dbClient.query(
      'SELECT id, name, email, phone, company, subject, message, status, created_at, resolved_at, user_id, guest_token FROM public.support_tickets WHERE id = $1',
      [id]
    );

    if (ticketRes.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const ticket = ticketRes.rows[0];

    // 2. Access control verification
    let isAuthorized = false;

    // Check if token matches guest_token
    if (token && ticket.guest_token === token) {
      isAuthorized = true;
    } else {
      // Check auth header
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const authToken = authHeader.replace('Bearer ', '');
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          try {
            const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'apikey': supabaseAnonKey
              }
            });

            if (authRes.ok) {
              const authUser = await authRes.json();
              const requesterId = authUser.id;

              // Check if requester is ticket owner
              if (ticket.user_id === requesterId) {
                isAuthorized = true;
              } else {
                // Check if requester is admin
                const adminCheckRes = await dbClient.query(
                  "SELECT role FROM public.profiles WHERE id = $1",
                  [requesterId]
                );
                if (adminCheckRes.rows.length > 0 && adminCheckRes.rows[0].role === 'admin') {
                  isAuthorized = true;
                }
              }
            }
          } catch (authErr) {
            console.error('Failed to verify token in get-ticket:', authErr);
          }
        }
      }
    }

    if (!isAuthorized) {
      res.status(403).json({ error: 'Access denied: unauthorized to view this ticket' });
      return;
    }

    // 3. Fetch ticket messages
    const messagesRes = await dbClient.query(
      'SELECT id, sender_role, message, created_at, sender_name FROM public.ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Omit guest_token in public response for security if requested by client (optional, but keep it simple)
    const { guest_token, ...clientFacingTicket } = ticket;

    res.status(200).json({
      ticket: clientFacingTicket,
      messages: messagesRes.rows
    });
  } catch (err) {
    console.error('Error fetching ticket:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
