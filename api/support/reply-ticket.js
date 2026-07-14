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

  const { ticketId, message, token } = req.body;

  if (!ticketId || !message) {
    res.status(400).json({ error: 'Missing required parameters: ticketId and message' });
    return;
  }

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await dbClient.connect();

    // 1. Fetch ticket details for authorization check
    const ticketRes = await dbClient.query(
      'SELECT user_id, guest_token, name, status FROM public.support_tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketRes.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const ticket = ticketRes.rows[0];

    // 2. Access control verification
    let isAuthorized = false;
    let senderRole = 'client';
    let senderName = ticket.name; // Fallback to guest ticket name

    if (token && ticket.guest_token === token) {
      isAuthorized = true;
    } else {
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

              const profileRes = await dbClient.query(
                "SELECT name, role FROM public.profiles WHERE id = $1",
                [requesterId]
              );

              if (profileRes.rows.length > 0) {
                const profile = profileRes.rows[0];
                senderName = profile.name || ticket.name;

                if (profile.role === 'admin') {
                  isAuthorized = true;
                  senderRole = 'admin';
                } else if (ticket.user_id === requesterId) {
                  isAuthorized = true;
                  senderRole = 'client';
                }
              }
            }
          } catch (authErr) {
            console.error('Failed to verify token in reply-ticket:', authErr);
          }
        }
      }
    }

    if (!isAuthorized) {
      res.status(403).json({ error: 'Access denied: unauthorized to reply to this ticket' });
      return;
    }

    await dbClient.query('BEGIN');

    // 3. Insert reply message
    const insertMsgQuery = `
      INSERT INTO public.ticket_messages (ticket_id, sender_role, message, sender_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, sender_role, message, created_at, sender_name
    `;
    const msgRes = await dbClient.query(insertMsgQuery, [ticketId, senderRole, message, senderName]);

    // 4. Update ticket status
    // If admin replies, change status to 'respondido'
    // If client replies, reset status to 'aberto' so admin knows it requires attention
    const newStatus = senderRole === 'admin' ? 'respondido' : 'aberto';
    await dbClient.query(
      'UPDATE public.support_tickets SET status = $1 WHERE id = $2',
      [newStatus, ticketId]
    );

    await dbClient.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: msgRes.rows[0]
    });
  } catch (err) {
    console.error('Error replying to ticket:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
