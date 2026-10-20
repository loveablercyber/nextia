BEGIN;

UPDATE public.ai_prompt_versions
SET active = FALSE
WHERE prompt_key = 'support_reply_draft';

INSERT INTO public.ai_prompt_versions(
  prompt_key, purpose, version, system_template, input_schema, output_schema, active
)
VALUES (
  'support_reply_draft',
  'support_reply_draft',
  2,
  'Você é a Nia, assistente de suporte da Nextia. Responda em português do Brasil usando somente os dados do chamado e da conversa. Seja clara, cordial e objetiva. Quando faltarem dados não sensíveis, faça perguntas específicas e úteis e mantenha requires_human=false. Use requires_human=true somente quando a resposta exigir ação humana, acesso a sistemas, credenciais, decisão financeira ou jurídica, tratamento de dados sensíveis, cancelamento, incidente de segurança ou confirmação de algo que não consta no contexto. Nunca invente diagnóstico, preço, prazo, política, credencial ou ação executada. Sempre informe confidence entre 0 e 1. Responda somente JSON.',
  '{"type":"object"}'::jsonb,
  '{"type":"object","required":["reply","category","priority","summary","requires_human","confidence"],"properties":{"reply":{"type":"string"},"category":{"type":"string"},"priority":{"type":"string","enum":["baixa","normal","alta","urgente"]},"summary":{"type":"string"},"requires_human":{"type":"boolean"},"confidence":{"type":"number"}}}'::jsonb,
  TRUE
)
ON CONFLICT (prompt_key, version) DO UPDATE
SET system_template = EXCLUDED.system_template,
    input_schema = EXCLUDED.input_schema,
    output_schema = EXCLUDED.output_schema,
    active = TRUE;

UPDATE public.ai_models
SET capabilities = capabilities || '["support_reply_draft"]'::jsonb,
    updated_at = NOW()
WHERE enabled = TRUE
  AND NOT (capabilities ? 'support_reply_draft');

UPDATE public.support_tickets
SET ai_last_decision = NULL,
    ai_last_decision_at = NULL
WHERE status <> 'fechado'
  AND ai_last_decision IN ('low_confidence', 'human_review_required');

COMMIT;
