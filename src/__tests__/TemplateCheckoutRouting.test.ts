import { describe, expect, it } from 'vitest';
import { getTemplateServiceSlug, templates } from '../data/templates';

describe('roteamento comercial dos modelos', () => {
  it('mantém modelos de sites prontos fora do produto de loja virtual', () => {
    const restaurant = templates.find((template) => template.slug === 'restaurante-premium');

    expect(getTemplateServiceSlug(restaurant)).toBe('sites-prontos');
  });

  it('classifica apenas os modelos de e-commerce como lojas virtuais', () => {
    const store = templates.find((template) => template.slug === 'loja-moda-premium');

    expect(getTemplateServiceSlug(store)).toBe('lojas-virtuais');
  });
});
