const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UHdNgQhyRdK17n0t@db.yyytinalsavikewukfxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const updateTriggerSql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_proj_id UUID;
  template_name TEXT;
  template_segment TEXT;
  monthly_price NUMERIC;
  activation_price NUMERIC;
  project_name TEXT;
BEGIN
  -- Insert profile
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

  -- Check if a template was specified in signup metadata
  template_name := NEW.raw_user_meta_data->>'template';
  
  IF template_name IS NOT NULL AND template_name <> '' THEN
    -- Extract optional other fields
    template_segment := COALESCE(NEW.raw_user_meta_data->>'segment', 'Serviços');
    monthly_price := COALESCE((NEW.raw_user_meta_data->>'monthly_fee')::NUMERIC, 79);
    activation_price := COALESCE((NEW.raw_user_meta_data->>'activation_fee')::NUMERIC, 497);
    project_name := COALESCE(NEW.raw_user_meta_data->>'company', 'Projeto ' || template_name);

    -- Insert project
    INSERT INTO public.projects (
      user_id, name, template, segment, plan, monthly_fee, activation_fee,
      status, progress_percent, requests_remaining, requests_total
    ) VALUES (
      NEW.id,
      project_name,
      template_name,
      template_segment,
      'Pro', -- Default plan
      monthly_price,
      activation_price,
      'aguardando-briefing',
      0,
      5,
      5
    ) RETURNING id INTO new_proj_id;

    -- Insert default milestones
    INSERT INTO public.milestones (project_id, title, description, status, estimated_at)
    VALUES 
      (new_proj_id, 'Briefing recebido', 'Formulário de briefing preenchido e arquivos enviados.', 'pendente', NOW() + INTERVAL '2 days'),
      (new_proj_id, 'Design aprovado', 'Wireframes e paleta de cores aprovados pelo cliente.', 'pendente', NOW() + INTERVAL '5 days'),
      (new_proj_id, 'Desenvolvimento', 'Construção do site com base no design aprovado.', 'pendente', NOW() + INTERVAL '10 days'),
      (new_proj_id, 'Revisão do cliente', 'Site enviado para revisão. Aguardando aprovação ou ajustes.', 'pendente', NOW() + INTERVAL '12 days'),
      (new_proj_id, 'Publicação', 'Publicação do site no domínio contratado.', 'pendente', NOW() + INTERVAL '15 days');

    -- Insert activation fee payment
    IF activation_price > 0 THEN
      INSERT INTO public.payments (project_id, description, amount, due_date, status, type)
      VALUES (
        new_proj_id,
        'Taxa de ativação — Plano Pro (' || template_name || ')',
        activation_price,
        NOW() + INTERVAL '3 days',
        'pendente',
        'ativacao'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function runUpdate() {
  try {
    console.log('🔌 Connecting to Supabase Database to update handle_new_user trigger...');
    await client.connect();
    console.log('✅ Connected successfully!');

    await client.query(updateTriggerSql);
    console.log('✅ Trigger function handle_new_user updated successfully!');
  } catch (err) {
    console.error('❌ Error executing database command:', err.message);
  } finally {
    await client.end();
  }
}

runUpdate();
