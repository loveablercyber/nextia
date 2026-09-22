import { useEffect, useRef, useState } from 'react';
import { getAvatarModel } from './registry';
import type { AvatarModelId, AvatarState } from './types';

declare global { interface Window { loadlive2d?: (canvasId: string, modelUrl: string) => void; __nextiaLive2dRuntime?: Promise<void>; } }

function webGlAvailable() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')); } catch { return false; }
}

function loadRuntime() {
  if (window.loadlive2d) return Promise.resolve();
  if (window.__nextiaLive2dRuntime) return window.__nextiaLive2dRuntime;
  window.__nextiaLive2dRuntime = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/live2d/runtime/live2d.min.js';
    script.async = true;
    script.onload = () => window.loadlive2d ? resolve() : reject(new Error('Runtime Live2D inválido.'));
    script.onerror = () => reject(new Error('Runtime Live2D indisponível.'));
    document.head.appendChild(script);
  });
  return window.__nextiaLive2dRuntime;
}

export function Live2DCanvas({ modelId, state, onFailure }: { modelId: AvatarModelId; state: AvatarState; onFailure: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);
  const [visible, setVisible] = useState(!document.hidden);
  const model = getAvatarModel(modelId);

  useEffect(() => {
    const listener = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, []);

  useEffect(() => {
    if (initialized.current || !webGlAvailable() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!initialized.current) onFailure();
      return;
    }
    initialized.current = true;
    const timer = window.setTimeout(() => onFailure(), 12000);
    void loadRuntime().then(() => {
      if (!canvasRef.current || !window.loadlive2d) return onFailure();
      window.loadlive2d(canvasRef.current.id, model.modelUrl);
      window.clearTimeout(timer);
    }).catch(onFailure);
    return () => window.clearTimeout(timer);
  }, [model.modelUrl, onFailure]);

  useEffect(() => {
    if (['success', 'happy', 'attention'].includes(state)) canvasRef.current?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, [state]);

  return <canvas ref={canvasRef} id={`nextia-live2d-${modelId}`} width="720" height="920" aria-label={model.label} className={`h-full w-full transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`} />;
}
