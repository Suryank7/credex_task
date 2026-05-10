# REFLECTION.md — Builder Reflection

## 1. What is the single most important thing you learned building this project?

[Your answer here — be specific. e.g., "I learned that deterministic math is a feature, not a limitation. When I showed the audit to a friend, they trusted it *because* I could explain exactly where every number came from. AI-generated estimates would have been easier to build but impossible to defend in a sales conversation."]

---

## 2. If you had one more week, what would you build next and why?

[Your answer here — e.g., "I'd build a Slack bot integration. The insight from user interviews was that engineering managers discover tool waste during Slack conversations ('hey, does anyone still use Copilot?'). A /stackaudit slash command that runs an audit inline would capture leads at the exact moment of intent."]

---

## 3. What was the hardest bug you encountered, and how did you fix it?

[Your answer here — be technical and specific. e.g., "The hardest bug was a Zod v4 compatibility issue. Our project installed Zod 4.x (pulled in by the Anthropic SDK), but I initially wrote schemas using the Zod v3 API (`invalid_type_error` parameter). The build failed with a cryptic 'Object literal may only specify known properties' error. Fixing it required reading the Zod 4 migration guide and switching to the new `error` parameter syntax. Lesson: always check the version of your transitive dependencies."]

---

## 4. How would you pitch StackAudit to a VC in exactly one sentence?

[Your answer here — e.g., "StackAudit is Mint for AI tool spend — a free audit that shows engineering teams exactly how much they're wasting, then converts the highest-savings users into Credex consulting clients at a 30:1 LTV:CAC ratio."]

---

## 5. What would you do differently if you started over?

[Your answer here — e.g., "I'd start with the user interviews before writing a single line of code. I assumed engineering managers care about per-seat cost optimization, but the interviews revealed they care more about *utilization visibility* — they don't even know which team members are using which tools. The MVP should have started with a usage tracker, not a price auditor."]
