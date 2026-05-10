# METRICS.md — Product Metrics Framework for StackAudit

## North Star Metric

### **Credex Consultations Booked**

Not DAU. Not pageviews. Not "audits completed." The only metric that matters is the number of high-savings users who book a Credex consultation, because that is the direct revenue driver.

**Why this metric:**
- It's downstream of all other engagement metrics (you can't book a consultation without completing an audit, passing the email gate, and seeing savings > $500/mo).
- It directly correlates to revenue ($1,500 LTV per conversion).
- It forces the entire team to optimize for *quality* of leads, not vanity volume.

**Target:** 50 consultations/month by Month 6 → 120/month by Month 12.

---

## 3 Input Metrics

These are the leading indicators that predict whether the North Star will hit its target.

### 1. Form Completion Rate
**Definition:** % of landing page visitors who successfully submit the audit form (click "Audit My Stack").
**Target:** ≥ 35%
**Why it matters:** If users can't get through the form, nothing downstream works. This metric is the top of the funnel.
**Measurement:** `audits_completed / unique_page_visitors × 100`

### 2. Email Gate Conversion Rate
**Definition:** % of users who see the savings hero and then submit their email to unlock the full report.
**Target:** ≥ 60%
**Why it matters:** This is the "value → trust" conversion. If the savings number is compelling but users won't enter their email, the gate placement or copy is wrong.
**Measurement:** `emails_submitted / audits_completed × 100`

### 3. Shareable URL Click-Through Rate
**Definition:** % of generated report URLs that receive at least one unique click from someone other than the original user.
**Target:** ≥ 15%
**Why it matters:** This is the viral coefficient driver. Each shared report that gets clicked is a potential new audit. If this metric is high, growth compounds organically.
**Measurement:** `unique_report_clicks_from_external / total_reports_generated × 100`

---

## Pivot Triggers

These are the hard thresholds that signal a fundamental problem requiring a strategic pivot, not incremental optimization.

| Metric | Threshold | Signal | Action |
|--------|-----------|--------|--------|
| Form Completion Rate | < 20% | Form is too long or confusing | Reduce to 1-tool minimum, add pre-filled templates (e.g., "I use Cursor + ChatGPT"), or switch to a single-page calculator |
| Email Gate Conversion | < 30% | Users don't trust us enough or savings aren't compelling | A/B test removing the gate entirely and monetizing via Credex CTA on the open report instead |
| Shareable URL CTR | < 5% | Reports aren't interesting enough to share | Add a "savings badge" image (like GitHub badges) that users can embed, or add comparison benchmarks ("Your team spends 2x the industry average") |
| Consultation Booking Rate | < 3% of email-gated users | Credex value prop is unclear | Add a "What Credex Does" explainer video directly on the results page, or offer a guaranteed savings amount |

---

## Instrumentation Plan

| Event | Tracked Where | Tool |
|-------|---------------|------|
| `page_view` | Landing page load | Vercel Analytics / PostHog |
| `audit_started` | First tool added to form | PostHog custom event |
| `audit_completed` | "Audit My Stack" button clicked | PostHog custom event |
| `email_submitted` | Email gate form submitted | Supabase INSERT + PostHog |
| `report_viewed` | /report/[id] page loaded | Vercel Analytics |
| `report_shared` | Copy link button clicked | PostHog custom event |
| `consultation_booked` | Credex CTA clicked from report | PostHog + UTM tracking |
