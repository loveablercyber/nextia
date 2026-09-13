# Automações

O motor usa regras versionadas com trigger, árvore de condições e ações. Automações podem ficar em rascunho, ativas, pausadas ou arquivadas, suportam dry-run e registram execução por regra e por ação.

Triggers suportados pelo motor: eventos do outbox e agendamentos por `intervalMinutes`. Eventos temporais específicos podem ser publicados no outbox pelos módulos de negócio sem uma fila paralela.

Ações internas disponíveis: distribuição de lead, atividade/follow-up no CRM, notificação administrativa, pré-preenchimento do briefing e marcos do projeto. IA e webhook passam por serviços centrais e kill switches. Ações externas exigem aprovação humana.
