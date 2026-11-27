import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Popup = {
  id: string;
  title: string;
  type: 'image' | 'text';
  image_url?: string | null;
  image_link?: string | null;
  image_alt?: string | null;
  description?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  delay_seconds: number;
  dismiss_hours: number;
};

const EXCLUDED = /^\/(admin|painel|parceiro|tecnico|checkout|login|cadastro|recuperar-senha|redefinir-senha|bio|suporte\/ticket|demo|demonstracao|crie-seu-site)(?:\/|$)/;

function dismissKey(id: string) {
  return `nextia_popup_dismissed_${id}`;
}

function linkProps(href?: string | null) {
  if (!href) return {};
  const external = /^https?:\/\//i.test(href);
  return external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };
}

export default function MarketingPopup() {
  const { pathname } = useLocation();
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (EXCLUDED.test(pathname)) {
      setPopup(null);
      setVisible(false);
      return;
    }
    let cancelled = false;
    let timer: number | undefined;
    setPopup(null);
    setVisible(false);
    (async () => {
      try {
        const response = await fetch(`/api/marketing/popups?path=${encodeURIComponent(pathname)}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data?.popup) return;
        const next = data.popup as Popup;
        const dismissedAt = Number(localStorage.getItem(dismissKey(next.id)) || 0);
        if (dismissedAt && Date.now() - dismissedAt < (Number(next.dismiss_hours) || 24) * 3600000) return;
        const delay = Math.max(0, Number(next.delay_seconds) || 0) * 1000;
        timer = window.setTimeout(() => {
          if (!cancelled) {
            setPopup(next);
            setVisible(true);
          }
        }, delay);
      } catch {
        // Falha na consulta não deve impactar a navegação do site.
      }
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [pathname]);

  const close = () => {
    if (popup) localStorage.setItem(dismissKey(popup.id), String(Date.now()));
    setVisible(false);
  };

  if (!visible || !popup) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || 'Aviso'}
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-lg font-black text-white hover:bg-black/70"
        >
          ×
        </button>

        {popup.type === 'image' ? (
          <a {...linkProps(popup.image_link)} className="block" onClick={popup.image_link ? undefined : close}>
            {popup.image_url ? (
              <img src={popup.image_url} alt={popup.image_alt || popup.title || 'Promoção'} className="h-56 w-full object-cover" />
            ) : null}
          </a>
        ) : (
          <div className="space-y-4 p-6">
            <h3 className="text-2xl font-black text-slate-900">{popup.title}</h3>
            {popup.description && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{popup.description}</p>}
            {popup.button_text && (
              popup.button_link ? (
                <a
                  {...linkProps(popup.button_link)}
                  className="inline-flex min-h-11 items-center rounded-xl bg-[#2086FF] px-5 font-bold text-white hover:bg-[#1a6ecc]"
                >
                  {popup.button_text}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex min-h-11 items-center rounded-xl bg-[#2086FF] px-5 font-bold text-white hover:bg-[#1a6ecc]"
                >
                  {popup.button_text}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
