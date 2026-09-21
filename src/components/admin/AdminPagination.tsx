interface AdminPaginationProps {
  page: number;
  total: number;
  limit?: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ page, total, limit = 50, onPageChange }: AdminPaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
      <span>Página {page} de {pages} · {total} registros</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))} className="rounded-xl bg-slate-100 px-3 py-2 font-bold disabled:opacity-40">Anterior</button>
        <button disabled={page >= pages} onClick={() => onPageChange(Math.min(pages, page + 1))} className="rounded-xl bg-slate-100 px-3 py-2 font-bold disabled:opacity-40">Próxima</button>
      </div>
    </nav>
  );
}
