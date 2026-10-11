# Prayanam — Technical Architecture & System Design

## 1. System Mission & Operating Philosophy

**Prayanam** is an agentic AI travel concierge and disruption-recovery workbench for Indian intercity journeys (centered on Visakhapatnam ↔ Hyderabad corridor).

### Core Principle: Strict Separation of AI and Deterministic Planning
```
+-------------------------------------------------------+
|  User Natural Language Goal (English / Telugu / Voice)|
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  AI / Heuristic Extraction Layer (Zod validated JSON) |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Deterministic Multi-Leg Engine (Hard Constraints)   |
|  - Graph search with bounded depth                    |
|  - Arrival deadline, strict budget, transfers         |
|  - Local transit / last-mile connection calculation   |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Resilience Passport & Decision Evidence Panel        |
|  - Transparent heuristics & candidate backups         |
|  - Factual constraint violation explanations          |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Explicit Approval Boundary (Strictly User-Gated)     |
|  - No simulated booking or payment without consent    |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Journey Rescue Network (Operator & Traveller Co-ord) |
|  - Re-planning from current simulated time & location |
|  - Atomic capacity holds & zero double-booking        |
|  - Multi-passenger (12 travellers) scarce allocation  |
+-------------------------------------------------------+
```

## 2. Core Workbenches & Roles
1. **Traveller Workbench (`/traveller`)**:
   - Conversational intake in English & Telugu with live voice transcription fallback.
   - Interactive, editable constraints panel.
   - Ranked multi-leg itineraries (Bus + Cab / Auto rickshaw).
   - Route Resilience Passport (backup alternatives, transfer slack, heuristic recovery index).
   - Decision Evidence Panel explaining why each candidate passed or failed.
   - Explicit Booking Approval modal and simulated digital boarding pass.
   - Live Journey Monitoring and disruption notifications.

2. **Operator Workbench (`/operator`)**:
   - Fleet capacity overview for operators (e.g., Orange Travels, Morning Star, APSRTC, TSRTC, Kaveri).
   - Recovery request queue showing passenger profiles, luggage, accessibility, pickup and proposed fare.
   - Accept / Decline actions with transactional seat holds (TTL countdown).
   - Confirmed assignments manifest and unresolved cases summary.

3. **Simulation Controller (`/admin/simulator`)**:
   - Controllable simulated clock (`Asia/Kolkata`).
   - Disruption injection triggers:
     - 90-minute bus delay (recalculates onward transfer and final arrival buffer).
     - Bus cancellation (triggers Journey Rescue Network).
     - Missed boarding (Smart Reboarding from current terminal).
     - Missed connection & Last-mile cab unavailability.
     - **12 Affected Travellers Mass Rescue** simulation.
     - Immediate hold expiry test trigger.
     - Deterministic demo reset.

4. **RecoveryBench (`/admin/bench`)**:
   - Automated benchmark test runner evaluating:
     - Constraint satisfaction rate (100% of feasible routes satisfy hard bounds).
     - Over-allocation violations (0 allowed).
     - Unauthorized state transitions (0 allowed).
     - Double-booking prevention during concurrent holds.
     - Planning latency measurement on local machine.

## 3. Data Flow & Transactional Safety
- **Single Process In-Memory Repository**: Provides complete zero-config offline execution. Maintains synchronized atomic locks for temporary holds (`SeatHold`) and consumed reservations.
- **Supabase PostgreSQL & Realtime Ready**: Data schema and migrations provided for PostgreSQL with Row-Level Security and atomic stored procedures.
- **Zero-Spend AI**: By default `AI_PROVIDER=demo` runs completely offline with deterministic parsing and robust intent fixtures. When `GROQ_API_KEY` is provided, server-side Llama models can be used with deterministic fallback.
