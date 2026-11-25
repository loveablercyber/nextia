import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NextiaBioPage from '../pages/NextiaBioPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <NextiaBioPage />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('NextiaBioPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders hero, plans, optionals, and FAQ sections', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /Seu negócio merece mais do que um link\./i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Plano Start').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plano Pro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plano Premium').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /Personalize seu Nextia Bio com recursos adicionais\./i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Perguntas frequentes/i })).toBeInTheDocument();
  });

  it('navigates to /checkout with plan, optionals, and domain when contracting', () => {
    renderPage();

    const domainInput = screen.getByLabelText('Pesquisar domínio');
    fireEvent.change(domainInput, { target: { value: 'minhaempresa' } });
    fireEvent.click(screen.getByRole('button', { name: /Consultar/i }));

    expect(screen.getAllByText(/minhaempresa\.com\.br/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Continuar para contratação/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const targetUrl = mockNavigate.mock.calls[0][0] as string;
    expect(targetUrl).toContain('/checkout?');
    expect(targetUrl).toContain('service=nextia-bio');
    expect(targetUrl).toContain('plan=pro');
    expect(targetUrl).toContain('options=domain-registration');
    expect(targetUrl).toContain('domain=minhaempresa.com.br');
    expect(targetUrl).toContain('domainMode=register');
  });
});
