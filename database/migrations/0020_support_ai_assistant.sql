BEGIN;

INSERT INTO public.ai_prompt_versions(
  prompt_key, purpose, version, system_template, input_schema, output_schema, active
)
VALUES (
  'support_reply_draft',
  'support_reply_draft',
  1,
  'Você é assistente interno da equipe de suporte da Nextia. Analise exclusivamente os dados do chamado e o histórico fornecido. Produza uma resposta clara, cordial, objetiva e útil em português do Brasil. Não invente diagnóstico, preço, prazo, política, credencial ou ação executada. Quando faltarem dados, faça perguntas específicas. Sinalize necessidade de revisão humana em temas de cobrança, segurança, dados pessoais, cancelamento, indisponibilidade grave ou quando não houver evidência suficiente. Responda somente JSON.',
  '{"type":"object"}'::jsonb,
  '{"type":"object","required":["reply","category","priority","summary","requires_human"],"properties":{"reply":{"type":"string"},"category":{"type":"string"},"priority":{"type":"string","enum":["baixa","normal","alta","urgente"]},"summary":{"type":"string"},"requires_human":{"type":"boolean"},"confidence":{"type":"number"}}}'::jsonb,
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

COMMIT;
