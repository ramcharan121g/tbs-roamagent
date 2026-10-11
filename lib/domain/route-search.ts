// Prayanam - Deterministic Multi-Leg Itinerary Engine
import {
  Itinerary,
  ItineraryLeg,
  Location,
  TransportService,
  TripConstraints,
} from './types';
import { SEED_LOCATIONS, getLocationById } from '../seed/locations';
import { SEED_SERVICES } from '../seed/services';
import { diffMinutes, isAfter, isBeforeOrEqual } from './time';

export const MIN_TRANSFER_BUFFER_MINUTES = 15;

export interface RouteSearchResult {
  feasibleItineraries: Itinerary[];
  infeasibleItineraries: { itinerary: Itinerary; reasons: string[] }[];
  searchTimestamp: string;
  totalEvaluated: number;
}

/**
 * Deterministically constructs and validates multi-leg journeys
 */
export function searchItineraries(
  constraints: TripConstraints,
  services: TransportService[] = SEED_SERVICES,
  currentSimulatedTime = '2026-10-10T18:00:00+05:30'
): RouteSearchResult {
  const originLoc = getLocationById(constraints.originLocationId) || SEED_LOCATIONS[0];
  const destLoc = getLocationById(constraints.destinationLocationId) || SEED_LOCATIONS[6]; // HITEC City

  // Reject identical origin and destination
  if (
    originLoc.id === destLoc.id ||
    (originLoc.city.toLowerCase() === destLoc.city.toLowerCase() &&
      originLoc.name.toLowerCase() === destLoc.name.toLowerCase())
  ) {
    return {
      feasibleItineraries: [],
      infeasibleItineraries: [
        {
          itinerary: {
            id: 'itin-invalid-same-station',
            legs: [],
            totalFareInr: 0,
            departureTime: constraints.earliestDeparture || currentSimulatedTime,
            finalArrivalTime: constraints.earliestDeparture || currentSimulatedTime,
            totalDurationMinutes: 0,
            transferTimeMinutes: 0,
            lastMileDurationMinutes: 0,
            lastMileFareInr: 0,
            transferCount: 0,
            deadlineBufferMinutes: 0,
            isFeasible: false,
            constraintViolations: ['Origin station and Destination station cannot be the same.'],
            preferenceMatches: [],
            heuristicResilience: 'Low',
            resilienceReason: 'Origin and destination are identical.',
            backupCount: 0,
            rankingScore: 0,
            badge: 'Invalid',
            simulated: true,
          },
          reasons: ['Origin station and Destination station cannot be the same.'],
        },
      ],
      searchTimestamp: currentSimulatedTime,
      totalEvaluated: 1,
    };
  }

  const candidateItineraries: Itinerary[] = [];
  const infeasibleList: { itinerary: Itinerary; reasons: string[] }[] = [];

  // 1. Separate intercity buses and local last-mile services
  const intercityBuses = services.filter(
    (s) =>
      s.mode === 'bus' &&
      s.status !== 'cancelled' &&
      s.originId !== s.destinationId &&
      (s.originId === originLoc.id ||
        (originLoc.city === 'Visakhapatnam' && s.originId === 'vizag-rtc'))
  );

  const lastMileServices = services.filter(
    (s) => s.mode === 'cab' || s.mode === 'auto' || s.mode === 'metro'
  );

  // 2. Explore single-leg and multi-leg connections
  for (const bus of intercityBuses) {
    const busOrigin = getLocationById(bus.originId) || originLoc;
    const busDest = getLocationById(bus.destinationId);

    if (!busDest || bus.originId === bus.destinationId) continue;

    // Check if the service already departed before current simulated time
    if (isBeforeOrEqual(bus.departureTime, currentSimulatedTime)) {
      continue;
    }

    const busLeg: ItineraryLeg = {
      id: `leg-${bus.id}`,
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
      delayMinutes: bus.delayMinutes,
      status: bus.status,
    };

    // Case A: Bus reaches the final destination directly
    if (bus.destinationId === destLoc.id) {
      const it = buildItinerary([busLeg], constraints, 0, 0);
      if (it.isFeasible) {
        candidateItineraries.push(it);
      } else {
        infeasibleList.push({ itinerary: it, reasons: it.constraintViolations });
      }
      continue;
    }

    // Case B: Bus reaches a Hyderabad hub (e.g. MGBS, LB Nagar), needs onward last-mile leg
    const compatibleLastMile = lastMileServices.filter(
      (lm) =>
        lm.originId === bus.destinationId &&
        (lm.destinationId === destLoc.id || destLoc.city === 'Hyderabad') &&
        diffMinutes(bus.arrivalTime, lm.departureTime) >= MIN_TRANSFER_BUFFER_MINUTES
    );

    if (compatibleLastMile.length > 0) {
      for (const lm of compatibleLastMile) {
        const lmOrigin = getLocationById(lm.originId) || busDest;
        const lmDest = getLocationById(lm.destinationId) || destLoc;

        const lmLeg: ItineraryLeg = {
          id: `leg-${lm.id}`,
          serviceId: lm.id,
          mode: lm.mode,
          operatorName: lm.operatorName,
          origin: lmOrigin,
          destination: lmDest,
          departureTime: lm.departureTime,
          arrivalTime: lm.arrivalTime,
          durationMinutes: diffMinutes(lm.departureTime, lm.arrivalTime),
          fareInr: lm.fareInr,
          seatClass: lm.seatClass,
          delayMinutes: lm.delayMinutes,
          status: lm.status,
        };

        const transferWait = diffMinutes(bus.arrivalTime, lm.departureTime);
        const it = buildItinerary([busLeg, lmLeg], constraints, transferWait, lm.fareInr);
        if (it.isFeasible) {
          candidateItineraries.push(it);
        } else {
          infeasibleList.push({ itinerary: it, reasons: it.constraintViolations });
        }
      }
    }

    // Case C: Bus reaches an intermediate transit junction, connects to onward bus
    const compatibleConnectingBuses = services.filter(
      (s) =>
        s.mode === 'bus' &&
        s.status !== 'cancelled' &&
        s.originId === bus.destinationId &&
        s.destinationId === destLoc.id &&
        diffMinutes(bus.arrivalTime, s.departureTime) >= MIN_TRANSFER_BUFFER_MINUTES
    );

    if (compatibleConnectingBuses.length > 0) {
      for (const cb of compatibleConnectingBuses) {
        const cbOrigin = getLocationById(cb.originId) || busDest;
        const cbDest = getLocationById(cb.destinationId) || destLoc;

        const cbLeg: ItineraryLeg = {
          id: `leg-${cb.id}`,
          serviceId: cb.id,
          mode: cb.mode,
          operatorName: cb.operatorName,
          origin: cbOrigin,
          destination: cbDest,
          departureTime: cb.departureTime,
          arrivalTime: cb.arrivalTime,
          durationMinutes: diffMinutes(cb.departureTime, cb.arrivalTime),
          fareInr: cb.fareInr,
          seatClass: cb.seatClass,
          delayMinutes: cb.delayMinutes,
          status: cb.status,
        };

        const transferWait = diffMinutes(bus.arrivalTime, cb.departureTime);
        const it = buildItinerary([busLeg, cbLeg], constraints, transferWait, 0);
        if (it.isFeasible) {
          candidateItineraries.push(it);
        } else {
          infeasibleList.push({ itinerary: it, reasons: it.constraintViolations });
        }
      }
    } else if (destLoc.city === 'Hyderabad' && compatibleLastMile.length === 0) {
      // If destination requires last-mile, but no valid connection meets buffer
      const it = buildItinerary([busLeg], constraints, 0, 0);
      it.isFeasible = false;
      it.constraintViolations.push(
        `Destination is ${destLoc.name}, but no onward connection from ${busDest.name} satisfied the minimum ${MIN_TRANSFER_BUFFER_MINUTES}m transfer buffer.`
      );
      infeasibleList.push({ itinerary: it, reasons: it.constraintViolations });
    }
  }

  // Rank feasible candidates
  const rankedFeasible = rankItineraries(candidateItineraries, constraints);

  return {
    feasibleItineraries: rankedFeasible,
    infeasibleItineraries: infeasibleList,
    searchTimestamp: currentSimulatedTime,
    totalEvaluated: candidateItineraries.length + infeasibleList.length,
  };
}

/**
 * Builds and strictly validates an Itinerary object against constraints
 */
function buildItinerary(
  legs: ItineraryLeg[],
  constraints: TripConstraints,
  transferWaitMinutes: number,
  lastMileFareInr: number
): Itinerary {
  const departureTime = legs[0].departureTime;
  const finalArrivalTime = legs[legs.length - 1].arrivalTime;
  const totalFareInr = legs.reduce((sum, leg) => sum + leg.fareInr, 0);
  const totalDurationMinutes = diffMinutes(departureTime, finalArrivalTime);

  const lastMileDurationMinutes =
    legs.length > 1 ? legs[legs.length - 1].durationMinutes : 0;

  // Deadline buffer in minutes: (deadline - finalArrival)
  const deadlineBufferMinutes = diffMinutes(finalArrivalTime, constraints.arrivalDeadline);

  const violations: string[] = [];
  const matches: string[] = [];

  // Check 1: Arrival deadline (Hard constraint)
  if (deadlineBufferMinutes < 0) {
    violations.push(
      `Arrives at ${finalArrivalTime.substring(11, 16)}, which is ${Math.abs(
        deadlineBufferMinutes
      )}m past the 09:00 AM deadline.`
    );
  } else {
    matches.push(`Arrives with ${deadlineBufferMinutes}m safety buffer before deadline.`);
  }

  // Check 2: Budget (Hard constraint)
  const budgetLimit =
    constraints.budgetScope === 'group_total'
      ? constraints.budgetInr
      : constraints.budgetInr * constraints.passengers;

  if (totalFareInr > budgetLimit) {
    violations.push(
      `Total fare of ₹${totalFareInr} exceeds budget limit of ₹${budgetLimit} by ₹${
        totalFareInr - budgetLimit
      }.`
    );
  } else {
    matches.push(`Within budget: ₹${totalFareInr} (₹${budgetLimit - totalFareInr} remaining).`);
  }

  // Check 3: Seat class preference (Soft preference)
  const busLeg = legs.find((l) => l.mode === 'bus');
  if (busLeg && constraints.preferredClass !== 'any') {
    if (busLeg.seatClass === constraints.preferredClass) {
      matches.push(`Matches seat preference: ${busLeg.seatClass}.`);
    }
  }

  // Check 4: Accessibility
  if (constraints.accessibilityNeeds.length > 0) {
    const service = SEED_SERVICES.find((s) => s.id === busLeg?.serviceId);
    if (service && !service.isAccessible) {
      violations.push(`Service ${service.operatorName} does not support requested accessibility needs.`);
    } else {
      matches.push('Accessible service confirmed.');
    }
  }

  // Resilience heuristic: based on deadline buffer and transfer simplicity
  let heuristicResilience: 'Higher' | 'Moderate' | 'Low' = 'Moderate';
  let resilienceReason = 'Standard multi-leg journey with adequate transfer buffer.';

  if (deadlineBufferMinutes >= 90 && totalFareInr <= budgetLimit) {
    heuristicResilience = 'Higher';
    resilienceReason = `Robust ${deadlineBufferMinutes}m deadline buffer tolerates significant highway delays.`;
  } else if (deadlineBufferMinutes < 30) {
    heuristicResilience = 'Low';
    resilienceReason = `Tight ${deadlineBufferMinutes}m deadline buffer. Delay on bus leg could cause late arrival.`;
  }

  const isFeasible = violations.length === 0;

  return {
    id: `itin-${legs.map((l) => l.serviceId).join('-')}`,
    legs,
    totalFareInr,
    departureTime,
    finalArrivalTime,
    totalDurationMinutes,
    transferTimeMinutes: transferWaitMinutes,
    lastMileDurationMinutes,
    lastMileFareInr,
    transferCount: legs.length - 1,
    deadlineBufferMinutes,
    isFeasible,
    constraintViolations: violations,
    preferenceMatches: matches,
    heuristicResilience,
    resilienceReason,
    backupCount: 2, // populated in resilience passport
    rankingScore: 0,
    badge: '',
    simulated: true,
  };
}

/**
 * Deterministically ranks feasible itineraries using multi-criteria cost function
 */
export function rankItineraries(itineraries: Itinerary[], constraints: TripConstraints): Itinerary[] {
  return itineraries
    .map((itin) => {
      // Lower score is better
      // Weights: Fare (0.4), Duration (0.3), Risk/Buffer (0.3)
      const fareScore = itin.totalFareInr / (constraints.budgetInr || 1000);
      const durationScore = itin.totalDurationMinutes / 600; // normalised against 10h
      const riskScore = itin.deadlineBufferMinutes < 45 ? 1.5 : itin.deadlineBufferMinutes >= 90 ? 0.5 : 1.0;

      const totalScore = fareScore * 0.4 + durationScore * 0.3 + riskScore * 0.3;

      let badge = 'Balanced';
      if (itin.heuristicResilience === 'Higher') badge = 'Most Resilient';
      else if (itin.totalFareInr <= 800) badge = 'Lowest Fare';
      else if (itin.deadlineBufferMinutes > 100) badge = 'Earliest Arrival';

      return {
        ...itin,
        rankingScore: parseFloat(totalScore.toFixed(3)),
        badge,
      };
    })
    .sort((a, b) => a.rankingScore - b.rankingScore);
}
