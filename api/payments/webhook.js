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

  // Always return 200 to Mercado Pago requests to acknowledge receipt quickly
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const queryParams = req.query || {};

  const type = body.type || queryParams.type;
  const resourceId = (body.data && body.data.id) || queryParams['data.id'];

  // If it's not a payment event or doesn't have an ID, we just acknowledge receipt (for test webhooks)
  if (type !== 'payment' || !resourceId) {
    res.status(200).json({ status: 'ignored' });
    return;
  }

  const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!mpAccessToken) {
    res.status(500).json({ error: 'Mercado Pago access token not configured' });
    return;
  }

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Fetch payment details from Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });

    if (!mpRes.ok) {
      const errData = await mpRes.json();
      console.error(`Error fetching payment ${resourceId} from Mercado Pago:`, errData);
      res.status(mpRes.status).json({ error: 'Error fetching payment details from Mercado Pago' });
      return;
    }

    const mpPayment = await mpRes.json();
    const { status, external_reference: paymentId } = mpPayment;

    // We only process approved payments
    if (status !== 'approved' || !paymentId) {
      res.status(200).json({ status: 'not_approved_or_no_reference', mpStatus: status });
      return;
    }

    await dbClient.connect();

    // Start database transaction
    await dbClient.query('BEGIN');

    // Check payment status first to avoid duplicate notifications/actions
    const checkQuery = 'SELECT status, description, project_id FROM public.payments WHERE id = $1';
    const checkRes = await dbClient.query(checkQuery, [paymentId]);

    if (checkRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      res.status(404).json({ error: 'Matching payment not found in local database' });
      return;
    }

    const currentPayment = checkRes.rows[0];

    // If already marked as paid, just succeed
    if (currentPayment.status === 'pago') {
      await dbClient.query('COMMIT');
      res.status(200).json({ status: 'already_paid' });
      return;
    }

    // Update payment status to paid
    const updatePaymentQuery = `
      UPDATE public.payments 
      SET status = 'pago', paid_at = NOW(), invoice_url = '#' 
      WHERE id = $1
    `;
    await dbClient.query(updatePaymentQuery, [paymentId]);

    // Retrieve client user_id and client name from database
    const detailsQuery = `
      SELECT proj.user_id, prof.name as client_name
      FROM public.projects proj
      JOIN public.profiles prof ON proj.user_id = prof.id
      WHERE proj.id = $1
    `;
    const detailsRes = await dbClient.query(detailsQuery, [currentPayment.project_id]);
    const { user_id, client_name } = detailsRes.rows[0];

    // Send notification to the client
    const clientNotificationQuery = `
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
    `;
    await dbClient.query(clientNotificationQuery, [
      user_id,
      'Pagamento confirmado',
      `O pagamento da fatura "${currentPayment.description}" foi processado com sucesso.`,
      'payment'
    ]);

    // Fetch all admins
    const adminsRes = await dbClient.query("SELECT id FROM public.profiles WHERE role = 'admin'");
    const adminIds = adminsRes.rows.map((row) => row.id);

    // Send notifications to admins
    if (adminIds.length > 0) {
      for (const adminId of adminIds) {
        await dbClient.query(clientNotificationQuery, [
          adminId,
          'Pagamento de fatura recebido',
          `O cliente ${client_name || 'Desconhecido'} realizou o pagamento da fatura "${currentPayment.description}".`,
          'payment'
        ]);
      }
    }

    await dbClient.query('COMMIT');
    res.status(200).json({ status: 'success', paymentId });
  } catch (err) {
    console.error('Unexpected error in webhook handler:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
