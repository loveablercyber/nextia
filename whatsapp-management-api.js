import { randomUUID } from 'node:crypto';
import { AutomationError, sanitizeForLog } from './automation-core.js';
import {
  configureEvolutionWebhook,evolutionQr,getEvolutionQr,getEvolutionStatus,getEvolutionWebhook,logoutEvolution,
  normalizeEvolutionStatus,normalizeWhatsAppNumber,restartEvolution,sendEvolutionText,
} from './evolution-client.js';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isWhatsAppManagementApiPath(pathname){return pathname.startsWith('/api/admin/whatsapp');}

function clean(value,max=500){return String(value??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function fail(message,status=400,code='WHATSAPP_VALIDATION_ERROR'){throw new AutomationError(message,{status,code,retryable:false});}
function uuid(value,label='Identificador'){if(!UUID.test(String(value||'')))fail(`${label} inválido.`);return String(value);}
function pageParams(url){const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit'))||30));const offset=Math.max(0,Number(url.searchParams.get('offset'))||0);return{limit,offset};}

export async function ensureWhatsAppManagementSchema(client){
  const result=await client.query("SELECT to_regclass('public.whatsapp_instances') instances,to_regclass('public.whatsapp_campaigns') campaigns");
  if(!result.rows[0]?.instances||!result.rows[0]?.campaigns){
    const error=new AutomationError('O módulo de WhatsApp ainda não foi migrado. Execute as migrations pendentes.',{status:503,code:'WHATSAPP_MIGRATION_REQUIRED'});
    throw error;
  }
}

async function audit(client,actorId,action,entityType,entityId,metadata={}){
  await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)`,
    [actorId,action,entityType,String(entityId),JSON.stringify(sanitizeForLog(metadata))]);
}

async function getInstance(client,id){
  const result=await client.query('SELECT * FROM public.whatsapp_instances WHERE id=$1',[uuid(id,'Instância')]);
  if(!result.rows[0])fail('Instância de WhatsApp não encontrada.',404,'WHATSAPP_INSTANCE_NOT_FOUND');
  return result.rows[0];
}

async function syncInstanceStatus(client,instance,data,error=null){
  const status=error?'error':normalizeEvolutionStatus(data);
  const qr=evolutionQr(data);
  const result=await client.query(`UPDATE public.whatsapp_instances SET connection_status=$2,qr_code_data=$3,
      last_connected_at=CASE WHEN $2='connected' THEN NOW() ELSE last_connected_at END,last_activity_at=NOW(),last_error=$4,updated_at=NOW()
    WHERE id=$1 RETURNING *`,[instance.id,status,status==='connected'?null:qr,error?String(error.message||error).slice(0,1000):null]);
  return result.rows[0];
}

function publicInstance(row){
  return {...row,qr_code_data:row.connection_status==='qrcode'?row.qr_code_data:null,api_url_env:row.api_url_env,api_key_env:row.api_key_env,webhook_secret_env:row.webhook_secret_env};
}

export function parseCsv(source){
  const text=String(source||'').replace(/^\uFEFF/,'');
  if(!text.trim())fail('O arquivo CSV está vazio.');
  const rows=[];let row=[];let field='';let quoted=false;
  for(let i=0;i<text.length;i+=1){const char=text[i];const next=text[i+1];
    if(char==='"'&&quoted&&next==='"'){field+='"';i+=1;continue;}
    if(char==='"'){quoted=!quoted;continue;}
    if(!quoted&&(char===','||char===';')){row.push(field.trim());field='';continue;}
    if(!quoted&&(char==='\n'||char==='\r')){if(char==='\r'&&next==='\n')i+=1;row.push(field.trim());field='';if(row.some(Boolean))rows.push(row);row=[];continue;}
    field+=char;
  }
  row.push(field.trim());if(row.some(Boolean))rows.push(row);
  if(quoted)fail('O CSV possui aspas não encerradas.');
  if(rows.length<2)fail('O CSV precisa ter cabeçalho e pelo menos um contato.');
  if(rows.length>5001)fail('Cada importação aceita no máximo 5.000 contatos.');
  const headers=rows[0].map((item,index)=>clean(item,80)||`coluna_${index+1}`);
  return{headers,rows:rows.slice(1).map((values,index)=>({rowNumber:index+2,data:Object.fromEntries(headers.map((header,column)=>[header,values[column]||'']))}))};
}

export function importRow(row,mapping){
  const read=(key)=>clean(row.data[mapping[key]||key],key==='name'?150:300);
  const phoneRaw=read('phone');let phone='';
  try{phone=normalizeWhatsAppNumber(phoneRaw);}catch{/* reported below */}
  const email=read('email').toLowerCase();
  const validEmail=!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return{rowNumber:row.rowNumber,raw:row.data,normalized:{name:read('name'),phone,email,companyName:read('company'),segmentSlug:read('segment'),tags:read('tags').split('|').map(x=>clean(x,60)).filter(Boolean)},valid:Boolean(phone&&validEmail),error:!phone?'Telefone inválido.':!validEmail?'E-mail inválido.':!read('name')?'Nome ausente; será usado Contato WhatsApp.':null};
}

async function overview(client){
  const [instances,settings,metrics,campaigns]=await Promise.all([
    client.query(`SELECT * FROM public.whatsapp_instances ORDER BY created_at`),
    client.query(`SELECT s.* FROM public.whatsapp_bot_settings s JOIN public.whatsapp_instances i ON i.id=s.instance_id ORDER BY i.created_at`),
    client.query(`SELECT
      (SELECT COUNT(*)::int FROM public.whatsapp_contacts) contacts,
      (SELECT COUNT(*)::int FROM public.whatsapp_contacts WHERE marketing_consent=TRUE AND opt_out_at IS NULL) marketable_contacts,
      (SELECT COUNT(*)::int FROM public.whatsapp_conversations WHERE status IN ('ai','human','waiting')) open_conversations,
      (SELECT COUNT(*)::int FROM public.whatsapp_handoffs WHERE status='pending') pending_handoffs,
      (SELECT COUNT(*)::int FROM public.whatsapp_messages WHERE created_at>=CURRENT_DATE) messages_today`),
    client.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='running')::int running,COUNT(*) FILTER(WHERE status='scheduled')::int scheduled FROM public.whatsapp_campaigns`),
  ]);
  return{instances:instances.rows.map(publicInstance),settings:settings.rows,metrics:metrics.rows[0],campaigns:campaigns.rows[0]};
}

export async function handleWhatsAppManagementApi(req,res,url,deps){
  const{dbClient,getSessionProfile,json,readJson}=deps;const client=dbClient();await client.connect();
  try{
    await ensureWhatsAppManagementSchema(client);
    const session=await getSessionProfile(req,client);
    if(!session)return json(res,401,{error:'Não autenticado.'});
    if(session.role!=='admin')return json(res,403,{error:'Acesso exclusivo para administradores.'});
    const response=await route(req,url,client,session,readJson);
    return json(res,response.status||200,response.body);
  }catch(error){
    if(error instanceof AutomationError)return json(res,error.status||400,{error:error.message,code:error.code});
    const incidentId=randomUUID();console.error('[WHATSAPP_ADMIN_API]',{incidentId,code:error?.code,message:String(error?.message||error).slice(0,1000)});
    return json(res,500,{error:'Não foi possível processar o módulo de WhatsApp.',incidentId});
  }finally{await client.end();}
}

async function route(req,url,client,session,readJson){
  const path=url.pathname;
  if(path==='/api/admin/whatsapp/overview'&&req.method==='GET')return{body:await overview(client)};

  if(path==='/api/admin/whatsapp/instances'&&req.method==='GET'){
    const rows=await client.query('SELECT * FROM public.whatsapp_instances ORDER BY created_at');return{body:{instances:rows.rows.map(publicInstance)}};
  }
  if(path==='/api/admin/whatsapp/instances'&&req.method==='POST'){
    const body=await readJson(req);const instanceName=clean(body.instanceName,120);if(!/^[a-zA-Z0-9_-]{2,120}$/.test(instanceName))fail('Nome da instância inválido.');
    const created=await client.query(`INSERT INTO public.whatsapp_instances(label,instance_name,organization_id,enabled,created_by,updated_by)
      VALUES($1,$2,$3,$4,$5,$5) RETURNING *`,[clean(body.label,120)||instanceName,instanceName,body.organizationId?uuid(body.organizationId,'Organização'):null,body.enabled===true,session.id]);
    await client.query(`INSERT INTO public.whatsapp_bot_settings(instance_id,updated_by) VALUES($1,$2) ON CONFLICT(instance_id) DO NOTHING`,[created.rows[0].id,session.id]);
    await audit(client,session.id,'whatsapp.instance.created','whatsapp_instance',created.rows[0].id,{instanceName});
    return{status:201,body:{instance:publicInstance(created.rows[0])}};
  }

  const instanceMatch=path.match(/^\/api\/admin\/whatsapp\/instances\/([0-9a-f-]{36})(?:\/(status|action))?$/i);
  if(instanceMatch){
    const instance=await getInstance(client,instanceMatch[1]);
    if(!instanceMatch[2]&&req.method==='PATCH'){
      const body=await readJson(req);const updated=await client.query(`UPDATE public.whatsapp_instances SET label=$2,enabled=$3,updated_by=$4,updated_at=NOW() WHERE id=$1 RETURNING *`,
        [instance.id,clean(body.label,120)||instance.label,body.enabled===true,session.id]);
      await audit(client,session.id,'whatsapp.instance.updated','whatsapp_instance',instance.id,{enabled:body.enabled===true});return{body:{instance:publicInstance(updated.rows[0])}};
    }
    if(instanceMatch[2]==='status'&&req.method==='GET'){
      try{const[data,webhook]=await Promise.all([getEvolutionStatus(instance),getEvolutionWebhook(instance).catch(()=>null)]);const saved=await syncInstanceStatus(client,instance,data);return{body:{instance:publicInstance(saved),provider:{status:normalizeEvolutionStatus(data),webhook}}};}
      catch(error){const saved=await syncInstanceStatus(client,instance,{},error);return{status:error.status||503,body:{error:error.message,code:error.code,instance:publicInstance(saved)}};}
    }
    if(instanceMatch[2]==='action'&&req.method==='POST'){
      const body=await readJson(req);const action=clean(body.action,40);let data;
      if(action==='connect'||action==='qr')data=await getEvolutionQr(instance);
      else if(action==='restart')data=await restartEvolution(instance);
      else if(action==='logout')data=await logoutEvolution(instance);
      else if(action==='configure_webhook'){
        const appUrl=String(process.env.APP_URL||'').replace(/\/$/,'');if(!appUrl)fail('APP_URL não configurada.',503,'APP_URL_NOT_CONFIGURED');
        data=await configureEvolutionWebhook(instance,`${appUrl}/api/webhooks/evolution`);await client.query('UPDATE public.whatsapp_instances SET webhook_configured=TRUE,updated_at=NOW() WHERE id=$1',[instance.id]);
      }else if(action==='test'){
        if(!instance.enabled)fail('Ative a instância antes do teste.',409,'WHATSAPP_INSTANCE_DISABLED');
        data=(await sendEvolutionText(instance,{number:body.phone,text:clean(body.message,2000)||'Mensagem de teste da Nextia.'})).data;
      }else fail('Ação da instância inválida.');
      const saved=await syncInstanceStatus(client,instance,data);await audit(client,session.id,`whatsapp.instance.${action}`,'whatsapp_instance',instance.id,{});
      return{body:{instance:publicInstance(saved),provider:data}};
    }
  }

  const settingsMatch=path.match(/^\/api\/admin\/whatsapp\/instances\/([0-9a-f-]{36})\/bot-settings$/i);
  if(settingsMatch&&req.method==='GET'){
    await getInstance(client,settingsMatch[1]);const result=await client.query('SELECT * FROM public.whatsapp_bot_settings WHERE instance_id=$1',[settingsMatch[1]]);return{body:{settings:result.rows[0]||null}};
  }
  if(settingsMatch&&req.method==='PATCH'){
    await getInstance(client,settingsMatch[1]);const b=await readJson(req);const prompt=String(b.systemPrompt||'').trim();if(prompt.length<40||prompt.length>12000)fail('As instruções da IA devem ter entre 40 e 12.000 caracteres.');
    const updated=await client.query(`UPDATE public.whatsapp_bot_settings SET enabled=$2,assistant_name=$3,business_name=$4,personality_mode=$5,system_prompt=$6,
      welcome_message=$7,after_hours_message=$8,handoff_message=$9,closing_message=$10,primary_purpose=$11,fallback_purpose=$12,
      fallback_enabled=$13,site_content_enabled=$14,crm_context_enabled=$15,support_context_enabled=$16,allow_new_contacts=$17,
      allow_existing_contacts=$18,human_transfer_enabled=$19,auto_resume_enabled=$20,human_timeout_minutes=$21,grouping_window_ms=$22,
      context_limit=$23,max_auto_messages=$24,max_response_tokens=$25,timezone=$26,service_hours=$27,pause_keywords=$28,resume_keywords=$29,opt_out_keywords=$30,updated_by=$31,updated_at=NOW()
      WHERE instance_id=$1 RETURNING *`,[settingsMatch[1],b.enabled===true,clean(b.assistantName,80)||'Nia',clean(b.businessName,120)||'Nextia',clean(b.personalityMode,80)||'consultiva_comercial',prompt,
      clean(b.welcomeMessage,1000),clean(b.afterHoursMessage,1000),clean(b.handoffMessage,1000),clean(b.closingMessage,1000),clean(b.primaryPurpose,100)||'whatsapp_sales_reply',clean(b.fallbackPurpose,100)||null,
      b.fallbackEnabled!==false,b.siteContentEnabled!==false,b.crmContextEnabled!==false,b.supportContextEnabled!==false,b.allowNewContacts!==false,b.allowExistingContacts!==false,
      b.humanTransferEnabled!==false,b.autoResumeEnabled!==false,Math.min(10080,Math.max(1,Number(b.humanTimeoutMinutes)||30)),Math.min(30000,Math.max(0,Number(b.groupingWindowMs)||1500)),
      Math.min(50,Math.max(1,Number(b.contextLimit)||12)),Math.min(100,Math.max(1,Number(b.maxAutoMessages)||12)),Math.min(4000,Math.max(50,Number(b.maxResponseTokens)||400)),
      clean(b.timezone,80)||'America/Sao_Paulo',JSON.stringify(b.serviceHours&&typeof b.serviceHours==='object'?b.serviceHours:{enabled:false}),
      Array.isArray(b.pauseKeywords)?b.pauseKeywords.map(x=>clean(x,80)).filter(Boolean):['atendente'],Array.isArray(b.resumeKeywords)?b.resumeKeywords.map(x=>clean(x,80)).filter(Boolean):['voltar ao bot'],
      Array.isArray(b.optOutKeywords)?b.optOutKeywords.map(x=>clean(x,80)).filter(Boolean):['sair','parar'],session.id]);
    await client.query(`INSERT INTO public.automation_settings(key,value,description) VALUES('whatsapp.ai_enabled',$1,'Kill switch independente da IA do WhatsApp')
      ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,[JSON.stringify(b.enabled===true)]);
    await audit(client,session.id,'whatsapp.bot_settings.updated','whatsapp_instance',settingsMatch[1],{enabled:b.enabled===true});return{body:{settings:updated.rows[0]}};
  }

  if(path==='/api/admin/whatsapp/knowledge'&&req.method==='GET'){
    const{limit,offset}=pageParams(url);const result=await client.query(`SELECT * FROM public.whatsapp_knowledge_articles WHERE ($1::uuid IS NULL OR instance_id=$1) AND ($2::text IS NULL OR status=$2) ORDER BY priority,title LIMIT $3 OFFSET $4`,
      [url.searchParams.get('instanceId')||null,url.searchParams.get('status')||null,limit,offset]);return{body:{articles:result.rows}};
  }
  if(path==='/api/admin/whatsapp/knowledge'&&req.method==='POST'){
    const b=await readJson(req);const slug=clean(b.slug,120);if(!SLUG.test(slug))fail('Slug do artigo inválido.');
    const result=await client.query(`INSERT INTO public.whatsapp_knowledge_articles(instance_id,title,slug,category,question_variations,short_answer,full_answer,recommended_followups,related_service_slugs,requires_human_handoff,status,priority,created_by,updated_by)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13) RETURNING *`,[b.instanceId?uuid(b.instanceId,'Instância'):null,clean(b.title,200),slug,clean(b.category,80)||'geral',JSON.stringify(b.questionVariations||[]),clean(b.shortAnswer,1000),String(b.fullAnswer||'').trim().slice(0,10000),JSON.stringify(b.recommendedFollowups||[]),JSON.stringify(b.relatedServiceSlugs||[]),b.requiresHumanHandoff===true,['draft','active','archived'].includes(b.status)?b.status:'draft',Number(b.priority)||100,session.id]);
    await audit(client,session.id,'whatsapp.knowledge.created','whatsapp_knowledge',result.rows[0].id,{slug});return{status:201,body:{article:result.rows[0]}};
  }
  const knowledgeMatch=path.match(/^\/api\/admin\/whatsapp\/knowledge\/([0-9a-f-]{36})$/i);
  if(knowledgeMatch&&req.method==='PATCH'){
    const b=await readJson(req);const result=await client.query(`UPDATE public.whatsapp_knowledge_articles SET title=COALESCE($2,title),category=COALESCE($3,category),question_variations=COALESCE($4,question_variations),short_answer=COALESCE($5,short_answer),full_answer=COALESCE($6,full_answer),recommended_followups=COALESCE($7,recommended_followups),related_service_slugs=COALESCE($8,related_service_slugs),requires_human_handoff=COALESCE($9,requires_human_handoff),status=COALESCE($10,status),priority=COALESCE($11,priority),updated_by=$12,updated_at=NOW() WHERE id=$1 RETURNING *`,
      [knowledgeMatch[1],b.title?clean(b.title,200):null,b.category?clean(b.category,80):null,b.questionVariations?JSON.stringify(b.questionVariations):null,b.shortAnswer?clean(b.shortAnswer,1000):null,b.fullAnswer?String(b.fullAnswer).trim().slice(0,10000):null,b.recommendedFollowups?JSON.stringify(b.recommendedFollowups):null,b.relatedServiceSlugs?JSON.stringify(b.relatedServiceSlugs):null,typeof b.requiresHumanHandoff==='boolean'?b.requiresHumanHandoff:null,['draft','active','archived'].includes(b.status)?b.status:null,Number.isFinite(Number(b.priority))?Number(b.priority):null,session.id]);
    if(!result.rows[0])fail('Artigo não encontrado.',404);await audit(client,session.id,'whatsapp.knowledge.updated','whatsapp_knowledge',knowledgeMatch[1],{});return{body:{article:result.rows[0]}};
  }

  if(path==='/api/admin/whatsapp/conversations'&&req.method==='GET'){
    const{limit,offset}=pageParams(url);const result=await client.query(`SELECT c.*,ct.name contact_name,ct.phone,ct.email,i.label instance_label,
      (SELECT COUNT(*)::int FROM public.whatsapp_messages m WHERE m.conversation_id=c.id) message_count
      FROM public.whatsapp_conversations c JOIN public.whatsapp_contacts ct ON ct.id=c.contact_id JOIN public.whatsapp_instances i ON i.id=c.instance_id
      WHERE ($1::text IS NULL OR c.status=$1) AND ($2::text IS NULL OR ct.name ILIKE '%'||$2||'%' OR ct.phone_normalized LIKE '%'||regexp_replace($2,'\\D','','g')||'%')
      ORDER BY c.last_message_at DESC LIMIT $3 OFFSET $4`,[url.searchParams.get('status')||null,clean(url.searchParams.get('q'),100)||null,limit,offset]);return{body:{conversations:result.rows}};
  }
  const conversationMatch=path.match(/^\/api\/admin\/whatsapp\/conversations\/([0-9a-f-]{36})(?:\/(messages|action))?$/i);
  if(conversationMatch&&req.method==='GET'&&!conversationMatch[2]){
    const conversation=(await client.query(`SELECT c.*,ct.name contact_name,ct.phone,ct.email,ct.marketing_consent,ct.opt_out_at,i.label instance_label FROM public.whatsapp_conversations c JOIN public.whatsapp_contacts ct ON ct.id=c.contact_id JOIN public.whatsapp_instances i ON i.id=c.instance_id WHERE c.id=$1`,[conversationMatch[1]])).rows[0];if(!conversation)fail('Conversa não encontrada.',404);
    const messages=(await client.query('SELECT * FROM public.whatsapp_messages WHERE conversation_id=$1 ORDER BY created_at',[conversation.id])).rows;return{body:{conversation,messages}};
  }
  if(conversationMatch&&conversationMatch[2]==='messages'&&req.method==='POST'){
    const b=await readJson(req);const message=clean(b.message,4000);if(message.length<1)fail('Escreva uma mensagem.');
    const conversation=(await client.query(`SELECT c.*,ct.phone,i.* FROM public.whatsapp_conversations c JOIN public.whatsapp_contacts ct ON ct.id=c.contact_id JOIN public.whatsapp_instances i ON i.id=c.instance_id WHERE c.id=$1`,[conversationMatch[1]])).rows[0];if(!conversation)fail('Conversa não encontrada.',404);if(!conversation.enabled)fail('A instância está desativada.',409);
    const sent=await sendEvolutionText(conversation,{number:conversation.phone,text:message});const saved=(await client.query(`INSERT INTO public.whatsapp_messages(conversation_id,provider_message_id,direction,sender_type,sender_user_id,body,delivery_status,sent_at) VALUES($1,$2,'outbound','user',$3,$4,'sent',NOW()) RETURNING *`,[conversation.id,sent.providerMessageId,session.id,message])).rows[0];
    await client.query(`UPDATE public.whatsapp_conversations SET status='human',ai_enabled=FALSE,human_takeover_at=COALESCE(human_takeover_at,NOW()),last_message_at=NOW(),last_message_preview=$2,updated_at=NOW() WHERE id=$1`,[conversation.id,message.slice(0,300)]);
    await audit(client,session.id,'whatsapp.message.sent','whatsapp_conversation',conversation.id,{messageId:saved.id});return{status:201,body:{message:saved}};
  }
  if(conversationMatch&&conversationMatch[2]==='action'&&req.method==='POST'){
    const b=await readJson(req);const action=clean(b.action,40);let result;
    if(action==='takeover')result=await client.query(`UPDATE public.whatsapp_conversations SET status='human',ai_enabled=FALSE,assigned_user_id=$2,human_takeover_at=NOW(),human_resume_at=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`,[conversationMatch[1],session.id]);
    else if(action==='resume_ai')result=await client.query(`UPDATE public.whatsapp_conversations SET status='ai',ai_enabled=TRUE,assigned_user_id=NULL,human_takeover_at=NULL,human_resume_at=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`,[conversationMatch[1]]);
    else if(['resolved','archived'].includes(action))result=await client.query(`UPDATE public.whatsapp_conversations SET status=$2,ai_enabled=FALSE,updated_at=NOW() WHERE id=$1 RETURNING *`,[conversationMatch[1],action]);
    else fail('Ação de conversa inválida.');if(!result.rows[0])fail('Conversa não encontrada.',404);await audit(client,session.id,`whatsapp.conversation.${action}`,'whatsapp_conversation',conversationMatch[1],{});return{body:{conversation:result.rows[0]}};
  }

  if(path==='/api/admin/whatsapp/contacts'&&req.method==='GET'){
    const{limit,offset}=pageParams(url);const result=await client.query(`SELECT * FROM public.whatsapp_contacts WHERE ($1::text IS NULL OR name ILIKE '%'||$1||'%' OR phone_normalized LIKE '%'||regexp_replace($1,'\\D','','g')||'%') ORDER BY updated_at DESC LIMIT $2 OFFSET $3`,[clean(url.searchParams.get('q'),100)||null,limit,offset]);return{body:{contacts:result.rows}};
  }
  if(path==='/api/admin/whatsapp/contact-lists'&&req.method==='GET'){
    const result=await client.query(`SELECT l.*,COUNT(m.contact_id)::int contact_count FROM public.whatsapp_contact_lists l
      LEFT JOIN public.whatsapp_contact_list_members m ON m.list_id=l.id GROUP BY l.id ORDER BY l.updated_at DESC`);
    return{body:{lists:result.rows}};
  }
  if(path==='/api/admin/whatsapp/contact-lists'&&req.method==='POST'){
    const b=await readJson(req);const name=clean(b.name,160);if(name.length<2)fail('Informe o nome da lista.');
    const created=(await client.query(`INSERT INTO public.whatsapp_contact_lists(name,description,created_by) VALUES($1,$2,$3) RETURNING *`,[name,clean(b.description,500)||null,session.id])).rows[0];
    await audit(client,session.id,'whatsapp.contact_list.created','whatsapp_contact_list',created.id,{});return{status:201,body:{list:created}};
  }

  if(path==='/api/admin/whatsapp/campaign-settings'&&req.method==='GET'){
    const result=await client.query(`SELECT key,value FROM public.automation_settings WHERE key IN ('whatsapp.campaigns_enabled','whatsapp.max_messages_per_minute')`);
    const values=Object.fromEntries(result.rows.map(row=>[row.key,row.value]));return{body:{enabled:values['whatsapp.campaigns_enabled']===true,maxMessagesPerMinute:Number(values['whatsapp.max_messages_per_minute']||10)}};
  }
  if(path==='/api/admin/whatsapp/campaign-settings'&&req.method==='PATCH'){
    const b=await readJson(req);const active=b.enabled===true;
    if(active){if(b.confirmation!=='ATIVAR CAMPANHAS')fail('Digite ATIVAR CAMPANHAS para liberar os disparos.',409,'CAMPAIGN_CONFIRMATION_REQUIRED');const ready=await client.query(`SELECT 1 FROM public.whatsapp_instances WHERE enabled=TRUE AND connection_status='connected' LIMIT 1`);if(!ready.rows[0])fail('Conecte e ative uma instância antes de liberar campanhas.',409,'WHATSAPP_INSTANCE_NOT_READY');}
    const rate=Math.min(120,Math.max(1,Number(b.maxMessagesPerMinute)||10));
    await client.query(`INSERT INTO public.automation_settings(key,value,description) VALUES
      ('whatsapp.campaigns_enabled',$1,'Kill switch independente das campanhas de WhatsApp'),
      ('whatsapp.max_messages_per_minute',$2,'Limite global de mensagens de campanha por minuto')
      ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=$3,updated_at=NOW()`,[JSON.stringify(active),JSON.stringify(rate),session.id]);
    await audit(client,session.id,active?'whatsapp.campaigns.enabled':'whatsapp.campaigns.disabled','whatsapp_campaign_settings','global',{rate});return{body:{enabled:active,maxMessagesPerMinute:rate}};
  }

  if(path==='/api/admin/whatsapp/imports/preview'&&req.method==='POST'){
    const b=await readJson(req);const parsed=parseCsv(b.csvText);const mapping=b.mapping&&typeof b.mapping==='object'?b.mapping:{};const normalized=parsed.rows.map(row=>importRow(row,mapping));
    const created=(await client.query(`INSERT INTO public.whatsapp_csv_imports(filename,column_mapping,consent_confirmed,consent_source,status,total_rows,invalid_rows,created_by) VALUES($1,$2,FALSE,$3,'preview',$4,$5,$6) RETURNING *`,[clean(b.filename,200)||'contatos.csv',JSON.stringify(mapping),clean(b.consentSource,200)||null,normalized.length,normalized.filter(x=>!x.valid).length,session.id])).rows[0];
    for(const row of normalized)await client.query(`INSERT INTO public.whatsapp_csv_import_rows(import_id,row_number,raw_data,normalized_data,status,error_message) VALUES($1,$2,$3,$4,$5,$6)`,[created.id,row.rowNumber,JSON.stringify(row.raw),JSON.stringify(row.normalized),row.valid?'valid':'invalid',row.error]);
    return{status:201,body:{import:created,headers:parsed.headers,preview:normalized.slice(0,50),validRows:normalized.filter(x=>x.valid).length}};
  }
  const importCommit=path.match(/^\/api\/admin\/whatsapp\/imports\/([0-9a-f-]{36})\/commit$/i);
  if(importCommit&&req.method==='POST'){
    const b=await readJson(req);if(b.consentConfirmed!==true)fail('Confirme a origem e o consentimento dos contatos antes de importar.',409,'MARKETING_CONSENT_REQUIRED');
    const source=clean(b.consentSource,200);if(source.length<3)fail('Informe a origem do consentimento.');await client.query('BEGIN');
    try{const importMeta=(await client.query(`SELECT * FROM public.whatsapp_csv_imports WHERE id=$1 AND status='preview' FOR UPDATE`,[importCommit[1]])).rows[0];if(!importMeta)fail('Importação não encontrada ou já processada.',409);
      const list=importMeta.contact_list_id?{id:importMeta.contact_list_id}:(await client.query(`INSERT INTO public.whatsapp_contact_lists(name,description,created_by) VALUES($1,$2,$3) RETURNING id`,[clean(importMeta.filename.replace(/\.csv$/i,''),160)||'Contatos importados',`Importação CSV: ${source}`,session.id])).rows[0];
      const imported=await client.query(`SELECT * FROM public.whatsapp_csv_import_rows WHERE import_id=$1 AND status='valid' ORDER BY row_number FOR UPDATE`,[importCommit[1]]);if(!imported.rowCount)fail('Importação sem linhas válidas.',409);
      let count=0,duplicates=0;for(const row of imported.rows){const d=row.normalized_data;const existing=await client.query(`SELECT id FROM public.whatsapp_contacts WHERE organization_id IS NULL AND phone_normalized=$1`,[d.phone]);let contactId;
        if(existing.rows[0]){contactId=existing.rows[0].id;duplicates+=1;await client.query(`UPDATE public.whatsapp_contacts SET name=CASE WHEN name='Contato WhatsApp' THEN $2 ELSE name END,email=COALESCE(NULLIF($3,''),email),company_name=COALESCE(NULLIF($4,''),company_name),tags=tags||$5::jsonb,marketing_consent=TRUE,consent_source=$6,consent_at=COALESCE(consent_at,NOW()),opt_out_at=NULL,updated_at=NOW() WHERE id=$1`,[contactId,d.name||'Contato WhatsApp',d.email,d.companyName,JSON.stringify(d.tags||[]),source]);}
        else{contactId=(await client.query(`INSERT INTO public.whatsapp_contacts(name,phone,email,company_name,segment_slug,tags,source,marketing_consent,consent_source,consent_at,created_by) VALUES($1,$2,NULLIF($3,''),NULLIF($4,''),NULLIF($5,''),$6,'csv',TRUE,$7,NOW(),$8) RETURNING id`,[d.name||'Contato WhatsApp',d.phone,d.email,d.companyName,d.segmentSlug,JSON.stringify(d.tags||[]),source,session.id])).rows[0].id;count+=1;}
        await client.query(`INSERT INTO public.whatsapp_contact_list_members(list_id,contact_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,[list.id,contactId]);
        await client.query(`INSERT INTO public.whatsapp_consent_events(contact_id,event_type,source,legal_basis,evidence,actor_user_id) VALUES($1,'imported',$2,'consentimento',jsonb_build_object('import_id',$3::text,'row_number',$4::int),$5)`,[contactId,source,importCommit[1],row.row_number,session.id]);await client.query(`UPDATE public.whatsapp_csv_import_rows SET status='imported',contact_id=$2 WHERE id=$1`,[row.id,contactId]);}
      const finished=(await client.query(`UPDATE public.whatsapp_csv_imports SET status='completed',contact_list_id=$2,consent_confirmed=TRUE,consent_source=$3,imported_rows=$4,duplicate_rows=$5,completed_at=NOW() WHERE id=$1 RETURNING *`,[importCommit[1],list.id,source,count,duplicates])).rows[0];await audit(client,session.id,'whatsapp.csv_import.completed','whatsapp_csv_import',importCommit[1],{imported:count,duplicates,listId:list.id});await client.query('COMMIT');return{body:{import:finished,listId:list.id}};
    }catch(error){await client.query('ROLLBACK');throw error;}
  }

  if(path==='/api/admin/whatsapp/campaigns'&&req.method==='GET'){
    const result=await client.query(`SELECT c.*,i.label instance_label,l.name list_name FROM public.whatsapp_campaigns c JOIN public.whatsapp_instances i ON i.id=c.instance_id LEFT JOIN public.whatsapp_contact_lists l ON l.id=c.contact_list_id ORDER BY c.created_at DESC LIMIT 100`);return{body:{campaigns:result.rows}};
  }
  if(path==='/api/admin/whatsapp/campaigns'&&req.method==='POST'){
    const b=await readJson(req);const name=clean(b.name,160);if(name.length<2)fail('Informe o nome da campanha.');const message=String(b.messageBody||'').trim().slice(0,4000);if(message.length<3)fail('Informe a mensagem da campanha.');
    const result=await client.query(`INSERT INTO public.whatsapp_campaigns(instance_id,template_id,contact_list_id,name,message_body,segment_filter,status,requires_approval,scheduled_at,send_rate_per_minute,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8,$9,$9) RETURNING *`,[uuid(b.instanceId,'Instância'),b.templateId?uuid(b.templateId,'Template'):null,b.contactListId?uuid(b.contactListId,'Lista'):null,name,message,JSON.stringify(b.segmentFilter||{}),b.scheduledAt||null,Math.min(120,Math.max(1,Number(b.sendRatePerMinute)||10)),session.id]);
    await audit(client,session.id,'whatsapp.campaign.created','whatsapp_campaign',result.rows[0].id,{});return{status:201,body:{campaign:result.rows[0]}};
  }
  const campaignAction=path.match(/^\/api\/admin\/whatsapp\/campaigns\/([0-9a-f-]{36})\/action$/i);
  if(campaignAction&&req.method==='POST'){
    const b=await readJson(req);const action=clean(b.action,30);let result;if(action==='approve'){
      await client.query('BEGIN');try{
        result=await client.query(`UPDATE public.whatsapp_campaigns SET approved_by=$2,approved_at=NOW(),status=CASE WHEN scheduled_at IS NULL THEN 'paused' ELSE 'scheduled' END,updated_at=NOW() WHERE id=$1 AND status='draft' RETURNING *`,[campaignAction[1],session.id]);
        if(!result.rows[0])fail('Campanha não encontrada ou transição inválida.',409);
        await client.query(`INSERT INTO public.whatsapp_campaign_recipients(campaign_id,contact_id,status,scheduled_at)
          SELECT c.id,ct.id,'pending',COALESCE(c.scheduled_at,NOW()) FROM public.whatsapp_campaigns c CROSS JOIN public.whatsapp_contacts ct
          WHERE c.id=$1 AND ct.marketing_consent=TRUE AND ct.opt_out_at IS NULL
            AND (c.organization_id IS NULL OR ct.organization_id=c.organization_id)
            AND (c.contact_list_id IS NULL OR EXISTS(SELECT 1 FROM public.whatsapp_contact_list_members m WHERE m.list_id=c.contact_list_id AND m.contact_id=ct.id))
            AND (COALESCE(c.segment_filter->>'segmentSlug','')='' OR ct.segment_slug=c.segment_filter->>'segmentSlug')
          ON CONFLICT(campaign_id,contact_id) DO NOTHING`,[campaignAction[1]]);
        result=await client.query(`UPDATE public.whatsapp_campaigns SET total_recipients=(SELECT COUNT(*)::int FROM public.whatsapp_campaign_recipients WHERE campaign_id=$1),updated_at=NOW() WHERE id=$1 RETURNING *`,[campaignAction[1]]);
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error;}
    }
    else if(action==='start')result=await client.query(`UPDATE public.whatsapp_campaigns SET status='scheduled',scheduled_at=COALESCE(scheduled_at,NOW()),updated_at=NOW() WHERE id=$1 AND status='paused' AND approved_at IS NOT NULL AND total_recipients>0 RETURNING *`,[campaignAction[1]]);
    else if(action==='pause')result=await client.query(`UPDATE public.whatsapp_campaigns SET status='paused',updated_at=NOW() WHERE id=$1 AND status IN ('scheduled','running') RETURNING *`,[campaignAction[1]]);
    else if(action==='cancel')result=await client.query(`UPDATE public.whatsapp_campaigns SET status='cancelled',updated_at=NOW() WHERE id=$1 AND status NOT IN ('completed','cancelled') RETURNING *`,[campaignAction[1]]);
    else fail('Ação de campanha inválida.');if(!result.rows[0])fail('Campanha não encontrada ou transição inválida.',409);await audit(client,session.id,`whatsapp.campaign.${action}`,'whatsapp_campaign',campaignAction[1],{});return{body:{campaign:result.rows[0]}};
  }

  return{status:404,body:{error:'Rota do módulo de WhatsApp não encontrada.'}};
}
