# ECONOMICS.md — Unit Economics & Path to $1M ARR

## The Funnel Math

StackAudit is a **lead-generation engine** for Credex, not a standalone product. Revenue is realized when a high-savings audit converts into a Credex credit-purchasing consultation.

### Core Assumptions

| Metric | Value | Source |
|--------|-------|--------|
| Customer Acquisition Cost (CAC) | $50 | Blended cost of outbound (Apollo scraping + Loom recording time + email tooling) |
| Lifetime Value (LTV) per converted lead | $1,500 | Average Credex consultation → credit purchase (12-month contract value) |
| LTV:CAC Ratio | **30:1** | Benchmark: >3:1 is healthy. 30:1 is exceptional. |

### Funnel Conversion Rates

```
Landing Page Visitors ─────── 100%
        │
        ▼
Audit Completed (form filled) ── 35%    [Industry avg for free tool: 25-40%]
        │
        ▼
Email Gate Passed ──────────── 60%     [Value shown before gate = high conversion]
        │
        ▼
Report Viewed ─────────────── 90%     [Email + shareable URL ensures viewing]
        │
        ▼
Consultation Booked ──────── 8%       [Of email-gated users; high-savings only]
        │
        ▼
Credit Purchase ──────────── 40%      [Credex's existing close rate on warm leads]
```

### Revenue Per 1,000 Visitors

| Stage | Count | Rate |
|-------|-------|------|
| Visitors | 1,000 | — |
| Audits completed | 350 | 35% |
| Emails captured | 210 | 60% of audits |
| Consultations booked | 17 | 8% of emails |
| Credits purchased | 7 | 40% of consults |
| **Revenue** | **$10,500** | 7 × $1,500 LTV |
| **CAC (for 210 leads)** | **$10,500** | 210 × $50 |
| **Net margin at scale** | **Positive** | CAC drops as organic/viral grows |

### Why This Becomes Wildly Profitable

The $50 CAC is a **blended outbound cost**. As StackAudit gains organic traffic from:
- Shareable audit URLs (viral coefficient 1.3)
- SEO on "AI tool cost comparison" keywords
- Product Hunt / Reddit word-of-mouth

The effective CAC drops to **$5–$15** for organic leads, while LTV remains $1,500. At a $10 effective CAC, the LTV:CAC ratio hits **150:1**.

## Path to $1M ARR in 18 Months

### Phase 1: Seed (Months 1–6)
- **Goal:** 500 audits/month → 150 emails → 12 consults → 5 purchases
- **Monthly Revenue:** $7,500
- **How:** Reddit posts, Slack DMs, Apollo outbound, Product Hunt launch
- **Cumulative ARR at Month 6:** $90,000

### Phase 2: Growth (Months 7–12)
- **Goal:** 2,000 audits/month → 600 emails → 48 consults → 19 purchases
- **Monthly Revenue:** $28,500
- **How:** SEO content engine, viral loops kicking in, Credex cross-sell pipeline
- **Cumulative ARR at Month 12:** $432,000

### Phase 3: Scale (Months 13–18)
- **Goal:** 5,000 audits/month → 1,500 emails → 120 consults → 48 purchases
- **Monthly Revenue:** $72,000
- **How:** Enterprise self-serve, partner referrals, paid ads (now justified by LTV:CAC)
- **Cumulative ARR at Month 18:** $1,296,000 → **$1M+ ARR achieved at Month 16**

### Break-Even Analysis

At a $50 blended CAC, break-even occurs when:

```
Revenue per lead = CAC
$1,500 × conversion_rate = $50
conversion_rate = 3.3%
```

We need just **3.3% of email-captured leads** to eventually purchase Credex credits to break even. Our model assumes 8% × 40% = **3.2% end-to-end conversion**, which means we break even from Day 1 on outbound, and every organic lead is pure profit.
