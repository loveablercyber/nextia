// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/seo-manifest.json'), 'utf8'));
const paths = manifest.entries.map((entry) => entry.path);

describe('manifesto e sitemap da Etapa 11', () => {
  it('não contém duplicatas, admin, área autenticada, draft ou query', () => {
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.some((path) => /^\/(admin|painel|checkout|perfil)(\/|$)/.test(path))).toBe(false);
    expect(paths.some((path) => path.includes('?'))).toBe(false);
  });
  it('mantém previews fora do índice e aliases fora das entradas indexáveis', () => {
    expect(manifest.entries.filter((entry) => entry.path.startsWith('/demo/')).every((entry) => entry.indexable === false)).toBe(true);
    expect(paths.includes('/templates')).toBe(false);
    expect(manifest.redirects).toContainEqual({ from:'/templates',to:'/modelos',status:301 });
  });
  it('não gera combinações locais além da fonte publicada', () => {
    expect(paths).not.toContain('/cidade-inventada/contabilidade/criacao-de-sites');
    expect(paths).not.toContain('/bauru/segmento-inventado/servico-inventado');
  });
  it('sitemap estático exclui noindex, redirects e áreas privadas', () => {
    const xml = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8');
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
    expect(xml).not.toContain('/demo/');
    expect(xml).not.toContain('/templates');
    expect(xml).not.toContain('/admin');
  });
});
