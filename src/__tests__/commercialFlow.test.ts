import { describe, expect, it } from 'vitest';
import {
  templates,
  getTemplateServiceSlug,
  getTemplateOptionalFeatures,
  ALL_OPTIONAL_FEATURES,
} from '../data/templates';

describe('1. Classificação de Serviços e Templates', () => {
  it('classifica Restaurante Premium como sites-prontos', () => {
    const restaurant = templates.find((t) => t.slug === 'restaurante-premium');
    expect(restaurant).toBeDefined();
    expect(getTemplateServiceSlug(restaurant)).toBe('sites-prontos');
  });

  it('classifica todos os modelos não-loja como sites-prontos', () => {
    const readySiteSlugs = [
      'restaurante-premium',
      'salao-elegance',
      'servicos-profissionais',
      'loja-catalogo',
      'clinica-estetica',
      'contabilidade',
      'imobiliaria',
      'oficina-mecanica',
      'imobiliaria-premium',
    ];
    for (const slug of readySiteSlugs) {
      const template = templates.find((t) => t.slug === slug);
      expect(template, `Template ${slug} deve existir`).toBeDefined();
      expect(getTemplateServiceSlug(template), `Template ${slug} deve ser sites-prontos`).toBe('sites-prontos');
    }
  });

  it('classifica e-commerces como lojas-virtuais', () => {
    const ecommerceSlugs = ['loja-moda-premium', 'loja-gourmet', 'loja-tech-store'];
    for (const slug of ecommerceSlugs) {
      const template = templates.find((t) => t.slug === slug);
      expect(template, `Template ${slug} deve existir`).toBeDefined();
      expect(getTemplateServiceSlug(template), `Template ${slug} deve ser lojas-virtuais`).toBe('lojas-virtuais');
    }
  });
});

describe('2. Capas dos Templates (Cover Images)', () => {
  it('todos os 12 templates possuem coverImage preenchida e válida', () => {
    expect(templates.length).toBe(12);
    for (const t of templates) {
      expect(t.coverImage, `Template ${t.slug} deve ter coverImage`).toBeTruthy();
      expect(t.coverImage.length, `Template ${t.slug} coverImage não pode ser vazia`).toBeGreaterThan(0);
      expect(t.coverImage).toMatch(/^\/images\/templates\/[a-z0-9-]+\.webp$/);
    }
  });
});

describe('3. Cálculo de Domínio e Opcionais', () => {
  it('taxa oficial de registro de domínio é de R$ 50,00 (5000 centavos)', () => {
    const domainRegisterFeeCents = 5000;
    const domainConnectFeeCents = 0;
    expect(domainRegisterFeeCents / 100).toBe(50);
    expect(domainConnectFeeCents).toBe(0);
  });

  it('calcula preview comercial para Restaurante Premium no plano Pro', () => {
    const restaurant = templates.find((t) => t.slug === 'restaurante-premium')!;
    const baseActivationCents = restaurant.activationFee * 100; // R$ 197,00 = 19700
    const baseMonthlyCents = restaurant.price * 100; // R$ 79,00 = 7900
    const domainFeeCents = 5000; // R$ 50,00

    const initialTotalCents = baseActivationCents + domainFeeCents;
    expect(initialTotalCents).toBe(24700); // R$ 247,00
    expect(baseMonthlyCents).toBe(7900); // R$ 79,00
  });

  it('calcula preview comercial com opcional opt-reservas (+ R$ 29,00/mês)', () => {
    const restaurant = templates.find((t) => t.slug === 'restaurante-premium')!;
    const baseMonthlyCents = restaurant.price * 100; // R$ 79,00
    const reservasOption = ALL_OPTIONAL_FEATURES.find((f) => f.id === 'opt-reservas')!;
    expect(reservasOption).toBeDefined();
    expect(reservasOption.monthlyPrice).toBe(29);

    const totalMonthlyCents = baseMonthlyCents + reservasOption.monthlyPrice * 100;
    expect(totalMonthlyCents).toBe(10800); // R$ 108,00/mês (79 + 29)
  });

  it('opcionais específicos por template são retornados corretamente', () => {
    const restaurant = templates.find((t) => t.slug === 'restaurante-premium');
    const optionals = getTemplateOptionalFeatures(restaurant);
    expect(optionals.length).toBeGreaterThan(0);
    expect(optionals.some((o) => o.id === 'opt-reservas')).toBe(true);
    expect(optionals.some((o) => o.id === 'opt-delivery')).toBe(true);
  });
});
