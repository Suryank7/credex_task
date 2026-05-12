import { AuditInput, AuditResult, ToolAuditResult, UseCase } from './types';


export function runAudit(input: AuditInput): AuditResult {
  const toolResults: ToolAuditResult[] = [];
  let totalMonthlySavings = 0;
  let totalAnnualSavings = 0;
  let totalMonthlySpend = 0;

  for (const toolInput of input.tools) {
    const result = evaluateTool(toolInput, input.teamSize, input.useCase);
    toolResults.push(result);
    totalMonthlySavings += result.savingsMonthly;
    totalAnnualSavings += result.savingsAnnual;
    totalMonthlySpend += toolInput.monthlySpend;
  }

  const savingsTier = 
    totalMonthlySavings > 500 ? 'high' : 
    totalMonthlySavings > 100 ? 'moderate' : 
    totalMonthlySavings > 0 ? 'low' : 'optimal';

  return {
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
    credexRelevant: totalMonthlySavings >= 500,
    benchmark: calculateBenchmark(totalMonthlySpend, input.teamSize)
  };
}

/**
 * Calculates per-developer AI spend benchmark against industry average.
 * Industry gold standard: $45/developer/month (source: 2026 SaaS benchmarks).
 * 
 * Edge cases:
 * - teamSize <= 0 or null/undefined → returns 'unavailable' status with $0 spend.
 * - totalSpend = 0 → returns 'below' status (efficient — no spend).
 */
export const INDUSTRY_AVG_PER_DEV = 45;

export function calculateBenchmark(
  totalSpend: number,
  teamSize: number | null | undefined
): AuditResult['benchmark'] {
  // Guard: prevent division by zero or nonsensical team sizes
  if (!teamSize || teamSize <= 0) {
    return {
      spendPerDev: 0,
      industryAverage: INDUSTRY_AVG_PER_DEV,
      status: 'unavailable' as AuditResult['benchmark']['status']
    };
  }

  const spendPerDev = totalSpend / teamSize;

  let status: 'below' | 'at' | 'above' = 'at';
  if (spendPerDev < INDUSTRY_AVG_PER_DEV * 0.9) status = 'below';
  else if (spendPerDev > INDUSTRY_AVG_PER_DEV * 1.1) status = 'above';

  return {
    spendPerDev: Math.round(spendPerDev),
    industryAverage: INDUSTRY_AVG_PER_DEV,
    status
  };
}

function evaluateTool(toolInput: import('./types').ToolInput, teamSize: number, useCase: UseCase): ToolAuditResult {
  const { tool, plan, monthlySpend, seats } = toolInput;
  const normalizedTool = tool.toLowerCase().replace(/\s+/g, '_');
  const normalizedPlan = plan.toLowerCase().trim();

  // Baseline values
  let recommendedAction: ToolAuditResult['recommendedAction'] = 'keep';
  let recommendedPlan = plan;
  let recommendedTool = tool;
  let savingsMonthly = 0;
  let defensibleReason = "Your current setup appears optimal for your team size and use case.";
  let confidenceLevel: ToolAuditResult['confidenceLevel'] = 'high';

  // Rule 1: Seat Waste Detection
  if (seats > teamSize) {
    recommendedAction = 'downgrade';
    const wastedSeats = seats - teamSize;
    const costPerSeat = monthlySpend / seats;
    savingsMonthly = wastedSeats * costPerSeat;
    defensibleReason = `You are paying for ${wastedSeats} more seats than your current team size (${teamSize}).`;
    return finalizeResult(toolInput, recommendedAction, recommendedPlan, recommendedTool, savingsMonthly, defensibleReason, confidenceLevel);
  }

  // Evaluate by Tool
  if (normalizedTool === 'chatgpt') {
    if (normalizedPlan.includes('business') || normalizedPlan.includes('team')) {
      if (seats === 1 || teamSize === 1) {
        recommendedAction = 'downgrade';
        recommendedPlan = 'Plus';
        savingsMonthly = monthlySpend - 20;
        defensibleReason = "ChatGPT Business/Team requires a 2-seat minimum. For a solo user, ChatGPT Plus offers the same core capabilities for less.";
      }
    } else if (normalizedPlan === 'plus' && useCase === 'coding') {
       // Rule 2: Alternative by Use case
       recommendedAction = 'switch';
       recommendedTool = 'Cursor';
       recommendedPlan = 'Pro';
       savingsMonthly = 0; // Price is same, but value is better
       defensibleReason = "For primary coding use cases, specialized AI IDEs like Cursor offer better workflow integration than browser-based ChatGPT Plus.";
       confidenceLevel = 'medium';
    }
  }

  if (normalizedTool === 'cursor') {
    if (normalizedPlan === 'teams' && (seats === 1 || teamSize === 1)) {
      recommendedAction = 'downgrade';
      recommendedPlan = 'Pro';
      savingsMonthly = monthlySpend - 20;
      defensibleReason = "Cursor Teams provides centralized billing and admin controls for groups. As a solo developer, you can get the exact same features on Cursor Pro and save $20/mo.";
    }
    if (normalizedPlan === 'pro+' && useCase !== 'coding') {
       recommendedAction = 'downgrade';
       recommendedPlan = 'Pro';
       savingsMonthly = monthlySpend - 20;
       defensibleReason = "Cursor Pro+ is for extremely heavy coding use. If coding is not your primary use case, Cursor Pro is more than sufficient.";
    }
  }

  if (normalizedTool === 'claude') {
    if (normalizedPlan.includes('max') && monthlySpend >= 100) {
      if (useCase !== 'data' && useCase !== 'coding') {
        recommendedAction = 'downgrade';
        recommendedPlan = 'Pro';
        savingsMonthly = monthlySpend - 20;
        defensibleReason = "Claude Max tiers are designed for extreme power users. For general writing and research, Claude Pro's limits are rarely reached.";
      }
    }
  }

  if (normalizedTool === 'github_copilot') {
    if (normalizedPlan === 'enterprise' && teamSize < 10) {
      recommendedAction = 'downgrade';
      recommendedPlan = 'Business';
      savingsMonthly = (monthlySpend / seats - 19) * seats;
      defensibleReason = "Copilot Enterprise features (like fine-tuning and doc indexing) are rarely ROI-positive for teams under 10. Business tier provides the core agentic features.";
    }
  }

  // Rule 3: API Spend Analysis
  if (normalizedTool === 'anthropic_api' || normalizedTool === 'openai_api' || normalizedTool === 'gemini') {
    if (normalizedPlan.includes('api') && monthlySpend > 500) {
      recommendedAction = 'optimize';
      savingsMonthly = monthlySpend * 0.4; // Estimate 40% savings via caching/batching
      defensibleReason = "At >$500/mo in direct API spend, you should implement Prompt Caching (up to 90% savings on context) or Batch API (50% discount) for non-real-time workloads.";
    } else if (normalizedPlan.includes('api') && monthlySpend > 50 && teamSize === 1) {
       recommendedAction = 'switch';
       recommendedPlan = 'Pro / Plus';
       savingsMonthly = monthlySpend - 20;
       defensibleReason = "Your API spend exceeds the cost of a flat-rate subscription ($20/mo) which provides access to the same flagship models.";
    }
  }

  // Handle generic tool switching / consolidation if no specific rule hit and spend is high
  if (recommendedAction === 'keep' && monthlySpend > 200 && (useCase === 'writing' || useCase === 'research')) {
      recommendedAction = 'optimize';
      savingsMonthly = monthlySpend * 0.2; // Generic 20% savings estimate
      defensibleReason = "Consider standardizing on a single enterprise tool (like ChatGPT Business or Claude Team) to avoid shadow IT and redundant subscriptions.";
      confidenceLevel = 'low';
  }

  return finalizeResult(toolInput, recommendedAction, recommendedPlan, recommendedTool, savingsMonthly, defensibleReason, confidenceLevel);
}

function finalizeResult(
  input: import('./types').ToolInput, 
  recommendedAction: ToolAuditResult['recommendedAction'], 
  recommendedPlan: string, 
  recommendedTool: string, 
  savingsMonthly: number, 
  defensibleReason: string, 
  confidenceLevel: ToolAuditResult['confidenceLevel']
): ToolAuditResult {
  return {
    tool: input.tool,
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
    recommendedAction,
    recommendedPlan,
    recommendedTool,
    savingsMonthly: Math.max(0, savingsMonthly),
    savingsAnnual: Math.max(0, savingsMonthly * 12),
    defensibleReason,
    confidenceLevel
  };
}
