export async function automationApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });

  const raw = await response.text();
  let data: unknown = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      if (response.ok) {
        throw new Error(`A API retornou uma resposta inválida (HTTP ${response.status}).`);
      }
    }
  }

  if (!response.ok) {
    const apiError = data && typeof data === 'object' && 'error' in data
      ? String((data as { error?: unknown }).error || '')
      : '';
    if (apiError) throw new Error(apiError);

    const proxyError = response.status >= 500
      ? `O servidor ou proxy não conseguiu concluir a operação (HTTP ${response.status}). Consulte os logs do serviço Nextia.`
      : `Falha na operação (HTTP ${response.status}).`;
    throw new Error(proxyError);
  }

  return data as T;
}

export function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
}
