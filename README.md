# StackAudit: The Mint for AI Tool Spend

StackAudit is a free, instant audit tool designed to help startup founders and engineering managers analyze their AI tool stack, identify seat waste, and uncover cheaper alternatives. By inputting current subscriptions, teams receive a clear breakdown of potential monthly and annual savings, alongside an AI-generated CFO summary and a per-developer spend benchmark.

> **🔗 Live URL:** [https://stackaudit.vercel.app](https://stackaudit.vercel.app) *(Deploy to Vercel and update this link)*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod v4 |
| Database | Supabase (PostgreSQL + RLS) |
| AI Summary | Anthropic Claude Sonnet 4 |
| Email | Resend API|
| Testing | Vitest (7 tests, 100% pass) |
| Deployment | Vercel |

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stackaudit.git
   cd stackaudit
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your keys: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

## Deploy

StackAudit is optimized for one-click deployment on Vercel. Connect your GitHub repository and configure the environment variables in the Vercel project settings. The build command is `next build` and the output directory is `.next`.

## Decisions

1. **Deterministic Math over LLM Math:** All financial calculations are hardcoded in TypeScript (`audit-engine.ts`) rather than delegated to an LLM. LLMs hallucinate numbers — they invented fake pricing tiers and miscalculated multi-seat arithmetic. Hardcoding guarantees every dollar figure is defensible and unit-tested. The LLM is only used for prose summarization of pre-calculated data.

2. **Supabase over Standard Postgres:** Chosen for rapid MVP setup and native Row Level Security (RLS). Supabase provides a managed Postgres instance with a REST API, auth, and RLS policies out of the box — eliminating the need to build a custom API layer or manage database infrastructure for the initial launch.

3. **Hidden Honeypot over CAPTCHA:** Implemented a hidden form field on the email gate instead of hCaptcha or reCAPTCHA. CAPTCHAs add significant friction and hurt conversion rates. The honeypot approach catches automated bots with zero visible impact on the user experience — critical for a lead-gen tool where every percentage point of conversion matters.

4. **Local Storage + React Hook Form over Redux/Zustand:** Used a custom `useLocalStorage` hook combined with React Hook Form's `watch()` API to persist multi-tool form state across page reloads. This avoids the heavy boilerplate and bundle size of global state managers. The trade-off: we had to implement a `useRef` hydration guard to prevent an infinite render loop caused by `reset()` triggering `watch()` which triggered `setSavedFormData()` in a cycle.

5. **Glassmorphic "IDE Window" + "Financial Terminal" UI over Standard Components:** Deliberately chose a custom-built dark-mode aesthetic with glassmorphism, traffic-light window chrome, and neon accent bars over using a component library like shadcn/ui or Material-UI. The visual metaphor of an IDE (for input) and a financial terminal (for output) reinforces the product's identity as a developer-native audit tool, building immediate trust with technical buyers.
