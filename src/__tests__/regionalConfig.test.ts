import { describe, expect, it } from 'vitest';
import { CITIES_DATA, getAllCities, getCityData, isServiceAvailableInCity } from '../data/cities';

describe('regional activation gates', () => {
  it('exposes only active regions with validated content', () => {
    expect(getAllCities().every((city) => city.operationalStatus === 'active' && city.contentStatus === 'validated')).toBe(true);
    expect(getCityData('bauru')?.slug).toBe('bauru');
    expect(getCityData('unknown')).toBeNull();
  });

  it('uses the shared catalog availability list instead of duplicating products', () => {
    expect(isServiceAvailableInCity('marilia', 'criacao-de-sites')).toBe(true);
    expect(isServiceAvailableInCity('marilia', 'servico-inexistente')).toBe(false);
    expect(Object.values(CITIES_DATA).every((city) => new Set(city.enabledServiceSlugs).size === city.enabledServiceSlugs.length)).toBe(true);
  });
});
