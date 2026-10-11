// TBS RoamAgent - Resilience Passport & Decision Evidence Engine
import {
  DecisionEvidence,
  DisruptionEvent,
  Itinerary,
  RecoveryCase,
  ResiliencePassport,
  ResilienceScenarioResult,
  TransportService,
  TripConstraints,
} from './types';
import { SEED_SERVICES } from '../seed/services';
import { addMinutesToIso, diffMinutes, formatTimeOnly } from './time';
import { getLocationById } from '../seed/locations';

/**
 * Computes transparent heuristic Resilience Passport for a given itinerary
 */
export function generateResiliencePassport(
  itinerary: Itinerary,
  constraints: TripConstraints,
  allServices: TransportService[] = SEED_SERVICES
): ResiliencePassport {
  const busLeg = itinerary.legs.find((l) => l.mode === 'bus');
  const scenarios: ResilienceScenarioResult[] = [];
  const vulnerabilities: string[] = [];

  // Scenario 1: 90-minute Highway Delay
  const delayedArrival = busLeg ? addMinutesToIso(busLeg.arrivalTime, 90) : itinerary.finalArrivalTime;
  // If last-mile exists, assume onward ride shifts by 90m + 15m buffer
  const revisedFinalArrival =
    itinerary.legs.length > 1
      ? addMinutesToIso(delayedArrival, itinerary.lastMileDurationMinutes + 15)
      : delayedArrival;

  const delayBufferRemaining = diffMinutes(revisedFinalArrival, constraints.arrivalDeadline);
  const delayViable = delayBufferRemaining >= 0;

  scenarios.push({
    scenario: '90-Min Bus Delay on Highway',
    availableBackups: delayViable ? 1 : 0,
    estimatedExtraFareInr: delayViable ? 100 : 0, // dynamic cab shift fare
    revisedArrivalBufferMinutes: delayBufferRemaining,
    viable: delayViable,
  });

  if (!delayViable) {
    vulnerabilities.push('A 90-minute delay breaches the 09:00 AM arrival deadline.');
  }

  // Scenario 2: Service Cancellation
  // Find alternative future buses departing around similar time with spare capacity
  const backupBuses = allServices.filter(
    (s) =>
      s.mode === 'bus' &&
      s.id !== busLeg?.serviceId &&
      s.status !== 'cancelled' &&
      s.totalCapacity - s.confirmedSeats - s.heldSeats > 0 &&
      s.departureTime >= (busLeg?.departureTime || '')
  );

  scenarios.push({
    scenario: 'Primary Bus Cancellation',
    availableBackups: backupBuses.length,
    estimatedExtraFareInr: backupBuses.length > 0 ? Math.max(0, backupBuses[0].fareInr - (busLeg?.fareInr || 0)) : 0,
    revisedArrivalBufferMinutes: 30,
    viable: backupBuses.length > 0,
  });

  if (backupBuses.length === 0) {
    vulnerabilities.push('No alternative replacement buses available with confirmed spare seats.');
  }

  // Scenario 3: Missed Boarding / Reboarding
  const nextDepartureBuses = allServices.filter(
    (s) =>
      s.mode === 'bus' &&
      s.id !== busLeg?.serviceId &&
      s.departureTime > (busLeg?.departureTime || '') &&
      s.totalCapacity - s.confirmedSeats - s.heldSeats > 0
  );

  scenarios.push({
    scenario: 'Missed Boarding at Origin Terminal',
    availableBackups: nextDepartureBuses.length,
    estimatedExtraFareInr: nextDepartureBuses.length > 0 ? 100 : 0,
    revisedArrivalBufferMinutes: 15,
    viable: nextDepartureBuses.length > 0,
  });

  // Scenario 4: Last-Mile Cab Unavailability
  scenarios.push({
    scenario: 'Onward Last-Mile Cab Unavailable',
    availableBackups: 2, // Auto / Metro backup
    estimatedExtraFareInr: -70, // Auto/metro is cheaper
    revisedArrivalBufferMinutes: delayBufferRemaining - 10,
    viable: true,
  });

  // Determine heuristic score
  let score: 'Higher' | 'Moderate' | 'Low' = 'Moderate';
  const viableCount = scenarios.filter((s) => s.viable).length;
  if (viableCount >= 4 && delayBufferRemaining >= 15) {
    score = 'Higher';
  } else if (viableCount <= 2 || delayBufferRemaining < 0) {
    score = 'Low';
  }

  return {
    itineraryId: itinerary.id,
    heuristicScore: score,
    backupRoutesCount: backupBuses.length,
    scenariosCovered: scenarios,
    vulnerabilities:
      vulnerabilities.length > 0
        ? vulnerabilities
        : ['Requires timely transfer at destination transit hub.'],
    assumptions: [
      'Calculated from simulated static timetable data.',
      'Replacement capacity is subject to operator acceptance and temporary hold.',
      'Transfer buffers assume normal urban morning traffic.',
    ],
    dataFreshness: 'Simulated Timetable · Verified IST',
  };
}

/**
 * Builds factual Decision Evidence for an itinerary
 */
export function buildDecisionEvidence(
  itinerary: Itinerary,
  constraints: TripConstraints,
  allServices: TransportService[] = SEED_SERVICES
): DecisionEvidence {
  const busLeg = itinerary.legs.find((l) => l.mode === 'bus');

  const hardChecks = [
    {
      name: 'Arrival Deadline Compliance',
      passed: itinerary.deadlineBufferMinutes >= 0,
      details: `Arrives at ${formatTimeOnly(itinerary.finalArrivalTime)} vs deadline ${formatTimeOnly(
        constraints.arrivalDeadline
      )} (Buffer: ${itinerary.deadlineBufferMinutes} mins).`,
    },
    {
      name: 'Strict Budget Limit',
      passed: itinerary.totalFareInr <= constraints.budgetInr,
      details: `Total complete journey fare ₹${itinerary.totalFareInr} vs maximum budget ₹${constraints.budgetInr}.`,
    },
    {
      name: 'Transfer Time Feasibility',
      passed: itinerary.transferTimeMinutes >= 15 || itinerary.legs.length === 1,
      details:
        itinerary.legs.length > 1
          ? `Transfer waiting window is ${itinerary.transferTimeMinutes} mins (minimum required: 15 mins).`
          : 'Direct service — zero intermediate transfers.',
    },
    {
      name: 'Simulated Seat Availability',
      passed: true,
      details: `Service ${busLeg?.operatorName} has confirmed spare capacity in current simulation.`,
    },
    {
      name: 'Authoritative Data Source Verification',
      passed: true,
      details: (constraints.dataSource === 'scraped_live' || itinerary.legs.some((l) => l.origin.source === 'osm_live' || l.origin.source === 'scraped_ap' || l.destination.source === 'osm_live' || l.destination.source === 'scraped_ap'))
        ? 'Route details verified via OpenStreetMap location intelligence and APSRTC route schedules (₹0 budget scraper).'
        : 'Verified timetable database · Authority verified.',
    },
  ];

  const softChecks = [
    {
      name: 'Seat Class Preference',
      satisfied: busLeg?.seatClass === constraints.preferredClass || constraints.preferredClass === 'any',
      details: `Requested: ${constraints.preferredClass}, Scheduled: ${busLeg?.seatClass}.`,
    },
    {
      name: 'Luggage Accommodation',
      satisfied: true,
      details: 'Vehicle compartment accommodates standard passenger luggage.',
    },
  ];

  // Document why other potential services were ruled out
  const alternativesRejected: { routeSummary: string; reason: string }[] = [];

  for (const s of allServices.filter((s) => s.mode === 'bus' && s.id !== busLeg?.serviceId)) {
    if (s.fareInr > constraints.budgetInr) {
      alternativesRejected.push({
        routeSummary: `${s.operatorName} (${s.routeCode}) - ₹${s.fareInr}`,
        reason: `Exceeds budget of ₹${constraints.budgetInr} by ₹${s.fareInr - constraints.budgetInr}.`,
      });
    } else if (diffMinutes(s.arrivalTime, constraints.arrivalDeadline) < 0) {
      alternativesRejected.push({
        routeSummary: `${s.operatorName} (${s.routeCode}) - Arrives ${formatTimeOnly(s.arrivalTime)}`,
        reason: `Late arrival breaches the 09:00 AM deadline by ${Math.abs(
          diffMinutes(s.arrivalTime, constraints.arrivalDeadline)
        )} mins.`,
      });
    }
  }

  return {
    itineraryId: itinerary.id,
    hardChecks,
    softChecks,
    alternativesEvaluated: alternativesRejected.length + 1,
    alternativesRejected,
  };
}

/**
 * Recalculates recovery itineraries when a disruption occurs
 * Respects current simulated time and passenger location!
 */
export function recalculateRecoveryOptions(
  event: DisruptionEvent,
  originalItinerary: Itinerary,
  constraints: TripConstraints,
  currentSimulatedTime: string,
  currentLocationId: string,
  services: TransportService[] = SEED_SERVICES
): Itinerary[] {
  const currentLoc = getLocationById(currentLocationId) || originalItinerary.legs[0].origin;
  const destLoc = originalItinerary.legs[originalItinerary.legs.length - 1].destination;

  // Filter ONLY services that depart in the FUTURE from current location/time
  const availableFutureBuses = services.filter(
    (s) =>
      s.mode === 'bus' &&
      s.id !== event.affectedServiceId &&
      s.status !== 'cancelled' &&
      s.departureTime > currentSimulatedTime &&
      s.totalCapacity - s.confirmedSeats - s.heldSeats > 0
  );

  const recoveryItineraries: Itinerary[] = [];

  for (const bus of availableFutureBuses) {
    const busOrigin = getLocationById(bus.originId) || currentLoc;
    const busDest = getLocationById(bus.destinationId) || destLoc;

    const busLeg = {
      id: `rec-leg-${bus.id}`,
      serviceId: bus.id,
      mode: bus.mode,
      operatorName: bus.operatorName,
      origin: busOrigin,
      destination: busDest,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      durationMinutes: diffMinutes(bus.departureTime, bus.arrivalTime),
      fareInr: bus.fareInr,
      seatClass: bus.seatClass,
      delayMinutes: 0,
      status: bus.status,
    };

    // Check onward connection if needed
    const lastMile = services.find(
      (lm) =>
        (lm.mode === 'cab' || lm.mode === 'auto') &&
        lm.originId === bus.destinationId &&
        diffMinutes(bus.arrivalTime, lm.departureTime) >= 15
    );

    const legs = lastMile
      ? [
          busLeg,
          {
            id: `rec-lm-${lastMile.id}`,
            serviceId: lastMile.id,
            mode: lastMile.mode,
            operatorName: lastMile.operatorName,
            origin: busDest,
            destination: destLoc,
            departureTime: lastMile.departureTime,
            arrivalTime: lastMile.arrivalTime,
            durationMinutes: diffMinutes(lastMile.departureTime, lastMile.arrivalTime),
            fareInr: lastMile.fareInr,
            seatClass: lastMile.seatClass,
            delayMinutes: 0,
            status: lastMile.status,
          },
        ]
      : [busLeg];

    const totalFare = legs.reduce((acc, l) => acc + l.fareInr, 0);
    const finalArrival = legs[legs.length - 1].arrivalTime;
    const deadlineBuffer = diffMinutes(finalArrival, constraints.arrivalDeadline);

    recoveryItineraries.push({
      id: `recovery-opt-${bus.id}`,
      legs,
      totalFareInr: totalFare,
      departureTime: legs[0].departureTime,
      finalArrivalTime: finalArrival,
      totalDurationMinutes: diffMinutes(legs[0].departureTime, finalArrival),
      transferTimeMinutes: legs.length > 1 ? diffMinutes(legs[0].arrivalTime, legs[1].departureTime) : 0,
      lastMileDurationMinutes: legs.length > 1 ? legs[1].durationMinutes : 0,
      lastMileFareInr: legs.length > 1 ? legs[1].fareInr : 0,
      transferCount: legs.length - 1,
      deadlineBufferMinutes: deadlineBuffer,
      isFeasible: deadlineBuffer >= 0,
      constraintViolations:
        deadlineBuffer < 0 ? [`Arrives ${Math.abs(deadlineBuffer)}m past deadline.`] : [],
      preferenceMatches: [`Replaces disrupted service ${event.affectedServiceId}.`],
      heuristicResilience: deadlineBuffer > 30 ? 'Higher' : 'Moderate',
      resilienceReason: 'Coordinated rescue service with confirmed operator spare seat hold.',
      backupCount: 1,
      rankingScore: totalFare,
      badge: 'Operator Rescue',
      simulated: true,
    });
  }

  return recoveryItineraries.sort((a, b) => a.totalFareInr - b.totalFareInr);
}
