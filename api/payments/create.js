import { Client } from 'pg';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    res.status(400).json({ error: 'Missing paymentId' });
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Query payment, project, and user profile details
    const query = `
      SELECT 
        p.id as payment_id,
        p.amount,
        p.description,
        proj.name as project_name,
        prof.name as user_name,
        u.email as user_email
      FROM public.payments p
      JOIN public.projects proj ON p.project_id = proj.id
      JOIN public.profiles prof ON proj.user_id = prof.id
      JOIN auth.users u ON prof.id = u.id
      WHERE p.id = $1
    `;

    const dbRes = await client.query(query, [paymentId]);

    if (dbRes.rows.length === 0) {
      res.status(404).json({ error: 'Payment or profile not found' });
      return;
    }

    const { amount, description, project_name, user_name, user_email } = dbRes.rows[0];

    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      res.status(500).json({ error: 'Mercado Pago access token not configured' });
      return;
    }

    // Determine back URLs dynamically using request host
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Create Mercado Pago Preference
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: paymentId,
            title: `${project_name} - ${description}`,
            quantity: 1,
            unit_price: Number(amount),
            currency_id: 'BRL'
          }
        ],
        payer: {
          name: user_name,
          email: user_email
        },
        back_urls: {
          success: `${baseUrl}/painel/pagamentos?success=true`,
          failure: `${baseUrl}/painel/pagamentos?failure=true`,
          pending: `${baseUrl}/painel/pagamentos?pending=true`
        },
        auto_return: 'approved',
        external_reference: paymentId,
        // The webhook URL should point back to this same host
        notification_url: `${baseUrl}/api/payments/webhook`
      })
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago API error:', mpData);
      res.status(mpRes.status).json({ error: 'Error creating Mercado Pago preference', details: mpData });
      return;
    }

    // Return the link to checkout
    res.status(200).json({ initPoint: mpData.init_point });
  } catch (err) {
    console.error('Unexpected error in create payment endpoint:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await client.end();
  }
}
