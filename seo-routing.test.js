// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildSitemapXml, injectSeoIntoHtml, isKnownPublicSeoPath, normalizeSeoPath, resolveSeoRedirect } from './seo-routing.js';

const manifest = {
  entries: [{ path: '/', title: 'Início', description: 'Descrição', indexable: true }, { path: '/conteudos/guia', title: 'Guia', description: 'Útil', indexable: true, type: 'article' }],
  redirects: [{ from: '/templates', to: '/modelos', status: 301 }],
};

describe('SEO routing', () => {
  it('normaliza caminho sem transformar query em URL indexável', () => expect(normalizeSeoPath('/Conteudos/Guia/?utm_source=x')).toBe('/conteudos/guia'));
  it('aceita somente entrada, redirect ou área privada conhecida', () => {
    expect(isKnownPublicSeoPath('/conteudos/guia?utm_source=x', manifest)).toBe(true);
    expect(isKnownPublicSeoPath('/admin/qualquer', manifest)).toBe(true);
    expect(isKnownPublicSeoPath('/cidade-inventada/servico', manifest)).toBe(false);
  });
  it('resolve redirect exato sem cadeia implícita', () => expect(resolveSeoRedirect('/templates', manifest.redirects)).toEqual({ status: 301, location: '/modelos' }));
  it('gera sitemap somente com entradas indexáveis', () => {
    const xml = buildSitemapXml([...manifest.entries, { path: '/draft', indexable: false }]);
    expect(xml).toContain('<loc>https://nextia.dev.br/conteudos/guia</loc>');
    expect(xml).not.toContain('/draft');
  });
  it('injeta metadata escapada no HTML inicial', () => {
    const html = injectSeoIntoHtml('<html><head><title>Base</title></head><body></body></html>', manifest.entries[1]);
    expect(html).toContain('<title>Guia</title>');
    expect(html).toContain('rel="canonical" href="https://nextia.dev.br/conteudos/guia"');
    expect(html).toContain('og:type" content="article"');
  });
});
