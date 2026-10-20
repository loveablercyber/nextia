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

  it('authorizes an owned demo at checkout even when a legacy funnel user link is missing', () => {
    const source = readFileSync('server.js', 'utf8');
    const acquisition = readFileSync('acquisition-api.js', 'utf8');
    const checkout = readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

    expect(source).toContain('c.service_slug,p.owner_user_id,p.share_key,p.demo_status');
    expect(source).toContain('funnel.user_id === sessionProfile.id || funnel.owner_user_id === sessionProfile.id');
    expect(source).toContain("UPDATE public.acquisition_funnel_sessions SET user_id=$2,updated_at=NOW() WHERE id=$1");
    expect(source).toContain('body.demoProjectKey || body.funnelSessionKey || body.funnelAccessToken');
    expect(source).toContain('p.share_key=$1 AND p.owner_user_id=$2');
    expect(source).toContain('const tokenMatches = Boolean(funnelActive && presentedHash');
    expect(acquisition).toContain('&demo=${demo.share_key}');
    expect(checkout).toContain('demoProjectKey: demoProjectKey || undefined');
  });

  it('reprocesses safe pending support replies when automatic mode becomes available', () => {
    const source = readFileSync('server.js', 'utf8');
    const migration = readFileSync('database/migrations/0024_support_ai_auto_reply_reliability.sql', 'utf8');

    expect(source).toContain('async function processPendingSupportAutoReplies(client, limit = 10)');
    expect(source).toContain("latest.sender_role='client'");
    expect(source).toContain("t.ai_last_decision LIKE 'error:%'");
    expect(source).toContain('await processPendingSupportAutoReplies(client, 10)');
    expect(migration).toContain("'support_reply_draft',\n  2,");
    expect(migration).toContain('"requires_human","confidence"');
  });
});
