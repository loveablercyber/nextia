import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Bot, ChevronDown, EyeOff, MessageCircle, Send, ThumbsDown, ThumbsUp, Volume2, VolumeX, X } from 'lucide-react';
import { avatarEventBus } from './eventBus';
import { getAvatarModel, isAuthorizedModelId } from './registry';
import { avatarStateController } from './stateController';
import type { AvatarModelId, AvatarState } from './types';

const Live2DCanvas = lazy(() => import('./Live2DCanvas').then((module) => ({ default: module.Live2DCanvas })));

interface PublicConfig {
  enabled: boolean; live2dEnabled: boolean; aiEnabled: boolean; voiceEnabled: boolean;
  config: { model: AvatarModelId; desktop: boolean; tablet: boolean; mobile: boolean; desktopSize: number; tabletSize: number; mobileSize: number; position: 'left' | 'right'; draggable: boolean; minimizable: boolean; hideable: boolean; followCursor: boolean; voiceAutoplay: boolean; volume: number; speechRate: number; idleSeconds: number; agentName: string; welcomeMessage: string; performanceProfile: 'high' | 'balanced' | 'economy' | 'fallback' };
}
interface Message { role: 'user' | 'assistant'; text: string; id?: string; feedback?: 'up' | 'down'; action?: { type: 'open_page'; path: string; label: string } | null }

const STORAGE_KEY = 'nextia.visual-agent.preferences.v1';
interface Preferences { voice: boolean; offset: { x: number; y: number } }

export default function VisualAgentWidget() {
  const [settings, setSettings] = useState<PublicConfig | null>(null);
  const [state, setState] = useState<AvatarState>('idle');
  const [fallback, setFallback] = useState<0 | 1 | 2>(0);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [voice, setVoice] = useState(() => readPreferences().voice);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>(() => viewportKind());
  const [offset, setOffset] = useState(() => readPreferences().offset);
  const dragStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  useEffect(() => avatarStateController.subscribe(setState), []);
  useEffect(() => { const resize = () => setViewport(viewportKind()); window.addEventListener('resize', resize, { passive: true }); return () => window.removeEventListener('resize', resize); }, []);
  useEffect(() => {
    const load = () => fetch('/api/visual-agent/config', { credentials: 'include', cache: 'no-store' }).then((response) => response.ok ? response.json() : null).then((data: PublicConfig | null) => {
      if (!data?.enabled) return;
      setSettings(data); setMessages([{ role: 'assistant', text: data.config.welcomeMessage }]);
    }).catch(() => undefined);
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(load, { timeout: 2500 });
    else timeoutId = globalThis.setTimeout(load, 900);
    return () => { if (idleId !== undefined) window.cancelIdleCallback(idleId); if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId); };
  }, []);

  useEffect(() => {
    if (!settings) return;
    const timer = window.setTimeout(() => avatarEventBus.emit({ type: 'USER_IDLE' }), settings.config.idleSeconds * 1000);
    const wake = () => avatarEventBus.emit({ type: 'USER_INTERACTION' });
    window.addEventListener('pointerdown', wake, { once: true });
    return () => { window.clearTimeout(timer); window.removeEventListener('pointerdown', wake); };
  }, [settings, messages]);

  const modelId = settings && isAuthorizedModelId(settings.config.model) ? settings.config.model : '22';
  const model = getAvatarModel(modelId);
  const alignment = settings?.config.position === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5';
  const handleLive2DFailure = useCallback(() => setFallback(1), []);
  const handleLive2DReady = useCallback(() => setFallback(0), []);

  const speak = useCallback((text: string) => {
    if (!voice || !settings?.voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; utterance.volume = settings.config.volume; utterance.rate = settings.config.speechRate;
    utterance.onstart = () => avatarEventBus.emit({ type: 'AI_RESPONSE_STARTED' });
    utterance.onend = () => avatarEventBus.emit({ type: 'AI_RESPONSE_FINISHED' });
    utterance.onerror = () => avatarEventBus.emit({ type: 'AI_ERROR' });
    window.speechSynthesis.speak(utterance);
  }, [settings, voice]);

  async function submit(event: FormEvent) {
    event.preventDefault(); const message = input.trim(); if (!message || busy) return;
    setInput(''); setMessages((current) => [...current, { role: 'user', text: message }]); setBusy(true);
    avatarEventBus.emit({ type: 'AI_THINKING' });
    try {
      const response = await fetch('/api/visual-agent/chat', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, online: navigator.onLine }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Falha ao consultar o assistente.');
      const next = { role: 'assistant' as const, text: String(data.message), id: typeof data.messageId === 'string' ? data.messageId : undefined, action: data.suggestedAction || null };
      setMessages((current) => [...current, next]); avatarStateController.setState(data.avatarState || 'success'); if (data.speak !== false) speak(next.text);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error instanceof Error ? error.message : 'Não foi possível responder agora.' }]);
      avatarEventBus.emit({ type: 'AI_ERROR' });
    } finally { setBusy(false); }
  }

  async function feedback(messageId: string, rating: 'up' | 'down') {
    setMessages((current) => current.map((message) => message.id === messageId ? { ...message, feedback: rating } : message));
    try {
      const response = await fetch('/api/visual-agent/feedback', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, rating }) });
      if (!response.ok) throw new Error();
    } catch {
      setMessages((current) => current.map((message) => message.id === messageId ? { ...message, feedback: undefined } : message));
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!settings?.config.draggable || viewport !== 'desktop') return;
    dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, ...offset };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const start = dragStart.current; if (!start || !settings) return;
    const rawX = start.x + event.clientX - start.pointerX; const rawY = start.y + event.clientY - start.pointerY;
    const x = settings.config.position === 'right' ? Math.max(-window.innerWidth + 120, Math.min(0, rawX)) : Math.max(0, Math.min(window.innerWidth - 120, rawX));
    setOffset({ x, y: Math.max(-window.innerHeight + 140, Math.min(0, rawY)) });
  }

  function endDrag() { if (!dragStart.current) return; dragStart.current = null; savePreferences({ offset }); }

  const deviceClass = `${settings?.config.mobile ? 'flex' : 'hidden'} ${settings?.config.tablet ? 'md:flex' : 'md:hidden'} ${settings?.config.desktop ? 'lg:flex' : 'lg:hidden'}`;
  if (!settings) return null;
  const avatarHeight = viewport === 'desktop' ? settings.config.desktopSize : viewport === 'tablet' ? settings.config.tabletSize : settings.config.mobileSize;

  return <aside aria-label={`Assistente ${settings.config.agentName}`} style={{ transform: viewport === 'desktop' ? `translate(${offset.x}px, ${offset.y}px)` : undefined }} className={`fixed bottom-[max(12px,env(safe-area-inset-bottom))] z-[80] ${alignment} ${deviceClass}`}>
    <div className={`flex max-w-[calc(100vw-24px)] flex-col items-end gap-2 lg:items-end lg:gap-3 ${settings.config.position === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
      {open && <section className="mb-2 flex h-[min(520px,70vh)] w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:mb-14" role="dialog" aria-label="Conversa com o assistente">
        <header className="flex items-center gap-3 bg-[#11132B] px-4 py-3 text-white"><Bot className="h-5 w-5"/><strong className="flex-1">{settings.config.agentName}</strong><button type="button" onClick={() => setOpen(false)} aria-label="Fechar conversa"><X className="h-5 w-5"/></button></header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">{messages.map((message, index) => <div key={message.id || `${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-[#6535D9] text-white' : 'bg-white text-slate-700 shadow-sm'}`}><p>{message.text}</p>{message.action?.type === 'open_page' && <a href={message.action.path} className="mt-2 inline-flex font-black text-[#6535D9]">{message.action.label}</a>}{message.role === 'assistant' && message.id && <div className="mt-2 flex gap-1 border-t border-slate-100 pt-2" aria-label="Avaliar resposta"><button type="button" onClick={() => void feedback(message.id!, 'up')} aria-label="Resposta útil" aria-pressed={message.feedback === 'up'} className={`rounded-lg p-1.5 ${message.feedback === 'up' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-slate-100'}`}><ThumbsUp className="h-3.5 w-3.5"/></button><button type="button" onClick={() => void feedback(message.id!, 'down')} aria-label="Resposta não útil" aria-pressed={message.feedback === 'down'} className={`rounded-lg p-1.5 ${message.feedback === 'down' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:bg-slate-100'}`}><ThumbsDown className="h-3.5 w-3.5"/></button></div>}</div>)}{busy && <p className="text-sm text-slate-500">Pensando…</p>}</div>
        <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3"><label className="sr-only" htmlFor="visual-agent-input">Mensagem</label><input id="visual-agent-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-violet-500" placeholder="Como posso ajudar?"/><button type="submit" disabled={busy || !input.trim()} aria-label="Enviar mensagem" className="grid h-11 w-11 place-items-center rounded-xl bg-[#6535D9] text-white disabled:opacity-50"><Send className="h-4 w-4"/></button></form>
      </section>}

      <div className="flex flex-col items-end gap-2">
        {!open && !minimized && <button type="button" onClick={() => setOpen(true)} className="relative max-w-56 rounded-2xl border border-violet-100 bg-white px-4 py-2 text-left text-xs font-bold leading-5 text-slate-700 shadow-lg after:absolute after:-bottom-2 after:right-7 after:h-4 after:w-4 after:rotate-45 after:border-b after:border-r after:border-violet-100 after:bg-white" aria-label="Abrir conversa com o assistente">Olá! Como posso ajudar?</button>}
        {!minimized && settings.live2dEnabled && <div data-avatar-state={state} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} style={{ height: avatarHeight, width: Math.round(avatarHeight * .794), touchAction: viewport === 'desktop' && settings.config.draggable ? 'none' : 'auto' }} className={`relative overflow-hidden rounded-[28px] bg-transparent ${viewport === 'desktop' && settings.config.draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          {fallback === 0 ? <Suspense fallback={null}><Live2DCanvas key={modelId} modelId={modelId} state={state} followCursor={settings.config.followCursor} onReady={handleLive2DReady} onFailure={handleLive2DFailure}/></Suspense> : fallback === 1 ? <><img src={model.fallbackImageUrl} alt={`Fallback do ${model.label}`} className="h-full w-full object-contain" onError={() => setFallback(2)}/><span className="absolute inset-x-2 bottom-2 rounded-lg bg-slate-950/80 px-2 py-1 text-center text-[10px] font-bold text-white">Modo alternativo — Live2D indisponível</span></> : <button type="button" onClick={() => setOpen(true)} className="absolute bottom-0 right-0 grid h-14 w-14 place-items-center rounded-full bg-[#6535D9] text-white shadow-xl" aria-label="Abrir assistente"><Bot/></button>}
        </div>}

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <button type="button" onClick={() => { setOpen((value) => !value); void track('avatar.opened'); }} className="grid h-10 w-10 place-items-center rounded-xl bg-[#6535D9] text-white" aria-label="Abrir conversa"><MessageCircle className="h-5 w-5"/></button>
          {settings.voiceEnabled && <button type="button" onClick={() => { const next = !voice; setVoice(next); savePreferences({ voice: next }); }} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label={voice ? 'Desativar voz' : 'Ativar voz'}>{voice ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5"/>}</button>}
          {settings.config.minimizable && <button type="button" onClick={() => setMinimized((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label={minimized ? 'Restaurar avatar' : 'Minimizar avatar'}><ChevronDown className={`h-5 w-5 transition ${minimized ? 'rotate-180' : ''}`}/></button>}
          {settings.config.hideable && <button type="button" onClick={() => { setMinimized(true); setOpen(false); void track('avatar.hidden'); }} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Ocultar avatar"><EyeOff className="h-5 w-5"/></button>}
        </div>
      </div>
    </div>
  </aside>;
}

function readPreferences(): Preferences { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return { voice: value.voice === true, offset: { x: Number.isFinite(value.offset?.x) ? value.offset.x : 0, y: Number.isFinite(value.offset?.y) ? value.offset.y : 0 } }; } catch { return { voice: false, offset: { x: 0, y: 0 } }; } }
function savePreferences(value: Partial<Preferences>) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readPreferences(), ...value })); }
function track(eventType: string) { return fetch('/api/visual-agent/event', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType }) }).catch(() => undefined); }
function viewportKind(): 'mobile' | 'tablet' | 'desktop' { return window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile'; }
