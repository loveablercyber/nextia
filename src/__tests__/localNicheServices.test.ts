import { describe, it, expect } from 'vitest';
import {
  LOCAL_NICHE_SERVICES,
  PUBLISHED_LOCAL_NICHE_SLUGS,
  getLocalNicheServiceData,
  getAllPublishedLocalNicheServices,
} from '../data/localNicheServices';
import { SEGMENTS } from '../data/segments';
import { templates } from '../data/templates';

describe('Local Niche Service Data Registry (Etapa 4)', () => {
  const expectedFirstBatch = [
    'bauru/contabilidade/criacao-de-sites',
    'bauru/contabilidade/whatsapp-ia',
    'bauru/contabilidade/automacao',
    'bauru/pizzarias/criacao-de-sites',
    'bauru/pizzarias/whatsapp-ia',
    'bauru/clinicas/criacao-de-sites',
    'bauru/imobiliarias/criacao-de-sites',
  ];

  const validPublicationReasons = [
    'search_demand',
    'sales_strategy',
    'ads_campaign',
    'organic_opportunity',
    'lead_demand',
  ];

  it('should register exactly all 7 expected published pages in the first batch', () => {
    expect(PUBLISHED_LOCAL_NICHE_SLUGS).toEqual(expect.arrayContaining(expectedFirstBatch));
    expect(PUBLISHED_LOCAL_NICHE_SLUGS.length).toBe(7);
  });

  it('should have unique composite slugs for all entries', () => {
    const slugs = Object.keys(LOCAL_NICHE_SERVICES);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should have a valid publicationReason for each entry', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(validPublicationReasons).toContain(entry.publicationReason);
    }
  });

  it('should provide rich SEO metadata without empty fields', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(entry.seo.title.length).toBeGreaterThan(20);
      expect(entry.seo.description.length).toBeGreaterThan(40);
      expect(entry.seo.keywords.length).toBeGreaterThanOrEqual(4);
      expect(entry.seo.schemaServiceType.length).toBeGreaterThan(0);
      expect(entry.hero.h1.length).toBeGreaterThan(15);
      expect(entry.hero.subtitle.length).toBeGreaterThan(30);
      expect(entry.hero.whatsappMessage).toContain('Nextia');
    }
  });

  it('should contain robust problems, solutions, and FAQs for each entry', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(entry.problems.items.length).toBeGreaterThanOrEqual(4);
      expect(entry.solution.features.length).toBeGreaterThanOrEqual(4);
      expect(entry.faqs.length).toBeGreaterThanOrEqual(5);
      expect(entry.ecosystem.pillars.length).toBeGreaterThanOrEqual(2);
      expect(entry.journey.steps.length).toBeGreaterThanOrEqual(4);

      // Each problem must have complete data
      for (const p of entry.problems.items) {
        expect(p.title).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.iconName).toBeTruthy();
      }

      // Each FAQ must have complete data
      for (const f of entry.faqs) {
        expect(f.question).toBeTruthy();
        expect(f.answer).toBeTruthy();
      }
    }
  });

  it('should reference valid segments from segments.ts', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(SEGMENTS[entry.segmentSlug]).toBeDefined();
    }
  });

  it('should reference valid template slugs from templates.ts', () => {
    const validTemplateSlugs = new Set(templates.map((t) => t.slug));
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      for (const tplSlug of entry.templateSlugs) {
        expect(validTemplateSlugs.has(tplSlug)).toBe(true);
      }
    }
  });

  it('should have correct relatedPages paths', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(entry.relatedPages.cityPage).toMatch(/^\/[a-z]/);
      expect(entry.relatedPages.cityServicePage).toMatch(/^\/[a-z]/);
      expect(entry.relatedPages.segmentPage).toMatch(/^\/solucoes\//);
    }
  });

  it('should resolve entries correctly via getLocalNicheServiceData helper', () => {
    const result = getLocalNicheServiceData('bauru', 'contabilidade', 'criacao-de-sites');
    expect(result).toBeDefined();
    expect(result?.cityName).toBe('Bauru');
    expect(result?.segmentName).toContain('Contabilidade');

    const invalid = getLocalNicheServiceData('cidadeinexistente', 'segmentofake', 'servicofake');
    expect(invalid).toBeNull();
  });

  it('should return all published entries via getAllPublishedLocalNicheServices', () => {
    const all = getAllPublishedLocalNicheServices();
    expect(all.length).toBe(7);
    for (const entry of all) {
      expect(entry.status).toBe('published');
    }
  });

  it('should have form defaults with appropriate goal options', () => {
    for (const slug of PUBLISHED_LOCAL_NICHE_SLUGS) {
      const entry = LOCAL_NICHE_SERVICES[slug];
      expect(entry.formDefaults.city).toBeTruthy();
      expect(entry.formDefaults.segment).toBeTruthy();
      expect(entry.formDefaults.service).toBeTruthy();
      expect(entry.formDefaults.goalOptions.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('should have unique H1 for every page to prevent cannibalization', () => {
    const h1s = PUBLISHED_LOCAL_NICHE_SLUGS.map((slug) => LOCAL_NICHE_SERVICES[slug].hero.h1);
    const uniqueH1s = new Set(h1s);
    expect(uniqueH1s.size).toBe(h1s.length);
  });

  it('should have unique SEO titles for every page', () => {
    const titles = PUBLISHED_LOCAL_NICHE_SLUGS.map((slug) => LOCAL_NICHE_SERVICES[slug].seo.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it('should have unique SEO descriptions for every page', () => {
    const descs = PUBLISHED_LOCAL_NICHE_SLUGS.map(
      (slug) => LOCAL_NICHE_SERVICES[slug].seo.description
    );
    const uniqueDescs = new Set(descs);
    expect(uniqueDescs.size).toBe(descs.length);
  });
});
