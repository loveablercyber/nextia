import { useEffect, useId, useRef, useState } from 'react';
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

interface Live2DModelJson {
  model: string;
  textures: string[];
  motions?: Record<string, Array<{ file: string }>>;
}

function localAsset(modelUrl: string, file: string) {
  if (!file || /^(?:[a-z]+:)?\/\//i.test(file) || file.includes('..')) throw new Error('Referência externa ou inválida no modelo Live2D.');
  return new URL(file, new URL(modelUrl, window.location.origin)).pathname;
}

async function validateModelAssets(modelUrl: string) {
  const modelResponse = await fetch(modelUrl, { cache: 'force-cache' });
  if (!modelResponse.ok) throw new Error(`Modelo Live2D indisponível (${modelResponse.status}).`);
  const definition = await modelResponse.json() as Live2DModelJson;
  if (!definition.model || !Array.isArray(definition.textures) || definition.textures.length === 0) throw new Error('Manifesto Live2D inválido.');
  const motionFiles = Object.values(definition.motions || {}).flat().map((motion) => motion.file);
  const assets = [definition.model, ...definition.textures, ...motionFiles].map((file) => localAsset(modelUrl, file));
  const responses = await Promise.all(assets.map((asset) => fetch(asset, { cache: 'force-cache' })));
  const failedAt = responses.findIndex((response) => !response.ok);
  if (failedAt >= 0) throw new Error(`Asset Live2D indisponível: ${assets[failedAt]}`);
}

interface Live2DCanvasProps {
  modelId: AvatarModelId;
  state: AvatarState;
  onFailure: (error?: Error) => void;
  onReady?: () => void;
  className?: string;
  followCursor?: boolean;
}

export function Live2DCanvas({ modelId, state, onFailure, onReady, className = '', followCursor = false }: Live2DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);
  const [visible, setVisible] = useState(!document.hidden);
  const model = getAvatarModel(modelId);
  const reactId = useId();
  const canvasId = `nextia-live2d-${modelId}-${reactId.replace(/[^a-z0-9_-]/gi, '')}`;

  useEffect(() => {
    const listener = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, []);

  useEffect(() => {
    if (initialized.current || !webGlAvailable()) {
      if (!initialized.current) onFailure(new Error('WebGL indisponível.'));
      return;
    }
    initialized.current = true;
    let cancelled = false;
    const timer = window.setTimeout(() => onFailure(new Error('Tempo limite ao carregar Live2D.')), 12000);
    void Promise.all([loadRuntime(), validateModelAssets(model.modelUrl)]).then(() => {
      if (cancelled) return;
      if (!canvasRef.current || !window.loadlive2d) return onFailure();
      window.loadlive2d(canvasRef.current.id, model.modelUrl);
      window.setTimeout(() => {
        if (cancelled) return;
        window.clearTimeout(timer);
        onReady?.();
      }, 900);
    }).catch((error: unknown) => onFailure(error instanceof Error ? error : new Error('Falha ao carregar Live2D.')));
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [model.modelUrl, onFailure, onReady]);

  useEffect(() => {
    if (['success', 'happy', 'attention'].includes(state)) canvasRef.current?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, [state]);

  return <canvas ref={canvasRef} id={canvasId} width="720" height="920" aria-label={`${model.label} Live2D`} className={`h-full w-full transition-opacity ${followCursor ? 'pointer-events-auto' : 'pointer-events-none'} ${visible ? 'opacity-100' : 'opacity-0'} ${className}`} />;
}
