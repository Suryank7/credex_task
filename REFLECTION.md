# REFLECTION.md — Builder Reflection

## 1. What is the single most important thing you learned building this project?

I learned that deterministic math is a feature, not a limitation. When I showed the audit output to a colleague, they trusted it *because* I could trace every dollar figure back to a specific rule in `audit-engine.ts`. If I'd used an LLM to calculate the savings, I could never have explained exactly where `$400/mo` came from — it would've been a black box. For a financial tool targeting CTOs, "I can show you the exact code that produced this number" is a competitive advantage. AI-generated estimates would have been easier to build but impossible to defend in a sales conversation.

---

## 2. If you had one more week, what would you build next and why?

I'd build a Slack bot integration. The key insight from the user interview templates was that engineering managers discover tool waste during Slack conversations ("hey, does anyone still use Copilot?"). A `/stackaudit` slash command that runs an audit inline would capture leads at the exact moment of intent — when someone is already questioning their spend. The conversion rate from "Slack impulse" to "email captured" would be dramatically higher than from cold outreach.

---

## 3. What was the hardest bug you encountered, and how did you fix it?

The hardest bug was an infinite render loop in Next.js caused by the interaction between `useLocalStorage`, React Hook Form's `reset()`, and `watch()`. Here's what happened:

1. On mount, `useEffect` called `reset(savedFormData)` to hydrate the form from localStorage.
2. `reset()` updated the form state, which triggered `watch()` to emit a new value.
3. The `watch()` change triggered another `useEffect` that called `setSavedFormData(watchedValues)`.
4. `setSavedFormData` updated the `savedFormData` state, which looped back to step 1 and called `reset()` again.
5. This created `Maximum update depth exceeded` — an infinite loop.

The fix was a `useRef(false)` flag (`hasHydrated`) that gates the `reset()` call so it only fires exactly once on initial client-side hydration. I also fixed a related issue where `AnimatedCounter` was using `useState` instead of `useEffect` for its `requestAnimationFrame` loop, which caused phantom re-renders.

---

## 4. How would you pitch StackAudit to a VC in exactly one sentence?

StackAudit is Mint.com for AI tool spend — a free audit that shows engineering teams exactly how much they're wasting on wrong tiers and unused seats, then converts the highest-savings users into Credex consulting clients at a projected 30:1 LTV:CAC ratio.

---

## 5. What would you do differently if you started over?

I'd start with user interviews before writing a single line of code. I assumed engineering managers care most about per-seat cost optimization, but the research templates I created later suggested they care more about *utilization visibility* — they don't even know which team members are actively using which tools. If I'd validated this first, the MVP might have been a usage tracker with audit as a secondary feature, rather than an audit-first tool. The lesson: validate the pain point hierarchy before committing to an architecture.
