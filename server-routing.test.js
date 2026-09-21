import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('server CRM dependency wiring', () => {
  it('keeps the commercial selection calculator at module scope', () => {
    const source = readFileSync('server.js', 'utf8');
    const declaration = 'async function calculateCommercialSelection(';
    const calculatorIndex = source.indexOf(declaration);
    const catalogHandlerIndex = source.indexOf('async function handleCatalogApi(');

    expect(calculatorIndex).toBeGreaterThan(-1);
    expect(calculatorIndex).toBeLessThan(catalogHandlerIndex);
    expect(source.split(declaration)).toHaveLength(2);
    expect(source).toContain('handleCrmApi(req, res, url, { dbClient, getSessionProfile, json, readJson, calculateCommercialSelection })');
  });
});
