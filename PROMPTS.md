# PROMPTS.md — AI Prompts Used in StackAudit

This document records every AI prompt used in the StackAudit product, per the documentation requirements.

---

## 1. Anthropic Claude — Audit Summary Generation

**Model:** `claude-sonnet-4-20250514`
**Max Tokens:** 300
**Used in:** `src/app/api/audit/route.ts`

### System Prompt

```
You are StackAudit's Chief Financial Analyst AI. You write concise, actionable audit summaries for engineering managers and CTOs.

RULES:
- Write exactly 80-120 words. No more.
- Be direct and use specific numbers from the data provided.
- Start with the single biggest savings opportunity.
- Use finance terminology: "over-provisioned", "right-size", "consolidate", "unit economics".
- End with a clear call to action mentioning Credex if savings exceed $500/mo.
- Never use generic filler phrases like "in today's landscape" or "it's important to note".
- Sound like a sharp CFO advisor, not a chatbot.
```

### User Prompt Template

```
Write a punchy financial audit summary for a {teamSize}-person team with the following AI tool analysis:

- {tool} ({plan}): ${spend}/mo, {seats} seats → Action: {action}. Reason: {reason}. Potential savings: ${savings}/mo.
[...repeated for each tool]

Total Monthly Savings: ${totalMonthlySavings}
Total Annual Savings: ${totalAnnualSavings}
Savings Tier: {savingsTier}
Credex Relevant (>$500/mo): {credexRelevant}
```

### Fallback Behavior

If the Anthropic API fails for any reason (no API key, timeout, rate limit, server error), the system gracefully falls back to a **hardcoded template-based summary** using the `generateFallbackSummary()` function. This function selects from 4 tier-specific templates (`optimal`, `low`, `moderate`, `high`) and dynamically inserts the team size, savings figures, and top saving opportunity. This ensures every user always receives a summary, regardless of API availability.

---

## 2. Prompt Design Rationale

- **Word limit (80-120):** Keeps the summary scannable. Engineering managers don't read walls of text.
- **Finance terminology:** Positions StackAudit as a serious finance tool, not a toy. Terms like "over-provisioned" and "right-size" resonate with CTOs who manage budgets.
- **Specific numbers mandate:** Forces Claude to cite the exact dollar amounts from the data rather than generating vague qualitative assessments.
- **Credex CTA condition:** Only pushes the Credex consultation when the savings genuinely warrant it (>$500/mo), maintaining trust.
- **Anti-filler rule:** Explicitly blocks common LLM filler phrases to keep the tone sharp and professional.

## 3. What I tried that didn't work

- **Giving the LLM the raw pricing data:** Initially, I tried passing the full `pricing-data.ts` to the LLM and asked it to calculate the savings itself. *Result:* Disastrous. The LLM would hallucinate fake tiers (like "ChatGPT Enterprise Lite") or invent imaginary discounts. It could not consistently perform basic arithmetic across variable team sizes. *Fix:* Hardcoded the financial logic in TypeScript (`audit-engine.ts`) and only used the LLM for text summarization.
- **Unconstrained generation:** Early prompts just asked for a "financial summary". *Result:* Claude would write 400-word essays that looked like college term papers. *Fix:* Implemented the strict 80-120 word limit and forced a bulleted list format for the underlying data.
