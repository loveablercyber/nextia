import { describe, it, expect } from 'vitest';
import {
  SEGMENTS,
  PUBLISHED_SEGMENT_SLUGS,
  getSegmentBySlug,
  SEGMENT_CATEGORIES,
} from '../data/segments';
import { templates } from '../data/templates';

describe('Segment Data Registry (Etapa 3)', () => {
  const expectedSlugs = [
    'contabilidade',
    'pizzarias',
    'advocacia',
    'clinicas',
    'dentistas',
    'imobiliarias',
    'pet-shops',
    'restaurantes',
    'academias',
    'lojas',
    'prestadores-de-servicos',
  ];

  it('should register exactly all 11 expected published segments', () => {
    expect(PUBLISHED_SEGMENT_SLUGS).toEqual(expect.arrayContaining(expectedSlugs));
    expect(PUBLISHED_SEGMENT_SLUGS.length).toBe(11);
  });

  it('should have unique slugs for all segments', () => {
    const slugs = Object.keys(SEGMENTS);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should assign valid categories from SEGMENT_CATEGORIES', () => {
    for (const slug of PUBLISHED_SEGMENT_SLUGS) {
      const seg = SEGMENTS[slug];
      expect(SEGMENT_CATEGORIES).toContain(seg.category);
    }
  });

  it('should provide rich SEO metadata for each segment without empty fields', () => {
    for (const slug of PUBLISHED_SEGMENT_SLUGS) {
      const seg = SEGMENTS[slug];
      expect(seg.seoTitle.length).toBeGreaterThan(20);
      expect(seg.metaDescription.length).toBeGreaterThan(40);
      expect(seg.h1.length).toBeGreaterThan(15);
      expect(seg.heroSubtitle.length).toBeGreaterThan(30);
      expect(seg.keywords.length).toBeGreaterThanOrEqual(4);
      expect(seg.whatsappMessage).toContain('Nextia');
    }
  });

  it('should contain robust problems, solutions, workflow steps and FAQs for each segment', () => {
    for (const slug of PUBLISHED_SEGMENT_SLUGS) {
      const seg = SEGMENTS[slug];
      expect(seg.problems.length).toBeGreaterThanOrEqual(3);
      expect(seg.solutions.length).toBeGreaterThanOrEqual(2);
      expect(seg.workflow.length).toBeGreaterThanOrEqual(4);
      expect(seg.faqs.length).toBeGreaterThanOrEqual(2);
      expect(seg.formServiceOptions.length).toBeGreaterThanOrEqual(3);

      for (const p of seg.problems) {
        expect(p.title).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.iconName).toBeTruthy();
      }

      for (const s of seg.solutions) {
        expect(s.title).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(s.features.length).toBeGreaterThanOrEqual(2);
      }

      for (const f of seg.faqs) {
        expect(f.question).toBeTruthy();
        expect(f.answer).toBeTruthy();
      }
    }
  });

  it('should correctly resolve matching templates from templates.ts', () => {
    const validTemplateSlugs = new Set(templates.map((t) => t.slug));
    for (const slug of PUBLISHED_SEGMENT_SLUGS) {
      const seg = SEGMENTS[slug];
      if (seg.templateSlugs.length > 0) {
        for (const tplSlug of seg.templateSlugs) {
          expect(validTemplateSlugs.has(tplSlug)).toBe(true);
        }
      }
    }
  });

  it('should retrieve segments by slug via getSegmentBySlug helper', () => {
    const contabilidade = getSegmentBySlug('contabilidade');
    expect(contabilidade).toBeDefined();
    expect(contabilidade?.name).toBe('Contabilidade');

    const invalid = getSegmentBySlug('segmento-inexistente-123');
    expect(invalid).toBeUndefined();
  });

  it('should have security and compliance definitions for sensitive professional segments', () => {
    const contabilidade = getSegmentBySlug('contabilidade');
    expect(contabilidade?.securitySection).toBeDefined();
    expect(contabilidade?.securitySection?.items.length).toBeGreaterThanOrEqual(3);

    const advocacia = getSegmentBySlug('advocacia');
    expect(advocacia?.securitySection).toBeDefined();

    const clinicas = getSegmentBySlug('clinicas');
    expect(clinicas?.securitySection).toBeDefined();
  });
});
