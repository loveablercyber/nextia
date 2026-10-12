import { AutomationError } from './automation-core.js';

const ENV_NAME = /^[A-Z][A-Z0-9_]{2,100}$/;

function envValue(name, env) {
  if (!ENV_NAME.test(String(name || ''))) throw new AutomationError('Referência de credencial inválida.', { code:'EVOLUTION_ENV_INVALID', status:500 });
  return String(env[name] || '').trim();
}

function endpointBase(value) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch { throw new AutomationError('URL da Evolution API inválida.', { code:'EVOLUTION_URL_INVALID', status:503 }); }
  if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) {
    throw new AutomationError('A Evolution API deve usar HTTPS.', { code:'EVOLUTION_URL_INSECURE', status:503 });
  }
  return url.toString().replace(/\/$/,'');
}

export function evolutionConfig(instance, env = process.env) {
  const baseUrl = endpointBase(envValue(instance?.api_url_env || 'WHATSAPP_API_URL',env));
  const apiKey = envValue(instance?.api_key_env || 'WHATSAPP_API_KEY',env);
  const instanceName = String(instance?.instance_name || env.WHATSAPP_INSTANCE || env.EVOLUTION_INSTANCE || '').trim();
  if (!apiKey || !instanceName) throw new AutomationError('Credenciais ou instância da Evolution API não configuradas.', { code:'EVOLUTION_NOT_CONFIGURED', status:503 });
  return {baseUrl,apiKey,instanceName};
}

function providerError(response,data) {
  const providerMessage = data?.response?.message || data?.error?.message || data?.message;
  const retryable = response.status===408 || response.status===409 || response.status===425 || response.status===429 || response.status>=500;
  return new AutomationError(providerMessage || `Evolution API respondeu HTTP ${response.status}.`, {
    code:`EVOLUTION_HTTP_${response.status}`,status:response.status===401?503:502,retryable,
  });
}

export function normalizeEvolutionStatus(data) {
  const raw = String(data?.instance?.state || data?.state || data?.status || data?.connectionStatus || 'unknown').toLowerCase();
  const hasQr = Boolean(data?.base64 || data?.code || data?.qrcode?.base64 || data?.qrCode);
  if (hasQr && !['open','connected','online','ready'].includes(raw)) return 'qrcode';
  if (['open','connected','online','ready'].includes(raw)) return 'connected';
  if (['connecting','starting','reconnecting'].includes(raw)) return 'connecting';
  if (['close','closed','disconnected','offline','logged_out'].includes(raw)) return 'disconnected';
  if (raw==='qrcode' || raw==='qr') return 'qrcode';
  return 'unknown';
}

export function evolutionQr(data) {
  return data?.base64 || data?.qrcode?.base64 || data?.qrCode || data?.code || null;
}

export function normalizeWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g,'');
  const normalized = digits.length===10 || digits.length===11 ? `55${digits}` : digits;
  if (!/^55\d{10,11}$/.test(normalized)) throw new AutomationError('Informe telefone brasileiro com DDD.', { code:'WHATSAPP_NUMBER_INVALID', status:400 });
  return normalized;
}

export async function evolutionRequest(instance,path,{method='GET',body,fetchImpl=globalThis.fetch,env=process.env,timeoutMs=20000}={}) {
  const config = evolutionConfig(instance,env);
  let response;
  try {
    response = await fetchImpl(`${config.baseUrl}${path.replace('{instance}',encodeURIComponent(config.instanceName))}`,{
      method,signal:AbortSignal.timeout(timeoutMs),headers:{apikey:config.apiKey,'x-api-key':config.apiKey,'Content-Type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
  } catch (cause) {
    if (cause instanceof AutomationError) throw cause;
    throw new AutomationError('Não foi possível conectar à Evolution API.', { code:'EVOLUTION_NETWORK_ERROR', status:503, retryable:true });
  }
  const text = await response.text();
  let data={};
  try { data=text?JSON.parse(text):{}; } catch { data={raw:text.slice(0,500)}; }
  if (!response.ok) throw providerError(response,data);
  return data;
}

export const getEvolutionStatus = (instance,options) => evolutionRequest(instance,'/instance/connectionState/{instance}',options);
export const getEvolutionQr = (instance,options) => evolutionRequest(instance,'/instance/connect/{instance}',options);
export const restartEvolution = (instance,options) => evolutionRequest(instance,'/instance/restart/{instance}',{...options,method:'POST'});
export const logoutEvolution = (instance,options) => evolutionRequest(instance,'/instance/logout/{instance}',{...options,method:'DELETE'});
export const getEvolutionWebhook = (instance,options) => evolutionRequest(instance,'/webhook/find/{instance}',options);

export function configureEvolutionWebhook(instance,webhookUrl,options={}) {
  return evolutionRequest(instance,'/webhook/set/{instance}',{...options,method:'POST',body:{webhook:{
    enabled:true,url:webhookUrl,byEvents:false,base64:false,
    events:['MESSAGES_UPSERT','MESSAGES_UPDATE','CONNECTION_UPDATE','QRCODE_UPDATED','SEND_MESSAGE'],
  }}});
}

export async function sendEvolutionText(instance,{number,text},options={}) {
  const message=String(text || '').trim();
  if (!message) throw new AutomationError('A mensagem não pode ficar vazia.', { code:'WHATSAPP_MESSAGE_EMPTY', status:400 });
  const data=await evolutionRequest(instance,'/message/sendText/{instance}',{...options,method:'POST',body:{number:normalizeWhatsAppNumber(number),text:message}});
  return {data,providerMessageId:data?.key?.id || data?.messageId || data?.id || null};
}
