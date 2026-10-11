<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PRAYANAM — COMPLETE AGENT REACTION & RESPONSE CONTRACT

## Purpose
The agent must respond intelligently to traveller messages, changes to travel requirements, itinerary results, booking decisions, disruptions, operator decisions, inventory conflicts, and AI failures.

Every reaction must follow the 4-part architecture:
1. **Understand:** Identify the request, event, or action.
2. **Validate:** Check journey state, hard constraints, seat capacity, and required permissions.
3. **Act:** Execute the permitted operation through the authoritative domain service.
4. **Respond:** Explain the result, update UI state, and explain what happens next.

## Core Interaction Rules (Reactions 1 to 52)
- **Part 1 — General Behaviour (Reactions 1-7):** Welcome prompt with demo actions; complete validation of origin/dest/date/deadline/budget/luggage; honest clarification for incomplete requests; no silent relaxing of constraints; automatic re-calculation upon user edits; Telugu support; voice transcript review.
- **Part 2 — Itinerary Planning (Reactions 8-13):** Verified feasible journeys; real calculated comparison of cheapest vs fastest; transparent failure reasons for infeasible options; honest Resilience Passport backup inspection; factual Decision Evidence Panel reasons.
- **Part 3 — Booking and Consent (Reactions 14-17):** Manual direct booking and AI selection open review mode first; booking occurs ONLY after explicit confirmation; transactional inventory validation prevents overbooking.
- **Part 4 — Disruption Reactions (Reactions 18-23):** 90-minute delay recalculation; cancellation invalidates dead legs and triggers rescue network; missed connection and missed boarding cases; honest fallback if last-mile cab fails.
- **Part 5 — Operator & Journey Rescue (Reactions 24-30):** Operator view of passenger needs; operator acceptance creates temporary atomic hold without confirming passenger automatically; hold expiry releases capacity; explicit traveller approval completes recovery.
- **Part 6 — 12-Passenger Rescue (Reactions 31-36):** Deliberate scarcity (11 seats for 12 passengers) truthfully reports unresolved passengers; transactional protection on competing requests; no fabricated recovery numbers.
- **Part 7 — AI & Application Failures (Reactions 37-42):** Deterministic demo parser fallback when AI key missing, rate-limited, malformed, timed out, or offline.
- **Part 8 — Consent, Privacy, Security (Reactions 43-48):** No auto-booking without approval; role permissions enforced in backend; truthful data source disclosure (simulated prototype).
- **Part 9 — Notifications & State (Reactions 49-52):** Event idempotency prevents duplicates; notifications reflect persisted state.
- **Part 10 — Shared Rules A to G:** Real outcomes for every button; separation of NLP from deterministic logic; words match persisted database state; truthful scarcity; consistent language; Telugu localization; accessible status labels.

