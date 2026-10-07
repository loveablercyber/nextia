import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import AcquisitionFunnelPage from '../features/acquisition/AcquisitionFunnelPage';

describe('AcquisitionFunnelPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('entrega valor antes de solicitar cadastro ou contato', () => {
    render(<MemoryRouter><AcquisitionFunnelPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /veja seu futuro site antes de contratar/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /criar minha prévia grátis/i })).toBeTruthy();
    expect(screen.queryByLabelText(/e-mail/i)).toBeNull();
    expect(screen.getByText(/você não precisa se cadastrar para começar/i)).toBeTruthy();
  });
});
