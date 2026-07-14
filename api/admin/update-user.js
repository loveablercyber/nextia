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
    res.status(500).json({ error: 'Supabase URL or Anon Key not configured in environment' });
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

    // 3. Extract the update parameters
    const { targetUserId, name, email, company, phone, role, password } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'Missing targetUserId' });
      return;
    }

    // Start transaction
    await dbClient.query('BEGIN');

    // 4. Update profiles table
    const updateProfileQuery = `
      UPDATE public.profiles 
      SET name = $1, email = $2, company = $3, phone = $4, role = $5 
      WHERE id = $6
    `;
    await dbClient.query(updateProfileQuery, [name, email, company, phone, role, targetUserId]);

    // 5. Update auth.users email and metadata (so it stays in sync)
    const updateAuthMetadataQuery = `
      UPDATE auth.users 
      SET 
        email = $1,
        email_confirmed_at = NOW(),
        raw_user_meta_data = jsonb_set(
          jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{name}', to_jsonb($2::text)
          ),
          '{company}', to_jsonb($3::text)
        )
      WHERE id = $4
    `;
    await dbClient.query(updateAuthMetadataQuery, [email, name, company, targetUserId]);

    // 6. Update password if provided
    if (password && password.length >= 6) {
      // Direct password update in auth.users using pgcrypto's crypt
      // Note: We use public.crypt or crypt depending on schema, usually extension functions are in public schema
      const updatePasswordQuery = `
        UPDATE auth.users 
        SET encrypted_password = crypt($1, gen_salt('bf')) 
        WHERE id = $2
      `;
      await dbClient.query(updatePasswordQuery, [password, targetUserId]);
    }

    await dbClient.query('COMMIT');
    res.status(200).json({ status: 'success', message: 'Client profile updated successfully' });
  } catch (err) {
    console.error('Error updating client profile:', err);
    try {
      await dbClient.query('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    await dbClient.end();
  }
}
