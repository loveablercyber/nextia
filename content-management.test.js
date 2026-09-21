// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canTransitionContent, contentToSeoEntry, normalizeContentSlug, validateSafeMarkdown } from './content-management.js';

describe('gestão editorial segura', () => {
  it('normaliza slug estável e legível', () => expect(normalizeContentSlug('  Automação Responsável: Guia 2026 ')).toBe('automacao-responsavel-guia-2026'));
  it('aceita Markdown sem HTML com links internos e HTTPS', () => expect(validateSafeMarkdown('## Guia\n\nVeja [soluções](/solucoes) e [fonte](https://example.com).')).toContain('Veja'));
  it.each(['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '[clique](javascript:alert(1))', '[arquivo](data:text/html,x)'])('rejeita vetor XSS: %s', (payload) => expect(() => validateSafeMarkdown(payload)).toThrow());
  it('impede salto direto de rascunho para publicação', () => {
    expect(canTransitionContent('draft', 'published')).toBe(false);
    expect(canTransitionContent('draft', 'review')).toBe(true);
    expect(canTransitionContent('review', 'published')).toBe(true);
    expect(canTransitionContent('published', 'draft')).toBe(false);
  });
  it('converte somente conteúdo publicado consultado em entrada SEO explícita', () => {
    const entry = contentToSeoEntry({ slug:'guia-real',title:'Guia real',excerpt:'Resumo',seo_title:'SEO title',seo_description:'SEO description',canonical_url:null,og_image_url:null,indexing_policy:'index',updated_at:'2026-09-19T12:00:00Z' });
    expect(entry).toMatchObject({ path:'/conteudos/guia-real',type:'article',indexable:true,updatedAt:'2026-09-19' });
  });
  it('usa as tabelas canônicas do Automation Engine na migration', () => {
    const sql = readFileSync(join(process.cwd(), 'database/migrations/0011_seo_content.sql'), 'utf8');
    expect(sql).toContain('INSERT INTO public.automations');
    expect(sql).toContain('INSERT INTO public.automation_versions');
    expect(sql).not.toContain('automation_definitions');
    expect(sql).not.toContain('automation_steps');
  });
});
