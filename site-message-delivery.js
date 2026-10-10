import { AutomationError } from './automation-core.js';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parsePayload(value) {
  if (value && typeof value === 'object') return value;
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}

function retryableStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function providerError(message, { code, status, responseBody = '' }) {
  return new AutomationError(message, {
    code,
    retryable: retryableStatus(status),
    status,
    details: String(responseBody || '').slice(0, 500),
  });
}

function whatsappNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

async function sendEmail(message, { fetchImpl, env }) {
  if (!env.RESEND_API_KEY) throw new AutomationError('Provedor de e-mail não configurado.', { code: 'RESEND_NOT_CONFIGURED', retryable: false });
  if (!message.contact_email) throw new AutomationError('O contato não possui e-mail.', { code: 'CONTACT_EMAIL_MISSING', retryable: false });
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `site-message/${message.id}`,
    },
    body: JSON.stringify({
      from: env.RESEND_SITE_FROM || env.RESEND_FROM || 'Nextia Sites <suporte@nextia.dev.br>',
      to: [message.contact_email],
      reply_to: message.owner_email || undefined,
      subject: `Re: ${message.subject} — ${message.business_name}`,
      text: `${message.body}\n\nMensagem enviada pela equipe de ${message.business_name}.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#172033"><p>Olá, ${escapeHtml(message.contact_name)}!</p><div style="white-space:pre-wrap;line-height:1.65;background:#f7f7fb;border-radius:12px;padding:18px">${escapeHtml(message.body)}</div><p style="color:#64748b;font-size:13px">Mensagem enviada pela equipe de ${escapeHtml(message.business_name)}.</p></div>`,
    }),
  });
  const responseBody = await response.text();
  if (!response.ok) throw providerError(`Resend respondeu HTTP ${response.status}.`, { code: `RESEND_HTTP_${response.status}`, status: response.status, responseBody });
  let data = {};
  try { data = JSON.parse(responseBody); } catch { /* provider returned an empty success body */ }
  return { provider: 'resend', reference: data.id || null };
}

async function sendWhatsApp(message, { fetchImpl, env }) {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_API_VERSION) {
    throw new AutomationError('Provedor do WhatsApp não configurado.', { code: 'WHATSAPP_NOT_CONFIGURED', retryable: false });
  }
  const to = whatsappNumber(message.contact_phone);
  if (to.length < 12 || to.length > 15) throw new AutomationError('Telefone do contato inválido para WhatsApp.', { code: 'CONTACT_PHONE_INVALID', retryable: false });
  const version = String(env.WHATSAPP_API_VERSION).replace(/^v/i, '').replace(/[^0-9.]/g, '');
  if (!version) throw new AutomationError('Versão da API do WhatsApp inválida.', { code: 'WHATSAPP_VERSION_INVALID', retryable: false });
  const directReply = message.conversation_channel === 'whatsapp';
  if (!directReply && !env.WHATSAPP_REPLY_TEMPLATE_NAME) {
    throw new AutomationError('Template aprovado para iniciar conversa no WhatsApp não configurado.', { code: 'WHATSAPP_TEMPLATE_NOT_CONFIGURED', retryable: false });
  }
  const providerBody = directReply
    ? { messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body: message.body } }
    : {
        messaging_product:'whatsapp',recipient_type:'individual',to,type:'template',
        template:{name:env.WHATSAPP_REPLY_TEMPLATE_NAME,language:{code:env.WHATSAPP_REPLY_TEMPLATE_LANGUAGE || 'pt_BR'},components:[{type:'body',parameters:[{type:'text',text:message.body.slice(0,1024)}]}]},
      };
  const response = await fetchImpl(`https://graph.facebook.com/v${version}/${encodeURIComponent(env.WHATSAPP_PHONE_NUMBER_ID)}/messages`, {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(providerBody),
  });
  const responseBody = await response.text();
  if (!response.ok) throw providerError(`WhatsApp respondeu HTTP ${response.status}.`, { code: `WHATSAPP_HTTP_${response.status}`, status: response.status, responseBody });
  let data = {};
  try { data = JSON.parse(responseBody); } catch { /* provider returned an empty success body */ }
  return { provider: 'whatsapp-cloud-api', reference: data.messages?.[0]?.id || null };
}

export async function deliverSiteMessage(client, event, { fetchImpl = globalThis.fetch, env = process.env } = {}) {
  const payload = parsePayload(event.payload);
  if (!payload.messageId) throw new AutomationError('Evento de mensagem sem messageId.', { code: 'SITE_MESSAGE_ID_MISSING', retryable: false });
  const result = await client.query(`SELECT sm.id,sm.body,sm.delivery_status,sm.delivery_channel,
      c.id conversation_id,c.subject,c.channel conversation_channel,ct.name contact_name,ct.email contact_email,ct.phone contact_phone,
      si.id site_id,si.business_name,p.email owner_email
    FROM public.site_messages sm
    JOIN public.site_conversations c ON c.id=sm.conversation_id
    JOIN public.site_contacts ct ON ct.id=c.contact_id
    JOIN public.site_instances si ON si.id=c.site_id
    JOIN public.organizations o ON o.id=si.organization_id
    LEFT JOIN public.profiles p ON p.id=o.owner_user_id
    WHERE sm.id=$1 AND sm.conversation_id=$2 AND si.id=$3 AND sm.direction='outbound'`,
  [payload.messageId,payload.conversationId,payload.siteId]);
  const message = result.rows[0];
  if (!message) throw new AutomationError('Mensagem de saída não encontrada.', { code: 'SITE_MESSAGE_NOT_FOUND', retryable: false });
  if (message.delivery_status === 'sent') return { skipped: 'already_sent' };
  if (!['email','whatsapp'].includes(message.delivery_channel)) throw new AutomationError('Canal de entrega inválido.', { code: 'DELIVERY_CHANNEL_INVALID', retryable: false });

  await client.query(`UPDATE public.site_messages SET delivery_attempts=delivery_attempts+1,delivery_error=NULL WHERE id=$1`, [message.id]);
  try {
    const delivered = message.delivery_channel === 'email'
      ? await sendEmail(message,{fetchImpl,env})
      : await sendWhatsApp(message,{fetchImpl,env});
    await client.query(`UPDATE public.site_messages SET delivery_status='sent',delivery_provider=$2,provider_reference=$3,
      delivery_error=NULL,sent_at=NOW() WHERE id=$1`, [message.id,delivered.provider,delivered.reference]);
    return { channel:message.delivery_channel,...delivered };
  } catch (error) {
    await client.query(`UPDATE public.site_messages SET delivery_error=$2 WHERE id=$1`, [message.id,String(error.message || error).slice(0,1000)]);
    throw error;
  }
}

export async function markSiteMessageFailed(client, event, error) {
  const payload = parsePayload(event.payload);
  if (!payload.messageId) return;
  await client.query(`UPDATE public.site_messages SET delivery_status='failed',delivery_error=$2 WHERE id=$1 AND delivery_status<>'sent'`,
    [payload.messageId,String(error.message || error).slice(0,1000)]);
}
