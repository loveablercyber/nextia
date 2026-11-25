import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'

// Subdomínio bio.nextia.dev.br aponta para a página pública da bio da Nextia
if (window.location.hostname.toLowerCase() === 'bio.nextia.dev.br') {
  const { pathname, search, hash } = window.location
  const suffix = pathname === '/' ? '' : pathname
  window.location.replace(`https://nextia.dev.br/bio/nextia${suffix}${search}${hash}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Falha ao registrar PWA:', error)))
}
