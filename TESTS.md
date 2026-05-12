# TESTS.md — Automated Test Suite for StackAudit

## Overview

StackAudit's core value proposition depends on **deterministic, defensible financial math**. Every savings recommendation must be traceable to a specific pricing rule. The test suite validates the `runAudit()` and `calculateBenchmark()` functions in `src/lib/audit-engine.ts` against 7 critical scenarios.

**Test Framework:** Vitest 4.x
**Test File:** `src/__tests__/audit-engine.test.ts`

## Running the Tests

```bash
npx vitest run
```

For watch mode during development:

```bash
npx vitest
```

## Test Coverage Matrix

| # | Test Name | Rule Tested | Input | Expected Output | Why It Matters |
|---|-----------|-------------|-------|-----------------|----------------|
| 1 | Seat waste downgrade | `seats > teamSize` → downgrade | 5-person team, 15 Cursor Teams seats at $600/mo | Action: `downgrade`, Savings: $400/mo ($40/seat × 10 wasted) | Most common enterprise waste pattern. Wrong math here = lost credibility. |
| 2 | API → flat-rate switch | Solo user API spend > $50 → switch | 1 person, $80/mo Anthropic API | Action: `switch`, Plan: `Pro / Plus`, Savings: $60/mo | Catches the classic "paying per-token when a $20 sub covers it" mistake. |
| 3 | Optimal stack (keep) | No rules fire → keep, $0 savings | 10-person team, Cursor Pro, $200/mo, 10 seats | Action: `keep`, Savings: $0, Tier: `optimal` | Validates the engine doesn't hallucinate savings where none exist. |
| 4 | Large volume edge case | Multi-tool stack with 250 seats + $3K API | 200-person team, 250 Cursor seats + $3K OpenAI API | Total: $3,200/mo, Tier: `high`, `credexRelevant: true` | Stress-tests aggregation logic at enterprise scale. |
| 5 | Empty/zero input handling | Empty tools array, $0 spend | Empty array; also $0 ChatGPT Business spend | `toolResults: []`, $0 savings, no crash; negative savings floored to $0 | Engine must never throw. Defensive programming validation. |
| 6 | Benchmark above average | Per-dev spend > industry avg | 10-person team, $600/mo total spend | `spendPerDev: 60`, `status: above`, `industryAverage: 45` | Validates the benchmark comparison correctly identifies overspending. |
| 7 | Benchmark edge cases | Division by zero + below average | `teamSize=0`, `teamSize=null`, $200/10 devs | `status: unavailable` for zero/null; `status: below`, `spendPerDev: 20` for $200/10 | Prevents runtime crashes and validates efficient spend detection. |

## Test Design Principles

1. **Deterministic Math:** Every `expect()` assertion uses a hardcoded number derived from the pricing rules in `src/lib/audit-engine.ts`. No fuzzy matching.
2. **Full-Path Coverage:** Tests cover all 5 `recommendedAction` types: `downgrade`, `switch`, `optimize`, `keep`, and the aggregation logic that produces `consolidate`.
3. **Edge-Case Discipline:** Test 5 specifically validates that `Math.max(0, savings)` prevents negative savings from propagating — a bug that would destroy trust in the product.
4. **Aggregate Validation:** Test 4 validates `totalMonthlySavings`, `totalAnnualSavings`, `savingsTier`, and `credexRelevant` across a multi-tool input, ensuring the summation loop is correct.
5. **Benchmark Safety:** Tests 6-7 validate the standalone `calculateBenchmark()` function, including division-by-zero protection and the industry average comparison.

## Expected Output

```
 ✓ src/__tests__/audit-engine.test.ts (7 tests) 20ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
```
