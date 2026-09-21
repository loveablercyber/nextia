# Etapa 11 — Auditoria SEO inicial (Fase Zero)

Data da auditoria: 2026-09-19. Esta análise foi concluída antes de qualquer alteração funcional da Etapa 11. O estado local das Etapas 9 e 10 foi preservado.

## Resultado executivo

Status inicial: **EXISTE PARCIALMENTE, COM ERROS TÉCNICOS RELEVANTES**.

- Há metadata client-side reutilizável, páginas comerciais extensas, dados estruturados em algumas famílias, `robots.txt`, sitemap estático, GTM, UTMs first/last touch e integração dos formulários com o CRM.
- Não há CMS, hub editorial, workflow de publicação, redirect registry nem painel de conteúdo.
- Toda URL pública desconhecida recebe o shell da SPA com HTTP 200. Isto produz soft 404.
- O sitemap contém 66 URLs mantidas manualmente e não nasce da fonte oficial de conteúdo publicado.
- Metadata essencial depende da execução de JavaScript; várias rotas públicas usam apenas a metadata genérica do `index.html`.
- `/templates` e `/modelos` expõem o mesmo conteúdo sem redirect canônico no servidor.
- Drafts/itens inexistentes retornam uma tela visual de indisponibilidade, mas continuam com HTTP 200 e sem `noindex` próprio.
- `LocalBusiness` é declarado em página de cidade sem endereço/unidade física confirmada. Deve ser substituído por schema compatível com atendimento por área.
- Nenhuma integração Search Console foi encontrada. Classificação: **NÃO FOI POSSÍVEL CONFIRMAR** externamente e **NÃO EXISTE** no repositório.

## Matriz de auditoria

| Item | Status | Localização | Problema | Risco SEO | Pode reutilizar? | Ação necessária | Requisito |
|---|---|---|---|---|---|---|---|
| Componente de metadata | EXISTE PARCIALMENTE | `src/components/seo/Seo.tsx` | Canonical, robots e OG existem; Twitter está incompleto e tudo é aplicado somente após JS | Médio/alto | Sim | Expandir componente e fornecer metadata no HTML inicial | E11-R014, R020 |
| Metadata padrão | EXISTE PARCIALMENTE | `index.html` | Genérica para rotas sem `Seo`; pode ser lida antes da metadata da rota | Médio | Sim | Injeção server-side por rota e cobertura das páginas faltantes | E11-R014, R020 |
| Rotas públicas | EXISTE E FUNCIONA | `src/App.tsx` | Grande superfície dinâmica; regras de publicação estão dispersas | Alto | Sim | Criar inventário/manifesto único de URLs indexáveis | E11-R008, R017 |
| Página 404 visual | EXISTE MAS POSSUI ERRO | `src/App.tsx`, páginas dinâmicas | Não define `noindex`; servidor sempre devolve 200 | Alto | Sim | 404 HTTP real e metadata de erro | E11-R018 |
| Servidor estático | EXISTE MAS POSSUI ERRO | `server.js::serveStatic` | Fallback incondicional para `index.html` com status 200 | Crítico | Sim | Validar rotas conhecidas e devolver 404 nas demais | E11-R018 |
| Robots | EXISTE PARCIALMENTE | `public/robots.txt`, `server.js`, `src/App.tsx` | Áreas principais estão bloqueadas/noindex, mas previews e estados inválidos não são tratados de forma central | Médio | Sim | Gerar política consistente e testá-la | E11-R016 |
| Sitemap | EXISTE MAS POSSUI ERRO | `public/sitemap.xml` | 66 URLs manuais; não é derivado de fontes publicadas e pode divergir | Alto | Não como fonte | Gerar a partir de manifesto oficial; excluir draft, alias, noindex e erro | E11-R017 |
| Canonical | EXISTE PARCIALMENTE | `Seo.tsx` e componentes locais | Cobertura incompleta; aliases não redirecionam; parâmetros são ignorados apenas em páginas com `Seo` | Alto | Sim | Canonical por rota e redirects 301 dos aliases | E11-R015, R019 |
| Redirects | NÃO EXISTE | servidor/repositório | Não há registro auditável; aliases duplicados servem 200 | Alto | Não | Registro mínimo, sem loops/chains | E11-R015 |
| Schema Organization/Service/FAQ/Breadcrumb | EXISTE PARCIALMENTE | `SolucoesPage`, componentes `local` e `segment` | Implementação duplicada e manual; necessita validação por tipo | Médio | Sim | Reutilizar apenas schemas coerentes e testar JSON | E11-R021 |
| Schema LocalBusiness | EXISTE MAS POSSUI ERRO | `CityLandingPage.tsx` | Sugere entidade local sem unidade/endereço confirmado | Alto | Não | Remover/substituir por Organization/ServiceArea compatível | E11-R021, R027 |
| Breadcrumbs | EXISTE PARCIALMENTE | componentes locais/segmentos | JSON-LD existe, mas não há padrão compartilhado nem cobertura editorial | Médio | Sim | Componente/schema compartilhado nas novas páginas | E11-R022 |
| Páginas institucionais | EXISTE PARCIALMENTE | `/`, `/contato`, `/como-funciona`, `/planos`, legais | Algumas rotas não possuem metadata específica | Médio | Sim | Completar metadata e intenção | E11-R008, R014 |
| Serviços | EXISTE PARCIALMENTE | slugs em `App.tsx`, `serviceCatalog.ts` | Parte usa `ServicePage`, parte tem página própria sem `Seo` direto | Alto | Sim | Cobertura representativa e manifesto | E11-R008, R020 |
| Cidades | EXISTE PARCIALMENTE | `cities.ts`, `CityLandingPage.tsx` | Bauru/Marília têm conteúdo próprio; alias `/cidade/*`; HTTP inválido para cidade inexistente | Alto | Sim | Publicar apenas slugs autorizados; redirect de alias | E11-R009, R019 |
| Cidade + serviço | EXISTE PARCIALMENTE | `localServices.ts`, `LocalServiceLandingPage.tsx` | Conteúdo autorizado existe, mas rota genérica aceita combinações inválidas como soft 404 | Alto | Sim | Manifesto fechado + 404 real | E11-R009, R019 |
| Segmentos | EXISTE PARCIALMENTE | `segments.ts`, `SegmentLandingPage.tsx` | Há status editorial no código; inexistentes continuam HTTP 200 | Alto | Sim | Somente publicados no manifesto/sitemap | E11-R009, R019 |
| Cidade + segmento + serviço | EXISTE PARCIALMENTE | `localNicheServices.ts` | Há status e `publicationReason`, mas rota catch-all ampla aceita qualquer combinação | Alto | Sim | Gate programático testado, sem explosão de URLs | E11-R009, R019 |
| Modelos | EXISTE PARCIALMENTE | `templates.ts`, `templateMetadata.ts` | Publicação controlada no cliente; dois namespaces equivalentes; draft visual 200 | Alto | Sim | Canonical único `/modelos`, redirect 301 e manifesto | E11-R009, R015 |
| Portfólio | EXISTE E FUNCIONA | `portfolio.ts`, páginas de portfólio | Fonte está vazia por segurança; só publica autorizado e com imagem | Baixo | Sim | Preservar regra e não inventar projetos | E11-R026 |
| Cases | EXISTE E FUNCIONA | `CasesPage.tsx` | `noindex` enquanto não existem cases verificáveis | Baixo | Sim | Preservar; não criar cases fictícios | E11-R026 |
| Hub editorial | NÃO EXISTE | rotas/dados/banco | Não há `/conteudos`, `/blog`, `/guias` ou equivalente | Alto | Não | Criar um único hub enxuto | E11-R010, R012 |
| CMS/modelo de conteúdo | NÃO EXISTE | migrations/backend/frontend | Sem conteúdo, autor, revisão, SEO ou política de indexação administráveis | Alto | Não | Uma entidade `content_entries`; sem tabela paralela de metadata | E11-R011, R012 |
| Workflow editorial | NÃO EXISTE | banco/API/admin | Sem draft → review → published → archived | Alto | Não | Transições protegidas e auditáveis | E11-R013, R030 |
| Segurança/XSS editorial | NÃO APLICÁVEL ATUALMENTE | não há CMS | Passa a ser obrigatória com conteúdo administrável | Alto | — | Armazenar/renderizar Markdown restrito, rejeitar HTML/scripts/URLs perigosas | E11-R031 |
| IA editorial | EXISTE COMO INFRAESTRUTURA, NÃO INTEGRADA | Etapa 8 | Infra existe; não há uso editorial; autopublicação não existe | Médio | Sim | Não duplicar provedor; qualquer auxílio deve permanecer rascunho | E11-R029 |
| Links internos | EXISTE PARCIALMENTE | Header/Footer/cards/componentes locais | Relações existem, mas não há verificação automática de órfãs/quebradas | Médio | Sim | Relações editoriais explícitas e auditor estático simples | E11-R023, R024 |
| Imagens/alt | EXISTE PARCIALMENTE | páginas públicas | Há `alt`, dimensões e lazy em vários pontos; não há auditoria consolidada | Médio | Sim | Testar páginas afetadas; não reengenheirar toda mídia | E11-R028 |
| Analytics | EXISTE PARCIALMENTE | `index.html`, `utils/whatsapp.ts` | GTM/dataLayer existem; eventos SEO/editoriais ainda não | Médio | Sim | Adicionar somente eventos úteis | E11-R034 |
| UTMs/atribuição | EXISTE E FUNCIONA | `leadAttribution.ts`, `useQuoteStore.ts`, testes | First touch em localStorage e last touch em sessionStorage; já alimenta CRM | Baixo | Sim | Reutilizar sem sobrescrever origem | E11-R032, R033 |
| Formulários/CRM | EXISTE E FUNCIONA PARCIALMENTE | `/api/leads`, `/api/quotes`, páginas locais | Fluxos existentes recebem origem; deve-se preservar `content`/landing em CTA editorial | Médio | Sim | CTA editorial para funil existente e teste de integração | E11-R032 |
| Search Console | NÃO FOI POSSÍVEL CONFIRMAR | ambiente externo | Nenhuma integração/configuração no repositório | Baixo | Não | Registrar como opcional, sem integração complexa | E11-R035 |
| Painel SEO/conteúdo | NÃO EXISTE | admin | Necessário apenas para workflow e alertas básicos | Médio | Sim (layout/RBAC) | Tela única enxuta de conteúdo/saúde SEO | E11-R036 |
| RBAC editorial | EXISTE PARCIALMENTE | sessão/admin existentes | Papel admin existe, mas permissões editoriais ainda não | Alto | Sim | Admin cria/edita/revisa/publica/arquiva; público lê só published | E11-R030 |
| Automação controlada | EXISTE COMO ENGINE | Etapa 8 | Nenhum evento editorial | Médio | Sim | Emitir lembrete/alerta seguro; nunca autopublicar | E11-R029, R037 |
| Performance/renderização | EXISTE PARCIALMENTE | Vite SPA | Conteúdo depende de JS; bundle público é amplo | Alto | Sim | Metadata server-side e HTML acessível; sem troca de framework | E11-R020, R038 |
| PWA | EXISTE | `public/sw.js` | Precisa regressão para não cachear respostas de erro/draft como públicas | Médio | Sim | Teste de regressão; alterar só se comprovado | E11-R039 |
| Banco/migrations | NÃO EXISTE PARA E11 | migrations 0001–0010 | Nenhuma duplicata de conteúdo/SEO localizada | Médio | Sim (padrão) | Uma migration idempotente, validada sem executar em produção | E11-R011, R042 |
| Testes SEO | NÃO EXISTE | suíte atual | Sem testes de sitemap, redirects, 404, canonical, CMS ou XSS | Crítico | Sim (Vitest) | Criar testes unitários/integrados e E2E HTTP local | E11-R040–R046 |

## Inventário público por família

| URL/família | Tipo | Objetivo/intenção | Indexável hoje? | Canonical/meta | HTTP atual | Conteúdo/links/CTA | Decisão inicial |
|---|---|---|---|---|---|---|---|
| `/` | institucional | comercial/navegacional | Sim | Parcial/client-side | 200 | Conteúdo e CTAs existentes | Manter |
| serviços fixos (`/sites`, `/automacao-ia`, etc.) | serviço | comercial/transacional | Sim | Cobertura desigual | 200 | Conteúdo/CTA existentes | Completar metadata |
| `/solucoes/:segmentSlug` | segmento | comercial por setor | Apenas publicados | Client-side | 200 até para inválidos | Conteúdo setorial/CTA | Gate + 404 |
| `/bauru`, `/marilia` | cidade | local/comercial | Sim | Client-side | 200 | Conteúdo local próprio/CTA | Manter; corrigir schema |
| `/:cidade/:servico` | cidade + serviço | local/transacional | Apenas registros existentes | Client-side | 200 até para inválidos | Conteúdo específico/CTA | Gate + 404 |
| `/:cidade/:segmento/:servico` | local-nicho | local/comercial | Apenas `published` com `publicationReason` | Client-side | 200 até para inválidos | Conteúdo específico/relações/CTA | Gate fechado |
| `/modelos` e `/modelos/:slug` | modelo | comercial | Apenas publicados | Client-side | 200 até para inválidos | Catálogo/demo/CTA | Manter canonical único |
| `/templates*` | alias duplicado | navegacional | Indevidamente 200 | Canonical divergente após JS | 200 | Duplicata | 301 para `/modelos*` |
| `/portfolio*` | portfólio | autoridade/comercial | Lista vazia; detalhes só autorizados | Client-side | 200 até para inválidos | Sem projeto fictício | Preservar/404 detalhe |
| `/cases` | case | autoridade | Não (`noindex`) | Client-side | 200 | Explica ausência de cases | Preservar |
| legais | institucional | informacional | Sim | Incompleta | 200 | Conteúdo legal | Completar metadata |
| auth/admin/cliente/checkout/demo | restrita/utilitária | operacional | Não | noindex/X-Robots parcial | 200 | Fora da aquisição orgânica | Excluir sitemap |
| URL desconhecida | erro | nenhuma | Tecnicamente rastreável | Metadata genérica | **200 incorreto** | Tela 404 após JS | Corrigir para 404 |

## Mapa de intenção inicial

| Tema/query | Intenção | Página existente/necessidade | CTA | Serviço |
|---|---|---|---|---|
| criação de sites | comercial | `/sites` e páginas locais autorizadas | orçamento/modelos | sites |
| site para segmento | comercial específica | `/solucoes/:segmento` e nichos autorizados | modelo/orçamento | sites |
| automação de atendimento | comercial/informacional | `/automacao-ia`, `/automacao-whatsapp` | contato/orçamento | automação |
| suporte de TI local | local/transacional | páginas cidade + serviço autorizadas | solicitar serviço | TechCare |
| como escolher/planejar solução | informacional | **conteúdo editorial necessário** | serviço relacionado | variável |
| modelos de site | comercial/navegacional | `/modelos` | cadastro/orçamento | sites |
| metodologia Nextia | informacional/autoridade | `/como-funciona` | contato | institucional |

## Canibalização e arquitetura

- `/templates*` × `/modelos*`: duplicação técnica; consolidar em `/modelos*` com 301.
- `/sites` × `/landing-pages` × páginas locais: manter intenções distintas (serviço geral, produto específico e intenção local), com canonicals próprios.
- `/automacao-ia`, `/chatbot` e `/automacao-whatsapp`: diferenciar escopo e intenção; não consolidar automaticamente.
- Páginas locais programáticas: somente registros explicitamente publicados; a rota curinga não autoriza indexação.
- Pilar proposto, sem criação em massa: **Presença digital**, **Automação responsável**, **Operação e suporte de TI**. Conteúdos específicos serão criados individualmente via workflow, com relação explícita a serviço e CTA.

## Arquivos sem relação e código órfão

Nenhum arquivo novo da Etapa 11 existia no início. Não foi identificado segundo CMS, sitemap generator duplicado ou integração Search Console oculta. Alterações locais das Etapas 9/10 não pertencem à auditoria E11 e serão preservadas.

## Gate da Fase Zero

**PASS** — auditoria concluída sem alteração funcional, migration, rota ou conteúdo. Próxima fase: matriz integral de requisitos e plano técnico.
