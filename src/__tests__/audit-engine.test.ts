import { describe, it, expect } from 'vitest';
import { runAudit } from '../lib/audit-engine';
import { AuditInput } from '../lib/types';

describe('Audit Engine', () => {
  it('detects seat waste', () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 400, seats: 10 }
      ]
    };
    const result = runAudit(input);
    expect(result.toolResults[0].recommendedAction).toBe('downgrade');
    expect(result.toolResults[0].savingsMonthly).toBe(200); // 5 wasted seats * $40
  });

  it('recommends ChatGPT Plus for solo Business user', () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: 'data',
      tools: [
        { tool: 'ChatGPT', plan: 'Business', monthlySpend: 25, seats: 1 }
      ]
    };
    const result = runAudit(input);
    expect(result.toolResults[0].recommendedAction).toBe('downgrade');
    expect(result.toolResults[0].recommendedPlan).toBe('Plus');
    expect(result.toolResults[0].savingsMonthly).toBe(5); // $25 - $20
  });

  it('recommends Cursor Pro for solo Teams user', () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 40, seats: 1 }
      ]
    };
    const result = runAudit(input);
    expect(result.toolResults[0].recommendedAction).toBe('downgrade');
    expect(result.toolResults[0].recommendedPlan).toBe('Pro');
    expect(result.toolResults[0].savingsMonthly).toBe(20); // $40 - $20
  });

  it('recommends caching for high API spend', () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: 'mixed',
      tools: [
        { tool: 'Anthropic API', plan: 'API direct', monthlySpend: 1000, seats: 10 }
      ]
    };
    const result = runAudit(input);
    expect(result.toolResults[0].recommendedAction).toBe('optimize');
    expect(result.toolResults[0].savingsMonthly).toBe(400); // 40% of 1000
    expect(result.credexRelevant).toBe(false); // Total savings < 500
  });

  it('calculates total savings correctly and triggers Credex', () => {
    const input: AuditInput = {
      teamSize: 50,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 2000, seats: 50 },
        { tool: 'ChatGPT', plan: 'Enterprise', monthlySpend: 1500, seats: 50 },
        { tool: 'OpenAI API', plan: 'API direct', monthlySpend: 2000, seats: 50 }
      ]
    };
    // Let's assume API optimization kicks in and saves $800 (40% of 2000)
    // ChatGPT Enterprise -> nothing specific in our rules right now so it keeps
    // Cursor Teams -> nothing specific as seats == teamSize
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(800);
    expect(result.credexRelevant).toBe(true);
    expect(result.savingsTier).toBe('high');
  });
});
