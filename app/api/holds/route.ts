// TBS RoamAgent - API: Atomic Seat Holds & Inventory Control
import { NextRequest, NextResponse } from 'next/server';
import { demoRepo } from '@/lib/repositories/demo-repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, serviceId, passengerCount = 1, recoveryCaseId, holdId, ttlSeconds = 300 } = body;

    switch (action) {
      case 'CREATE': {
        if (!serviceId || !recoveryCaseId) {
          return NextResponse.json({ error: 'serviceId and recoveryCaseId required' }, { status: 400 });
        }
        const result = demoRepo.createSeatHold(serviceId, passengerCount, recoveryCaseId, ttlSeconds);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 409 });
        }
        return NextResponse.json({ success: true, hold: result.hold });
      }

      case 'CONFIRM': {
        if (!holdId || !recoveryCaseId) {
          return NextResponse.json({ error: 'holdId and recoveryCaseId required' }, { status: 400 });
        }
        const result = demoRepo.confirmSeatHold(holdId, recoveryCaseId);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Hold successfully confirmed and consumed' });
      }

      case 'RELEASE': {
        if (!holdId) {
          return NextResponse.json({ error: 'holdId required' }, { status: 400 });
        }
        const released = demoRepo.releaseSeatHold(holdId);
        return NextResponse.json({ success: released });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Hold operation failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
