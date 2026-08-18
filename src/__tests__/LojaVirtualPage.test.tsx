import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LojaVirtualPage from '../pages/LojaVirtualPage';

vi.mock('../hooks/useServiceCatalog', () => ({
  useServiceCatalog: () => [{ slug: 'lojas-virtuais', name: 'Lojas Virtuais', price: 1490, benefits: [] }],
}));

vi.mock('../hooks/useCommercialPlans', () => ({
  useCommercialPlans: () => [],
}));

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        templates: [
          {
            id: 'tpl-loja-catalogo',
            slug: 'loja-catalogo',
            name: 'Loja & Catálogo Digital',
            category: 'Loja e Catálogo',
            description: 'Template oficial Nextia para lojas virtuais.',
            cover_image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
            preview_url: '/demo/loja-catalogo',
            features: ['Catálogo de produtos completo'],
            featured: true,
            active: true,
            sort_order: 10,
          },
        ],
      }),
  })
));

describe('LojaVirtualPage Integration Test', () => {
  it('renders hero title and primary call to action', async () => {
    render(
      <MemoryRouter>
        <LojaVirtualPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 1 })).toBeDefined();
    expect(await screen.findByText(/pronta para vender online/i)).toBeDefined();
    expect((await screen.findAllByText('Loja & Catálogo Digital')).length).toBeGreaterThan(0);
  }, 15000);
});
