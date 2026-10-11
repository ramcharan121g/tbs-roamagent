# TBS RoamAgent — RecoveryBench Testing & Invariant Verification

## 1. Running Automated Tests
Run the deterministic test suite from the repository root:
```bash
npm test
```
Or directly with `tsx`:
```bash
npx tsx tests/run-tests.ts
```

## 2. Invariants & Deterministic Scenarios Tested
The test suite validates 12 critical operational criteria:

| ID | Test Scenario | Operational Invariant Tested | Measured Outcome |
|---|---|---|---|
| **TC-01** | Simple Feasible Route Search | Graph search finds valid journeys meeting deadline & budget | **PASS (3ms)** · 2 valid multi-leg routes |
| **TC-02** | Missing Parameters Gate | Clarification prompt for missing date & budget scope | **PASS (0ms)** · Clarifications generated |
| **TC-03** | Strict Budget Invariant | Over-budget candidate journeys excluded from feasible set | **PASS (0ms)** · Zero over-budget routes |
| **TC-04** | Arrival Deadline Invariant | Late candidate journeys excluded from feasible set | **PASS (0ms)** · 100% late routes rejected |
| **TC-05** | 90-Minute Bus Delay Impact | Arrival buffer recomputed (08:45 AM arrival, 15m remaining buffer) | **PASS (0ms)** · Exactly 15m buffer |
| **TC-06** | Cancellation Lifecycle | Service state transition to cancelled triggers rescue engine | **PASS (0ms)** · Rescue triggered |
| **TC-07** | Exclude Departed Services | Re-planning from current simulated time excludes departed buses | **PASS (0ms)** · Future services only |
| **TC-08** | 12-Passenger Mass Rescue | Constrained allocation matching 12 travellers to 11 finite seats | **PASS (0ms)** · 11 matched, 1 unresolved |
| **TC-09** | Atomic Capacity / Race Condition | Concurrent requests competing for last seat; double-booking prevented | **PASS (0ms)** · 0 double-bookings |
| **TC-10** | Hold Expiry Restoration | Temporary seat holds expire and restore free capacity | **PASS (0ms)** · Capacity restored |
| **TC-11** | Idempotent Booking Protection | Repeated confirmation submissions return existing booking | **PASS (0ms)** · 0 duplicate charges |
| **TC-12** | Decision Evidence Panel | Transparent hard checks and rejected alternatives explained factually | **PASS (11ms)** · Full factual audit |

## 3. Web UI Benchmark Runner
You can run the live benchmark inside the application:
1. Navigate to `http://localhost:3000/admin/bench`
2. Click **"Run Full Benchmark Suite"**
3. Inspect live latency, passed test count, and scenario execution log.
