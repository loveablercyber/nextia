const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UHdNgQhyRdK17n0t@db.yyytinalsavikewukfxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sqlQueries = [
  // ─── Profiles Table ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    company TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    avatar_initials TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // ─── Handle New User Trigger Function ──────────────────────────────────────
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, name, company, phone, role, avatar_initials)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'company', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
      COALESCE(NEW.raw_user_meta_data->>'avatar_initials', 'US')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  // ─── Trigger Definition ────────────────────────────────────────────────────
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,

  // ─── Projects Table ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template TEXT,
    segment TEXT,
    status TEXT DEFAULT 'aguardando-briefing',
    plan TEXT DEFAULT 'Pro',
    site_url TEXT,
    preview_url TEXT,
    domain TEXT,
    monthly_fee NUMERIC DEFAULT 0,
    activation_fee NUMERIC DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    progress_percent INT DEFAULT 0,
    requests_remaining INT DEFAULT 5,
    requests_total INT DEFAULT 5
  );`,

  // ─── Milestones Table ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em-andamento', 'concluido')),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_at TIMESTAMP WITH TIME ZONE
  );`,

  // ─── Files Table ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size TEXT,
    type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by TEXT,
    url TEXT
  );`,

  // ─── Change Requests Table ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em-andamento', 'concluido', 'cancelado')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta')),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
  );`,

  // ─── Payments Table ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'atrasado')),
    type TEXT CHECK (type IN ('ativacao', 'mensalidade')),
    invoice_url TEXT
  );`,

  // ─── Quotes Table (Orçamentos) ─────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_type TEXT,
    segment TEXT,
    pages INT DEFAULT 1,
    features TEXT[],
    has_identity BOOLEAN DEFAULT false,
    urgency TEXT,
    budget_range TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_company TEXT,
    estimated_min NUMERIC,
    estimated_max NUMERIC,
    recommended_plan TEXT,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em-analise', 'respondido', 'contratado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // ════════════════════════════════════════════════════════════════════════════
  // ─── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  // ── Enable RLS on all tables ──
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;`,

  // ── Helper function: Check if current user is admin ──
  `CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
  $$ LANGUAGE sql SECURITY DEFINER;`,

  // ── Profiles Policies ──
  `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;`,
  `CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);`,

  `DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;`,
  `CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);`,

  `DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;`,
  `CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());`,

  // ── Projects Policies ──
  `DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;`,
  `CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);`,

  `DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;`,
  `CREATE POLICY "Admins can view all projects" ON public.projects
    FOR SELECT USING (public.is_admin());`,

  `DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;`,
  `CREATE POLICY "Admins can update projects" ON public.projects
    FOR UPDATE USING (public.is_admin());`,

  `DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;`,
  `CREATE POLICY "Admins can insert projects" ON public.projects
    FOR INSERT WITH CHECK (public.is_admin());`,

  // ── Milestones Policies ──
  `DROP POLICY IF EXISTS "Users can view own project milestones" ON public.milestones;`,
  `CREATE POLICY "Users can view own project milestones" ON public.milestones
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Admins can manage milestones" ON public.milestones;`,
  `CREATE POLICY "Admins can manage milestones" ON public.milestones
    FOR ALL USING (public.is_admin());`,

  // ── Files Policies ──
  `DROP POLICY IF EXISTS "Users can view own project files" ON public.files;`,
  `CREATE POLICY "Users can view own project files" ON public.files
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Users can insert files on own projects" ON public.files;`,
  `CREATE POLICY "Users can insert files on own projects" ON public.files
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Admins can manage files" ON public.files;`,
  `CREATE POLICY "Admins can manage files" ON public.files
    FOR ALL USING (public.is_admin());`,

  // ── Change Requests Policies ──
  `DROP POLICY IF EXISTS "Users can view own change requests" ON public.change_requests;`,
  `CREATE POLICY "Users can view own change requests" ON public.change_requests
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = change_requests.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Users can create change requests on own projects" ON public.change_requests;`,
  `CREATE POLICY "Users can create change requests on own projects" ON public.change_requests
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = change_requests.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Admins can manage change requests" ON public.change_requests;`,
  `CREATE POLICY "Admins can manage change requests" ON public.change_requests
    FOR ALL USING (public.is_admin());`,

  // ── Payments Policies ──
  `DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;`,
  `CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = payments.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;`,
  `CREATE POLICY "Users can update own payments" ON public.payments
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.projects WHERE projects.id = payments.project_id AND projects.user_id = auth.uid())
    );`,

  `DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;`,
  `CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin());`,

  // ── Quotes Policies ──
  `DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;`,
  `CREATE POLICY "Anyone can insert quotes" ON public.quotes
    FOR INSERT WITH CHECK (true);`,

  `DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;`,
  `CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id);`,

  `DROP POLICY IF EXISTS "Admins can manage quotes" ON public.quotes;`,
  `CREATE POLICY "Admins can manage quotes" ON public.quotes
    FOR ALL USING (public.is_admin());`
];

async function runSetup() {
  try {
    console.log('🔌 Connecting to Supabase Database...');
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

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Migration complete! ✅ ${success} succeeded, ❌ ${errors} failed`);
    console.log(`${'═'.repeat(60)}`);
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
