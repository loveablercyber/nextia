// @ts-nocheck
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  MapPin,
  Pause,
  Play,
  Save,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
type Ticket = {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  technical_notes?: string;
  created_at: string;
  assignment_status: string;
  operational_status: string;
  service_mode?: string;
  service_city?: string;
  sla_accept_by?: string;
};
type Metrics = {
  active: number;
  awaiting_acceptance: number;
  in_service: number;
  onsite: number;
  remote: number;
};
type Notification = {
  id: string;
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
};
const priorities: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  normal: "bg-blue-50 text-blue-700",
  baixa: "bg-slate-100 text-slate-600",
};
export default function TechnicianDashboardPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [metrics, setMetrics] = useState<Metrics>({
      active: 0,
      awaiting_acceptance: 0,
      in_service: 0,
      onsite: 0,
      remote: 0,
    }),
    [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [availability, setAvailability] = useState("OFFLINE"),
    [profileReady, setProfileReady] = useState(false);
  const load = () =>
    Promise.all(
      [
        "/api/technician/tickets",
        "/api/technician/operations",
        "/api/technician/profile",
      ].map(async (url) => {
        const r = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        return d;
      }),
    )
      .then(([a, b, c]) => {
        setTickets(a.tickets);
        setMetrics(b.metrics);
        setNotifications(b.notifications);
        if (c.profile) {
          setAvailability(c.profile.availability_status);
          setProfileReady(true);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const action = async (ticketId: string, value: string, reason?: string) => {
    setBusy(ticketId + value);
    setError("");
    try {
      const r = await fetch("/api/technician/ticket-action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: value, reason }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na ação");
    } finally {
      setBusy("");
    }
  };
  const saveNotes = async (t: Ticket) => {
    setBusy(t.id + "save");
    const r = await fetch("/api/technician/update-ticket", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: t.id,
        status: t.status,
        technicalNotes: t.technical_notes,
      }),
    });
    if (r.ok) await load();
    setBusy("");
  };
  const change = (id: string, v: Partial<Ticket>) =>
    setTickets((x) => x.map((t) => (t.id === id ? { ...t, ...v } : t)));
  const updateAvailability = async (status: string) => {
    setAvailability(status);
    await fetch("/api/technician/availability", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };
  return (
    <div className="min-h-screen bg-[#F4F8FC] pb-20 text-[#07162B]">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-5">
          <div>
            <b className="text-xl">Nextia Técnico</b>
            <p className="text-xs text-slate-500">{user?.name}</p>
          </div>
          <div className="flex gap-2">
            {profileReady && (
              <select
                value={availability}
                onChange={(e) => updateAvailability(e.target.value)}
                className="min-h-11 rounded-xl border px-3 font-bold"
              >
                <option value="AVAILABLE">🟢 Disponível</option>
                <option value="BUSY">🔵 Ocupado</option>
                <option value="ON_ROUTE">🟠 Em rota</option>
                <option value="IN_SERVICE">🔵 Atendendo</option>
                <option value="BREAK">🟡 Pausa</option>
                <option value="ABSENT">⚪ Ausente</option>
                <option value="OFFLINE">⚫ Offline</option>
              </select>
            )}
            <button onClick={() => logout()} className="px-3 font-bold">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-[#1677FF]">Dashboard operacional</p>
            <h1 className="text-3xl font-black">Meus atendimentos</h1>
          </div>
          <Link
            to="/tecnico/agenda"
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#1677FF] px-4 font-bold text-white"
          >
            <CalendarDays className="h-4 w-4" />
            Agenda
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ["Ativos", metrics.active],
            ["Aceite pendente", metrics.awaiting_acceptance],
            ["Em serviço", metrics.in_service],
            ["Presenciais", metrics.onsite],
            ["Remotos", metrics.remote],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border bg-white p-4">
              <p className="text-sm text-slate-500">{l}</p>
              <p className="text-2xl font-black">{v}</p>
            </div>
          ))}
        </div>
        {error && (
          <div className="mt-5 flex gap-2 border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}
        {notifications.some((n) => !n.read_at) && (
          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="flex items-center gap-2 font-black">
              <Bell className="h-5 w-5" />
              Novas notificações
            </p>
            {notifications
              .filter((n) => !n.read_at)
              .slice(0, 3)
              .map((n) => (
                <p key={n.id} className="mt-2 text-sm">
                  <b>{n.title}:</b> {n.message}
                </p>
              ))}
          </div>
        )}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : !tickets.length ? (
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl border bg-white">
            <ClipboardList className="h-10 w-10 text-slate-300" />
            <p className="mt-3">Nenhum chamado atribuído.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {tickets.map((t) => (
              <article key={t.id} className="rounded-2xl border bg-white p-6">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{t.subject}</h2>
                    <p className="text-sm text-slate-500">
                      {t.name}
                      {t.company && ` · ${t.company}`}
                    </p>
                  </div>
                  <span
                    className={`h-fit rounded-full px-3 py-1 text-sm font-bold ${priorities[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                  {t.service_mode && (
                    <span>
                      {t.service_mode === "ONSITE"
                        ? "Presencial"
                        : t.service_mode === "REMOTE"
                          ? "Remoto"
                          : "Flexível"}
                    </span>
                  )}
                  {t.service_city && (
                    <span className="flex gap-1">
                      <MapPin className="h-3 w-3" />
                      {t.service_city}
                    </span>
                  )}
                  {t.sla_accept_by && (
                    <span className="flex gap-1">
                      <Clock3 className="h-3 w-3" />
                      Aceite até{" "}
                      {new Date(t.sla_accept_by).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 p-4 leading-7">
                  {t.message}
                </p>
                {t.assignment_status === "ASSIGNED" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => action(t.id, "ACCEPT")}
                      className="min-h-11 rounded-xl bg-green-600 font-bold text-white"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => {
                        const r = prompt("Motivo da recusa:");
                        if (r) action(t.id, "REJECT", r);
                      }}
                      className="min-h-11 rounded-xl border border-red-300 font-bold text-red-600"
                    >
                      Recusar
                    </button>
                  </div>
                )}
                {t.assignment_status === "ACCEPTED" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.service_mode === "ONSITE" && (
                      <>
                        <Action
                          label="Em rota"
                          onClick={() => action(t.id, "ON_ROUTE")}
                        />
                        <Action
                          label="No local"
                          onClick={() => action(t.id, "ON_SITE")}
                        />
                      </>
                    )}
                    <Action
                      label="Iniciar"
                      icon={<Play className="h-4 w-4" />}
                      onClick={() => action(t.id, "START")}
                    />
                  </div>
                )}
                {["IN_SERVICE", "PAUSED"].includes(t.operational_status) && (
                  <div className="mt-4 flex gap-2">
                    {t.operational_status === "IN_SERVICE" ? (
                      <Action
                        label="Pausar"
                        icon={<Pause className="h-4 w-4" />}
                        onClick={() => action(t.id, "PAUSE")}
                      />
                    ) : (
                      <Action
                        label="Retomar"
                        icon={<Play className="h-4 w-4" />}
                        onClick={() => action(t.id, "RESUME")}
                      />
                    )}
                    <Action
                      label="Finalizar"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => action(t.id, "FINISH")}
                    />
                  </div>
                )}
                <textarea
                  value={t.technical_notes || ""}
                  onChange={(e) =>
                    change(t.id, { technical_notes: e.target.value })
                  }
                  rows={3}
                  className="mt-4 w-full rounded-xl border p-3"
                  placeholder="Diagnóstico e notas técnicas"
                />
                <button
                  onClick={() => saveNotes(t)}
                  disabled={busy === t.id + "save"}
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border font-bold"
                >
                  <Save className="h-4 w-4" />
                  Salvar notas
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-white p-2 md:hidden">
        <Link to="/tecnico" className="p-2 text-center text-xs font-bold">
          Início
        </Link>
        <Link to="/tecnico" className="p-2 text-center text-xs font-bold">
          Chamados
        </Link>
        <Link
          to="/tecnico/agenda"
          className="p-2 text-center text-xs font-bold"
        >
          Agenda
        </Link>
        <Link
          to="/tecnico/recursos"
          className="p-2 text-center text-xs font-bold"
        >
          Recursos
        </Link>
      </nav>
    </div>
  );
}
function Action({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1677FF] px-4 font-bold text-white"
    >
      {icon}
      {label}
    </button>
  );
}
