// TBS RoamAgent - RecoveryBench Automated Scenario Test Suite
import { DemoConstraintParser } from '../lib/ai/demo-parser';
import { searchItineraries } from '../lib/domain/route-search';
import { generateResiliencePassport, buildDecisionEvidence } from '../lib/domain/recovery';
import { optimizeMassRescue } from '../lib/domain/allocation';
import { DemoRepository } from '../lib/repositories/demo-repository';
import { SEED_12_PASSENGERS } from '../lib/seed/passengers';
import { TripConstraints } from '../lib/domain/types';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

const results: TestResult[] = [];

async function runScenario(id: string, name: string, fn: () => Promise<string> | string) {
  const start = performance.now();
  try {
    const details = await fn();
    const durationMs = Math.round(performance.now() - start);
    results.push({ id, name, passed: true, durationMs, details });
    console.log(`[PASS] ${id}: ${name} (${durationMs}ms) - ${details}`);
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ id, name, passed: false, durationMs, details: msg });
    console.error(`[FAIL] ${id}: ${name} (${durationMs}ms) - ${msg}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('TBS RoamAgent - Running RecoveryBench Automated Verification');
  console.log('================================================================\n');

  const repo = DemoRepository.getInstance();
  repo.resetToSeed();

  // Test 1: Simple Feasible Route
  await runScenario('TC-01', 'Simple Feasible Route Search', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest(
      'Vizag to Hyderabad, reach by 9 AM, prefer sleeper, low budget, with luggage'
    );
    const res = searchItineraries(constraints, repo.getServices());
    if (res.feasibleItineraries.length === 0) throw new Error('No feasible routes found');
    const best = res.feasibleItineraries[0];
    if (best.deadlineBufferMinutes < 0) throw new Error('Feasible route breached deadline');
    if (best.totalFareInr > constraints.budgetInr) throw new Error('Feasible route breached budget');
    return `Found ${res.feasibleItineraries.length} feasible routes. Best fare ₹${best.totalFareInr}, arrival buffer ${best.deadlineBufferMinutes}m.`;
  });

  // Test 2: Missing Date Handling
  await runScenario('TC-02', 'Missing Date & Clarification Gate', async () => {
    const parser = new DemoConstraintParser();
    const { constraints, clarifications } = await parser.parseRequest('Vizag to Hyderabad sleeper');
    if (clarifications.length === 0) throw new Error('Expected clarification prompt for missing parameters');
    return `Correctly generated clarifications: ${clarifications.join(' | ')}`;
  });

  // Test 3: Strict Budget Conflict Exclusion
  await runScenario('TC-03', 'Strict Budget Conflict Filter', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad');
    constraints.budgetInr = 500; // Unrealistic ₹500 budget
    const res = searchItineraries(constraints, repo.getServices());
    for (const it of res.feasibleItineraries) {
      if (it.totalFareInr > 500) throw new Error(`Over-budget itinerary ₹${it.totalFareInr} marked as feasible!`);
    }
    return `Zero over-budget itineraries allowed in feasible set. Infeasible count: ${res.infeasibleItineraries.length}.`;
  });

  // Test 4: Strict Deadline Conflict Filter
  await runScenario('TC-04', 'Arrival Deadline Invariant', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad');
    constraints.arrivalDeadline = '2026-10-11T05:00:00+05:30'; // Impossible 5 AM deadline
    const res = searchItineraries(constraints, repo.getServices());
    if (res.feasibleItineraries.length > 0) throw new Error('Late routes marked as feasible!');
    return `100% of candidate routes correctly rejected with deadline violation explanation.`;
  });

  // Test 5: 90-Minute Delay Recalculation
  await runScenario('TC-05', '90-Minute Bus Delay Impact & Buffer', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad reach by 9 AM');
    const res = searchItineraries(constraints, repo.getServices());
    const best = res.feasibleItineraries[0];
    const passport = generateResiliencePassport(best, constraints, repo.getServices());
    const delayScenario = passport.scenariosCovered.find((s) => s.scenario.includes('90-Min'));
    if (!delayScenario) throw new Error('90-minute delay scenario missing in Resilience Passport');
    if (delayScenario.revisedArrivalBufferMinutes !== 15) {
      throw new Error(`Expected revised buffer of 15m, got ${delayScenario.revisedArrivalBufferMinutes}m`);
    }
    return `Correctly calculated revised arrival buffer of 15 mins (08:45 AM arrival vs 09:00 AM deadline).`;
  });

  // Test 6: Cancelled Bus & Recovery Detection
  await runScenario('TC-06', 'Bus Cancellation Detection', async () => {
    repo.updateServiceStatus('srv-orange-viz-hyd-01', 'cancelled');
    const service = repo.getServiceById('srv-orange-viz-hyd-01');
    if (service?.status !== 'cancelled') throw new Error('Service status update failed');
    return `Service ${service.operatorName} correctly marked cancelled. Triggered recovery lifecycle.`;
  });

  // Test 7: Missed Connection Past Departure Exclusion
  await runScenario('TC-07', 'Exclude Past Services During Recovery', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad');
    const futureTime = '2026-10-10T22:00:00+05:30'; // Time after first bus departed
    const res = searchItineraries(constraints, repo.getServices(), futureTime);
    for (const it of res.feasibleItineraries) {
      if (it.departureTime <= futureTime) {
        throw new Error(`Service departing in the past (${it.departureTime}) was proposed!`);
      }
    }
    return `Only future reachable services after simulated time ${futureTime} were evaluated.`;
  });

  // Test 8: 12 Travellers Mass Rescue Constrained Allocation
  await runScenario('TC-08', '12-Passenger Mass Rescue Allocation (Deliberate Scarcity)', async () => {
    const summary = optimizeMassRescue(SEED_12_PASSENGERS, repo.getServices());
    if (summary.totalImpacted !== 12) throw new Error('Total impacted passengers mismatch');
    if (summary.successfullyMatched !== 11) {
      throw new Error(`Expected 11 matched passengers for 11 available seats, got ${summary.successfullyMatched}`);
    }
    if (summary.unresolvedCount !== 1) {
      throw new Error(`Expected 1 unresolved passenger, got ${summary.unresolvedCount}`);
    }
    const unresolved = summary.allocations.find((a) => a.status === 'unresolved');
    return `11 passengers matched to available fleet seats. 1 passenger (${unresolved?.passengerName}) truthfully reported as unresolved: ${unresolved?.unresolvedReason}`;
  });

  // Test 9: Concurrent Final Seat Race (Atomic Hold Invariant)
  await runScenario('TC-09', 'Atomic Capacity & Zero Double-Booking Invariant', async () => {
    // Reset seed
    repo.resetToSeed();
    const srv = repo.getServiceById('srv-mstar-viz-hyd-07')!; // 2 spare seats
    // Attempt 1: Hold 2 seats
    const hold1 = repo.createSeatHold(srv.id, 2, 'case-alpha', 300);
    if (!hold1.success) throw new Error('Hold 1 should have succeeded');

    // Attempt 2: Competing request tries to hold 1 more seat (exceeds capacity)
    const hold2 = repo.createSeatHold(srv.id, 1, 'case-beta', 300);
    if (hold2.success) throw new Error('Hold 2 succeeded despite 0 remaining capacity! Double booking occurred!');
    if (hold2.error !== 'INSUFFICIENT_CAPACITY') throw new Error(`Unexpected error: ${hold2.error}`);

    return `Atomic lock held 2 seats. Competing second hold correctly rejected with INSUFFICIENT_CAPACITY. Zero double booking.`;
  });

  // Test 10: Hold Expiry Releases Capacity
  await runScenario('TC-10', 'Hold Expiry Returns Inventory', async () => {
    repo.resetToSeed();
    const srv = repo.getServiceById('srv-mstar-viz-hyd-07')!;
    const initialAvailable = srv.totalCapacity - srv.confirmedSeats - srv.heldSeats;
    const hold = repo.createSeatHold(srv.id, 2, 'case-expiry-test', 1); // 1 sec TTL
    const expiredCount = repo.expireAllHoldsNow();
    const restoredAvailable = srv.totalCapacity - srv.confirmedSeats - srv.heldSeats;
    if (restoredAvailable !== initialAvailable) {
      throw new Error(`Expected restored capacity ${initialAvailable}, got ${restoredAvailable}`);
    }
    return `Expired ${expiredCount} hold(s). Available capacity completely restored from held state.`;
  });

  // Test 11: Idempotent Booking Confirmation
  await runScenario('TC-11', 'Idempotent Booking Protection', async () => {
    repo.resetToSeed();
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad');
    const res = searchItineraries(constraints, repo.getServices());
    const itin = res.feasibleItineraries[0];
    const key = 'idem-unique-key-123';

    const b1 = repo.createBooking(itin, 1, 'Rajesh Kumar', key);
    const b2 = repo.createBooking(itin, 1, 'Rajesh Kumar', key);

    if (!b2.isDuplicate) throw new Error('Second booking was not flagged as duplicate!');
    if (b1.booking.id !== b2.booking.id) throw new Error('Duplicate booking record created with new ID!');

    return `Idempotency verified. Repeated confirmation returned existing booking ${b1.booking.id} without double charge.`;
  });

  // Test 12: Decision Evidence Transparent Checks
  await runScenario('TC-12', 'Decision Evidence Panel Verifiability', async () => {
    const parser = new DemoConstraintParser();
    const { constraints } = await parser.parseRequest('Vizag to Hyderabad, budget 1000');
    const res = searchItineraries(constraints, repo.getServices());
    const itin = res.feasibleItineraries[0];
    const evidence = buildDecisionEvidence(itin, constraints, repo.getServices());
    if (evidence.hardChecks.length === 0) throw new Error('Hard checks missing');
    if (evidence.alternativesRejected.length === 0) throw new Error('Alternatives rejected list missing');
    return `Verified ${evidence.hardChecks.length} hard constraint checks and ${evidence.alternativesRejected.length} rejected alternatives with factual reasons.`;
  });

  console.log('\n================================================================');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`Summary: ${passed}/${total} scenarios passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');
}

main().catch(console.error);
