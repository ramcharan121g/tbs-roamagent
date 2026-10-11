'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bus, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Clock, 
  CreditCard, 
  QrCode, 
  Printer, 
  RefreshCw, 
  User, 
  Users, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Building
} from 'lucide-react';
import { Itinerary, Booking, HumanBookingApproval, SimulatedPaymentMethod } from '@/lib/domain/types';
import { formatTimeOnly, formatDuration } from '@/lib/domain/time';
import { useAuth } from '@/lib/auth/auth-context';

export type BookingStage = 
  | 'review' 
  | 'approval' 
  | 'payment_gateway' 
  | 'payment_declined' 
  | 'payment_cancelled' 
  | 'payment_pending' 
  | 'confirmed';

interface HumanBookingFlowModalProps {
  isOpen: boolean;
  itinerary: Itinerary | null;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
  initialPassengerCount?: number;
  passengerName?: string;
  isRecovery?: boolean;
  recoveryFareDifference?: number;
}

export function HumanBookingFlowModal({
  isOpen,
  itinerary,
  onClose,
  onBookingConfirmed,
  initialPassengerCount = 1,
  passengerName = 'Rajesh Kumar',
  isRecovery = false,
  recoveryFareDifference,
}: HumanBookingFlowModalProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState<BookingStage>('review');
  const [passengerCount, setPassengerCount] = useState(initialPassengerCount);
  const [name, setName] = useState(user?.name || passengerName);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Approval & Payment State
  const [approval, setApproval] = useState<HumanBookingApproval | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SimulatedPaymentMethod>('upi_demo');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [paymentTxnId, setPaymentTxnId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStage('review');
      setPassengerCount(initialPassengerCount);
      setName(user?.name || passengerName);
      setApproval(null);
      setConfirmedBooking(null);
      setErrorMsg(null);
      setPaymentTxnId(null);
    }
  }, [isOpen, itinerary, initialPassengerCount, passengerName, user]);

  if (!isOpen || !itinerary) return null;

  // Calculate fare
  const totalAmount = isRecovery && typeof recoveryFareDifference === 'number'
    ? Math.max(0, recoveryFareDifference)
    : itinerary.totalFareInr * passengerCount;

  // STAGE 2: Continue to Approval
  const handleProceedToApproval = () => {
    setErrorMsg(null);
    setStage('approval');
  };

  // STAGE 3: Human Approval Action
  const handleHumanApprove = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId: itinerary.id,
          passengerCount,
          approvedAmount: totalAmount,
          passengerName: name,
          bookingSessionId: `sess-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.approval) {
        setApproval(data.approval);
        setStage('payment_gateway');
      } else {
        setErrorMsg(data.error || 'Failed to record human approval.');
      }
    } catch {
      setErrorMsg('Network error while recording approval.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineApproval = () => {
    if (approval) {
      fetch(`/api/approvals?id=${approval.id}&reason=TRAVELLER_DECLINED`, { method: 'DELETE' });
    }
    setStage('review');
    onClose();
  };

  // STAGE 4 & 5: Simulated Payment Gateway Execution
  const handleExecuteSimulatedPayment = async (outcome: 'successful' | 'declined' | 'cancelled' | 'pending') => {
    if (!approval) {
      setErrorMsg('No valid human approval found. Please approve first.');
      setStage('approval');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const idempotencyKey = `idemp-${approval.id}-${Date.now()}`;

    try {
      // 1. Process Simulated Payment
      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: approval.id,
          itineraryId: itinerary.id,
          amount: totalAmount,
          method: paymentMethod,
          requestedOutcome: outcome,
          idempotencyKey,
        }),
      });

      const payData = await payRes.json();
      setPaymentTxnId(payData.payment?.transactionId || `TXN-DEMO-${Date.now()}`);

      if (outcome === 'declined') {
        setStage('payment_declined');
        setLoading(false);
        return;
      }

      if (outcome === 'cancelled') {
        setStage('payment_cancelled');
        setLoading(false);
        return;
      }

      if (outcome === 'pending') {
        setStage('payment_pending');
        setLoading(false);
        return;
      }

      if (!payData.success) {
        setErrorMsg(payData.message || 'Payment simulation failed.');
        setStage('payment_declined');
        setLoading(false);
        return;
      }

      // 2. Complete Booking with Backend Authoritative Validation
      const bookRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          passengerCount,
          passengerName: name,
          idempotencyKey,
          approvalId: approval.id,
          approvedAmount: totalAmount,
          paymentTransactionId: payData.payment?.transactionId,
          paymentMethod,
        }),
      });

      const bookData = await bookRes.json();
      if (bookData.success && bookData.booking) {
        setConfirmedBooking(bookData.booking);
        setStage('confirmed');
        onBookingConfirmed(bookData.booking);
      } else {
        setErrorMsg(bookData.error || bookData.message || 'Booking validation failed on backend inventory.');
        setStage('payment_declined');
      }
    } catch {
      setErrorMsg('Transaction failed during execution.');
      setStage('payment_declined');
    } finally {
      setLoading(false);
    }
  };

  const busLeg = itinerary.legs.find((l) => l.mode === 'bus');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-glow max-w-2xl w-full rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden bg-[#070e0a] my-auto">
        
        {/* Header with Step Tracker */}
        <div className="p-4 sm:p-5 border-b border-[#1b2e23] bg-[#0c1611]/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Human Approval & Booking Gate</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Secure Workflow
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {stage === 'review' && 'Step 1 of 3: Review Complete Journey Details'}
                {stage === 'approval' && 'Step 2 of 3: Explicit Human Consent & Authorization'}
                {stage === 'payment_gateway' && 'Step 3 of 3: Simulated Payment Gateway'}
                {stage === 'confirmed' && 'Booking Confirmed & Boarding Pass Ready'}
                {(stage === 'payment_declined' || stage === 'payment_cancelled' || stage === 'payment_pending') && 'Payment Result Resolution'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#15231b] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Simulation */}
        <div className="px-5 py-2 bg-emerald-950/40 border-b border-[#1b2e23] flex items-center justify-between text-[11px] font-mono text-emerald-400">
          <span>🛡️ HACKATHON PROTOTYPE: DEMO PAYMENT — ZERO REAL CHARGES</span>
          <span className="text-gray-400">Verified IST Schedule</span>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ========================================================================= */}
          {/* STAGE 2: REVIEW BOOKING SCREEN                                            */}
          {/* ========================================================================= */}
          {stage === 'review' && (
            <div className="space-y-5">
              <div className="bg-[#0b1410] p-4 rounded-2xl border border-[#1b2e23] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-2 border-b border-[#18271e]">
                  <span>Origin: <strong className="text-white">{itinerary.legs[0].origin.name}</strong></span>
                  <span>Destination: <strong className="text-white">{itinerary.legs[itinerary.legs.length - 1].destination.name}</strong></span>
                </div>

                {/* Journey Legs */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-mono text-emerald-400 block">Itinerary Legs</span>
                  {itinerary.legs.map((leg, idx) => (
                    <div key={leg.id || idx} className="p-3 rounded-xl bg-[#0e1a14] border border-[#1a2d21] flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Bus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{leg.operatorName}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {leg.seatClass.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {leg.origin.name} ➔ {leg.destination.name}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-emerald-400 font-bold">{formatTimeOnly(leg.departureTime)} - {formatTimeOnly(leg.arrivalTime)}</div>
                        <div className="text-[10px] text-gray-400">{formatDuration(leg.durationMinutes)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requirements & Passengers */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#0e1a14] border border-[#1a2d21]">
                    <span className="text-gray-400 block text-[10px]">PASSENGER COUNT</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 rounded bg-[#09130d] border border-emerald-800 text-white font-bold"
                      />
                      <span className="text-gray-400 text-xs">Person(s)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0e1a14] border border-[#1a2d21]">
                    <span className="text-gray-400 block text-[10px]">LEAD PASSENGER NAME</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User className="w-4 h-4 text-emerald-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#09130d] border border-emerald-800 text-white font-medium text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="p-3.5 rounded-xl bg-[#08120d] border border-emerald-900/60 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Fare per passenger:</span>
                    <span>₹{itinerary.totalFareInr}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Passenger count:</span>
                    <span>× {passengerCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxes & Platform Fees:</span>
                    <span className="text-emerald-400">₹0 (Prototype Free)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#18271e]">
                    <span>Total Amount:</span>
                    <span className="text-base">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Simulated Cancellation Policy */}
                <div className="text-[11px] text-gray-400 bg-[#0c1611] p-3 rounded-xl border border-[#1b2e23] space-y-1">
                  <strong className="text-gray-300 block">Simulated Refund & Cancellation Policy:</strong>
                  <p>100% simulated refund if cancelled at least 2 hours before scheduled departure. Re-accommodation supported via Prayanam Journey Rescue Network.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-xs font-medium hover:bg-[#121f17] transition-all"
                >
                  Cancel and Return to Results
                </button>

                <button
                  onClick={handleProceedToApproval}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  <span>Continue to Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: EXPLICIT HUMAN APPROVAL SCREEN                                    */}
          {/* ========================================================================= */}
          {stage === 'approval' && (
            <div className="space-y-6">
              <div className="bg-[#0b1410] p-6 rounded-2xl border border-emerald-500/50 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Please Review Your Journey Before Continuing to Payment</span>
                </div>

                <div className="p-4 rounded-xl bg-[#09150e] border border-emerald-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Journey:</span>
                    <span className="font-bold text-white">{itinerary.legs[0].origin.city} → {itinerary.legs[itinerary.legs.length - 1].destination.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Travel Date:</span>
                    <span className="text-white">2026-10-10 (IST Overnight)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passengers:</span>
                    <span className="text-white">{passengerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lead Traveller:</span>
                    <span className="text-white">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booking Mode:</span>
                    <span className="text-emerald-400 font-bold">Simulated Demonstration</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#182d20] text-sm font-bold">
                    <span className="text-gray-300">Total Amount:</span>
                    <span className="text-emerald-400 text-base">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs leading-relaxed">
                  <p className="font-semibold text-white mb-1">Human Approval Mandate:</p>
                  "By continuing, you explicitly approve proceeding to the payment stage for this journey and amount. The AI agent cannot independently authorize payment or finalize your booking."
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleDeclineApproval}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#122017] hover:bg-[#1a2d21] text-gray-300 text-xs font-medium transition-all"
                >
                  Decline
                </button>

                <button
                  onClick={handleHumanApprove}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Approve and Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4 & 5: SIMULATED PAYMENT GATEWAY SCREEN                             */}
          {/* ========================================================================= */}
          {stage === 'payment_gateway' && (
            <div className="space-y-6">
              <div className="bg-[#0b1410] p-5 rounded-2xl border border-[#1b2e23] space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center justify-between">
                  <span>APPROVED AMOUNT DUE:</span>
                  <span className="font-bold text-base text-white">₹{totalAmount}</span>
                </div>

                {/* Simulated Payment Methods */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-gray-400 block">Select Simulated Demo Payment Method:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_demo')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === 'upi_demo'
                          ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                          : 'bg-[#0d1712] border-[#1b2e23] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="font-bold text-xs">UPI Demo</div>
                      <div className="text-[10px] text-gray-400 font-mono">GPay / PhonePe Mock</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card_demo')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === 'card_demo'
                          ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                          : 'bg-[#0d1712] border-[#1b2e23] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="font-bold text-xs">Card Demo</div>
                      <div className="text-[10px] text-gray-400 font-mono">RuPay / Visa Mock</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking_demo')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === 'netbanking_demo'
                          ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                          : 'bg-[#0d1712] border-[#1b2e23] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Building className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="font-bold text-xs">Net Banking Demo</div>
                      <div className="text-[10px] text-gray-400 font-mono">SBI / HDFC Mock</div>
                    </button>
                  </div>
                </div>

                {/* Gateway Simulation Controls */}
                <div className="pt-2 border-t border-[#18271e] space-y-2">
                  <span className="text-[11px] font-mono text-gray-400 block">
                    Choose Simulated Outcome (Fulfills Prototype Specification):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      onClick={() => handleExecuteSimulatedPayment('successful')}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Pay ₹' + totalAmount + ' (Success)'}
                    </button>

                    <button
                      onClick={() => handleExecuteSimulatedPayment('declined')}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-center transition-all disabled:opacity-50"
                    >
                      Simulate Decline
                    </button>

                    <button
                      onClick={() => handleExecuteSimulatedPayment('cancelled')}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-[#121c16] hover:bg-[#1a2920] border border-[#21382b] text-gray-300 text-center transition-all disabled:opacity-50"
                    >
                      Simulate Cancel
                    </button>

                    <button
                      onClick={() => handleExecuteSimulatedPayment('pending')}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-center transition-all disabled:opacity-50"
                    >
                      Simulate Pending
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 pt-2">
                <button
                  onClick={() => setStage('approval')}
                  className="hover:text-white"
                >
                  ← Back to Approval
                </button>
                <span>Zero financial liability in prototype</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAYMENT OUTCOME: DECLINED                                                 */}
          {/* ========================================================================= */}
          {stage === 'payment_declined' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Payment Declined</h4>
                <p className="text-xs text-rose-300 max-w-md mx-auto">
                  The simulated payment was declined. Your booking has not been confirmed.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => setStage('payment_gateway')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Retry Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#122017] text-gray-300 text-xs"
                >
                  Return to Itineraries
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAYMENT OUTCOME: CANCELLED                                                */}
          {/* ========================================================================= */}
          {stage === 'payment_cancelled' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 text-gray-400 flex items-center justify-center mx-auto">
                <X className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Payment Cancelled</h4>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  You cancelled the payment. No booking has been confirmed and temporary holds were released.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => setStage('payment_gateway')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Restart Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#122017] text-gray-300 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAYMENT OUTCOME: PENDING / INTERRUPTED                                     */}
          {/* ========================================================================= */}
          {stage === 'payment_pending' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-600 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Payment Status is Pending</h4>
                <p className="text-xs text-amber-300 max-w-md mx-auto">
                  Payment status is pending. We have not yet confirmed your booking. Please check status before retrying to prevent duplicate bookings.
                </p>
                {paymentTxnId && (
                  <span className="text-[11px] font-mono text-gray-400 block pt-1">
                    Idempotent Ref: {paymentTxnId}
                  </span>
                )}
              </div>
              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => handleExecuteSimulatedPayment('successful')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Verify & Resolve Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#122017] text-gray-300 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 6: BOOKING CONFIRMATION & BOARDING PASS                             */}
          {/* ========================================================================= */}
          {stage === 'confirmed' && confirmedBooking && (
            <div className="space-y-5">
              <div className="text-center space-y-1 pb-2 border-b border-[#1b2e23]">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base pt-2">
                  Your booking is confirmed in the Prayanam simulation!
                </h4>
                <p className="text-xs text-gray-400 font-mono">
                  Your itinerary and simulated boarding pass are ready.
                </p>
              </div>

              {/* Simulated Boarding Pass Card */}
              <div className="bg-[#0b1410] rounded-2xl border border-emerald-500/60 p-5 space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.15)] font-mono">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[#192b20]">
                  <div>
                    <span className="text-gray-500 text-[10px] block">BOARDING PASS ID</span>
                    <span className="font-bold text-emerald-400">{confirmedBooking.boardingPassId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[10px] block">PAYMENT TXN ID</span>
                    <span className="text-gray-300">{confirmedBooking.paymentTransactionId || paymentTxnId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 text-[10px] block">ORIGIN</span>
                    <span className="font-bold text-white">{itinerary.legs[0].origin.name}</span>
                    <div className="text-emerald-400 text-[11px]">{formatTimeOnly(itinerary.departureTime)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[10px] block">DESTINATION</span>
                    <span className="font-bold text-white">{itinerary.legs[itinerary.legs.length - 1].destination.name}</span>
                    <div className="text-emerald-400 text-[11px]">{formatTimeOnly(itinerary.finalArrivalTime)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#192b20] text-xs">
                  <div>
                    <span className="text-gray-500 text-[10px] block">PASSENGER</span>
                    <span className="text-gray-200">{name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">COUNT</span>
                    <span className="text-gray-200">{passengerCount} Seat(s)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[10px] block">AMOUNT PAID</span>
                    <span className="font-bold text-emerald-400">₹{confirmedBooking.totalFareInr}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[10px] text-emerald-300 text-center">
                  SIMULATED PROTOTYPE PASS — AUTHORITATIVE INVENTORY UPDATED ATOMICALLY
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-[#122017] hover:bg-[#1b2e22] text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                >
                  <span>Done & View Journey Status</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
