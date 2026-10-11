'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, IndianRupee, AlertTriangle, ArrowRight } from 'lucide-react';
import { Itinerary } from '@/lib/domain/types';
import { formatTimeOnly } from '@/lib/domain/time';
import { enTranslations } from '@/lib/i18n/en';
import { teTranslations } from '@/lib/i18n/te';

interface BookingConsentModalProps {
  itinerary: Itinerary | null;
  onClose: () => void;
  onBookingConfirmed: (booking: unknown) => void;
  lang: string;
}

export function BookingConsentModal({
  itinerary,
  onClose,
  onBookingConfirmed,
  lang,
}: BookingConsentModalProps) {
  const t = lang === 'te' ? teTranslations : enTranslations;
  const [loading, setLoading] = useState(false);
  const [passengerName, setPassengerName] = useState('Rajesh Kumar');
  const [error, setError] = useState<string | null>(null);

  if (!itinerary) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const idempotencyKey = `idempotent-${itinerary.id}-${Date.now()}`;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          passengerCount: 1,
          passengerName,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || data.error || 'Booking validation failed');
        return;
      }

      onBookingConfirmed(data.booking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="glass-panel-glow max-w-lg w-full p-6 rounded-2xl border border-emerald-500/40 text-left space-y-5">
        <div className="flex items-center justify-between border-b border-[#1b2e23] pb-3">
          <div className="flex items-center space-x-3 text-emerald-400">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">{t.bookingReviewTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Journey Summary */}
        <div className="bg-[#0b120e] p-4 rounded-xl border border-[#1a2d22] space-y-3 text-xs">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-100">
            <span>{itinerary.legs[0].origin.name}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            <span>{itinerary.legs[itinerary.legs.length - 1].destination.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-gray-300 font-mono text-[11px] pt-1 border-t border-[#182a20]">
            <div>Departure: {formatTimeOnly(itinerary.departureTime)}</div>
            <div>Arrival: {formatTimeOnly(itinerary.finalArrivalTime)}</div>
            <div>Deadline Buffer: +{itinerary.deadlineBufferMinutes} mins</div>
            <div>Total Legs: {itinerary.legs.length}</div>
          </div>
        </div>

        {/* Passenger Input */}
        <div className="space-y-1.5 text-xs">
          <label className="text-gray-300 font-medium">Passenger Name</label>
          <input
            type="text"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-3 py-2 text-gray-100 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Total Price & Simulation Boundary */}
        <div className="bg-[#121c16] p-3.5 rounded-xl border border-emerald-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">{t.fareTotal}</span>
            <div className="text-2xl font-bold text-emerald-400 flex items-center font-mono">
              <IndianRupee className="w-5 h-5" />
              <span>{itinerary.totalFareInr}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Simulated Sandbox
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Zero real money charged</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Explicit Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#1b2e23] transition-all"
          >
            {t.declineBookingBtn}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !passengerName.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Validating Seats...' : t.confirmBookingBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
