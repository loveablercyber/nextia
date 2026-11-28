import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NextiaBioPublicPage from '../pages/NextiaBioPublicPage';

function renderPublicRoute(initialEntry: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/bio/:slug" element={<NextiaBioPublicPage />} />
          <Route path="/bio/:slug/galeria" element={<NextiaBioPublicPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('NextiaBioPublicPage', () => {
  it('renders the public bio profile directly for /bio/nextia', () => {
    renderPublicRoute('/bio/nextia');

    expect(screen.getByText('Nextia Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('(14) 99640-5496')).toBeInTheDocument();
    expect(screen.getByText('ola@nextia.dev.br')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Chatbot/i })).not.toBeInTheDocument();
  });

  it('renders the dedicated gallery view for /bio/:slug/galeria', () => {
    renderPublicRoute('/bio/studiobellaforma/galeria');

    expect(screen.getByRole('heading', { name: /Galeria — Studio Bella Forma/i })).toBeInTheDocument();
    expect(screen.getByText('Cabines de estética facial e corporal')).toBeInTheDocument();
  });
});
