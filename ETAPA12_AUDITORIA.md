# Etapa 12 — Auditoria inicial (Fase Zero)

Data: 2026-09-19
Regra aplicada: nenhuma funcionalidade, migration ou infraestrutura da Etapa 12 foi criada antes desta auditoria.

## 1. Estado real e método

Foram lidos o prompt integral da Etapa 12, relatórios das Etapas 8–11, código frontend/backend, migrations, APIs, configuração de deploy, testes, `git status`, `git diff`, dependências e ativos. Foram executados somente diagnósticos não destrutivos, a suíte existente e um servidor local explicitamente sem `DATABASE_URL`.

Arquitetura atual: React 19 + TypeScript + Vite; backend HTTP Node sem framework; PostgreSQL via `pg.Client`; migrations SQL com checksum/advisory lock; outbox/worker PostgreSQL; Cloudinary; Mercado Pago; Resend opcional; sessão HMAC em cookie; deploy documentado por Docker/Nixpacks e configuração Vercel também presente.

## 2. Baseline mensurável

| Métrica | Resultado | Condição |
|---|---:|---|
| Testes | 13 arquivos / 98 testes PASS | Vitest serial, sem PostgreSQL real |
| Lint | PASS | `eslint .` |
| Build/typecheck | PASS | `npm run build`; 1.963 módulos |
| CSS | 188,86 kB; gzip 26,43 kB | build de produção |
| JS principal | 1.557,33 kB; gzip 374,23 kB | após correção E11; ainda acima do aviso de 500 kB |
| Demo isolada | 222,41 kB; gzip 47,49 kB | chunk lazy da Etapa 11 |
| Maior imagem fonte | 1.605.192 bytes | `src/assets/nextia-hero-v2.png` |
| Processo Node local | ~58,2 MB working set / ~73,4 MB private | servidor sem DB, amostra única |
| `/` local | mediana 96,60 ms; 3.098 bytes | 5 GETs localhost, sem rede/DB |
| `/health` local | mediana 117,44 ms; 54 bytes | 5 GETs; máximo 7.714,64 ms inclui cold start |
| manifesto SEO | mediana 43,23 ms; 37.131 bytes | 5 GETs localhost |
| JS principal servido | mediana 514,15 ms; 1.557.326 bytes | inclui transferência local; 5 GETs |

Os números locais são baseline comparativo, não SLO de produção. Não houve manipulação de amostra: mínimo, mediana e máximo foram preservados na evidência de execução.

## 3. Matriz de auditoria por área

| Área | Status | Gargalo / estado | Evidência | Impacto | Risco | Prioridade | Ação | Requisito |
|---|---|---|---|---|---|---|---|---|
| Frontend público | FAIL | chunk inicial de 1,56 MB e dezenas de páginas eager | build e imports de `src/App.tsx` | carregamento e parse em páginas públicas | alto | P0 | dividir por famílias de rota e medir novamente | E12-R013 |
| Frontend autenticado | FAIL | dashboards/admin/cliente/técnico majoritariamente eager | `src/App.tsx` linhas 49–116 | público baixa código privado desnecessário | alto | P0 | lazy loading por layout/rota | E12-R013 |
| Imagens | FAIL | hero PNG de 1,60 MB; estratégia não uniforme | inventário de `src/assets`/`public` | LCP/banda | médio | P1 | localizar uso, dimensões e conversão comprovada | E12-R014 |
| Cache frontend/PWA | PASS | SW cacheia somente shell/ativos públicos e exclui áreas sensíveis | `public/sw.js` | reduz risco de cache privado | baixo | manter | testar invalidação após chunks | E12-R015 |
| Backend | FAIL | monólito de ~4.800 linhas, conexão DB nova por requisição e ausência de métricas de duração | `server.js`, `dbClient()` | latência/conexões difíceis de medir | alto | P0 | medir; considerar pool existente `pg`, sem reescrever arquitetura | E12-R016 |
| Payload/body | FAIL | limite global de JSON = 32 MB para todos endpoints | `server.js:readJson` | DoS/memória; formulários aceitam muito além do necessário | alto | P0 | limites por classe de endpoint | E12-R020/R040 |
| Queries | BLOCKED | SQL inventariado, mas sem `EXPLAIN ANALYZE` seguro | banco descartável ausente | índices/N+1 não comprováveis em dados reais | alto | P0 | executar em staging descartável | E12-R017 |
| Paginação | FAIL | oportunidades, propostas, engagements, domains, migration issues e admin data retornam tudo | `crm-api.js`, `app-api.js` | payload/latência crescem sem limite | alto | P0 | paginação limitada e compatível | E12-R020 |
| Conteúdo/automação/logs | PENDENTE | listas limitadas a 200/250, mas sem cursor/total consistente | APIs correspondentes | degradação futura controlada apenas parcialmente | médio | P1 | padronizar limites onde necessário | E12-R020 |
| Índices | PENDENTE | vários índices orientados às queries já existem | migrations 0001–0011 | base razoável | médio | P1 | não criar novos sem EXPLAIN | E12-R018 |
| N+1 | PENDENTE | várias agregações SQL/laterais evitam N+1; `loadProjects` e telas precisam medição real | módulos API | risco ainda não quantificado | médio | P1 | instrumentar e medir antes de alterar | E12-R019 |
| Cache backend | PASS | não existe Redis/cache comercial prematuro | inventário | evita dados desatualizados/infra duplicada | baixo | manter | só adicionar com evidência | E12-R021 |
| Filas/jobs | PASS | outbox PostgreSQL + worker com `SKIP LOCKED`, retry e dead-letter | Etapa 8, migrations/engine/tests | infraestrutura única e idempotente | baixo | manter | medir fila e falhas | E12-R022/R023 |
| Webhooks/idempotência | PENDENTE | chaves/idempotência presentes; testes reais duplicado/fora de ordem bloqueados | Mercado Pago/outbox | efeitos duplicados mitigados localmente | alto | P0 | sandbox real e testes de concorrência | E12-R023/R042 |
| Rate limiting | FAIL | lead e algumas mutações têm limite em memória; login/register/reset e APIs caras não | `app-api.js`, `customer-success.js`, `server.js` | brute force/abuso; mapa por processo | crítico | P0 | reutilizar limitador mínimo e cobrir auth/endpoints críticos | E12-R024/R040 |
| Storage | PENDENTE | uploads autenticados, allowlist e 20 MB; Cloudinary; órfãos não auditados | `app-api.js`, Etapa 9 | custo/storage órfão possível | médio | P1 | inventário referencial, sem apagar automaticamente | E12-R025 |
| CDN | PENDENTE | Cloudinary entrega arquivos; ativos recebem cache imutável no Node | server/Cloudinary | base existente reutilizável | baixo | P2 | validar ambiente real, não criar CDN | E12-R025 |
| Dependências externas | FAIL | fetches Mercado Pago, Resend, Cloudinary/S3 sem timeout consistente | 12 chamadas backend encontradas | requests podem ficar presos | crítico | P0 | timeout por operação; retry só idempotente | E12-R026 |
| Auth | FAIL | fallback de segredo fixo existe mesmo em produção; sem rate limit de login | `server.js:29`, rotas auth | falsificação de sessão se secret omitido | crítico | P0 | falhar startup em produção sem secret; rate limit | E12-R036/R040 |
| RBAC/RLS/IDOR | PARTIAL | RBAC/ownership em aplicação e testes; nenhuma RLS/policy encontrada | APIs/migrations | depende integralmente do backend | alto | P0 | preservar controles; testar perfis reais; não inventar RLS sem necessidade | E12-R040 |
| Health | FAIL | `/health` retorna `ok` sem verificar DB; implementação detalhada é inalcançável pelo handler anterior | `server.js:4248` e `4704` | monitor pode declarar saudável com DB indisponível | crítico | P0 | health leve e readiness real sem segredos | E12-R028 |
| Logs | FAIL | logs não estruturados e sem request ID/duração global; reset link é logado quando Resend falta | `server.js`, módulos API | baixa rastreabilidade; exposição de token em log | crítico | P0 | logger estruturado mínimo, correlação e remover token de reset | E12-R027/R040 |
| Métricas/alertas | MISSING | não há request rate/latency/error rate nem alertas configurados no repo | busca estática | falhas e regressões invisíveis | alto | P0 | métricas/alertas acionáveis no mecanismo disponível | E12-R028 |
| Error tracking | BLOCKED | nenhuma ferramenta identificada; ambiente externo desconhecido | repo | não se deve criar tracker próprio | médio | P1 | confirmar plataforma/deploy e reutilizar recurso existente | E12-R028 |
| Eventos/dados | PENDENTE | outbox e nomes canônicos existem, porém coexistem aliases legados e não há contrato central completo | docs/events, produtores | análise inconsistente | médio | P1 | documentar taxonomia/versão sem renomear em massa | E12-R029 |
| Analytics | FAIL | dataLayer cobre sobretudo WhatsApp/editorial; métricas operacionais estão fragmentadas | `src/utils/whatsapp.ts`, dashboards | jornada completa não mensurável de forma única | alto | P0 | consolidar eventos existentes e fórmulas, sem analytics paralelo | E12-R030/R031 |
| KPI/dashboard | PENDENTE | CRM, técnico, automação e CS têm painéis separados; não há visão consolidada confiável | páginas admin/APIs | decisão operacional fragmentada | médio | P1 | visão mínima somente com dados calculáveis | E12-R032 |
| Regional | FAIL | 2 cidades (`bauru`, `marilia`) são dados em TS, mas sem `active`, disponibilidade/preço por serviço ou workflow de ativação | `src/data/cities.ts`, manifesto | expansão exige código/deploy e pode publicar tudo | alto | P0 | configuração mínima com gate de ativação; sem multi-tenant/cópia de catálogo | E12-R004–R011 |
| SEO regional | PENDENTE | manifesto limita combinações e Etapa 11 proíbe explosão; cidades existentes entram automaticamente | gerador/manifesto/testes | nova cidade pode indexar antes do gate operacional | alto | P0 | vincular publicação a ativação/conteúdo validado | E12-R006/R043 |
| LGPD/retenção | PENDENTE | controles de acesso e sanitização existem; política global de retenção/anonimização não está documentada | código/docs | risco de retenção indefinida | alto | P1 | documentar por entidade; não apagar automaticamente | E12-R033 |
| Backups | PENDENTE | criação, rotação, download, restore/rollback e logs existem | `server.js`, AdminBackup | implementação existe, garantia não | crítico | P0 | teste de restore em ambiente descartável e RPO/RTO | E12-R034 |
| Disaster recovery | FAIL | não há plano proporcional com responsável/ação/validação | busca em docs | recuperação depende de conhecimento tácito | alto | P1 | documentar DR e diferença backup/DR | E12-R034 |
| CI/CD | FAIL | nenhum workflow de CI; Docker/Nixpacks executam migration no startup; Vercel reescreve tudo para SPA | inventário `.github`, Docker, Nixpacks, Vercel | deploy pode ocorrer sem gates; configuração ambígua | alto | P0 | definir pipeline real e documentar alvo; não trocar plataforma | E12-R035 |
| Migrations | PENDENTE | checksum, ordem lexicográfica, transação e advisory lock; numeração pula 0007; schemas também autoexecutam no startup | `scripts/migrate.js`, módulos ensure | boa base, mas dois caminhos de DDL | alto | P0 | escolher fonte canônica e validar ordem/staging | E12-R036 |
| Ambientes/secrets | BLOCKED | `.env.example` existe; development/staging/production reais não comprovados | repo sem credenciais externas | gates externos não executáveis | alto | P0 | inventariar plataforma com autorização | E12-R036 |
| Deploy/rollback | PENDENTE | scripts de smoke/verify e backup rollback; procedimento completo não documentado | scripts/config | reversão incerta | alto | P1 | runbook proporcional | E12-R035/R036 |
| Custos | BLOCKED | nenhum dado real de compute/DB/storage/IA/email/WhatsApp | ambiente externo | não é possível otimizar sem números | médio | P2 | registrar como indisponível; não inventar KPI | E12-R038 |
| Testes de carga | FAIL | não há cenário/load harness | testes atuais | limite operacional desconhecido | alto | P1 | carga local/staging plausível, nunca produção | E12-R041 |
| E2E/roadmap | BLOCKED | browser não anexou; DB/sandbox/sessões não disponíveis | relatórios E9–E11 | jornada completa não comprovada | crítico | P0 | staging seguro + contas/credenciais teste | E12-R045–R047 |
| Git/escopo | PENDENTE | worktree contém mudanças justificadas E9–E11 e nenhuma mudança E12 antes dos docs | status/diff/stat | risco de misturar etapas | alto | P0 | manter rastreabilidade e não remover trabalho anterior | E12-R048 |

## 4. Reuse first — componentes oficiais

- Região/SEO: `CITIES_DATA`, serviços locais, manifesto e sitemap da Etapa 11.
- Dados operacionais: PostgreSQL transacional; não criar warehouse/tenant.
- Fila/jobs: `outbox_events`, `AutomationWorker`, retry/dead-letter da Etapa 8.
- Eventos/auditoria: outbox e `audit_log`.
- Métricas existentes: dashboards CRM, técnico, automação e customer success.
- Storage/CDN: Cloudinary e headers de cache do servidor.
- Auth/RBAC: sessão e roles existentes, com hardening pontual.
- Deploy/migration: Docker/Nixpacks, `scripts/migrate.js`, verify/smoke scripts.
- Backup/restore: módulo administrativo existente.

Não há evidência para Redis, nova fila, novo analytics, data warehouse, multi-tenancy, CDN própria, circuit breaker, novo error tracker ou uma segunda aplicação por cidade.

## 5. Segurança prioritária

1. Fallback de segredo de sessão em produção.
2. Ausência de rate limit em autenticação.
3. Reset link completo registrado em log quando e-mail não está configurado.
4. Chamadas externas sem timeout.
5. Health check falso-positivo.
6. Limite JSON global excessivo.

Esses itens pertencem diretamente ao escopo E12 e podem ser corrigidos no mínimo necessário após o gate documental.

## 6. Blockers reais

- PostgreSQL descartável: migrations, EXPLAIN, concorrência, RLS/RBAC real, backup/restore.
- Contas admin/cliente/técnico e credenciais sandbox: E2E e jornada completa.
- Browser anexável: QA visual e E2E de interface.
- Dados/plataforma de produção: custos, alertas, CDN, ambientes e SLO reais.

Nenhum recurso externo foi alterado. A tentativa de iniciar o servidor herdando a `DATABASE_URL` foi rejeitada preventivamente; a medição local foi repetida com `DATABASE_URL` explicitamente vazia.

## 7. Arquivos e escopo

Antes dos documentos E12, o worktree já continha implementações documentadas das Etapas 9–11. Nenhum desses arquivos foi removido ou atribuído falsamente à Etapa 12. Não foi encontrada dependência nova da Etapa 12, arquivo órfão criado nesta etapa ou funcionalidade E12 fora do prompt.

## 8. Decisão da Fase Zero

A Etapa 12 começa em estado **NÃO CONCLUÍDA**. Há gargalos comprovados e corrigíveis localmente, além de validações externas bloqueadas. A próxima fase autorizada é consolidar a matriz e um plano de correções P0 pequenas e mensuráveis; nenhuma reconstrução, multi-tenancy, warehouse, Redis ou plataforma paralela é justificada.
