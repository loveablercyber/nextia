-- Delivery tracking for replies sent from the multi-tenant site inbox.

ALTER TABLE public.site_messages
  ADD COLUMN IF NOT EXISTS delivery_channel TEXT
    CHECK (delivery_channel IN ('email','whatsapp')),
  ADD COLUMN IF NOT EXISTS delivery_provider TEXT,
  ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_error TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_site_messages_delivery
  ON public.site_messages(delivery_status,created_at)
  WHERE direction='outbound';

-- Recover replies created before provider delivery existed.
UPDATE public.site_messages sm
SET delivery_channel=CASE WHEN ct.email IS NOT NULL THEN 'email' WHEN ct.phone IS NOT NULL THEN 'whatsapp' END
FROM public.site_conversations c
JOIN public.site_contacts ct ON ct.id=c.contact_id
WHERE sm.conversation_id=c.id AND sm.direction='outbound' AND sm.delivery_status='queued' AND sm.delivery_channel IS NULL;

UPDATE public.outbox_events e
SET status='pending',attempts=0,available_at=NOW(),processed_at=NULL,locked_at=NULL,locked_by=NULL,last_error=NULL,
    dead_lettered_at=NULL,discarded_at=NULL
WHERE e.event_type='site.message_reply_requested'
  AND e.status IN ('completed','dead_letter','discarded')
  AND EXISTS (
    SELECT 1 FROM public.site_messages sm
    WHERE sm.id::text=e.payload->>'messageId' AND sm.delivery_status='queued' AND sm.delivery_channel IS NOT NULL
  );
