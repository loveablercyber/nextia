import { sendEvolutionText } from './evolution-client.js';

function enabled(value){return value===true||value==='true'||value===1||value==='1';}
function render(template,contact){const values={nome:contact.name||'cliente',empresa:contact.company_name||'',segmento:contact.segment_slug||''};return String(template||'').replace(/{{\s*(nome|empresa|segmento)\s*}}/gi,(_,key)=>values[String(key).toLowerCase()]||'').trim();}

function inQuietHours(quietHours,now=new Date()){
  if(!quietHours?.enabled)return false;
  const timezone=quietHours.timezone||'America/Sao_Paulo';
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);
  const value=Number(parts.find(x=>x.type==='hour')?.value||0)*60+Number(parts.find(x=>x.type==='minute')?.value||0);
  const minutes=(source)=>{const[h,m]=String(source||'').split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null;};
  const start=minutes(quietHours.start),end=minutes(quietHours.end);if(start===null||end===null||start===end)return false;
  return start<end?value>=start&&value<end:value>=start||value<end;
}

async function setting(client,key,fallback){const result=await client.query('SELECT value FROM public.automation_settings WHERE key=$1',[key]);return result.rows[0]?.value??fallback;}

export async function processWhatsAppCampaigns(client,{fetchImpl=globalThis.fetch,now=()=>new Date()}={}){
  if(!enabled(await setting(client,'whatsapp.campaigns_enabled',false)))return{skipped:'campaigns_disabled',claimed:0,sent:0,failed:0};
  const globalLimit=Math.max(1,Math.min(120,Number(await setting(client,'whatsapp.max_messages_per_minute',10))||10));
  const recent=await client.query(`SELECT COUNT(*)::int total FROM public.whatsapp_campaign_recipients WHERE sent_at>=NOW()-INTERVAL '1 minute'`);
  let allowance=Math.max(0,globalLimit-Number(recent.rows[0]?.total||0));
  if(!allowance)return{skipped:'rate_limit',claimed:0,sent:0,failed:0};

  await client.query('BEGIN');let claimed=[];
  try{
    const lock=await client.query(`SELECT pg_try_advisory_xact_lock(hashtext('nextia.whatsapp.campaign.worker')) acquired`);
    if(lock.rows[0]?.acquired===false){await client.query('COMMIT');return{skipped:'worker_locked',claimed:0,sent:0,failed:0};}
    const result=await client.query(`WITH eligible AS (
      SELECT r.id,r.campaign_id,c.send_rate_per_minute,stats.recent_sent,
        ROW_NUMBER() OVER(PARTITION BY r.campaign_id ORDER BY COALESCE(r.scheduled_at,c.scheduled_at),r.created_at) campaign_position
      FROM public.whatsapp_campaign_recipients r
      JOIN public.whatsapp_campaigns c ON c.id=r.campaign_id
      JOIN public.whatsapp_instances i ON i.id=c.instance_id
      JOIN public.whatsapp_contacts ct ON ct.id=r.contact_id
      LEFT JOIN LATERAL (SELECT COUNT(*)::int recent_sent FROM public.whatsapp_campaign_recipients recent
        WHERE recent.campaign_id=c.id AND recent.status IN ('sent','delivered','read','replied') AND recent.sent_at>=NOW()-INTERVAL '1 minute') stats ON TRUE
      WHERE c.status IN ('scheduled','running') AND c.approved_at IS NOT NULL AND COALESCE(c.scheduled_at,NOW())<=NOW()
        AND i.enabled=TRUE AND (r.status='pending' OR (r.status='queued' AND r.updated_at<NOW()-INTERVAL '10 minutes')) AND COALESCE(r.scheduled_at,NOW())<=NOW()
        AND ct.marketing_consent=TRUE AND ct.opt_out_at IS NULL
    ), candidates AS (
      SELECT id FROM eligible WHERE campaign_position<=GREATEST(0,send_rate_per_minute-recent_sent)
      ORDER BY id LIMIT $1
    ) UPDATE public.whatsapp_campaign_recipients r SET status='queued',updated_at=NOW() FROM candidates x WHERE r.id=x.id
      RETURNING r.id,r.campaign_id,r.contact_id`,[allowance]);
    claimed=result.rows;await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}

  let sent=0,failed=0;
  for(const item of claimed){
    const loaded=await client.query(`SELECT r.*,c.instance_id,c.message_body,c.quiet_hours,c.send_rate_per_minute,c.status campaign_status,
      ct.name,ct.phone,ct.company_name,ct.segment_slug,ct.marketing_consent,ct.opt_out_at,i.*
      FROM public.whatsapp_campaign_recipients r JOIN public.whatsapp_campaigns c ON c.id=r.campaign_id
      JOIN public.whatsapp_contacts ct ON ct.id=r.contact_id JOIN public.whatsapp_instances i ON i.id=c.instance_id WHERE r.id=$1`,[item.id]);
    const row=loaded.rows[0];if(!row)continue;
    if(inQuietHours(row.quiet_hours,now())){await client.query(`UPDATE public.whatsapp_campaign_recipients SET status='pending',scheduled_at=NOW()+INTERVAL '30 minutes',updated_at=NOW() WHERE id=$1`,[item.id]);continue;}
    const body=render(row.message_body,row);
    try{
      const delivered=await sendEvolutionText(row,{number:row.phone,text:body},{fetchImpl});
      await client.query(`UPDATE public.whatsapp_campaign_recipients SET status='sent',rendered_body=$2,provider_message_id=$3,failure_reason=NULL,sent_at=NOW(),updated_at=NOW() WHERE id=$1`,[item.id,body,delivered.providerMessageId]);
      await client.query(`INSERT INTO public.whatsapp_message_logs(instance_id,event_type,status,details) VALUES($1,'campaign.message.sent','success',$2)`,[row.instance_id,JSON.stringify({campaignId:row.campaign_id,recipientId:item.id})]);sent+=1;
    }catch(error){
      await client.query(`UPDATE public.whatsapp_campaign_recipients SET status='failed',rendered_body=$2,failure_reason=$3,updated_at=NOW() WHERE id=$1`,[item.id,body,String(error?.message||error).slice(0,1000)]);
      await client.query(`INSERT INTO public.whatsapp_message_logs(instance_id,event_type,status,error_code,error_message,details) VALUES($1,'campaign.message.failed','error',$2,$3,$4)`,[row.instance_id,String(error?.code||'CAMPAIGN_SEND_FAILED').slice(0,100),String(error?.message||error).slice(0,1000),JSON.stringify({campaignId:row.campaign_id,recipientId:item.id})]);failed+=1;
    }
    allowance-=1;if(allowance<=0)break;
  }
  const campaigns=[...new Set(claimed.map(x=>x.campaign_id))];
  for(const id of campaigns)await client.query(`UPDATE public.whatsapp_campaigns c SET
    status=CASE WHEN NOT EXISTS(SELECT 1 FROM public.whatsapp_campaign_recipients r WHERE r.campaign_id=c.id AND r.status IN ('pending','queued')) THEN 'completed' ELSE 'running' END,
    started_at=COALESCE(started_at,NOW()),completed_at=CASE WHEN NOT EXISTS(SELECT 1 FROM public.whatsapp_campaign_recipients r WHERE r.campaign_id=c.id AND r.status IN ('pending','queued')) THEN NOW() ELSE NULL END,
    sent_count=(SELECT COUNT(*)::int FROM public.whatsapp_campaign_recipients r WHERE r.campaign_id=c.id AND r.status IN ('sent','delivered','read','replied')),
    failed_count=(SELECT COUNT(*)::int FROM public.whatsapp_campaign_recipients r WHERE r.campaign_id=c.id AND r.status='failed'),updated_at=NOW() WHERE c.id=$1`,[id]);
  return{claimed:claimed.length,sent,failed};
}

export{inQuietHours,render as renderCampaignMessage};
