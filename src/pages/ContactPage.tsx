import { useEffect, useState } from 'react';
import { Mail, MessageCircle, MapPin, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contato — Nextia';
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketTrackingLink, setTicketTrackingLink] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', subject: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/support/create-ticket', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao criar chamado de suporte');
      }

      const data = await response.json();
      setTicketTrackingLink(data.trackingLink);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    'Quero contratar um site pronto',
    'Quero um projeto personalizado',
    'Dúvidas sobre planos e preços',
    'Suporte técnico',
    'Financeiro / Pagamentos',
    'Outro assunto',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" size="md" className="mb-4">Contato</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Fale com a nossa equipe
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Estamos aqui para ajudar. Escolha o canal mais conveniente para você.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact options */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Canais de atendimento</h2>

            {[
              {
                icon: MessageCircle,
                color: '#25D366',
                bg: '#f0fdf4',
                title: 'WhatsApp',
                subtitle: 'Resposta rápida',
                value: '(14) 99640-5496',
                action: 'https://wa.me/5514996405496',
                label: 'Iniciar conversa',
              },
              {
                icon: Mail,
                color: '#5B4FE9',
                bg: '#eef2ff',
                title: 'E-mail',
                subtitle: 'Resposta em até 24h úteis',
                value: 'ola@nextia.dev.br',
                action: 'mailto:ola@nextia.dev.br',
                label: 'Enviar e-mail',
              },
              {
                icon: Phone,
                color: '#7c3aed',
                bg: '#f5f3ff',
                title: 'Telefone',
                subtitle: 'Seg–Sex, 9h–18h',
                value: '(14) 99640-5496',
                action: 'tel:+5514996405496',
                label: 'Ligar agora',
              },
              {
                icon: MapPin,
                color: '#ef4444',
                bg: '#fef2f2',
                title: 'Localização',
                subtitle: 'Atendimento remoto',
                value: 'Bauru, SP — Brasil',
                action: '#',
                label: 'Atendimento remoto',
              },
            ].map(({ icon: Icon, color, bg, title, subtitle, value, action, label }) => (
              <a
                key={title}
                href={action}
                target={action.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-bold text-sm">{title}</div>
                  <div className="text-gray-400 text-xs">{subtitle}</div>
                  <div className="text-gray-600 text-sm font-medium mt-0.5">{value}</div>
                </div>
                <div className="text-xs text-[#5B4FE9] font-semibold group-hover:underline">{label}</div>
              </a>
            ))}

            {/* Response time */}
            <div className="bg-[#eef2ff] rounded-2xl p-4 border border-[#c7d2fe]">
              <div className="font-semibold text-[#5B4FE9] text-sm mb-2">⚡ Horário de atendimento</div>
              <div className="text-gray-600 text-xs space-y-1">
                <div>Segunda–Sexta: 9h às 18h</div>
                <div>Sábado: 9h às 13h</div>
                <div>Domingo e feriados: Sem atendimento</div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Chamado criado!</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Recebemos sua solicitação! Um e-mail de confirmação contendo o link de acompanhamento foi enviado. 
                    Você pode visualizar o status e responder à nossa equipe clicando no botão abaixo:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {ticketTrackingLink && (
                      <a href={ticketTrackingLink} className="w-full sm:w-auto">
                        <Button variant="gradient" size="lg" fullWidth>
                          Acompanhar Chamado
                        </Button>
                      </a>
                    )}
                    <a href="https://wa.me/5514996405496" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" fullWidth>
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Envie sua mensagem</h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-sm text-red-600 font-semibold animate-fade-in">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Nome completo *
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="João Silva"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          E-mail *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="joao@empresa.com.br"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          WhatsApp
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Empresa / Negócio
                        </label>
                        <input
                          id="company"
                          type="text"
                          value={form.company}
                          onChange={e => setForm({ ...form, company: e.target.value })}
                          placeholder="Nome do seu negócio"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Assunto *
                      </label>
                      <select
                        id="subject"
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all bg-white"
                      >
                        <option value="">Selecione o assunto</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Mensagem *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Descreva como podemos ajudar você..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all resize-none"
                      />
                    </div>

                    <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading}>
                      <Send className="w-4 h-4" />
                      {loading ? 'Enviando...' : 'Enviar mensagem'}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      Seus dados são tratados com segurança e nunca serão compartilhados com terceiros.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
