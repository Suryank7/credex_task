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

## 2. Why We Chose a Finance-Oriented Persona

The system prompt instructs Claude to adopt the voice of a "Chief Financial Analyst" rather than a generic assistant. This is a deliberate design choice:

- **Trust signal for EM/CTO buyers:** Our target user is an engineering manager or CTO who manages a budget. Terms like "over-provisioned," "right-size," and "unit economics" are the *exact vocabulary* these buyers use in quarterly budget reviews. Using their language makes the output feel like a professional audit rather than a chatbot response.
- **Credex conversion:** StackAudit is a lead-gen tool for Credex consulting. The finance persona establishes authority that naturally leads to the CTA ("talk to Credex for enterprise credits"). A casual or generic tone would undermine this.
- **Conciseness enforcement:** Finance writing is inherently terse — no one reads a 500-word audit memo. The persona naturally supports the 80-120 word constraint.

---

## 3. How We Prevented Hallucinations via Hardcoded Fallbacks

### The Problem
LLMs cannot reliably perform multi-step arithmetic. When we initially let Claude calculate savings from raw pricing data, it would:
- Invent fake pricing tiers (e.g., "ChatGPT Enterprise Lite" doesn't exist)
- Miscalculate seat waste when team sizes were non-trivial (e.g., 47 seats × $19/seat)
- Invent discounts that don't exist ("Cursor offers a 30% annual discount")

### The Architecture
We solved this with a strict **separation of concerns**:
1. **Deterministic math** (`audit-engine.ts`): All financial calculations are hardcoded TypeScript. Every dollar amount is derived from verified pricing data in `pricing-data.ts`. The engine is 100% unit-tested with 7 Vitest assertions.
2. **LLM for prose only** (`route.ts`): Claude receives the *pre-calculated* JSON output and is only asked to write a natural-language summary. It never sees raw pricing data or performs arithmetic.
3. **Hardcoded fallback** (`generateFallbackSummary()`): If the API fails entirely, a template function generates a tier-specific summary using string interpolation. Zero LLM involvement.

### What We Tried That Didn't Work
- **Giving the LLM the raw pricing data:** Initially, I tried passing the full `pricing-data.ts` to the LLM and asked it to calculate the savings itself. *Result:* Disastrous. The LLM would hallucinate fake tiers or invent imaginary discounts. It could not consistently perform basic arithmetic across variable team sizes. *Fix:* Hardcoded the financial logic in TypeScript and only used the LLM for text summarization.
- **Unconstrained generation:** Early prompts just asked for a "financial summary." *Result:* Claude would write 400-word essays that looked like college term papers. *Fix:* Implemented the strict 80-120 word limit and the anti-filler rule.
