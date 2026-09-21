# Etapa 11 — Matriz de requisitos

Status inicial após Fase Zero. `PASS` exige implementação, integração, teste e evidência. Os IDs agrupam instruções correlatas sem omitir o conteúdo normativo do prompt.

| ID | Requisito | Status | Arquivos | Implementação/Teste/Resultado/Evidência |
|---|---|---|---|---|
| E11-R001 | Respeitar escopo fechado; não implementar Etapa 12 nem refazer Etapas 1–10 | PASS | auditoria/diff | Escopo auditado; mudanças anteriores preservadas |
| E11-R002 | Aplicar reuse-first antes de componente, rota, CMS, tabela, API, metadata, sitemap, schema, redirect, analytics ou conteúdo | PASS | `ETAPA11_AUDITORIA.md` | Inventário comprova o que será reutilizado |
| E11-R003 | Executar Fase Zero sem codificação e classificar cada item pelos estados exigidos | PASS | `ETAPA11_AUDITORIA.md` | Auditoria anterior a qualquer mudança E11 |
| E11-R004 | Manter relatório, matriz e estado de continuidade para outra IA | PASS | docs E11, `AI_IMPLEMENTATION_STATE.md` | Auditoria, matriz, relatório final e estado atualizados |
| E11-R005 | Inventariar URL, tipo, objetivo, indexação, canonical, title, description, H1, HTTP, conteúdo, links e CTA | PASS | `ETAPA11_AUDITORIA.md` | Inventário por família e desvios registrados |
| E11-R006 | Classificar páginas institucionais, serviços, locais, segmentos, modelos, autoridade, editorial e campanha | PASS | `ETAPA11_AUDITORIA.md` | Classificação registrada |
| E11-R007 | Definir intenção query→página/conteúdo→CTA→serviço | PASS | `ETAPA11_AUDITORIA.md` | Mapa inicial registrado |
| E11-R008 | Auditar canibalização antes de consolidar, diferenciar, canonicalizar ou redirecionar | PASS | `ETAPA11_AUDITORIA.md` | Aliases e sobreposições documentados |
| E11-R009 | Proibir geração massiva; exigir gate e conteúdo suficiente para páginas programáticas | PASS | `seo-routing.js`, `seo-manifest.test.js` | Manifesto usa whitelist das fontes oficiais; teste anti-explosão passou |
| E11-R010 | Organizar pilares, clusters e hub único com temas reais | PASS | `ContentHubPage.tsx`, `content-management.js` | Hub único publica somente conteúdo aprovado; nenhum conteúdo fictício semeado |
| E11-R011 | Não duplicar CMS; criar modelo apenas porque nenhum equivalente existe | PASS | auditoria/migration | Ausência comprovada; uma entidade planejada |
| E11-R012 | Modelo editorial com título, slug, resumo, conteúdo, status, autor, datas, SEO, canonical, OG e indexing policy | PASS | `0011_seo_content.sql`, `content-management.js` | Modelo e validações cobertos por testes |
| E11-R013 | Workflow draft→review→published→archived, sem publicação automática por IA | PASS | migration/API/admin | Transições controladas; testes impedem autopublish e transições inválidas |
| E11-R014 | Padronizar title, description, H1/headings, OG e social metadata sem duplicação abusiva | PASS | `Seo.tsx`, páginas, servidor | Metadata SSR e client-side padronizada e testada |
| E11-R015 | Canonical coerente; parâmetros não criam duplicatas; mudanças de URL só com 301 sem loops/chains | PASS | `seo-routing.js`, `server.js` | Canonicals e redirects sem cadeia validados em testes/HTTP |
| E11-R016 | Robots/meta/X-Robots conscientes; público permitido, restrito/draft/noindex bloqueado | PASS | robots/server/Seo | Cabeçalhos e robots testados em HTTP local |
| E11-R017 | Sitemap válido e derivado de fontes publicadas, sem draft/admin/noindex/redirect/404/duplicata | PASS | generator/sitemap | 74 URLs indexáveis; testes de exclusão e XML passaram |
| E11-R018 | URL inexistente deve responder HTTP 404 real | PASS | `server.js` | Rota inexistente retornou HTTP 404 e noindex |
| E11-R019 | Páginas dinâmicas só respondem/indexam combinações explicitamente autorizadas | PASS | manifest/server/pages | Gate por manifesto e testes de rota inválida passaram |
| E11-R020 | Conteúdo/meta importante acessível conforme Vite SPA, sem trocar framework | PASS | server/build | HTML inicial recebe metadata por rota; verificado via HTTP |
| E11-R021 | Structured data somente compatível com conteúdo real; sem Review/Rating/LocalBusiness/Offer fictício | PASS | `CityLandingPage.tsx` | Schema incompatível removido; nenhum dado fictício adicionado |
| E11-R022 | Breadcrumbs visuais/estruturados coerentes | PASS | páginas/editorial existentes | Breadcrumbs existentes preservados; conteúdo novo usa navegação coerente |
| E11-R023 | Links internos legítimos entre conteúdo, serviços, segmentos, cidades, modelos e autoridade | PASS | páginas/relations | Relações editoriais validadas e CTA aponta ao funil existente |
| E11-R024 | Detectar órfãs e links quebrados sem crawler complexo | PASS | `scripts/audit-seo-links.js` | 44 destinos verificados, 0 quebrados |
| E11-R025 | Preservar navegação/UX; sem menu/rodapé com links em massa, facetas ou busca indexável infinita | PASS | UI/manifesto | Apenas um link de hub no rodapé; sem facetas/links em massa |
| E11-R026 | Cases/portfólio/prova social/autores/métricas somente reais e verificáveis | PASS | dados existentes | Lista de portfólio vazia; cases noindex; autoria institucional planejada |
| E11-R027 | Conteúdo local/segmento verdadeiro, sem unidade, cliente, estatística ou variação superficial inventada | PASS | dados/schemas | Schema LocalBusiness/Offer sem lastro removido |
| E11-R028 | Imagens com alt real, dimensões/lazy adequados; mobile e acessibilidade preservados | BLOCKED | páginas E11 | Inspeção estática sem erro; navegador da sessão não anexou após duas tentativas, impedindo validação visual |
| E11-R029 | Reutilizar IA/Automation Engine; auxílio só como rascunho, sem produção em massa ou autopublish | PASS | migration/automation | Evento `content.review_requested` usa outbox/automação existente; publicar continua humano |
| E11-R030 | RBAC para criar/editar/revisar/publicar/arquivar/SEO/redirect; publicação protegida | BLOCKED | API/admin/tests | Checagem admin implementada e unitária; prova autenticada em PostgreSQL real indisponível |
| E11-R031 | CMS seguro contra XSS, HTML/scripts, URL maliciosa e upload indevido | PASS | API/renderer/tests | Markdown seguro; HTML/script/data/javascript rejeitados por testes |
| E11-R032 | Conteúdo/CTA alimentar funil existente e CRM, preservando landing/source/medium/campaign/referrer/city/segment/service/content | BLOCKED | attribution/content/tests | Atribuição unitária passou; fluxo completo até CRM depende de banco/ambiente autenticado |
| E11-R033 | Preservar first/last touch e UTMs; não criar tracking paralelo | PASS | `leadAttribution.ts`, testes | Infra existente comprovada |
| E11-R034 | Reutilizar GTM/dataLayer e adicionar apenas eventos orgânicos/editoriais úteis | PASS | content pages | Eventos mínimos usam `dataLayer` existente; nenhum analytics paralelo |
| E11-R035 | Search Console opcional se ausente; não inventar dados nem integração complexa | PASS | auditoria | Ausência no repo registrada; nenhum dado fictício |
| E11-R036 | Admin enxuto para conteúdo e saúde SEO; não criar suíte tipo Ahrefs | PASS | `AdminContentPage.tsx` | Tela limitada a workflow e campos editoriais necessários |
| E11-R037 | Automação segura para revisão/metadata/link/desatualização, nunca autopublicação | PASS | migration/engine | Automação apenas notifica revisão; sem transição automática para published |
| E11-R038 | Corrigir apenas performance/renderização diretamente ligada ao SEO | PASS | server/public pages/App | Metadata SSR e demo pesada carregada sob demanda; bundle medido no build |
| E11-R039 | Preservar compatibilidade com rotas, APIs, banco, auth, checkout, pagamentos, CRM, PWA, WhatsApp e analytics | PASS | suíte/build | Suíte automatizada e build preservam integrações cobertas; lacunas E2E classificadas separadamente |
| E11-R040 | Testar metadata/canonical em cidade, serviço, segmento, local, modelo, case e conteúdo | PASS | testes SEO | Famílias e aliases representativos cobertos |
| E11-R041 | Testar robots/noindex público, admin, cliente e draft | PASS | testes/HTTP | Manifesto, server e conteúdo privado validados |
| E11-R042 | Testar sitemap XML e migrations; somente URLs válidas/publicadas | BLOCKED | testes/migration | XML e contrato SQL passaram; execução da migration em PostgreSQL descartável indisponível |
| E11-R043 | Testar redirects 301, destino e ausência de loop | PASS | `seo-routing.test.js`, HTTP | Alias `/templates` retorna 301 para destino canônico |
| E11-R044 | Testar 404, schema, links internos, draft e URLs programáticas | PASS | testes SEO/conteúdo | Cobertura automatizada e auditor de links passaram |
| E11-R045 | Testar CMS/RBAC/XSS e publicação/arquivamento | BLOCKED | `content-management.test.js` | Workflow/XSS passaram; integração RBAC com banco/autenticação real bloqueada |
| E11-R046 | Testar lead orgânico conteúdo→CTA→formulário→CRM e atribuição | BLOCKED | attribution tests | Preservação UTM passou; E2E até CRM requer banco/ambiente autenticado |
| E11-R047 | Executar typecheck, lint, build, unitários, integração e E2E relevante | BLOCKED | scripts existentes | Unitários, lint, typecheck, build e HTTP passaram; browser E2E e DB real indisponíveis |
| E11-R048 | Regressão Home, cidades, serviços, segmentos, modelos, portfólio, checkout, formulários, CRM e PWA | BLOCKED | testes/E2E | Regressão automatizada passou; verificação visual/browser não pôde anexar |
| E11-R049 | Não alterar preços, regras comerciais ou prometer ranking/vendas/ROI garantidos | PASS | escopo | Nenhuma mudança comercial planejada |
| E11-R050 | Não criar Ads, spam, backlinks automáticos, link farms ou presença local fictícia | PASS | escopo | Fora de escopo e não implementado |
| E11-R051 | Preparar ciclo de aquisição e dados para análise futura sem implementar Etapa 12 | PASS | content/analytics/CRM | Campos de atribuição e eventos mínimos preservam análise posterior |
| E11-R052 | Não apagar conteúdo/URLs automaticamente; arquivamento deve decidir noindex/manutenção/redirect | PASS | CMS/API | Arquivamento não destrutivo com política `keep_noindex`/`not_found` |
| E11-R053 | Permitir identificar conteúdo desatualizado sem atualizar fatos automaticamente | PASS | CMS/admin | `review_due_at` identifica revisão; nenhuma atualização factual automática |
| E11-R054 | Auditar todos os arquivos novos/modificados contra E11-Rxxx; remover só órfãos criados nesta etapa | PASS | diff final | Arquivos E11 mapeados; nenhum órfão comprovado |
| E11-R055 | Revisar git status/diff/stat e procurar TODO/FIXME/debug/mock/placeholder/hardcode/segredo/morto/fora do escopo | PASS | diff final | Revisão executada; ocorrências legítimas documentadas, sem segredo novo |
| E11-R056 | Relatório final completo e auditoria requisito a requisito sem suposições | PASS | `ETAPA11_FINAL_REPORT.md` | Relatório final registra evidências e blockers sem declarar conclusão |
| E11-R057 | Zero falhas, não testados, pendências obrigatórias, regressões e alterações injustificadas para declarar conclusão | BLOCKED | todos | Blockers externos de DB/browser impedem o gate zero |
| E11-R058 | Não fazer push sem autorização explícita posterior à auditoria final | PASS | git | Nenhum push será feito |

## Plano técnico autorizado

1. Manifesto SEO único gerado das fontes publicadas existentes; sitemap/redirect/404 dependem dele.
2. Metadata no HTML servido e cobertura client-side; remover schema incompatível.
3. Uma migration `0011`, um módulo de API editorial, um hub público e uma tela admin — nenhum segundo CMS.
4. Conteúdo como Markdown restrito; HTML cru e URLs perigosas rejeitados; público lê somente `published`.
5. CTA usa rotas/formulários existentes, UTMs e first/last touch; eventos passam pelo `dataLayer` atual.
6. Outbox/Automation Engine apenas para revisão e alertas; nenhuma publicação automática.
7. Testes unitários, integração HTTP, build/typecheck, lint, regressão e auditoria final do diff.
