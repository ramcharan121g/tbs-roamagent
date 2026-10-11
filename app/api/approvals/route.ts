// Prayanam - API: Human Booking Approval Gate
import { NextRequest, NextResponse } from 'next/server';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { HumanBookingApproval } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      itineraryId, 
      passengerCount = 1, 
      approvedAmount, 
      passengerName = 'Traveller', 
      bookingSessionId 
    } = body;

    if (!itineraryId || typeof approvedAmount !== 'number') {
      return NextResponse.json(
        { error: 'itineraryId and approvedAmount are strictly required' },
        { status: 400 }
      );
    }

    const approvalId = `appr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const approval: HumanBookingApproval = {
      id: approvalId,
      itineraryId,
      passengerCount,
      approvedAmount,
      currency: 'INR',
      passengerName,
      approvedAt: new Date().toISOString(),
      bookingSessionId: bookingSessionId || `sess-${Date.now()}`,
      status: 'valid',
    };

    demoRepo.recordHumanApproval(approval);

    return NextResponse.json({
      success: true,
      approval,
      message: 'Human approval recorded. Proceed to payment stage.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record human approval';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const reason = searchParams.get('reason') || 'TRAVELLER_DECLINED';

  if (!id) {
    return NextResponse.json({ error: 'Approval id required' }, { status: 400 });
  }

  const success = demoRepo.invalidateHumanApproval(id, reason);
  return NextResponse.json({ success, message: `Approval ${id} invalidated (${reason}).` });
}
