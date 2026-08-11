// @ts-nocheck
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
type Event = {
  id: string;
  event_type: string;
  title: string;
  starts_at: string;
  ends_at: string;
  notes?: string;
};
export default function TechnicianAgendaPage() {
  const [events, setEvents] = useState<Event[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [form, setForm] = useState({
      eventType: "REMOTE",
      title: "",
      startsAt: "",
      endsAt: "",
      notes: "",
    });
  const load = () =>
    fetch("/api/technician/operations", {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setEvents(d.calendar || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/technician/calendar", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setForm({
      eventType: "REMOTE",
      title: "",
      startsAt: "",
      endsAt: "",
      notes: "",
    });
    load();
  };
  return (
    <main className="min-h-screen bg-[#F4F8FC] px-5 py-8 text-[#07162B]">
      <div className="mx-auto max-w-6xl">
        <Link to="/tecnico" className="flex items-center gap-2 font-bold">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-5 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
          <form
            onSubmit={save}
            className="h-fit rounded-2xl border bg-white p-6"
          >
            <h1 className="flex items-center gap-2 text-2xl font-black">
              <Plus />
              Novo compromisso
            </h1>
            <label className="mt-5 block font-bold">
              Tipo
              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm({ ...form, eventType: e.target.value })
                }
                className="mt-2 min-h-11 w-full rounded border px-3"
              >
                <option value="REMOTE">Suporte remoto</option>
                <option value="ONSITE">Visita</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="BLOCK">Bloqueio</option>
              </select>
            </label>
            <label className="mt-4 block font-bold">
              Título
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 min-h-11 w-full rounded border px-3"
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="font-bold">
                Início
                <input
                  required
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                  className="mt-2 min-h-11 w-full rounded border px-3"
                />
              </label>
              <label className="font-bold">
                Fim
                <input
                  required
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="mt-2 min-h-11 w-full rounded border px-3"
                />
              </label>
            </div>
            <label className="mt-4 block font-bold">
              Observações
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-2 w-full rounded border p-3"
              />
            </label>
            {error && <p className="mt-3 text-red-600">{error}</p>}
            <button className="mt-5 min-h-11 w-full rounded-xl bg-[#1677FF] font-bold text-white">
              Adicionar à agenda
            </button>
          </form>
          <section>
            <h2 className="flex items-center gap-2 text-3xl font-black">
              <CalendarDays />
              Agenda
            </h2>
            {loading ? (
              <Loader2 className="mt-10 animate-spin" />
            ) : (
              <div className="mt-5 space-y-3">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border bg-white p-5"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#1677FF]">
                          {event.event_type}
                        </p>
                        <h3 className="text-lg font-black">{event.title}</h3>
                        <p className="text-sm text-slate-500">{event.notes}</p>
                      </div>
                      <div className="text-right text-sm">
                        <b>
                          {new Date(event.starts_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </b>
                        <p>
                          {new Date(event.starts_at).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                          –
                          {new Date(event.ends_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
                {!events.length && (
                  <p className="rounded-2xl border bg-white p-10 text-center text-slate-500">
                    Nenhum compromisso futuro.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
