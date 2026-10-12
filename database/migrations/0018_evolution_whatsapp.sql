-- Evolution API integration for the multi-tenant site inbox.
-- The API key and webhook secret remain environment variables and are never stored here.

ALTER TABLE public.site_conversations
  ADD COLUMN IF NOT EXISTS provider_instance TEXT,
  ADD COLUMN IF NOT EXISTS external_thread_key TEXT;

CREATE INDEX IF NOT EXISTS idx_site_conversations_provider_thread
  ON public.site_conversations(provider_instance,external_thread_key,last_message_at DESC)
  WHERE provider_instance IS NOT NULL AND external_thread_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_site_messages_provider_reference
  ON public.site_messages(delivery_provider,provider_reference)
  WHERE provider_reference IS NOT NULL;
