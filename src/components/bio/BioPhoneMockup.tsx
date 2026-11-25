import { useState } from 'react';
import {
  Bot,
  Check,
  Clock,
  Globe,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { BioDemoProfile } from '../../data/nextiaBioDemos';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

export default function BioPhoneMockup({
  profile,
  standalone = false,
  fullPage = false,
}: {
  profile: BioDemoProfile;
  standalone?: boolean;
  fullPage?: boolean;
}) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: profile.chatbotGreeting },
  ]);

  const addToCart = (id: string) => {
    setOrderSent(false);
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const cartItems = profile.items
    .filter((item) => (cart[item.id] || 0) > 0)
    .map((item) => ({ ...item, qty: cart[item.id] }));

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    profile.bioUrl
  )}`;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (profile.isOfficialNextia) {
      const chosenPlan = cartItems[0]?.planId || 'pro';
      setCartOpen(false);
      navigate(`/checkout?service=nextia-bio&plan=${chosenPlan}`);
      return;
    }
    setOrderSent(true);
  };

  const handleSendChat = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: content },
      {
        sender: 'bot',
        text: `Obrigado pela mensagem! Nossa equipe em ${profile.brand} já pode continuar seu atendimento pelo WhatsApp.`,
      },
    ]);
    if (!textToSend) setChatInput('');
  };

  const s = {
    headerPad: fullPage ? 'px-6 pt-10 pb-8' : 'px-5 pt-6 pb-5',
    logo: fullPage ? 'h-20 w-20' : 'h-14 w-14',
    brand: fullPage ? 'text-2xl' : 'text-base',
    subtitle: fullPage ? 'text-sm' : 'text-[11px]',
    cta: fullPage ? 'text-sm' : 'text-xs',
    content: fullPage ? 'space-y-4 p-5 text-sm' : 'space-y-3 p-3.5 text-xs',
    label: fullPage ? 'text-xs' : 'text-[11px]',
    tiny: fullPage ? 'text-xs' : 'text-[10px]',
    item: fullPage ? 'text-sm' : 'text-[11px]',
    btn: fullPage ? 'text-xs' : 'text-[10px]',
    link: fullPage ? 'text-sm' : 'text-[11px]',
    contact: fullPage ? 'text-xs' : 'text-[10px]',
  };

  const frameClass = fullPage
    ? 'mx-auto w-full max-w-md'
    : standalone
      ? 'mx-auto w-full max-w-[420px] rounded-[2rem] border border-slate-200 bg-white shadow-xl'
      : 'mx-auto w-full max-w-[340px] rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-2xl';

  return (
    <div className={frameClass}>
      <div
        className={`relative bg-white text-slate-900 ${fullPage ? '' : 'rounded-[2rem]'}`}
        style={fullPage ? undefined : { overflow: cartOpen || chatOpen ? 'hidden' : 'auto' }}
      >
        {/* Cabeçalho com Logomarca real e URL funcional */}
        <div className={`bg-gradient-to-br ${profile.gradient} ${s.headerPad} text-center text-white`}>
          <div className="mb-3 flex items-center justify-center">
            <Link
              to={profile.bioPath}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white hover:bg-white/25"
            >
              <Globe className="h-3 w-3" />
              {profile.bioUrl.replace(/^https?:\/\//, '')}
            </Link>
          </div>

          <img
            src={profile.logoUrl}
            alt={`Logomarca ${profile.brand}`}
            className={`mx-auto ${s.logo} rounded-2xl bg-white object-contain p-1.5 shadow-md ring-2 ring-white/40`}
          />
          <h3 className={`mt-2.5 ${s.brand} font-extrabold`}>{profile.brand}</h3>
          <p className={`mt-0.5 ${s.subtitle} text-white/90`}>{profile.subtitle}</p>

          <a
            href={profile.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={`mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 ${s.cta} font-bold text-white shadow-md transition hover:bg-emerald-600`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {profile.ctaLabel}
          </a>
        </div>

        <div className={s.content}>
          {/* Catálogo com Carrinho e Checkout */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 ${s.label} font-bold uppercase tracking-wider text-[#1677FF]`}>
                <ShoppingBag className="h-3.5 w-3.5" />
                Catálogo &amp; Carrinho
              </span>
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full bg-[#1677FF] px-2.5 py-0.5 ${s.btn} font-bold text-white hover:bg-[#0F5FD6]`}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Ver carrinho ({totalItems})
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {profile.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg bg-white p-2 shadow-xs"
                >
                  <div>
                    <p className={`${s.item} font-bold leading-tight text-slate-800`}>{item.title}</p>
                    <p className={`mt-0.5 ${s.item} font-extrabold text-[#1677FF]`}>
                      {money.format(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item.id)}
                    className={`mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-1 ${s.btn} font-bold text-white hover:bg-[#1677FF]`}
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </button>
                </div>
              ))}
            </div>

            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className={`mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 ${s.label} font-bold text-white hover:bg-emerald-700`}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Abrir carrinho · {money.format(totalPrice)}
              </button>
            )}
          </div>

          {/* Galeria de Fotos real + Link para página dedicada */}
          <div className="rounded-xl border border-slate-200 p-2.5">
            <div className="flex items-center justify-between">
              <p className={`inline-flex items-center gap-1 ${s.tiny} font-bold uppercase tracking-wider text-slate-500`}>
                <Images className="h-3.5 w-3.5 text-[#1677FF]" />
                Galeria de fotos
              </p>
              <Link
                to={`${profile.bioPath}/galeria`}
                className={`${s.tiny} font-bold text-[#1677FF] hover:underline`}
              >
                Ver galeria completa →
              </Link>
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {profile.gallery.map((photo) => (
                <Link
                  key={photo.src}
                  to={`${profile.bioPath}/galeria`}
                  className="group overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-12 w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Botões de Ação Funcionais */}
          <div className="space-y-1.5">
            {profile.links.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 ${s.link} font-bold text-slate-700 transition hover:border-[#1677FF] hover:text-[#1677FF]`}
                >
                  <span>{item.label}</span>
                  <span className="text-[#1677FF]">→</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 ${s.link} font-bold text-slate-700 transition hover:border-[#1677FF] hover:text-[#1677FF]`}
                >
                  <span>{item.label}</span>
                  <span className="text-[#1677FF]">→</span>
                </Link>
              )
            )}
          </div>

          {/* Contatos e Redes Sociais reais */}
          <div className={`space-y-1 rounded-xl bg-slate-50 p-2.5 ${s.contact} text-slate-600`}>
            <a href={profile.phoneHref} className="flex items-center gap-1.5 hover:text-[#1677FF]">
              <Phone className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.phone}</span>
            </a>
            <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-[#1677FF]">
              <Mail className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.email}</span>
            </a>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-[#1677FF]" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0 text-[#1677FF]" />
              <span>{profile.hours}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.socials.map((social) =>
                social.href.startsWith('http') ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200 hover:ring-[#1677FF]"
                  >
                    <Share2 className="h-2.5 w-2.5 text-[#1677FF]" />
                    {social.label}
                  </a>
                ) : (
                  <Link
                    key={social.label}
                    to={social.href}
                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200 hover:ring-[#1677FF]"
                  >
                    <Share2 className="h-2.5 w-2.5 text-[#1677FF]" />
                    {social.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* QR Code real + Botão Chatbot */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <img
                src={qrUrl}
                alt={`QR Code para ${profile.bioUrl}`}
                className="h-14 w-14 rounded-lg border border-slate-200"
                loading="lazy"
              />
              <div>
                <p className={`${s.item} font-extrabold text-slate-900`}>Acesse no celular</p>
                <p className={`${s.tiny} text-slate-500`}>Escaneie o QR Code</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className={`inline-flex items-center gap-1 rounded-xl bg-[#1677FF] px-2.5 py-2 ${s.btn} font-bold text-white shadow-sm hover:bg-[#0F5FD6]`}
            >
              <Bot className="h-3.5 w-3.5" />
              Chatbot
            </button>
          </div>
        </div>

        {/* Modal Interno do Carrinho e Checkout */}
        {cartOpen && (
          <div className={`${fullPage ? 'fixed' : 'absolute'} inset-0 z-20 flex flex-col justify-end bg-slate-900/60 backdrop-blur-[1px]`}>
            <div className="max-h-[85%] overflow-y-auto rounded-t-2xl bg-white p-4 text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="flex items-center gap-1.5 font-extrabold text-slate-900">
                  <ShoppingCart className="h-4 w-4 text-[#1677FF]" />
                  Seu carrinho
                </h4>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  aria-label="Fechar carrinho"
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="py-6 text-center text-slate-500">Seu carrinho está vazio.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2.5"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="text-[11px] font-semibold text-[#1677FF]">
                          {money.format(item.price * item.qty)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label={`Diminuir quantidade de ${item.title}`}
                          className="rounded-md border border-slate-200 p-1 hover:bg-slate-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-4 text-center font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label={`Aumentar quantidade de ${item.title}`}
                          className="rounded-md border border-slate-200 p-1 hover:bg-slate-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remover ${item.title}`}
                          className="ml-1 rounded-md p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!profile.isOfficialNextia && (
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome (opcional)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#1677FF] focus:outline-none"
                    />
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm font-extrabold">
                    <span>Total</span>
                    <span className="text-[#1677FF]">{money.format(totalPrice)}</span>
                  </div>

                  {orderSent ? (
                    <div className="rounded-xl bg-emerald-50 p-3 text-center text-emerald-800">
                      <p className="inline-flex items-center gap-1 font-bold">
                        <Check className="h-4 w-4" />
                        Pedido demonstrativo preparado!
                      </p>
                      <p className="mt-1 text-[11px]">
                        {customerName ? `${customerName}, o ` : 'O '}resumo foi gerado para envio no WhatsApp.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1677FF] px-4 py-2.5 font-bold text-white hover:bg-[#0F5FD6]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {profile.isOfficialNextia
                        ? 'Ir para o checkout Nextia'
                        : 'Finalizar pedido no WhatsApp'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pop-up / Modal Flutuante do Chatbot */}
        {chatOpen && (
          <div className={`${fullPage ? 'fixed' : 'absolute'} inset-0 z-20 flex flex-col justify-end bg-slate-900/60 backdrop-blur-[1px]`}>
            <div className="flex max-h-[82%] flex-col rounded-t-2xl bg-white p-3.5 text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1677FF] text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">Assistente {profile.brand}</p>
                    <p className="text-[10px] text-emerald-600">Online agora</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  aria-label="Fechar chatbot"
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-2.5 flex-1 space-y-2 overflow-y-auto pr-1">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                      msg.sender === 'bot'
                        ? 'bg-slate-100 text-slate-800'
                        : 'ml-auto bg-[#1677FF] text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {profile.chatbotReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleSendChat(reply)}
                    className="rounded-full border border-[#1677FF]/30 bg-[#EAF3FF] px-2.5 py-1 text-[10px] font-bold text-[#1677FF] hover:bg-[#1677FF] hover:text-white"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  aria-label="Mensagem para o chatbot"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[11px] focus:border-[#1677FF] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensagem"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1677FF] text-white hover:bg-[#0F5FD6]"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
