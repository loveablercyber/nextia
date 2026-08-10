import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }

export default function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('nextia-pwa-dismissed') === 'true');
  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!prompt || dismissed) return null;
  const install = async () => { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setPrompt(null); };
  const dismiss = () => { sessionStorage.setItem('nextia-pwa-dismissed', 'true'); setDismissed(true); };
  return <div className="fixed bottom-4 left-4 right-4 z-[70] flex items-center gap-3 border border-slate-200 bg-white p-4 shadow-2xl sm:left-auto sm:max-w-md"><div className="flex-1"><p className="text-base font-black text-[#07162B]">Instalar Nextia</p><p className="text-sm text-slate-600">Acesse serviços e painéis como aplicativo.</p></div><button onClick={install} className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1677FF] text-white" title="Instalar aplicativo"><Download className="h-5 w-5" /></button><button onClick={dismiss} className="flex h-11 w-11 items-center justify-center text-slate-500" title="Agora não"><X className="h-5 w-5" /></button></div>;
}
