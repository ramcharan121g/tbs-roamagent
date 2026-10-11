// Prayanam - API: Booking & Consent Gate
import { NextRequest, NextResponse } from 'next/server';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { Itinerary } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      itinerary, 
      passengerCount = 1, 
      passengerName = 'Traveller', 
      idempotencyKey,
      approvalId,
      approvedAmount,
      paymentTransactionId,
      paymentMethod,
      seatHoldId,
    } = body;

    if (!itinerary || !idempotencyKey) {
      return NextResponse.json(
        { error: 'Itinerary and idempotencyKey are strictly required' },
        { status: 400 }
      );
    }

    const typedItin = itinerary as Itinerary;
    const expectedFare = typedItin.totalFareInr * passengerCount;

    // Validate Human Approval if provided
    if (approvalId) {
      const approval = demoRepo.getHumanApproval(approvalId);
      if (!approval) {
        return NextResponse.json(
          { error: 'APPROVAL_NOT_FOUND', message: 'Human approval record not found.' },
          { status: 400 }
        );
      }
      if (approval.status === 'invalidated') {
        return NextResponse.json(
          { error: 'APPROVAL_INVALIDATED', message: 'Journey or passenger count changed. New approval required.' },
          { status: 400 }
        );
      }
      if (typeof approvedAmount === 'number' && approvedAmount !== expectedFare) {
        demoRepo.invalidateHumanApproval(approvalId, 'AMOUNT_MISMATCH');
        return NextResponse.json(
          { error: 'AMOUNT_MISMATCH', message: `Approved amount (₹${approvedAmount}) does not match current total fare (₹${expectedFare}).` },
          { status: 400 }
        );
      }
    }

    // Server-side seat re-validation if no active hold
    if (!seatHoldId) {
      const busLeg = typedItin.legs.find((l) => l.mode === 'bus');
      if (busLeg) {
        const srv = demoRepo.getServiceById(busLeg.serviceId);
        if (srv) {
          const available = srv.totalCapacity - srv.confirmedSeats - srv.heldSeats;
          if (available < passengerCount) {
            return NextResponse.json(
              { error: 'INSUFFICIENT_SEATS', message: `Only ${available} seat(s) remain on service.` },
              { status: 409 }
            );
          }
        }
      }
    }

    const { booking, isDuplicate, error } = demoRepo.createBooking(
      typedItin,
      passengerCount,
      passengerName,
      idempotencyKey,
      approvalId,
      paymentTransactionId,
      paymentMethod,
      seatHoldId
    );

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      booking,
      isDuplicate,
      simulatedNotice: 'SIMULATED PASS — NOT VALID FOR REAL TRAVEL',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Booking creation failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const booking = demoRepo.getBooking(id);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, booking });
  }

  return NextResponse.json({ success: true, bookings: demoRepo.getAllBookings() });
}
