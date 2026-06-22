const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UHdNgQhyRdK17n0t@db.yyytinalsavikewukfxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sqlQueries = [
  // ─── Notifications Table ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // ─── Enable RLS ────────────────────────────────────────────────────────────
  `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`,

  // ─── Policies ──────────────────────────────────────────────────────────────
  `DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;`,
  `CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);`,

  `DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;`,
  `CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);`,

  `DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;`,
  `CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (public.is_admin());`,

  `DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;`,
  `CREATE POLICY "Anyone can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);`
];

async function runSetup() {
  try {
    console.log('🔌 Connecting to Supabase Database to setup notifications...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    let success = 0;
    let errors = 0;

    for (let i = 0; i < sqlQueries.length; i++) {
      const label = sqlQueries[i].substring(0, 80).replace(/\n/g, ' ').trim();
      try {
        await client.query(sqlQueries[i]);
        console.log(`  ✅ [${i + 1}/${sqlQueries.length}] ${label}...`);
        success++;
      } catch (err) {
        console.error(`  ❌ [${i + 1}/${sqlQueries.length}] ${label}`);
        console.error(`     → ${err.message}`);
        errors++;
      }
    }

    console.log(`\nMigration completed! Setup ${success} statements successfully, ${errors} errors.`);
  } catch (err) {
    console.error('❌ Error executing database command:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
