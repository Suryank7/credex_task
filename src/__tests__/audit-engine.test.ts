import { describe, it, expect } from 'vitest';
import { runAudit, calculateBenchmark } from '../lib/audit-engine';
import type { AuditInput } from '../lib/types';

describe('AuditEngine — Deterministic Finance Logic', () => {

  // ─────────────────────────────────────────────────────────
  // TEST 1: Downgrade — Seat waste detection
  // Scenario: A 5-person team paying for 15 Cursor Teams seats.
  //   Cost per seat = $600 / 15 = $40/seat.
  //   Wasted seats = 15 - 5 = 10.
  //   Expected savings = 10 * $40 = $400/mo.
  // ─────────────────────────────────────────────────────────
  it('TEST 1: recommends downgrade when seats exceed team size (seat waste)', () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 600, seats: 15 }
      ]
    };
    const result = runAudit(input);
    const tr = result.toolResults[0];

    expect(tr.recommendedAction).toBe('downgrade');
    expect(tr.savingsMonthly).toBe(400);        // 10 wasted * $40
    expect(tr.savingsAnnual).toBe(4800);         // $400 * 12
    expect(tr.defensibleReason).toContain('10 more seats');
    expect(tr.confidenceLevel).toBe('high');
  });

  // ─────────────────────────────────────────────────────────
  // TEST 2: Switch — API direct to flat-rate subscription
  // Scenario: A solo developer spending $80/mo on Anthropic API.
  //   Rule: API spend > $50 and teamSize === 1 → switch to Pro/Plus ($20/mo).
  //   Expected savings = $80 - $20 = $60/mo.
  // ─────────────────────────────────────────────────────────
  it('TEST 2: recommends switching from API direct to flat-rate for solo users', () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: 'research',
      tools: [
        { tool: 'Anthropic API', plan: 'API direct', monthlySpend: 80, seats: 1 }
      ]
    };
    const result = runAudit(input);
    const tr = result.toolResults[0];

    expect(tr.recommendedAction).toBe('switch');
    expect(tr.recommendedPlan).toBe('Pro / Plus');
    expect(tr.savingsMonthly).toBe(60);          // $80 - $20
    expect(tr.savingsAnnual).toBe(720);          // $60 * 12
  });

  // ─────────────────────────────────────────────────────────
  // TEST 3: Keep — Optimized stack returns $0 savings
  // Scenario: A 10-person coding team on Cursor Pro at $200/mo (10 seats).
  //   No seat waste (seats === teamSize).
  //   No plan-specific downgrade rule fires.
  //   Spend is not > $200 threshold for generic optimization.
  //   Expected: action = 'keep', savings = $0, tier = 'optimal'.
  // ─────────────────────────────────────────────────────────
  it('TEST 3: retains current plan when stack is already optimized (savings = $0)', () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Pro', monthlySpend: 200, seats: 10 }
      ]
    };
    const result = runAudit(input);
    const tr = result.toolResults[0];

    expect(tr.recommendedAction).toBe('keep');
    expect(tr.savingsMonthly).toBe(0);
    expect(tr.savingsAnnual).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsTier).toBe('optimal');
    expect(result.credexRelevant).toBe(false);
  });

  // ─────────────────────────────────────────────────────────
  // TEST 4: Edge case — Large seat volume with high API spend
  // Scenario: A 200-person enterprise team with:
  //   - 250 Cursor Teams seats at $10,000/mo (50 wasted seats)
  //   - $3,000/mo OpenAI API spend (triggers 40% optimize rule)
  //   Seat waste: 50 wasted * ($10,000/250 = $40/seat) = $2,000/mo
  //   API optimize: $3,000 * 0.4 = $1,200/mo
  //   Total: $3,200/mo → savingsTier = 'high', credexRelevant = true
  // ─────────────────────────────────────────────────────────
  it('TEST 4: handles large seat volumes and multi-tool stacks correctly', () => {
    const input: AuditInput = {
      teamSize: 200,
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 10000, seats: 250 },
        { tool: 'OpenAI API', plan: 'API direct', monthlySpend: 3000, seats: 200 }
      ]
    };
    const result = runAudit(input);

    // Tool 1: Cursor seat waste
    expect(result.toolResults[0].recommendedAction).toBe('downgrade');
    expect(result.toolResults[0].savingsMonthly).toBe(2000); // 50 * $40

    // Tool 2: API optimization
    expect(result.toolResults[1].recommendedAction).toBe('optimize');
    expect(result.toolResults[1].savingsMonthly).toBe(1200); // 40% of $3,000

    // Aggregate
    expect(result.totalMonthlySavings).toBe(3200);
    expect(result.totalAnnualSavings).toBe(38400);
    expect(result.savingsTier).toBe('high');
    expect(result.credexRelevant).toBe(true);
  });

  // ─────────────────────────────────────────────────────────
  // TEST 5: Error handling — Empty tools array & zero spend
  // The engine must never throw. It should return a clean
  // result object with $0 savings and 'optimal' tier.
  // Also tests negative savings are floored to $0 via Math.max.
  // ─────────────────────────────────────────────────────────
  it('TEST 5: handles empty tools array gracefully (no crash, $0 savings)', () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: 'coding',
      tools: []
    };
    const result = runAudit(input);

    expect(result.toolResults).toEqual([]);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
    expect(result.savingsTier).toBe('optimal');
    expect(result.credexRelevant).toBe(false);

    // Also test a tool with $0 spend doesn't produce negative savings
    const inputZero: AuditInput = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        { tool: 'ChatGPT', plan: 'Business', monthlySpend: 0, seats: 1 }
      ]
    };
    const resultZero = runAudit(inputZero);
    expect(resultZero.toolResults[0].savingsMonthly).toBeGreaterThanOrEqual(0);
    expect(resultZero.toolResults[0].savingsAnnual).toBeGreaterThanOrEqual(0);
  });
  // ─────────────────────────────────────────────────────────
  // TEST 6: Benchmark Logic Verification
  // Scenario: A 10-person team spending $600/mo ($60/dev).
  //   Industry average is $45.
  //   $60 > $45 * 1.1 ($49.50) → status should be 'above'.
  // ─────────────────────────────────────────────────────────
  it('TEST 6: accurately calculates per-developer benchmark spend', () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: 'mixed',
      tools: [
        { tool: 'Cursor', plan: 'Teams', monthlySpend: 400, seats: 10 },
        { tool: 'ChatGPT', plan: 'Plus', monthlySpend: 200, seats: 10 }
      ]
    };
    const result = runAudit(input);

    expect(result.benchmark).toBeDefined();
    expect(result.benchmark.spendPerDev).toBe(60); // (400 + 200) / 10
    expect(result.benchmark.industryAverage).toBe(45);
    expect(result.benchmark.status).toBe('above');
  });

  // ─────────────────────────────────────────────────────────
  // TEST 7: Benchmark edge cases — division by zero & below average
  // Tests the standalone calculateBenchmark function directly:
  //   - teamSize = 0 → returns 'unavailable' (no division by zero)
  //   - teamSize = null → returns 'unavailable'
  //   - $200 spend / 10 devs = $20/dev → 'below' ($20 < $45 * 0.9)
  // ─────────────────────────────────────────────────────────
  it('TEST 7: benchmark handles zero/null team size and below-average correctly', () => {
    // Edge: teamSize = 0
    const zeroTeam = calculateBenchmark(500, 0);
    expect(zeroTeam.status).toBe('unavailable');
    expect(zeroTeam.spendPerDev).toBe(0);

    // Edge: teamSize = null
    const nullTeam = calculateBenchmark(500, null);
    expect(nullTeam.status).toBe('unavailable');
    expect(nullTeam.spendPerDev).toBe(0);

    // Normal: below average ($20/dev < $40.50 threshold)
    const belowAvg = calculateBenchmark(200, 10);
    expect(belowAvg.spendPerDev).toBe(20);
    expect(belowAvg.status).toBe('below');
    expect(belowAvg.industryAverage).toBe(45);
  });
});
