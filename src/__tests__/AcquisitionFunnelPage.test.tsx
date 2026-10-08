import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import AcquisitionFunnelPage from '../features/acquisition/AcquisitionFunnelPage';
import { createPreviewContent, segmentPresets } from '../features/acquisition/acquisitionPresets';

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

  it('usa modelo e conteúdo próprios para advocacia', () => {
    const advocacy = segmentPresets.advocacia;
    const restaurant = segmentPresets.restaurantes;
    expect(advocacy.templateSlug).toBe('servicos-profissionais');
    expect(advocacy.templateSlug).not.toBe(restaurant.templateSlug);
    expect(advocacy.image).not.toBe(restaurant.image);
    expect(createPreviewContent('advocacia', 'Silva Advocacia').services[0].title).toMatch(/direito empresarial/i);
  });

  it('define ações de conversão adequadas ao segmento', () => {
    expect(segmentPresets.restaurantes.bookingLabel).toMatch(/mesa/i);
    expect(segmentPresets['saloes-de-beleza'].bookingLabel).toMatch(/serviço/i);
    expect(segmentPresets.clinicas.bookingLabel).toMatch(/consulta/i);
    expect(segmentPresets.hoteis.bookingLabel).toMatch(/quarto/i);
  });
});
