// Prayanam - API: Simulated Payment Gateway & Transaction Processor
import { NextRequest, NextResponse } from 'next/server';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { SimulatedPaymentRecord, SimulatedPaymentStatus, SimulatedPaymentMethod } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      approvalId, 
      itineraryId, 
      amount, 
      method = 'upi_demo',
      requestedOutcome = 'successful',
      idempotencyKey 
    } = body;

    if (!approvalId || typeof amount !== 'number' || !idempotencyKey) {
      return NextResponse.json(
        { error: 'approvalId, amount, and idempotencyKey are required' },
        { status: 400 }
      );
    }

    // Verify approval is valid
    const approval = demoRepo.getHumanApproval(approvalId);
    if (!approval) {
      return NextResponse.json(
        { error: 'APPROVAL_NOT_FOUND', message: 'No valid human approval found.' },
        { status: 400 }
      );
    }
    if (approval.status === 'invalidated') {
      return NextResponse.json(
        { error: 'APPROVAL_INVALIDATED', message: 'This approval has been invalidated. Please re-approve.' },
        { status: 400 }
      );
    }

    // Check existing payment for idempotency
    const existingPayment = demoRepo.getSimulatedPayment(idempotencyKey);
    if (existingPayment) {
      return NextResponse.json({
        success: existingPayment.status === 'successful',
        payment: existingPayment,
        isDuplicate: true,
        notice: 'DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.',
      });
    }

    const transactionId = `TXN-DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const status: SimulatedPaymentStatus = requestedOutcome as SimulatedPaymentStatus;

    const paymentRecord: SimulatedPaymentRecord = {
      transactionId,
      approvalId,
      itineraryId,
      amount,
      currency: 'INR',
      method: method as SimulatedPaymentMethod,
      status,
      timestamp: new Date().toISOString(),
      idempotencyKey,
    };

    demoRepo.recordSimulatedPayment(paymentRecord);

    if (status === 'declined') {
      return NextResponse.json({
        success: false,
        payment: paymentRecord,
        error: 'PAYMENT_DECLINED',
        message: 'The simulated payment was declined. Your booking has not been confirmed.',
        notice: 'DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.',
      });
    }

    if (status === 'cancelled') {
      return NextResponse.json({
        success: false,
        payment: paymentRecord,
        error: 'PAYMENT_CANCELLED',
        message: 'You cancelled the payment. No booking has been confirmed.',
        notice: 'DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.',
      });
    }

    if (status === 'pending') {
      return NextResponse.json({
        success: false,
        payment: paymentRecord,
        error: 'PAYMENT_PENDING',
        message: 'Payment status is pending. We have not yet confirmed your booking. Please check status before retrying.',
        notice: 'DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.',
      });
    }

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
      message: 'Payment successful in the simulation. Your booking is being confirmed.',
      notice: 'DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Simulated payment failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
