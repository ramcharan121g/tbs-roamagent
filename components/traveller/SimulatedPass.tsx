'use client';

import React from 'react';
import { QrCode, Bus, Car, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { Booking } from '@/lib/domain/types';
import { formatTimeOnly, formatDateTime } from '@/lib/domain/time';

interface SimulatedPassProps {
  booking: Booking;
  onSimulateDisruption?: () => void;
}

export function SimulatedPass({ booking, onSimulateDisruption }: SimulatedPassProps) {
  const busLeg = booking.itinerary.legs.find((l) => l.mode === 'bus');
  const lastMileLeg = booking.itinerary.legs.find((l) => l.mode === 'cab' || l.mode === 'auto');

  return (
    <div className="glass-panel-glow max-w-xl mx-auto rounded-3xl border border-emerald-500/50 p-6 space-y-6 shadow-[0_0_35px_rgba(16,185,129,0.15)] text-left">
      {/* Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-600/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono font-semibold uppercase tracking-wider">
            Simulated Pass · Not Valid for Real Travel
          </span>
        </div>
        <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded text-amber-200">
          MOCK DATA
        </span>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="bg-[#0b1410] rounded-2xl border border-[#1b2e23] p-5 space-y-5 relative overflow-hidden">
        {/* Subtle watermark */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
          <Bus className="w-56 h-56 text-emerald-400" />
        </div>

        {/* Pass Header */}
        <div className="flex items-center justify-between border-b border-[#182a20] pb-4">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              RoamAgent Digital Boarding Pass
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>{busLeg?.operatorName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {busLeg?.seatClass}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-bold block">
              {booking.boardingPassId}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">ID: {booking.id}</span>
          </div>
        </div>

        {/* Origin & Destination Nodes */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-mono">ORIGIN</span>
            <div className="text-xl font-bold text-white font-mono">VIZAG</div>
            <div className="text-xs text-gray-300">{busLeg?.origin.name}</div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              {formatTimeOnly(busLeg?.departureTime || '')}
            </div>
          </div>

          <div className="flex flex-col items-center px-4">
            <span className="text-[10px] text-gray-500 font-mono">INTERCITY LEG</span>
            <div className="w-20 h-0.5 bg-emerald-600/50 my-2 relative">
              <div className="absolute right-0 top-[-3px] w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Direct Expressway</span>
          </div>

          <div className="space-y-1 text-right">
            <span className="text-xs text-gray-400 font-mono">DESTINATION</span>
            <div className="text-xl font-bold text-white font-mono">HYD</div>
            <div className="text-xs text-gray-300">
              {booking.itinerary.legs[booking.itinerary.legs.length - 1].destination.name}
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              {formatTimeOnly(booking.itinerary.finalArrivalTime)}
            </div>
          </div>
        </div>

        {/* Passenger & Fare Details */}
        <div className="grid grid-cols-3 gap-3 border-t border-[#182a20] pt-4 text-xs font-mono">
          <div>
            <span className="text-gray-500 block text-[10px]">PASSENGER</span>
            <span className="font-semibold text-gray-200">{booking.passengerName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">TOTAL FARE</span>
            <span className="font-semibold text-emerald-400">₹{booking.totalFareInr}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">STATUS</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </span>
          </div>
        </div>

        {/* Last-Mile Connection Note if applicable */}
        {lastMileLeg && (
          <div className="bg-[#121f18] p-3 rounded-xl border border-emerald-900/50 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-300">
              <Car className="w-4 h-4" />
              <span>Coordinated Onward Ride: {lastMileLeg.operatorName}</span>
            </div>
            <span className="text-gray-400 font-mono">
              Pickup at MGBS: {formatTimeOnly(lastMileLeg.departureTime)}
            </span>
          </div>
        )}

        {/* QR Code motif */}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#1f382a]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <QrCode className="w-10 h-10 text-black" />
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              <div>Scan for Operator Manifest Verification</div>
              <div className="text-emerald-400">Security Hash: sha256-{booking.id.substring(3, 11)}</div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg bg-[#14221a] hover:bg-[#1a3024] text-gray-300 border border-[#203a2b] transition-all"
            title="Print Pass"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Quick Action */}
      {onSimulateDisruption && (
        <div className="flex justify-center">
          <button
            onClick={onSimulateDisruption}
            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Simulate 90-Minute Bus Delay on This Active Journey</span>
          </button>
        </div>
      )}
    </div>
  );
}
