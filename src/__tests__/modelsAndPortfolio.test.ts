import { describe, expect, it } from 'vitest';
import { getPublishedPortfolioProjects, portfolioProjects } from '../data/portfolio';
import { getTemplateMetadata, isPublishedTemplate } from '../data/templateMetadata';
import { templates } from '../data/templates';

describe('Etapa 5 — modelos e portfólio', () => {
  it('publica somente modelos completos e com demonstração válida', () => {
    const published = templates.filter(isPublishedTemplate);
    expect(published.length).toBeGreaterThan(0);
    expect(published.every(item => item.coverImage && item.demoUrl !== '#')).toBe(true);
  });

  it('mantém metadados comerciais e de personalização em todos os modelos', () => {
    templates.forEach(template => {
      const metadata = getTemplateMetadata(template);
      expect(metadata.type).toBeTruthy();
      expect(metadata.style).toBeTruthy();
      expect(metadata.tags.length).toBeGreaterThan(0);
      expect(metadata.customizationOptions.length).toBeGreaterThan(0);
    });
  });

  it('não contém depoimentos fictícios nos modelos', () => {
    expect(templates.every(template => template.testimonials.length === 0)).toBe(true);
  });

  it('não publica portfólio sem autorização e imagem real', () => {
    expect(getPublishedPortfolioProjects().every(project => project.authorized && project.images.length > 0)).toBe(true);
    expect(portfolioProjects.find(project => project.slug === 'carolsol')).toBeUndefined();
  });
});
