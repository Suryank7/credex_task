# Architecture

## System Diagram

```mermaid
graph TD
    A[User Input Form] --> B[AuditEngine]
    B --> C[Audit Results]
    C --> D{Savings > $500/mo?}
    D -->|Yes| E[Credex Lead Capture]
    D -->|No| F[Notify Me Signup]
    
    E --> G[Supabase Database]
    F --> G
    
    C --> H[Anthropic API]
    H -->|Generate Summary| I[100-word Personalized Summary]
    H -->|Fallback| J[Templated Summary]
    
    I --> K[Final Report View]
    J --> K
    
    G --> L[/report/:id - Shareable URL]
    L --> M[Next.js Dynamic OG Image]
    
    E --> N[Resend API]
    N --> O[Transactional Email to User]
```

## Stack Justification

**Frontend / Backend:** Next.js (App Router) + TypeScript
- Chosen for its ability to handle both server-side logic (API routes for Anthropic/Supabase interactions) and rich client-side UI in a single deployable repository.
- Next.js App Router strongly supports dynamic Open Graph (OG) image generation via `@vercel/og` which is critical for the "shareable result URL" viral loop requirement.
- TypeScript ensures our complex financial logic in the audit engine is type-safe and resilient against refactoring regressions.

**Database:** Supabase
- Provides instant Postgres with built-in Row Level Security (RLS). This allows us to securely store leads and audit results without building a custom backend layer, accelerating MVP development while remaining scalable.

**Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- Tailwind enables rapid styling while keeping bundle sizes small.
- `shadcn/ui` provides accessible, high-quality primitive components that can be heavily customized for a premium "startup" aesthetic.
- Framer Motion adds the micro-interactions necessary to make the app feel like a modern, high-end product.

## Future Scalability (10k audits/day)

If StackAudit needs to scale to handle 10,000 audits per day, I would change the following:
1. **Edge Caching & CDN:** The read-only `/report/:id` pages would be heavily cached at the CDN level since their data is immutable after creation.
2. **Asynchronous Processing:** Currently, Anthropic API calls might block the report generation flow. At scale, this would be decoupled using a message queue (like Upstash Kafka or Redis) to generate summaries asynchronously, showing a loading skeleton on the UI while the summary generates in the background.
3. **Database Read Replicas:** If read volume (for shareable links) drastically outweighs writes, adding a Supabase read replica would prevent read contention from affecting lead capture operations.
4. **Enhanced Abuse Protection:** Moving from basic hCaptcha/Honeypot to Cloudflare Turnstile or specialized bot protection (e.g., DataDome) at the edge before requests even hit our Next.js API routes.
