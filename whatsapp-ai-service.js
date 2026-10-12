import { AIService } from './ai-service.js';
import { AutomationError, sanitizeForLog } from './automation-core.js';
import { sendEvolutionText } from './evolution-client.js';

function payloadObject(value){if(value&&typeof value==='object')return value;try{return JSON.parse(value||'{}');}catch{return{};}}
function text(value,max=4000){return String(value||'').trim().slice(0,max);}

async function supportContext(client,row){
  if(row.support_context_enabled===false)return[];
  const exists=await client.query("SELECT to_regclass('public.support_tickets') ready");if(!exists.rows[0]?.ready)return[];
  const result=await client.query(`SELECT id,subject,status,priority,service_slug,created_at,resolved_at FROM public.support_tickets
    WHERE ($1<>'' AND RIGHT(regexp_replace(COALESCE(phone,''),'\D','','g'),11)=RIGHT($1,11)) OR ($2<>'' AND LOWER(email)=LOWER($2))
    ORDER BY created_at DESC LIMIT 10`,[row.phone||'',row.email||'']);return result.rows;
}

async function contextForMessage(client,messageId){
  const result=await client.query(`SELECT m.id message_id,m.body,m.created_at,c.id conversation_id,c.status conversation_status,c.ai_enabled,c.context,
      ct.id contact_id,ct.name contact_name,ct.phone,ct.email,ct.company_name,ct.segment_slug,ct.crm_lead_id,ct.opt_out_at,
      i.id instance_id,i.organization_id,i.instance_name,i.api_url_env,i.api_key_env,i.webhook_secret_env,i.enabled,
      i.connection_status,i.configuration,s.enabled bot_enabled,s.assistant_name,s.business_name,s.personality_mode,s.system_prompt,s.welcome_message,s.after_hours_message,
      s.handoff_message,s.closing_message,s.primary_purpose,s.fallback_purpose,s.fallback_enabled,s.site_content_enabled,
      s.crm_context_enabled,s.support_context_enabled,s.max_auto_messages,s.context_limit,s.max_response_tokens,s.human_transfer_enabled
    FROM public.whatsapp_messages m JOIN public.whatsapp_conversations c ON c.id=m.conversation_id
    JOIN public.whatsapp_contacts ct ON ct.id=c.contact_id JOIN public.whatsapp_instances i ON i.id=c.instance_id
    JOIN public.whatsapp_bot_settings s ON s.instance_id=i.id WHERE m.id=$1 AND m.direction='inbound'`,[messageId]);
  return result.rows[0]||null;
}

async function buildContext(client,row){
  const [history,knowledge,services,siteContent,lead,support]=await Promise.all([
    client.query(`SELECT direction,sender_type,body,created_at FROM public.whatsapp_messages WHERE conversation_id=$1 AND body IS NOT NULL ORDER BY created_at DESC LIMIT $2`,[row.conversation_id,Math.max(1,Number(row.context_limit)||12)]),
    client.query(`SELECT title,category,question_variations,short_answer,full_answer,recommended_followups,related_service_slugs,requires_human_handoff
      FROM public.whatsapp_knowledge_articles WHERE status='active' AND (instance_id=$1 OR (instance_id IS NULL AND organization_id IS NOT DISTINCT FROM $2)) ORDER BY priority,title LIMIT 100`,[row.instance_id,row.organization_id]),
    client.query(`SELECT slug,name,category,price_cents,price_label,recurring FROM public.commercial_services WHERE active=TRUE ORDER BY sort_order,name LIMIT 100`),
    row.site_content_enabled!==false?client.query(`SELECT title,slug,excerpt,LEFT(content_markdown,6000) content_markdown,related_service_slug,cta_label,cta_path
      FROM public.content_entries WHERE status='published' ORDER BY published_at DESC LIMIT 30`):Promise.resolve({rows:[]}),
    row.crm_lead_id&&row.crm_context_enabled!==false?client.query(`SELECT public_code,name,company_name,segment_slug,service_slug,product_slug,plan_slug,status,score,notes FROM public.crm_leads WHERE id=$1`,[row.crm_lead_id]):Promise.resolve({rows:[]}),
    supportContext(client,row),
  ]);
  return sanitizeForLog({
    channel:'whatsapp',assistant:{name:row.assistant_name,business:row.business_name,personality:row.personality_mode,instructions:row.system_prompt},
    contact:{name:row.contact_name,company:row.company_name,segment:row.segment_slug},currentMessage:row.body,
    recentHistory:history.rows.reverse(),knowledge:knowledge.rows,serviceCatalog:services.rows,siteContent:siteContent.rows,crm:lead.rows[0]||null,supportTickets:support,
    rules:{doNotInvent:true,oneQuestionAtATime:true,handoffAvailable:row.human_transfer_enabled!==false},
  });
}

async function pauseForHuman(client,row,messageId,reason){
  await client.query(`UPDATE public.whatsapp_conversations SET status='human',ai_enabled=FALSE,human_takeover_at=NOW(),updated_at=NOW() WHERE id=$1`,[row.conversation_id]);
  await client.query(`INSERT INTO public.whatsapp_handoffs(conversation_id,reason,status) VALUES($1,$2,'pending')`,[row.conversation_id,text(reason,500)||'Solicitação da IA']);
  await client.query(`INSERT INTO public.notifications(user_id,title,message,type) SELECT id,'Atendimento humano solicitado',$1,'warning' FROM public.profiles WHERE role='admin'`,[`${row.contact_name} precisa de atendimento humano no WhatsApp.`]);
  await client.query(`INSERT INTO public.whatsapp_message_logs(instance_id,conversation_id,message_id,event_type,status,details)
    VALUES($1,$2,$3,'ai.handoff','warning',$4)`,[row.instance_id,row.conversation_id,messageId,JSON.stringify({reason:text(reason,500)})]);
}

async function sendAndRecord(client,row,reply,{senderType='ai',aiRunId=null}={}){
  const sent=await sendEvolutionText(row,{number:row.phone,text:reply});
  const message=(await client.query(`INSERT INTO public.whatsapp_messages(conversation_id,provider_message_id,direction,sender_type,body,payload,delivery_status,sent_at)
    VALUES($1,$2,'outbound',$3,$4,$5,'sent',NOW()) RETURNING *`,[row.conversation_id,sent.providerMessageId,senderType,reply,JSON.stringify({aiRunId})])).rows[0];
  await client.query(`UPDATE public.whatsapp_conversations SET last_message_at=NOW(),last_message_preview=$2,updated_at=NOW() WHERE id=$1`,[row.conversation_id,reply.slice(0,300)]);
  await client.query(`INSERT INTO public.whatsapp_message_logs(instance_id,conversation_id,message_id,event_type,status,details)
    VALUES($1,$2,$3,'message.sent','success',$4)`,[row.instance_id,row.conversation_id,message.id,JSON.stringify({senderType,aiRunId})]);
  return message;
}

export async function processWhatsAppInbound(client,event,{fetchImpl=globalThis.fetch}={}){
  const payload=payloadObject(event.payload);if(!payload.messageId)throw new AutomationError('Evento do WhatsApp sem messageId.',{code:'WHATSAPP_MESSAGE_ID_MISSING',retryable:false});
  const row=await contextForMessage(client,payload.messageId);if(!row)throw new AutomationError('Mensagem recebida não encontrada.',{code:'WHATSAPP_MESSAGE_NOT_FOUND',retryable:false});
  if(!row.enabled||!row.bot_enabled||!row.ai_enabled||row.conversation_status==='human')return{skipped:'bot_disabled_or_human'};
  if(payload.optedOut||row.opt_out_at){
    const reply='Tudo certo. Você não receberá mais mensagens de marketing. Ainda pode falar conosco quando precisar de atendimento.';
    await sendAndRecord(client,row,reply,{senderType:'system'});return{optedOut:true};
  }
  const outboundCount=await client.query(`SELECT COUNT(*)::int total FROM public.whatsapp_messages WHERE conversation_id=$1 AND direction='outbound' AND sender_type='ai' AND created_at>=NOW()-INTERVAL '24 hours'`,[row.conversation_id]);
  if(Number(outboundCount.rows[0]?.total||0)>=Number(row.max_auto_messages||12)){
    await pauseForHuman(client,row,row.message_id,'Limite de mensagens automáticas atingido.');return{handoff:true,reason:'message_limit'};
  }
  const context=await buildContext(client,row);const service=new AIService(client,{fetchImpl});
  const generated=await service.generate({purpose:row.primary_purpose||'whatsapp_sales_reply',source:{},contextOverride:context,enabledSetting:'whatsapp.ai_enabled',maxTokens:row.max_response_tokens||400,entityType:'whatsapp_message',entityId:row.message_id});
  const result=generated.result||{};const reply=text(result.reply,4000);if(!reply)throw new AutomationError('A IA não retornou uma resposta utilizável.',{code:'WHATSAPP_AI_EMPTY_REPLY',retryable:true});
  const handoff=result.handoff===true&&row.human_transfer_enabled!==false;
  if(handoff)await pauseForHuman(client,row,row.message_id,result.handoff_reason||`Intenção: ${result.intent||'não classificada'}`);
  const sent=await sendAndRecord(client,row,reply,{aiRunId:generated.aiRunId});
  const allowedStages=new Set(['new','contact','qualified']);
  if(row.crm_lead_id&&allowedStages.has(String(result.crm_stage||''))){
    await client.query(`UPDATE public.crm_leads SET status=$2,last_contact_at=NOW(),last_touch_source='whatsapp_ai',last_touch_at=NOW(),updated_at=NOW() WHERE id=$1 AND status NOT IN ('won','lost','archived')`,[row.crm_lead_id,result.crm_stage]);
    await client.query(`INSERT INTO public.crm_lead_history(lead_id,action,to_status,metadata) VALUES($1,'whatsapp.ai_classified',$2,$3)`,[row.crm_lead_id,result.crm_stage,JSON.stringify({intent:result.intent,confidence:result.confidence,messageId:row.message_id})]);
  }
  return{messageId:sent.id,aiRunId:generated.aiRunId,handoff,intent:result.intent||null};
}

export async function markWhatsAppInboundFailed(client,event,error){
  const payload=payloadObject(event.payload);if(!payload.messageId)return;
  await client.query(`INSERT INTO public.whatsapp_message_logs(conversation_id,message_id,event_type,status,error_code,error_message)
    SELECT conversation_id,id,'ai.failed','error',$2,$3 FROM public.whatsapp_messages WHERE id=$1`,
  [payload.messageId,String(error?.code||'WHATSAPP_AI_FAILED').slice(0,100),String(error?.message||error).slice(0,1000)]);
}
