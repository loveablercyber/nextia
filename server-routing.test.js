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

  it('registers the dedicated password and assisted-support routes', () => {
    const source = readFileSync('server.js', 'utf8');
    const clientPage = readFileSync('src/pages/admin/AdminClientsPage.tsx', 'utf8');
    const ticketPage = readFileSync('src/pages/TicketDetailPage.tsx', 'utf8');
    const migration = readFileSync('database/migrations/0020_support_ai_assistant.sql', 'utf8');

    expect(source).toContain("['/api/admin/update-user-password', 'POST']");
    expect(source).toContain("if (url.pathname === '/api/admin/update-user-password')");
    expect(clientPage).toContain("fetch('/api/admin/update-user-password'");
    expect(source).toContain("['/api/admin/support-ticket/ai-suggestion', 'POST']");
    expect(source).toContain("purpose: 'support_reply_draft'");
    expect(ticketPage).toContain("fetch('/api/admin/support-ticket/ai-suggestion'");
    expect(migration).toContain("'support_reply_draft'");
    expect(migration).toContain('"requires_human"');
  });

  it('turns every explicitly defined password into a permanent password', () => {
    const source = readFileSync('server.js', 'utf8');
    const passwordUpdates = source.match(/SET password_hash = \$1,[\s\S]{0,160}?WHERE id = \$2/g) || [];

    expect(passwordUpdates.length).toBeGreaterThanOrEqual(4);
    for (const update of passwordUpdates) {
      expect(update).toContain('must_change_password');
      expect(update).toMatch(/temporary_password_expires_at\s*=\s*NULL/);
    }
  });
});
