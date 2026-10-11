# Prayanam — 5-Minute Hackathon Demo Script for Judges

## Step 1: Conversational Intake & Validated Constraints (1 Minute)
1. Open `http://localhost:3000/traveller`.
2. Enter the prompt:
   > *"I need to travel from Vizag to Hyderabad, reach by 9 AM, prefer sleeper, low budget, and I have luggage."*
   *(Or click the quick chip: **"వైజాగ్ ➔ హైదరాబాద్ (తెలుగు)"** to demonstrate Telugu extraction).*
3. **Point out to Judges:**
   - The extraction layer extracts structured constraints into a Zod-validated schema.
   - The interactive **Constraints Editor** lets the traveller modify the date, budget, or deadline. Edits immediately recompute results.

## Step 2: Multi-Leg Itineraries & Resilience Passport (1 Minute)
1. Show the ranked itineraries:
   - **Leg 1**: Orange Travels AC Sleeper (Vizag RTC ➔ MGBS, 20:30 to 06:15, ₹850).
   - **Transfer**: 15m minimum transfer buffer at MGBS.
   - **Leg 2**: SmartRide EV Cab (MGBS ➔ HITEC City, 06:30 to 07:15, ₹130).
   - **Total Fare**: ₹980 complete journey.
   - **Arrival Buffer**: Reaches at 07:15 AM (+105 mins safety buffer before 09:00 AM deadline).
2. Click **"Resilience Passport"**:
   - Show judges the transparent heuristic evaluation of 4 disruption scenarios (90m highway delay, bus cancellation, missed boarding, cab unavailability).
3. Click **"Decision Evidence"**:
   - Show the 4 hard validation checks passed, and explain which alternative buses were ruled out and why (e.g. Kaleswari Travels arriving at 09:30 AM past 9 AM deadline).

## Step 3: Explicit Consent Gate & Boarding Pass (1 Minute)
1. Click **"Select & Review Booking"**.
2. **Point out to Judges:**
   - The agent NEVER books or takes payments automatically.
   - Clear explicit consent gate displaying the exact itinerary, INR amount, and bold disclaimer: *SIMULATED PASS · NOT VALID FOR TRAVEL*.
3. Click **"Confirm Simulated Booking"**.
4. Show the simulated digital boarding pass with unique boarding pass ID and security hash.

## Step 4: Disruption Simulation — 90-Minute Bus Delay (1 Minute)
1. On the active journey, click **"Simulate 90-Minute Bus Delay"** (or trigger it from `/admin/simulator`).
2. Show the live disruption recalculation:
   - Orange Travels bus arrival shifts from 06:15 AM to 07:45 AM.
   - Onward cab automatically shifts to 08:00 AM, arriving at HITEC City at **08:45 AM**.
   - Remaining deadline buffer is **15 minutes** before 09:00 AM.
   - The agent explains why the journey remains feasible and asks for approval before confirming any change.

## Step 5: Signature Demo — 12-Passenger Mass Rescue (1 Minute)
1. Navigate to `/admin/simulator` and click **"Simulate 12 Affected Passengers"**.
2. **Point out to Judges:**
   - One cancellation impacts 12 synthetic passengers with diverse budgets, accessibility needs, and deadlines.
   - Total spare seats across replacement operators (TSRTC, Orange, Morning Star) = **11 seats**.
   - The constrained-passenger-first optimizer matches 11 passengers safely.
   - **Zero double-booking** occurs.
   - Exactly **1 passenger (Ramesh Chowdary)** is truthfully reported as **Unresolved** with transparent explanation (impossible deadline/exhausted capacity).
3. Navigate to `/admin/bench` to show the automated test suite confirming all 12 operational criteria pass deterministically with sub-5ms planning latency!
