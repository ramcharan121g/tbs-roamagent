// Prayanam - API: Disruption Event Simulator & Controller
import { NextRequest, NextResponse } from 'next/server';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { recalculateRecoveryOptions } from '@/lib/domain/recovery';
import { optimizeMassRescue } from '@/lib/domain/allocation';
import { SEED_12_PASSENGERS } from '@/lib/seed/passengers';
import { DisruptionEvent } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, serviceId = 'srv-orange-viz-hyd-01', delayMinutes = 90, advanceMinutes = 30 } = body;

    switch (action) {
      case 'DELAY_90': {
        const srv = demoRepo.updateServiceStatus(serviceId, 'delayed', delayMinutes);
        const event: DisruptionEvent = {
          id: `evt-delay-${Date.now()}`,
          type: 'DELAY',
          affectedServiceId: serviceId,
          delayMinutes,
          description: `Service ${srv?.operatorName || serviceId} delayed by ${delayMinutes} mins due to highway congestion.`,
          timestamp: demoRepo.getSimulatedTime(),
          simulated: true,
        };

        // Open recovery cases for active bookings on this service
        const bookings = demoRepo.getAllBookings().filter(
          (b) => b.itinerary.legs.some((l) => l.serviceId === serviceId)
        );

        const recoveryCases = [];
        for (const b of bookings) {
          const defaultConstraints = {
            origin: b.itinerary.legs[0].origin.name,
            destination: b.itinerary.legs[b.itinerary.legs.length - 1].destination.name,
            originLocationId: b.itinerary.legs[0].origin.id,
            destinationLocationId: b.itinerary.legs[b.itinerary.legs.length - 1].destination.id,
            departureDate: '2026-10-10',
            earliestDeparture: null,
            arrivalDeadline: '2026-10-11T09:00:00+05:30',
            passengers: b.passengerCount,
            budgetInr: 1200,
            budgetScope: 'per_person' as const,
            preferredClass: 'sleeper' as const,
            hasLuggage: true,
            accessibilityNeeds: [],
            maxTransfers: 1,
            language: 'en' as const,
            hardConstraints: ['arrivalDeadline'],
            softPreferences: [],
            clarificationNeeded: [],
          };

          const options = recalculateRecoveryOptions(
            event,
            b.itinerary,
            defaultConstraints,
            demoRepo.getSimulatedTime(),
            b.itinerary.legs[0].origin.id,
            demoRepo.getServices()
          );

          const rc = demoRepo.createRecoveryCase(
            b.id,
            event.id,
            b.passengerName,
            b.itinerary.legs[0].origin.id,
            options
          );
          recoveryCases.push(rc);
        }

        demoRepo.addNotification({
          recipient: 'traveller',
          title: 'Highway Delay Alert (90 Mins)',
          message: `${srv?.operatorName} is delayed by 90m. Shifted final arrival calculated at 08:45 AM. 15m buffer remaining before 09:00 AM deadline.`,
          type: 'warning',
        });

        return NextResponse.json({ success: true, event, recoveryCases });
      }

      case 'CANCEL_BUS': {
        const srv = demoRepo.updateServiceStatus(serviceId, 'cancelled');
        const event: DisruptionEvent = {
          id: `evt-cancel-${Date.now()}`,
          type: 'CANCEL',
          affectedServiceId: serviceId,
          description: `Service ${srv?.operatorName || serviceId} cancelled due to mechanical failure. Rescue Network activated.`,
          timestamp: demoRepo.getSimulatedTime(),
          simulated: true,
        };

        demoRepo.addNotification({
          recipient: 'traveller',
          title: 'Service Cancellation',
          message: `${srv?.operatorName} has been cancelled. Alternate fleet services identified under Journey Rescue Network.`,
          type: 'alert',
        });

        return NextResponse.json({ success: true, event });
      }

      case 'MISSED_BOARDING': {
        const event: DisruptionEvent = {
          id: `evt-missed-${Date.now()}`,
          type: 'MISSED_BOARDING',
          affectedServiceId: serviceId,
          description: 'Passenger missed boarding window at terminal. Smart Reboarding initiated.',
          timestamp: demoRepo.getSimulatedTime(),
          simulated: true,
        };

        demoRepo.recordAudit(
          'system',
          'MISSED_BOARDING_DETECTED',
          'Simulated boarding record absent after departure. Finding next viable bus on corridor.'
        );

        demoRepo.addNotification({
          recipient: 'traveller',
          title: 'Missed Boarding Alert',
          message: 'Your bus departed terminal. Prayanam Smart Reboarding has identified the next scheduled service with confirmed spare seat.',
          type: 'alert',
        });

        return NextResponse.json({ success: true, event });
      }

      case 'MASS_RESCUE_12': {
        const massRescueSummary = optimizeMassRescue(SEED_12_PASSENGERS, demoRepo.getServices());

        demoRepo.recordAudit(
          'simulator',
          'MASS_RESCUE_EXECUTED',
          `12 impacted passengers evaluated against finite fleet capacity. ${massRescueSummary.successfullyMatched} matched, ${massRescueSummary.unresolvedCount} unresolved.`
        );

        demoRepo.addNotification({
          recipient: 'operator',
          title: 'Mass Disruption: 12 Impacted Passengers',
          message: `Fleet rescue allocation proposed: ${massRescueSummary.successfullyMatched} matched to TSRTC/Orange/Morning Star. 1 passenger requires manual review.`,
          type: 'warning',
        });

        return NextResponse.json({ success: true, massRescueSummary });
      }

      case 'ADVANCE_TIME': {
        const newTime = demoRepo.advanceSimulatedTime(advanceMinutes);
        return NextResponse.json({ success: true, simulatedTime: newTime });
      }

      case 'EXPIRE_HOLDS': {
        const expired = demoRepo.expireAllHoldsNow();
        return NextResponse.json({ success: true, expiredHoldsCount: expired });
      }

      case 'RESET': {
        demoRepo.resetToSeed();
        return NextResponse.json({ success: true, message: 'Reset to deterministic seed' });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Disruption action failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    simulatedTime: demoRepo.getSimulatedTime(),
    services: demoRepo.getServices(),
    auditTrail: demoRepo.getAuditTrail().slice(0, 30),
    notifications: demoRepo.getNotifications(),
  });
}
