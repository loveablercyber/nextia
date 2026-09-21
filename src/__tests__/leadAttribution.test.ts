import { beforeEach, describe, expect, it } from 'vitest';
import { captureAttribution, getAttribution } from '../lib/leadAttribution';

describe('atribuicao de leads do CRM', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/landing?utm_source=google&utm_medium=cpc&utm_campaign=nextia');
  });

  it('preserva o first touch e atualiza a pagina do last touch', () => {
    captureAttribution();
    const first = getAttribution();

    window.history.pushState({}, '', '/orcamento');
    captureAttribution();
    const converted = getAttribution();

    expect(first.first_touch_source).toBe('google');
    expect(converted.first_touch_source).toBe('google');
    expect(converted.utm_source).toBe('google');
    expect(converted.landing_page).toContain('/landing?utm_source=google');
    expect(converted.conversion_page).toBe('/orcamento');
    expect(converted.last_touch_source).toBe('google');
  });

  it('mantem first touch mesmo quando uma nova campanha chega na sessao', () => {
    captureAttribution();
    window.history.pushState({}, '', '/contato?utm_source=linkedin&utm_medium=social');
    captureAttribution();

    const attribution = getAttribution();
    expect(attribution.first_touch_source).toBe('google');
    expect(attribution.last_touch_source).toBe('linkedin');
    expect(attribution.utm_source).toBe('linkedin');
  });

  it('preserva a origem e associa o conteúdo editorial ao lead', () => {
    captureAttribution();
    window.history.pushState({}, '', '/orcamento?content=guia-automacao');
    captureAttribution();
    const attribution = getAttribution();
    expect(attribution.utm_source).toBe('google');
    expect(attribution.utm_medium).toBe('cpc');
    expect(attribution.utm_content).toBe('guia-automacao');
    expect(attribution.first_touch_source).toBe('google');
  });
});
