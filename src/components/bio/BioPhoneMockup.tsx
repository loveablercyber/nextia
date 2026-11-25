import { useState } from 'react';
import {
  Bot,
  Check,
  Clock,
  Globe,
  Share2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';

export interface BioDemoItem {
  id: string;
  title: string;
  price: number;
  tag?: string;
}

export interface BioDemoProfile {
  segment?: string;
  initials: string;
  brand: string;
  subtitle: string;
  bioUrl: string;
  gradient: string;
  whatsappHref: string;
  ctaLabel: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  socials: string[];
  galleryColors: string[];
  items: BioDemoItem[];
  links: string[];
  chatbotGreeting: string;
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function BioPhoneMockup({ profile }: { profile: BioDemoProfile }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const addToCart = (id: string) => {
    setOrderSent(false);
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = profile.items.reduce(
    (sum, item) => sum + (cart[item.id] || 0) * item.price,
    0
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    profile.bioUrl
  )}`;

  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-2xl">
      <div className="relative overflow-hidden rounded-[2rem] bg-white text-slate-900">
        {/* Cabeçalho com Logomarca e Plano Premium */}
        <div className={`bg-gradient-to-br ${profile.gradient} px-5 pt-6 pb-5 text-center text-white`}>
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/80">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5">
              <Sparkles className="h-3 w-3" />
              Plano Premium
            </span>
            <a
              href={profile.bioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline decoration-white/50 hover:text-white"
            >
              <Globe className="h-3 w-3" />
              {profile.bioUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-lg font-black ring-2 ring-white/40 backdrop-blur">
            {profile.initials}
          </div>
          <h3 className="mt-2.5 text-base font-extrabold">{profile.brand}</h3>
          <p className="mt-0.5 text-[11px] text-white/90">{profile.subtitle}</p>

          <a
            href={profile.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {profile.ctaLabel}
          </a>
        </div>

        <div className="space-y-3 p-3.5 text-xs">
          {/* Catálogo com Carrinho */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1677FF]">
                <ShoppingBag className="h-3.5 w-3.5" />
                Catálogo &amp; Carrinho
              </span>
              {totalItems > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1677FF] px-2 py-0.5 text-[10px] font-bold text-white">
                  <ShoppingCart className="h-3 w-3" />
                  {totalItems} · {money.format(totalPrice)}
                </span>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {profile.items.map((item) => (
                <div key={item.id} className="flex flex-col justify-between rounded-lg bg-white p-2 shadow-xs">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">{item.title}</p>
                    <p className="mt-0.5 text-[11px] font-extrabold text-[#1677FF]">
                      {money.format(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item.id)}
                    className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white hover:bg-[#1677FF]"
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
                onClick={() => setOrderSent(true)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
              >
                {orderSent ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Pedido pronto no WhatsApp!
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    Finalizar compra ({money.format(totalPrice)})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Galeria de Fotos */}
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Galeria de fotos
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {profile.galleryColors.map((bgClass, idx) => (
                <div
                  key={idx}
                  className={`flex h-12 items-center justify-center rounded-lg ${bgClass} text-[10px] font-bold text-white/90`}
                >
                  Foto {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1.5">
            {profile.links.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700"
              >
                <span>{label}</span>
                <span className="text-[#1677FF]">→</span>
              </div>
            ))}
          </div>

          {/* Contatos e Redes Sociais */}
          <div className="space-y-1 rounded-xl bg-slate-50 p-2.5 text-[10px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#1677FF]" />
              <span>{profile.hours}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.socials.map((social) => (
                <span
                  key={social}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  <Share2 className="h-2.5 w-2.5 text-[#1677FF]" />
                  {social}
                </span>
              ))}
            </div>
          </div>

          {/* QR Code real + Chatbot */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <img
                src={qrUrl}
                alt={`QR Code para ${profile.bioUrl}`}
                className="h-14 w-14 rounded-lg border border-slate-200"
                loading="lazy"
              />
              <div>
                <p className="text-[11px] font-extrabold text-slate-900">Acesse no celular</p>
                <p className="text-[10px] text-slate-500">Escaneie o QR Code</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#1677FF] px-2.5 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-[#0F5FD6]"
            >
              <Bot className="h-3.5 w-3.5" />
              Chatbot
            </button>
          </div>

          {chatOpen && (
            <div className="rounded-xl border border-[#1677FF]/30 bg-[#EAF3FF] p-2.5 text-[11px] text-slate-800">
              <p className="font-bold text-[#1677FF]">Assistente Virtual</p>
              <p className="mt-1">{profile.chatbotGreeting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
