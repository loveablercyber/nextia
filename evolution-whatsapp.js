import { createHash, timingSafeEqual } from 'node:crypto';

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a,b);
}

function normalizePhone(value) {
  const digits = String(value || '').split('@')[0].replace(/\D/g,'');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function phoneFromJid(value) {
  const candidate = String(value || '').trim();
  if (!candidate || candidate.endsWith('@lid')) return '';
  if (candidate.includes('@') && !candidate.endsWith('@s.whatsapp.net') && !candidate.endsWith('@c.us')) return '';
  const phone = normalizePhone(candidate);
  return /^55\d{10,11}$/.test(phone) ? phone : '';
}

function messagePhone(data,key,remoteJid) {
  const candidates = String(remoteJid).endsWith('@lid')
    ? [key.remoteJidAlt,data.remoteJidAlt,data.senderPn,key.participantAlt,data.participantAlt]
    : [remoteJid,key.remoteJidAlt,data.remoteJidAlt,data.senderPn,key.participantAlt,data.participantAlt];
  return candidates.map(phoneFromJid).find(Boolean) || '';
}

function eventName(payload) {
  return String(payload?.event || payload?.type || '').trim().toUpperCase().replace(/[.-]/g,'_');
}

function webhookQr(payload) {
  return payload?.data?.qrcode?.base64
    || payload?.data?.base64
    || payload?.qrcode?.base64
    || payload?.base64
    || null;
}

function webhookConnectionStatus(payload) {
  const raw=String(payload?.data?.state || payload?.data?.status || payload?.state || payload?.status || '').toLowerCase();
  if(['open','connected','online','ready'].includes(raw))return'connected';
  if(['connecting','starting','reconnecting'].includes(raw))return'connecting';
  if(['close','closed','disconnected','offline','logged_out'].includes(raw))return'disconnected';
  return null;
}

export function parseEvolutionMessage(payload) {
  if (eventName(payload) !== 'MESSAGES_UPSERT') return null;
  const data = payload?.data || {};
  const key = data.key || {};
  if (key.fromMe === true) return null;
  const remoteJid = key.remoteJid || data.remoteJid || data.sender || '';
  if (String(remoteJid).endsWith('@g.us')) return null;
  const message = data.message || {};
  const text = message.conversation
    || message.extendedTextMessage?.text
    || message.imageMessage?.caption
    || message.videoMessage?.caption
    || message.buttonsResponseMessage?.selectedDisplayText
    || message.buttonsResponseMessage?.selectedButtonId
    || message.listResponseMessage?.title
    || message.listResponseMessage?.singleSelectReply?.selectedRowId
    || message.templateButtonReplyMessage?.selectedDisplayText
    || message.templateButtonReplyMessage?.selectedId
    || '';
  const phone = messagePhone(data,key,remoteJid);
  const body = String(text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,4000);
  if (!key.id || !phone || !body) return null;
  return {
    eventId:String(key.id).slice(0,255),
    instance:String(payload.instance || '').trim().slice(0,120),
    phone,
    body,
    contactName:String(data.pushName || data.senderName || '').replace(/[<>]/g,'').trim().slice(0,100),
  };
}

function authorized(req, payload, env) {
  const webhookSecret = req.headers['x-webhook-secret'];
  if (env.EVOLUTION_WEBHOOK_SECRET && safeEqual(webhookSecret,env.EVOLUTION_WEBHOOK_SECRET)) return true;
  const apiKey = req.headers.apikey || req.headers['x-api-key'] || payload?.apikey;
  return Boolean(env.WHATSAPP_API_KEY && safeEqual(apiKey,env.WHATSAPP_API_KEY));
}

function redactedPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};
  const copy = structuredClone(payload);
  delete copy.apikey;
  return copy;
}

async function routeManagedConversation(client,parsed,instanceName) {
  const integration=(await client.query(`SELECT i.*,s.enabled bot_enabled,s.allow_new_contacts,s.crm_context_enabled,s.opt_out_keywords
    FROM public.whatsapp_instances i LEFT JOIN public.whatsapp_bot_settings s ON s.instance_id=i.id
    WHERE i.instance_name=$1 ORDER BY i.enabled DESC,i.created_at LIMIT 1`,[instanceName])).rows[0];
  if(!integration)return null;
  let contact=(await client.query(`SELECT * FROM public.whatsapp_contacts WHERE organization_id IS NOT DISTINCT FROM $1
    AND phone_normalized=$2 LIMIT 1`,[integration.organization_id,parsed.phone])).rows[0];
  if(!contact&&integration.allow_new_contacts===false)return{integration,routed:false,reason:'new_contacts_disabled'};

  if(!contact){
    contact=(await client.query(`INSERT INTO public.whatsapp_contacts(organization_id,name,phone,source,marketing_consent,consent_source)
      VALUES($1,$2,$3,'whatsapp_inbound',FALSE,'inbound_contact') RETURNING *`,
    [integration.organization_id,parsed.contactName||'Contato WhatsApp',parsed.phone])).rows[0];
  }
  if(!contact.crm_lead_id&&integration.crm_context_enabled!==false){
    let lead=(await client.query(`SELECT id FROM public.crm_leads WHERE phone_normalized=$1 ORDER BY updated_at DESC LIMIT 1`,[parsed.phone])).rows[0];
    if(!lead){
      lead=(await client.query(`INSERT INTO public.crm_leads(public_code,name,phone,whatsapp,status,source,source_detail,first_touch_source,first_touch_at,last_touch_source,last_touch_at,metadata)
        VALUES('LEAD-'||UPPER(SUBSTRING(gen_random_uuid()::text,1,8)),$1,$2,$2,'new','whatsapp','Atendimento pela Evolution API','whatsapp',NOW(),'whatsapp',NOW(),$3) RETURNING id`,
      [contact.name,parsed.phone,JSON.stringify({whatsapp_instance:instanceName})])).rows[0];
    }
    contact.crm_lead_id=lead.id;
    await client.query('UPDATE public.whatsapp_contacts SET crm_lead_id=$2,updated_at=NOW() WHERE id=$1',[contact.id,lead.id]);
  }
  const conversation=(await client.query(`INSERT INTO public.whatsapp_conversations(instance_id,contact_id,external_thread_key,status,ai_enabled,last_message_at,last_message_preview)
    VALUES($1,$2,$3,$4,$5,NOW(),$6) ON CONFLICT(instance_id,external_thread_key) DO UPDATE SET contact_id=EXCLUDED.contact_id,
    last_message_at=NOW(),last_message_preview=EXCLUDED.last_message_preview,updated_at=NOW() RETURNING *`,
  [integration.id,contact.id,parsed.phone,integration.bot_enabled?'ai':'waiting',integration.bot_enabled===true,parsed.body.slice(0,300)])).rows[0];
  const message=(await client.query(`INSERT INTO public.whatsapp_messages(conversation_id,provider_message_id,direction,sender_type,body,payload,delivery_status)
    VALUES($1,$2,'inbound','contact',$3,$4,'received') ON CONFLICT(provider_message_id) DO NOTHING RETURNING *`,
  [conversation.id,parsed.eventId,parsed.body,JSON.stringify({instance:instanceName})])).rows[0];
  if(!message)return{integration,conversation,routed:true,duplicate:true};

  const normalizedText=parsed.body.toLocaleLowerCase('pt-BR').trim();
  const optOutKeywords=Array.isArray(integration.opt_out_keywords)?integration.opt_out_keywords:[];
  const optedOut=optOutKeywords.some(keyword=>normalizedText===String(keyword).toLocaleLowerCase('pt-BR').trim());
  if(optedOut){
    await client.query(`UPDATE public.whatsapp_contacts SET marketing_consent=FALSE,opt_out_at=NOW(),updated_at=NOW() WHERE id=$1`,[contact.id]);
    await client.query(`INSERT INTO public.whatsapp_consent_events(contact_id,event_type,source,legal_basis,evidence)
      VALUES($1,'opt_out','whatsapp_keyword','legitimo_interesse',jsonb_build_object('message_id',$2::text))`,[contact.id,message.id]);
  }
  await client.query(`INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
    VALUES('whatsapp_conversation',$1,'whatsapp.message_received',$2,$3) ON CONFLICT(idempotency_key) DO NOTHING`,
  [conversation.id,JSON.stringify({instanceId:integration.id,conversationId:conversation.id,messageId:message.id,contactId:contact.id,optedOut}),`whatsapp.message_received:${message.id}`]);
  await client.query(`INSERT INTO public.notifications(user_id,title,message,type)
    SELECT id,'Nova mensagem no WhatsApp',$1,'info' FROM public.profiles WHERE role='admin'`,
  [`${contact.name} enviou uma mensagem pelo WhatsApp.`]);
  await client.query(`INSERT INTO public.whatsapp_message_logs(instance_id,conversation_id,message_id,event_type,status,details)
    VALUES($1,$2,$3,'message.received','success',$4)`,[integration.id,conversation.id,message.id,JSON.stringify({optedOut})]);
  return{integration,conversation,message,routed:true,optedOut};
}

export async function handleEvolutionWebhook(req,res,{client,json,readJson,env=process.env}) {
  let payload;
  try { payload = await readJson(req); }
  catch { return json(res,400,{error:'Payload inválido.',code:'EVOLUTION_PAYLOAD_INVALID'}); }
  if (!authorized(req,payload,env)) return json(res,401,{error:'Webhook não autorizado.',code:'EVOLUTION_WEBHOOK_UNAUTHORIZED'});

  const cleanPayload = redactedPayload(payload);
  const payloadJson = JSON.stringify(cleanPayload);
  const hash = createHash('sha256').update(payloadJson).digest('hex');
  const parsed = parseEvolutionMessage(payload);
  const type = eventName(payload) || 'UNKNOWN';
  const instance = String(payload?.instance || env.WHATSAPP_INSTANCE || env.EVOLUTION_INSTANCE || '').trim().slice(0,120);
  const rawEventId = parsed?.eventId || String(payload?.data?.key?.id || payload?.id || hash);
  const eventId = `${instance || 'default'}:${rawEventId}`.slice(0,255);

  await client.query('BEGIN');
  try {
    const recorded = await client.query(`INSERT INTO public.provider_webhook_events(provider,event_id,event_type,resource_id,payload_hash,payload,status,attempts)
      VALUES('evolution',$1,$2,$3,$4,$5,'processing',1)
      ON CONFLICT(provider,event_id) DO NOTHING RETURNING id`,[eventId,type,instance,hash,payloadJson]);
    if (!recorded.rows[0]) {
      await client.query('COMMIT');
      return json(res,200,{received:true,duplicate:true});
    }
    const webhookId = recorded.rows[0].id;
    if(type==='QRCODE_UPDATED'){
      const qr=webhookQr(payload);
      if(qr)await client.query(`UPDATE public.whatsapp_instances SET connection_status='qrcode',qr_code_data=$2,
        last_activity_at=NOW(),last_error=NULL,updated_at=NOW() WHERE instance_name=$1`,[instance,String(qr)]);
    }else if(type==='CONNECTION_UPDATE'){
      const status=webhookConnectionStatus(payload);
      if(status)await client.query(`UPDATE public.whatsapp_instances SET
        connection_status=CASE WHEN $2='connecting' AND qr_code_data IS NOT NULL THEN 'qrcode' ELSE $2 END,
        qr_code_data=CASE WHEN $2 IN ('connected','disconnected') THEN NULL ELSE qr_code_data END,
        last_connected_at=CASE WHEN $2='connected' THEN NOW() ELSE last_connected_at END,
        last_activity_at=NOW(),last_error=NULL,updated_at=NOW() WHERE instance_name=$1`,[instance,status]);
    }
    if (!parsed) {
      await client.query(`UPDATE public.provider_webhook_events SET status='ignored',processed_at=NOW(),error_message=$2 WHERE id=$1`,
        [webhookId,type==='MESSAGES_UPSERT'?'Mensagem sem texto, própria ou de grupo.':'Evento não utilizado pela caixa de mensagens.']);
      await client.query('COMMIT');
      return json(res,200,{received:true,ignored:true});
    }

    const managed=await routeManagedConversation(client,parsed,parsed.instance||instance);

    const routed = await client.query(`SELECT c.id,c.contact_id,c.site_id
      FROM public.site_conversations c
      JOIN public.site_contacts ct ON ct.id=c.contact_id
      WHERE (c.provider_instance=$1 AND c.external_thread_key=$2)
         OR (RIGHT(regexp_replace(COALESCE(ct.phone,''),'\\D','','g'),11)=RIGHT($2,11)
           AND EXISTS (SELECT 1 FROM public.site_messages sm WHERE sm.conversation_id=c.id
             AND sm.direction='outbound' AND sm.delivery_provider='evolution-api' AND sm.delivery_status='sent'))
      ORDER BY (c.provider_instance=$1 AND c.external_thread_key=$2) DESC,c.last_message_at DESC LIMIT 1`,[parsed.instance || instance,parsed.phone]);
    const conversation = routed.rows[0];
    if (!conversation) {
      await client.query(`UPDATE public.provider_webhook_events SET status=$2,processed_at=NOW(),error_message=$3 WHERE id=$1`,
        [webhookId,managed?.routed?'processed':'ignored',managed?.routed?null:'Nenhuma conversa Nextia vinculada a este número.']);
      await client.query('COMMIT');
      return json(res,200,{received:true,routed:Boolean(managed?.routed),managedRouted:Boolean(managed?.routed),siteRouted:false,optedOut:Boolean(managed?.optedOut)});
    }

    await client.query(`INSERT INTO public.site_messages(conversation_id,direction,sender_contact_id,body,delivery_status,delivery_channel,delivery_provider,provider_reference,sent_at)
      VALUES($1,'inbound',$2,$3,'received','whatsapp','evolution-api',$4,NOW())`,
    [conversation.id,conversation.contact_id,parsed.body,parsed.eventId]);
    await client.query(`UPDATE public.site_conversations SET channel='whatsapp',status='open',provider_instance=$2,
      external_thread_key=$3,last_message_at=NOW(),updated_at=NOW() WHERE id=$1`,
    [conversation.id,parsed.instance || instance,parsed.phone]);
    if (parsed.contactName) {
      await client.query(`UPDATE public.site_contacts SET name=CASE WHEN name='' OR name='Contato WhatsApp' THEN $2 ELSE name END,updated_at=NOW() WHERE id=$1`,
        [conversation.contact_id,parsed.contactName]);
    }
    await client.query(`INSERT INTO public.notifications(user_id,title,message,type)
      SELECT m.user_id,'Nova mensagem no WhatsApp',$2,'info' FROM public.organization_members m
      JOIN public.site_instances si ON si.organization_id=m.organization_id
      WHERE si.id=$1 AND m.status='active'`,[conversation.site_id,`${parsed.contactName || 'Um contato'} respondeu pelo WhatsApp.`]);
    await client.query(`UPDATE public.provider_webhook_events SET status='processed',processed_at=NOW(),error_message=NULL WHERE id=$1`,[webhookId]);
    await client.query('COMMIT');
    return json(res,200,{received:true,routed:true,managedRouted:Boolean(managed?.routed),siteRouted:true,optedOut:Boolean(managed?.optedOut)});
  } catch (cause) {
    await client.query('ROLLBACK').catch(()=>undefined);
    throw cause;
  }
}
