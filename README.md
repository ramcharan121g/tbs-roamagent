# TBS RoamAgent — Agentic AI Travel Concierge

> **Samartha Hackathon: Agentic AI in Travel Technology**  
> *Theme: "Where Indian Ingenuity Meets AI" — Vignan's Institute of Information Technology*  
> **Value Line:** *Travel planned. Disruptions handled. Decisions stay yours.*

---

## 🌟 Overview & Product Mission

**TBS RoamAgent** is an agentic AI travel concierge and disruption-recovery workbench designed for Indian intercity travel, centered on the **Visakhapatnam (Vizag) ↔ Hyderabad** transport corridor.

Conventional travel apps force users to manually search individual bus routes, coordinate separate cabs, guess transfer buffers, and frantically search for new tickets when a bus is delayed or cancelled. 

RoamAgent replaces this fragmented process with an end-to-end agentic workflow:
```
Understand ➔ Validate ➔ Plan ➔ Compare ➔ Confirm ➔ Monitor ➔ Recover ➔ Coordinate
```

---

## 🚀 Key Differentiators Built

1. **RoamAgent Resilience Passport**: Before booking, inspect your itinerary's disruption tolerance. Validates 4 simulated highway scenarios (90-minute delay, service cancellation, missed boarding, cab unavailability) and displays honest heuristics rather than fabricated predictions.
2. **Journey Rescue Network**: When a service is disrupted, coordinates recovery between affected travellers and transport operators (APSRTC, TSRTC, Orange Travels, Morning Star, Kaveri). Uses transactional seat holds to prevent double-booking and requires operator acceptance plus traveller approval.
3. **12-Passenger Mass Rescue Benchmark**: Demonstrates an assignment optimizer matching 12 travellers with diverse deadlines, budgets, and accessibility needs against scarce replacement fleet capacity (11 available seats). Transparently reports the 1 unresolved case with zero double-booking.
4. **AI-Powered Missed-Bus Recovery & Smart Reboarding**: Detects absent boarding records after terminal departure, finds future viable departures from the traveller's current location, places a seat hold, and issues an updated simulated boarding pass.
5. **Decision Evidence Panel**: Explains the factual validation criteria behind every recommendation or rejection (e.g., late arrival, insufficient transfer buffer, over-budget fare, or inaccessible vehicle).
6. **RecoveryBench**: Automated deterministic verification suite running 12 operational scenarios and measuring real execution time, constraint violations (0), and double allocations (0).
7. **Bilingual English & Telugu Support**: Natural-language understanding and dynamic UI translation for regional Indian accessibility.

---

## ⚡ Zero-Cost AI & Safe Environment Defaults

- **Default Mode (`AI_PROVIDER=demo`)**: Operates completely offline with **₹0 AI API spend** using a deterministic parser, Zod validation, and robust regex fixtures.
- **Optional Groq LLM Mode**: If an optional `GROQ_API_KEY` is provided, server-side Llama models can be enabled. If rate-limited or unavailable, the system safely falls back to deterministic parsing without incurring charges.
- **Single-Process Demo Repository**: Runs locally without requiring Supabase or cloud database credentials.

---

## 🛠️ Quickstart: Install & Run Locally

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+`

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "vignan hackthon sol"
npm install
```

### 2. Configure Environment (Optional)
A pre-configured `.env.example` is provided:
```bash
cp .env.example .env.local
```
*(No API keys are required to run the full application!)*

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Verification

### Run the RecoveryBench Scenario Suite:
```bash
npm test
```
**Measured Output:**
```
================================================================
TBS RoamAgent - Running RecoveryBench Automated Verification
================================================================

[PASS] TC-01: Simple Feasible Route Search (3ms) - Found 2 feasible routes. Best fare ₹980, arrival buffer 105m.
[PASS] TC-02: Missing Date & Clarification Gate (0ms) - Correctly generated clarifications.
[PASS] TC-03: Strict Budget Conflict Filter (0ms) - Zero over-budget itineraries allowed in feasible set.
[PASS] TC-04: Arrival Deadline Invariant (0ms) - 100% of candidate routes correctly rejected.
[PASS] TC-05: 90-Minute Bus Delay Impact & Buffer (0ms) - Calculated arrival buffer of 15 mins (08:45 AM arrival vs 09:00 AM deadline).
[PASS] TC-06: Bus Cancellation Detection (0ms) - Service Orange Travels marked cancelled.
[PASS] TC-07: Exclude Past Services During Recovery (0ms) - Only future reachable services evaluated.
[PASS] TC-08: 12-Passenger Mass Rescue Allocation (0ms) - 11 passengers matched to available seats. 1 truthfully unresolved.
[PASS] TC-09: Atomic Capacity & Zero Double-Booking Invariant (0ms) - Competing second hold rejected with INSUFFICIENT_CAPACITY.
[PASS] TC-10: Hold Expiry Returns Inventory (0ms) - Hold expired and capacity restored.
[PASS] TC-11: Idempotent Booking Protection (0ms) - Repeated confirmation returned existing booking without duplicate charge.
[PASS] TC-12: Decision Evidence Panel Verifiability (11ms) - 4 hard checks and 3 rejected alternatives verified.

================================================================
Summary: 12/12 scenarios passed (100%)
================================================================
```

### Run Production Build Check:
```bash
npm run build
```
Compiled successfully with zero TypeScript or route errors.

---

## 🧭 Navigation & Workbenches

| Route | Role / Workbench | Purpose |
|---|---|---|
| **`/`** | Product Landing | Overview, core differentiators, and demo launcher |
| **`/traveller`** | Traveller Workbench | Conversational intake (EN/TE), editable constraints, multi-leg plans, Resilience Passport, booking gate, and simulated pass |
| **`/operator`** | Operator Workbench | Fleet manifest, spare seat capacity, incoming rescue requests, and transactional hold authorization |
| **`/admin/simulator`** | Disruption Controller | Controllable clock, 90-min delay, cancel bus, missed boarding, 12-passenger rescue trigger, and audit log |
| **`/admin/bench`** | RecoveryBench | Live browser execution of the 12-scenario test suite with real measured latency |

---

## 🔒 Security, Privacy & Simulation Disclaimer

- **Simulated Data**: Timetables, GPS coordinates, seat allocations, notifications, and boarding passes are synthetic models designed for demonstration.
- **Privacy Protections**: No real payment credentials, card numbers, or UPI PINs are ever requested or stored.
- **Reset Capability**: Click the reset button in the header at any time to restore the deterministic baseline.
