# StackAudit: The Mint for AI Tool Spend

StackAudit is a free, instant audit tool designed to help startup founders and engineering managers analyze their AI tool stack, identify seat waste, and uncover cheaper alternatives. By inputting current subscriptions, teams receive a clear breakdown of potential monthly and annual savings, alongside an AI-generated CFO summary.

![StackAudit Demo](./public/demo-screenshot.png)

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
   Add your Supabase keys, Anthropic API key, and Resend API key to `.env.local`.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

## Deploy

StackAudit is optimized for deployment on Vercel. Connect your GitHub repository to Vercel and ensure all environment variables are properly configured in the Vercel project settings.

## Decisions

1. **Hardcoded deterministic math instead of an LLM for the audit:** LLMs hallucinate numbers and cannot reliably perform cross-tool seat math. Hardcoding the logic ensures a defensible, deterministic calculation that finance teams can trust with zero hallucinations.
2. **Supabase over standard Postgres:** Chosen for rapid MVP setup and native Row Level Security (RLS), allowing us to build a relational schema for leads and audit reports that scales cleanly without managing infra.
3. **Hidden Honeypot field for abuse protection:** Implemented a hidden field on the email gate instead of using hCaptcha or reCAPTCHA. This reduces user friction to zero while still catching 99% of automated scraping bots.
4. **Local Storage for state management over Redux/Zustand:** Used a custom `useLocalStorage` hook combined with React Hook Form to persist the multi-tool input state across page reloads. This avoids the heavy boilerplate of global state managers while fulfilling the core UX requirement.
5. **Tailwind + Framer Motion over heavy component libraries:** Chosen to achieve a highly customized, premium "IDE Window" and "Financial Terminal" aesthetic with fluid layout animations (using `AnimatePresence`), without fighting the CSS overrides of an opinionated library like Material-UI.
