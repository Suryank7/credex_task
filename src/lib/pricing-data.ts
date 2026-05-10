export interface PricingPlan {
  name: string;
  pricePerSeatMonthly: number;
  minSeats?: number;
  isCustom?: boolean;
}

export const PRICING_DB: Record<string, PricingPlan[]> = {
  cursor: [
    { name: 'hobby', pricePerSeatMonthly: 0 },
    { name: 'pro', pricePerSeatMonthly: 20 },
    { name: 'pro+', pricePerSeatMonthly: 60 },
    { name: 'ultra', pricePerSeatMonthly: 200 },
    { name: 'teams', pricePerSeatMonthly: 40, minSeats: 1 }, // Cursor docs say professional teams but no hard minimum stated, usually used by groups
    { name: 'enterprise', pricePerSeatMonthly: 0, isCustom: true }
  ],
  github_copilot: [
    { name: 'free', pricePerSeatMonthly: 0 },
    { name: 'pro', pricePerSeatMonthly: 10 },
    { name: 'pro+', pricePerSeatMonthly: 39 },
    { name: 'business', pricePerSeatMonthly: 19 },
    { name: 'enterprise', pricePerSeatMonthly: 39 }
  ],
  claude: [
    { name: 'free', pricePerSeatMonthly: 0 },
    { name: 'pro', pricePerSeatMonthly: 20 },
    { name: 'max 5x', pricePerSeatMonthly: 100 },
    { name: 'max 20x', pricePerSeatMonthly: 200 },
    { name: 'team standard', pricePerSeatMonthly: 25, minSeats: 5 },
    { name: 'team premium', pricePerSeatMonthly: 125, minSeats: 5 },
    { name: 'enterprise', pricePerSeatMonthly: 0, isCustom: true },
    { name: 'api direct', pricePerSeatMonthly: 0, isCustom: true } // usage based
  ],
  chatgpt: [
    { name: 'plus', pricePerSeatMonthly: 20 },
    { name: 'pro 100', pricePerSeatMonthly: 100 },
    { name: 'pro 200', pricePerSeatMonthly: 200 },
    { name: 'business', pricePerSeatMonthly: 25, minSeats: 2 }, // $25 if billed monthly
    { name: 'enterprise', pricePerSeatMonthly: 0, isCustom: true },
    { name: 'api direct', pricePerSeatMonthly: 0, isCustom: true } // usage based
  ],
  anthropic_api: [
    { name: 'api direct', pricePerSeatMonthly: 0, isCustom: true }
  ],
  openai_api: [
    { name: 'api direct', pricePerSeatMonthly: 0, isCustom: true }
  ],
  gemini: [
    { name: 'pro', pricePerSeatMonthly: 19.99 },
    { name: 'ultra', pricePerSeatMonthly: 249.99 },
    { name: 'api', pricePerSeatMonthly: 0, isCustom: true }
  ],
  windsurf: [
    { name: 'free', pricePerSeatMonthly: 0 },
    { name: 'pro', pricePerSeatMonthly: 15 },
    { name: 'teams', pricePerSeatMonthly: 30 },
    { name: 'enterprise', pricePerSeatMonthly: 60, isCustom: true } // minimum $60
  ]
};
