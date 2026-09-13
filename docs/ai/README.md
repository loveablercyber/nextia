# Governança de IA

IA começa desativada e sem provider. O cadastro administrativo guarda apenas a URL HTTPS e o nome de uma variável de ambiente permitida; a chave nunca vai para o banco nem para o navegador.

Cada chamada usa um prompt versionado, contexto mínimo por finalidade, saída JSON validada, timeout, fallback restrito a falhas transitórias e registro de modelo, tokens, custo estimado e latência. Entradas completas não são persistidas: guarda-se hash e contexto sanitizado.

RAG não foi criado porque a auditoria não encontrou uma base documental confiável e necessária. WhatsApp e e-mail também permanecem desativados, pois não há integração real desses canais no projeto.
