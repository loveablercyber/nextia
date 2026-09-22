# Decisões

## DEC-001 — Groq é o provider inicial

- Data: 2026-09-22
- Motivo: requisito explícito.
- Impacto: provider OpenAI-compatible com segredo apenas no servidor.

## DEC-002 — Modelo configurável

- Data: 2026-09-22
- Decisão: `qwen/qwen3.8-27b` é default solicitado, nunca caminho espalhado pelo frontend; disponibilidade será validada em runtime e haverá fallback configurável.
- Impacto: configuração persistida e troca sem recompilação.

## DEC-003 — Assets 22/33 exclusivamente locais

- Data: 2026-09-22
- Motivo: remover hotlinks e controlar cache/falhas.
- Impacto: runtime, `.moc`, `.mtn`, texturas e manifestos em `public/live2d`.

## DEC-004 — Nenhuma dependência do Moedog

- Data: 2026-09-22
- Impacto: nenhuma URL do Moedog em código ou assets executáveis.

## DEC-005 — Live2D nunca é crítico

- Data: 2026-09-22
- Impacto: lazy loading, error boundary próprio e fallback em três níveis.

## DEC-006 — Reutilizar a infraestrutura de IA da Etapa 8

- Data: 2026-09-22
- Motivo: `AIService`, tabelas de providers/modelos/prompts e telemetria já estão corretos para automações.
- Impacto: o agente conversacional terá serviço próprio, mas compartilhará configuração/observabilidade compatíveis e não criará um segundo cadastro de provider.

## DEC-007 — Assets upstream e direitos

- Data: 2026-09-22
- Decisão: preservar GPL-2.0 e atribuição; usar somente roupa default não adulta.
- Motivo: o upstream é GPL-2.0 e declara propriedade dos personagens pela Bilibili.
- Impacto: validação jurídica comercial continua sendo responsabilidade externa ao código.

## DEC-008 — Fallback Groq não depreciado

- Data: 2026-09-22
- Decisão: usar `openai/gpt-oss-20b` como fallback inicial do `qwen/qwen3.8-27b`.
- Motivo: a documentação oficial atual do Groq confirma Qwen 3.8 em preview e informa que `llama-3.3-70b-versatile` foi descontinuado em 2026-08-16.
- Impacto: falha/indisponibilidade do preview pode seguir para um modelo de produção ativo sem alterar o frontend.

## DEC-009 — Resumo local e orçamento antes do provider

- Data: 2026-09-22
- Decisão: compactar contexto antigo deterministicamente, sem uma segunda chamada de IA, e bloquear novas chamadas ao atingir o limite global diário de chamadas ou tokens.
- Motivo: o resumo não pode gerar um custo que anule a economia do contexto reduzido; FAQ e navegação local devem continuar funcionando mesmo com orçamento esgotado.
- Impacto: o resumo é deliberadamente factual e curto; chamadas ao Groq dependem dos dois limites configuráveis no admin.

## DEC-010 — Feedback com vínculo mínimo

- Data: 2026-09-22
- Decisão: aceitar apenas `up`/`down` para respostas pertencentes à mesma sessão derivada no servidor.
- Motivo: impedir avaliação de mensagens alheias e evitar rastreamento excessivo.
- Impacto: analytics guarda referência da resposta, sessão e usuário opcional, sem comentário livre.
