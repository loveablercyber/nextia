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

  const { name, email, phone, company, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Missing required fields: name, email, subject, message' });
    return;
  }

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    let userId = null;
    const authHeader = req.headers.authorization;

    // 1. Try to verify requester session if auth header is present
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        try {
          const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': supabaseAnonKey
            }
          });

          if (authRes.ok) {
            const authUser = await authRes.json();
            userId = authUser.id;
          }
        } catch (authErr) {
          console.error('Failed to verify token in support ticket:', authErr);
        }
      }
    }

    await dbClient.connect();
    await dbClient.query('BEGIN');

    // 2. Insert support ticket
    const insertTicketQuery = `
      INSERT INTO public.support_tickets (name, email, phone, company, subject, message, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, guest_token
    `;
    const ticketRes = await dbClient.query(insertTicketQuery, [
      name,
      email,
      phone || null,
      company || null,
      subject,
      message,
      userId
    ]);

    const ticketId = ticketRes.rows[0].id;
    const guestToken = ticketRes.rows[0].guest_token;

    // 3. Insert initial message
    const insertMessageQuery = `
      INSERT INTO public.ticket_messages (ticket_id, sender_role, message, sender_name)
      VALUES ($1, 'client', $2, $3)
    `;
    await dbClient.query(insertMessageQuery, [ticketId, message, name]);

    await dbClient.query('COMMIT');

    // 4. Send email notification via Resend
    const appUrl = process.env.APP_URL || 'https://nextia.dev.br';
    const trackingLink = `${appUrl}/suporte/ticket/${ticketId}?token=${guestToken}`;
    const emailSubject = `Suporte Nextia: Chamado criado (#${ticketId.slice(0, 8)})`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eef2ff; border-radius: 12px;">
        <h2 style="color: #5B4FE9;">Olá, ${name}!</h2>
        <p>Recebemos a sua solicitação de suporte. Um chamado foi aberto para nossa equipe.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h4 style="margin-top: 0; color: #111827;">Resumo do Chamado:</h4>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Assunto:</strong> ${subject}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Mensagem:</strong> ${message}</p>
        </div>

        <p>Para acompanhar o status do atendimento e responder à nossa equipe sem precisar criar uma conta, clique no botão abaixo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${trackingLink}" style="background-color: #5B4FE9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Visualizar Chamado</a>
        </div>
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 40px;">
          Se você preferir, poderá criar uma conta com este mesmo e-mail (${email}) no futuro para unificar seu histórico de projetos e chamados.
        </p>
      </div>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Nextia Suporte <suporte@nextia.dev.br>',
            to: [email],
            subject: emailSubject,
            html: htmlContent
          })
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error('Resend API returned error:', errText);
        } else {
          console.log('Email sent successfully via Resend API.');
        }
      } catch (emailErr) {
        console.error('Failed to send email via Resend:', emailErr);
      }
    } else {
      console.log('--- MOCK EMAIL Dispatched ---');
      console.log('To:', email);
      console.log('Subject:', emailSubject);
      console.log('Link:', trackingLink);
      console.log('-----------------------------');
    }

    res.status(200).json({ status: 'success', ticketId, guestToken, trackingLink });
  } catch (err) {
    console.error('Error creating support ticket:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
