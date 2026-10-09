import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import AcquisitionFunnelPage, { replacePreviewSegment } from '../features/acquisition/AcquisitionFunnelPage';
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
  }, 15_000);

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

  it('substitui todo o conteúdo incompatível ao trocar de segmento', () => {
    const legalContent = createPreviewContent('advocacia', 'Empresa Teste');
    const changed = replacePreviewSegment({
      segment_slug: 'advocacia',
      template_slug: segmentPresets.advocacia.templateSlug,
      business_name: 'Empresa Teste',
      theme: { primaryColor: segmentPresets.advocacia.accent },
      content: legalContent,
      revision: 2,
    }, 'contabilidade', 'Empresa Teste');

    expect(changed?.segment_slug).toBe('contabilidade');
    expect(changed?.template_slug).toBe(segmentPresets.contabilidade.templateSlug);
    expect(changed?.content.services[0].title).toMatch(/abertura de empresas/i);
    expect(changed?.content.services.some((service) => /direito/i.test(service.title))).toBe(false);
  });
});
