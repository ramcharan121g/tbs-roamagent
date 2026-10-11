# TBS ROAMAGENT — COMPLETE AGENT REACTION & RESPONSE CONTRACT

## Purpose
The agent must respond intelligently to traveller messages, changes to travel requirements, itinerary results, booking decisions, disruptions, operator decisions, inventory conflicts, and AI failures.

Every reaction must have four parts:
1. **Understand:** Identify the request, event, or action.
2. **Validate:** Check the current journey state, constraints, capacity, and required permissions.
3. **Act:** Execute the permitted operation through the appropriate application service.
4. **Respond:** Explain the result, update the relevant dashboard, and show the next available action.

Do not implement these as a collection of hardcoded chatbot replies. Connect each reaction to the actual domain logic and UI state.

---

# PART 1 — GENERAL AGENT BEHAVIOUR

## Reaction 1: Traveller opens RoamAgent
**Context:** The traveller opens the application for the first time.
**Expected behaviour:**
The application explains its purpose, shows the available actions, and makes the demo-data status visible.
**Agent response:**
"Welcome to TBS RoamAgent.
Tell me where you want to travel, when you need to arrive, and what matters most to you.
I'll compare feasible journeys, explain the trade-offs, and help you recover if your plans change.
You remain in control of every booking and journey change."
**UI actions:**
* Plan a journey.
* Manual direct booking.
* Explore sample journeys (Vizag-Hyderabad, Araku Valley, Gandikota, Tirumala).
* View the Resilience Passport.
* Open the operator dashboard.
* Open the disruption simulator.
**State:** No journey is created until the traveller starts a request.

## Reaction 2: Traveller enters a complete travel request
**Expected behaviour:**
The agent extracts origin, destination, date, arrival deadline, budget, comfort preference, and luggage requirement. It validates the request before running the itinerary planner.
**Agent response:**
"I've understood your travel requirements.
Origin: {origin}
Destination: {destination}
Travel date: {date}
Arrival deadline: {deadline}
Preferred class: {preferredClass}
Budget: ₹{budget}
Luggage: {hasLuggage ? 'Yes' : 'No'}
Please review these details before I search for suitable journeys."

## Reaction 3: Traveller provides incomplete information
**Expected behaviour:** Identify missing fields (e.g. origin or date) and ask only questions needed to continue without inventing data.

## Reaction 4: Traveller gives conflicting information
**Expected behaviour:** Check whether any route can satisfy all supplied constraints. If none does, explain the conflict honestly without silently relaxing hard constraints.

## Reaction 5: Traveller edits requirements
**Expected behaviour:** Update trip constraints, recalculate itinerary options, and explain what changed and why routes were recomputed.

## Reaction 6: Traveller switches to Telugu
**Expected behaviour:** Display Telugu translations and process input accurately preserving places, times, fares, and IDs.

## Reaction 7: Traveller submits a voice request
**Expected behaviour:** Use Web Speech API or explain fallback if voice is unsupported.

---

# PART 2 — ITINERARY PLANNING REACTIONS

## Reaction 8: A valid journey is found
**Expected behaviour:** Deterministic planner validates all hard constraints. AI explains verified options with fares, buffers, and capacity.

## Reaction 9: Cheapest route and fastest route differ
**Expected behaviour:** Calculate actual cheapest vs fastest route, comparing price vs extra buffer time.

## Reaction 10: No feasible journey is found
**Expected behaviour:** Explain exact constraint failures (deadline breach, budget, transfers, capacity) without fabricating routes.

## Reaction 11: Traveller opens the Resilience Passport
**Expected behaviour:** Show primary plan, viable backup services, slack buffer, and transparent heuristics without inventing fake guarantees.

## Reaction 12: Traveller asks why a route was rejected
**Expected behaviour:** Retrieve factual validation reasons from the Decision Evidence Panel.

## Reaction 13: Traveller changes a hard constraint
**Expected behaviour:** Update deadline or budget, replan, and explain the newly eligible routes.

---

# PART 3 — BOOKING AND CONSENT REACTIONS

## Reaction 14: Traveller selects an itinerary
**Expected behaviour:** Opens booking review. Does not confirm or charge yet.

## Reaction 15: Traveller confirms simulated booking / Manual booking
**Expected behaviour:** Revalidate inventory atomically, create booking with idempotency, issue boarding pass, and activate real-time journey monitoring.

## Reaction 16: Traveller declines booking
**Expected behaviour:** Cancel confirmation modal without creating any booking.

## Reaction 17: Capacity changes before confirmation
**Expected behaviour:** Refuse to confirm if seats are no longer available in backend inventory.

---

# PART 4 — DISRUPTION REACTIONS

## Reaction 18: A bus is delayed by 90 minutes
**Expected behaviour:** Calculate revised arrival, check onward buffer slack, present valid alternatives, require consent.

## Reaction 19: The current bus is cancelled
**Expected behaviour:** Mark service cancelled, invalidate dependent routes, check rescue network capacity, request approval.

## Reaction 20: Traveller misses a connecting bus
**Expected behaviour:** Invalidate missed continuation, search future departures from current location.

## Reaction 21: Traveller misses the original bus
**Expected behaviour:** Verify boarding window has ended without recorded scan, open smart reboarding case.

## Reaction 22: The last-mile cab becomes unavailable
**Expected behaviour:** Search alternate local rides or public transit, update final arrival.

## Reaction 23: The original route is delayed but remains feasible
**Expected behaviour:** Do not unnecessarily rebook; inform passenger that buffer absorbs the delay.

---

# PART 5 — OPERATOR AND JOURNEY RESCUE REACTIONS

## Reaction 24: A recovery request reaches an operator
**Expected behaviour:** Display request with passenger needs, deadline, proposed fare, and accept/decline actions.

## Reaction 25: Operator accepts a recovery request
**Expected behaviour:** Attempt atomic temporary capacity hold. Inform operator that traveller approval is still required.

## Reaction 26: Operator declines a request
**Expected behaviour:** Record refusal, return request to rescue pool to find alternative capacity.

## Reaction 27: Temporary seat hold expires
**Expected behaviour:** Release held inventory back to service capacity, notify traveller that offer expired.

## Reaction 28: Traveller approves a replacement
**Expected behaviour:** Atomically confirm assignment, update booking status to 'recovered', issue revised boarding pass.

## Reaction 29: Traveller declines a replacement
**Expected behaviour:** Release hold, preserve prior booking record as disrupted.

## Reaction 30: Passenger requests a cheaper alternative
**Expected behaviour:** Search lower-cost options under deadline and capacity constraints.

---

# PART 6 — TWELVE-PASSENGER RESCUE REACTIONS

## Reaction 31: Admin clicks 'Simulate 12 affected passengers'
**Expected behaviour:** Ingest 12 synthetic profiles, evaluate finite capacity across operators.

## Reaction 32: Available seats are insufficient (Deliberate Scarcity)
**Expected behaviour:** Match up to 11 eligible passengers truthfully; report remaining passenger as unresolved. Never overbook.

## Reaction 33: Multiple passengers need the same service
**Expected behaviour:** Prioritize constrained passengers (wheelchair, family, tight deadlines).

## Reaction 34: Competing requests for final seat
**Expected behaviour:** Atomic lock grants seat to first transactional hold; competing hold receives INSUFFICIENT_CAPACITY.

## Reaction 35: Some passengers decline
**Expected behaviour:** Holds released, remaining capacity made available for re-matching.

## Reaction 36: Mass recovery finishes
**Expected behaviour:** Truthfully report confirmed, pending, expired, and unresolved counts from persisted state.

---

# PART 7 — AI AND APPLICATION FAILURE REACTIONS

## Reaction 37: No AI API key is configured
**Expected behaviour:** Graceful offline fallback to deterministic parser; never block application behind setup wall.

## Reaction 38: Groq rate-limit reached
**Expected behaviour:** Fallback immediately to deterministic parser with user notice.

## Reaction 39: Model returns invalid JSON
**Expected behaviour:** Reject malformed output; fallback safely to deterministic extractor.

## Reaction 40: AI service times out
**Expected behaviour:** Abort after timeout; proceed with deterministic rule-based planning.

## Reaction 41: Engine encounters error
**Expected behaviour:** Preserve user input, show recoverable alert, write log.

## Reaction 42: Application is offline
**Expected behaviour:** Continue running in local demo mode using simulated datasets.

---

# PART 8 — CONSENT, PRIVACY, AND SECURITY REACTIONS

## Reaction 43: Traveller asks agent to book automatically
**Expected behaviour:** Agent recommends route but mandates explicit traveller approval before booking.

## Reaction 44: Traveller asks to change/cancel booking
**Expected behaviour:** Review change and fees; require explicit confirmation.

## Reaction 45: Traveller rejects financial action
**Expected behaviour:** Abort proposed action without side effects.

## Reaction 46: Traveller clears demo data
**Expected behaviour:** Confirm reset, restore predictable deterministic seed state.

## Reaction 47: Unauthorized operator access
**Expected behaviour:** Enforce role checks in backend services.

## Reaction 48: User asks if schedules are live
**Expected behaviour:** Truthfully state prototype uses simulated data for demonstration.

---

# PART 9 — NOTIFICATIONS AND JOURNEY-STATE REACTIONS

## Reaction 49: Disruption event received twice
**Expected behaviour:** Idempotency key prevents duplicate recovery cases.

## Reaction 50: Journey reaches final destination
**Expected behaviour:** Mark journey completed when arrival condition is verified.

## Reaction 51: Traveller opens notifications
**Expected behaviour:** Show persisted audit events and recovery alerts.

## Reaction 52: Notification action is no longer valid
**Expected behaviour:** Validate against live state; reject expired holds.

---

# PART 10 — SHARED IMPLEMENTATION RULES
* **Rule A: Every visible action has a real outcome.** No dummy buttons or empty toasts.
* **Rule B: Separate language understanding from domain decisions.** LLM parses intent; deterministic engine validates constraints, capacity, and holds.
* **Rule C: Responses must match persisted state.** Words and database must never disagree.
* **Rule D: Never hide unresolved cases.** Truthful scarcity reporting.
* **Rule E: Use consistent, calm, specific language.**
* **Rule F: Respect language preference (Telugu & English).**
* **Rule G: Keep reactions accessible.** Text labels for all statuses.
