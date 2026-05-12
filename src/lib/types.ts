export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export interface ToolInput {
  tool: string;        // e.g., 'cursor', 'chatgpt', 'claude'
  plan: string;        // e.g., 'pro', 'team', 'enterprise'
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolAuditResult {
  tool: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: 'downgrade' | 'switch' | 'optimize' | 'keep' | 'consolidate';
  recommendedPlan: string;
  recommendedTool?: string;
  savingsMonthly: number;
  savingsAnnual: number;
  defensibleReason: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface AuditResult {
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: 'high' | 'moderate' | 'low' | 'optimal';
  credexRelevant: boolean; // true if >$500/mo savings
  benchmark: {
    spendPerDev: number;
    industryAverage: number;
    status: 'below' | 'at' | 'above' | 'unavailable';
  };
}
