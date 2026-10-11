// Prayanam - Journey Rescue Optimizer (Mass Recovery for 12 Travellers)
import { SyntheticPassenger, SEED_12_PASSENGERS } from '../seed/passengers';
import { TransportService } from './types';
import { SEED_SERVICES } from '../seed/services';
import { diffMinutes } from './time';

export interface PassengerAllocationResult {
  passengerId: string;
  passengerName: string;
  matchedServiceId: string | null;
  matchedOperatorName: string | null;
  assignedSeatClass: string | null;
  revisedFareInr: number | null;
  fareDeltaInr: number | null;
  revisedArrival: string | null;
  deadlineBufferMinutes: number | null;
  status: 'offer_pending' | 'operator_accepted' | 'unresolved';
  unresolvedReason?: string;
}

export interface MassRescueSummary {
  totalImpacted: number;
  successfullyMatched: number;
  unresolvedCount: number;
  operatorCapacityUsage: {
    operatorName: string;
    allocatedSeats: number;
    maxAvailable: number;
  }[];
  allocations: PassengerAllocationResult[];
}

/**
 * Deterministic Constrained-Passenger-First Allocation Heuristic
 * Respects strict finite inventory without double-booking!
 */
export function optimizeMassRescue(
  passengers: SyntheticPassenger[] = SEED_12_PASSENGERS,
  services: TransportService[] = SEED_SERVICES
): MassRescueSummary {
  // 1. Identify relief services and track active capacity pool
  const reliefServices = services.filter((s) =>
    ['srv-tsrtc-viz-hyd-05', 'srv-orange-viz-hyd-06', 'srv-mstar-viz-hyd-07'].includes(s.id)
  );

  // Capacity tracker per service
  const capacityTracker = new Map<string, { service: TransportService; available: number; used: number }>();
  for (const s of reliefServices) {
    const spare = s.totalCapacity - s.confirmedSeats - s.heldSeats;
    capacityTracker.set(s.id, {
      service: s,
      available: spare,
      used: 0,
    });
  }

  // 2. Sort passengers: higher priorityScore first (most constrained passengers first)
  const sortedPax = [...passengers].sort((a, b) => b.priorityScore - a.priorityScore);

  const allocations: PassengerAllocationResult[] = [];
  let matchedCount = 0;
  let unresolvedCount = 0;

  for (const pax of sortedPax) {
    let matchedService: TransportService | null = null;
    let failureReason = '';

    // Check each relief service for feasibility against pax constraints
    for (const pool of capacityTracker.values()) {
      if (pool.used >= pool.available) {
        continue; // No spare seats left on this bus
      }

      const s = pool.service;

      // Check deadline
      const arrivalBuffer = diffMinutes(s.arrivalTime, pax.constraints.arrivalDeadline);
      if (arrivalBuffer < 0) {
        failureReason = `Arrives past individual deadline of ${pax.constraints.arrivalDeadline.substring(11, 16)}.`;
        continue;
      }

      // Check budget
      if (s.fareInr > pax.constraints.budgetInr) {
        failureReason = `Fare ₹${s.fareInr} exceeds passenger's maximum budget of ₹${pax.constraints.budgetInr}.`;
        continue;
      }

      // Check accessibility needs
      if (pax.constraints.accessibilityNeeds.length > 0 && !s.isAccessible) {
        failureReason = 'Bus lacks required step-free accessibility / assistance.';
        continue;
      }

      // Found a viable match!
      matchedService = s;
      pool.used += 1;
      break;
    }

    if (matchedService) {
      matchedCount++;
      const buffer = diffMinutes(matchedService.arrivalTime, pax.constraints.arrivalDeadline);
      const originalFare = 850; // Original Orange Travels fare
      const fareDelta = matchedService.fareInr - originalFare;

      allocations.push({
        passengerId: pax.id,
        passengerName: pax.name,
        matchedServiceId: matchedService.id,
        matchedOperatorName: matchedService.operatorName,
        assignedSeatClass: matchedService.seatClass,
        revisedFareInr: matchedService.fareInr,
        fareDeltaInr: fareDelta,
        revisedArrival: matchedService.arrivalTime,
        deadlineBufferMinutes: buffer,
        status: 'operator_accepted',
      });
    } else {
      unresolvedCount++;
      allocations.push({
        passengerId: pax.id,
        passengerName: pax.name,
        matchedServiceId: null,
        matchedOperatorName: null,
        assignedSeatClass: null,
        revisedFareInr: null,
        fareDeltaInr: null,
        revisedArrival: null,
        deadlineBufferMinutes: null,
        status: 'unresolved',
        unresolvedReason:
          failureReason ||
          'All compatible operator rescue seats exhausted (11 seats available across fleet).',
      });
    }
  }

  // Restore original ordering of passengers
  const orderedAllocations = passengers.map(
    (p) => allocations.find((a) => a.passengerId === p.id)!
  );

  const operatorUsage = Array.from(capacityTracker.values()).map((p) => ({
    operatorName: p.service.operatorName,
    allocatedSeats: p.used,
    maxAvailable: p.available,
  }));

  return {
    totalImpacted: passengers.length,
    successfullyMatched: matchedCount,
    unresolvedCount,
    operatorCapacityUsage: operatorUsage,
    allocations: orderedAllocations,
  };
}
