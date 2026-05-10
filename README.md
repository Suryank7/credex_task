# StackAudit: The Mint for AI Tool Spend

StackAudit is a free, instant audit tool designed to help startup founders and engineering managers analyze their AI tool stack, identify seat waste, and uncover cheaper alternatives. By simply inputting current usage, teams receive a clear breakdown of potential monthly and annual savings, alongside actionable recommendations.

For audits revealing over $500/mo in savings, StackAudit securely captures the user's information to schedule a consultation with Credex to access discounted enterprise credits.

## Screenshots
*(Add 3+ screenshots or screen recording link here after UI is built)*

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your keys (Supabase, Anthropic, Resend)
4. Start the dev server: `npm run dev`
5. Open `http://localhost:3000`

## Decisions
1. **Next.js App Router:** Chosen over React SPA to leverage dynamic Open Graph image generation (`@vercel/og`) for the shareable result URLs, which is critical for the product's viral loop.
2. **Hardcoded Audit Engine:** Explicitly avoided using an LLM for the savings math. LLMs hallucinate numbers; hardcoding the logic ensures a defensible, deterministic calculation that finance teams can trust.
3. **Supabase over Firebase:** Chosen for its native Postgres SQL and Row Level Security, allowing us to build a more relational schema for leads and audit reports that scales cleanly into a B2B SaaS architecture.
4. **Tailwind + Framer Motion:** Used to ensure the app looks like a premium, YC-backed startup product without incurring the technical debt of a heavy UI library.
5. **Decoupled Engine:** Built the `audit-engine.ts` entirely independent of React/UI components so it can be thoroughly unit tested via Vitest to guarantee math accuracy.

## Deployed URL
*(Add Vercel deployment link here)*
