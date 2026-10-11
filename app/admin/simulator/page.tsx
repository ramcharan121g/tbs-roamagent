'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  Users, 
  TimerReset, 
  RotateCcw, 
  ShieldAlert, 
  Bus, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';
import { MassRescueSummary } from '@/lib/domain/allocation';
import { formatDateTime } from '@/lib/domain/time';

export default function SimulatorPage() {
  const [clock, setClock] = useState('2026-10-10T18:00:00+05:30');
  const [liveIstClock, setLiveIstClock] = useState('');
  const [auditTrail, setAuditTrail] = useState<Array<{ id: string; timestamp: string; actor: string; action: string; reason: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Mass Rescue result state
  const [massRescueData, setMassRescueData] = useState<MassRescueSummary | null>(null);

  const loadState = async () => {
    try {
      const res = await fetch('/api/disruptions');
      const data = await res.json();
      if (data.simulatedTime) setClock(data.simulatedTime);
      if (data.auditTrail) setAuditTrail(data.auditTrail);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadState();

    const formatCurrentIST = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).toUpperCase();
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
      });
      return `${dateStr}, ${timeStr} IST`;
    };

    setLiveIstClock(formatCurrentIST());
    const interval = setInterval(() => {
      setLiveIstClock(formatCurrentIST());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerAction = async (action: string, payload: Record<string, unknown> = {}) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/disruptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (action === 'MASS_RESCUE_12' && data.massRescueSummary) {
        setMassRescueData(data.massRescueSummary);
        setStatusMessage(
          `Mass Rescue Executed: ${data.massRescueSummary.successfullyMatched} matched, ${data.massRescueSummary.unresolvedCount} unresolved due to finite capacity.`
        );
      } else if (action === 'ADVANCE_TIME') {
        setStatusMessage(`Simulated clock advanced to ${data.simulatedTime}`);
      } else if (action === 'DELAY_90') {
        setStatusMessage('90-minute delay applied to Orange Travels. Shifted arrival: 08:45 AM (15m buffer remains).');
      } else if (action === 'CANCEL_BUS') {
        setStatusMessage('Orange Travels bus cancelled. Rescue Network alerts broadcasted.');
      } else if (action === 'MISSED_BOARDING') {
        setStatusMessage('Missed boarding detected. Smart Reboarding case generated.');
      } else if (action === 'EXPIRE_HOLDS') {
        setStatusMessage(`Expired ${data.expiredHoldsCount || 0} active holds. Capacity restored.`);
      } else if (action === 'RESET') {
        setStatusMessage('Demo environment reset to initial deterministic state.');
        setMassRescueData(null);
      }

      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c0a] text-gray-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b2e23] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Zap className="w-7 h-7 text-emerald-400" />
              <span>Disruption & Scenario Simulator</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Deterministic control console for judges. Advance time, inject highway disruptions, and trigger mass rescue.
            </p>
          </div>

          {/* Clock Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Accurate IST Clock */}
            <div 
              className="bg-[#0e1713] border border-emerald-800/60 p-3 rounded-2xl flex items-center space-x-3 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
              title="Current real-world Indian Standard Time (IST / ISD · UTC+5:30)"
            >
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-emerald-400 block font-mono font-semibold">ACCURATE LIVE IST</span>
                <span className="text-sm font-bold text-white font-mono">{liveIstClock || 'Syncing IST...'}</span>
              </div>
            </div>

            {/* Simulated Scenario Clock */}
            <div className="bg-[#0e1713] border border-[#1b2e23] p-3 rounded-2xl flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-[10px] text-gray-400 block font-mono">SIMULATED SCENARIO CLOCK</span>
                <span className="text-sm font-bold text-gray-200 font-mono">
                  {formatDateTime(clock)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-emerald-950/60 border border-emerald-600/70 p-4 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 1. Time Advancement Controls */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Simulated Clock Controls</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerAction('ADVANCE_TIME', { advanceMinutes: 30 })}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#121f18] hover:bg-emerald-950 text-emerald-300 border border-[#1f382a] text-xs font-mono font-medium transition-all"
            >
              +30 Minutes
            </button>
            <button
              onClick={() => triggerAction('ADVANCE_TIME', { advanceMinutes: 60 })}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#121f18] hover:bg-emerald-950 text-emerald-300 border border-[#1f382a] text-xs font-mono font-medium transition-all"
            >
              +60 Minutes
            </button>
            <button
              onClick={() => triggerAction('ADVANCE_TIME', { advanceMinutes: 120 })}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#121f18] hover:bg-emerald-950 text-emerald-300 border border-[#1f382a] text-xs font-mono font-medium transition-all"
            >
              +2 Hours (Midnight Advance)
            </button>
          </div>
        </div>

        {/* 2. Disruption Trigger Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Deterministic Scenario Triggers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 90-Minute Delay */}
            <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
              <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>90-Minute Bus Delay</span>
              </div>
              <p className="text-xs text-gray-400">
                Simulates heavy highway congestion. Verifies that onward ride shifts to 08:00 AM,
                reaching HITEC City at 08:45 AM (15m buffer remains before 9 AM).
              </p>
              <button
                onClick={() => triggerAction('DELAY_90')}
                disabled={loading}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              >
                Trigger 90-Min Delay
              </button>
            </div>

            {/* Service Cancellation */}
            <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
              <div className="text-rose-400 font-semibold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Service Cancellation</span>
              </div>
              <p className="text-xs text-gray-400">
                Simulates mechanical breakdown on primary bus. Activates Journey Rescue Network
                to search compatible future departures.
              </p>
              <button
                onClick={() => triggerAction('CANCEL_BUS')}
                disabled={loading}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all shadow-[0_0_12px_rgba(244,63,94,0.25)]"
              >
                Cancel Current Bus
              </button>
            </div>

            {/* Missed Boarding */}
            <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
              <div className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                <Bus className="w-4 h-4" />
                <span>Missed Boarding / Reboarding</span>
              </div>
              <p className="text-xs text-gray-400">
                Simulates passenger missing terminal departure. Smart Reboarding checks next same-route
                bus and requests operator authorization.
              </p>
              <button
                onClick={() => triggerAction('MISSED_BOARDING')}
                disabled={loading}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                Simulate Missed Boarding
              </button>
            </div>
          </div>

          {/* Signature Feature: 12 Affected Travellers Mass Rescue */}
          <div className="glass-panel-glow p-6 rounded-2xl border border-emerald-500/50 bg-[#0c1712] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Signature Demo: Simulate 12 Affected Passengers</span>
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                  One cancellation impacts 12 synthetic travellers with diverse deadlines, budgets, and
                  accessibility needs. Evaluates scarce fleet capacity (11 available seats) to prove
                  zero double-booking and honest reporting of 1 unresolved passenger.
                </p>
              </div>

              <button
                onClick={() => triggerAction('MASS_RESCUE_12')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex-shrink-0"
              >
                <Users className="w-4 h-4" />
                <span>Simulate 12 Affected Passengers</span>
              </button>
            </div>

            {/* Mass Rescue Results Matrix */}
            {massRescueData && (
              <div className="space-y-4 pt-3 border-t border-[#1b2e23]">
                {/* Metric Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22]">
                    <span className="text-[10px] text-gray-400 block">TOTAL IMPACTED</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {massRescueData.totalImpacted}
                    </span>
                  </div>
                  <div className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22]">
                    <span className="text-[10px] text-gray-400 block">MATCHED TO SEATS</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {massRescueData.successfullyMatched}
                    </span>
                  </div>
                  <div className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22]">
                    <span className="text-[10px] text-gray-400 block">UNRESOLVED (CAPACITY EXHAUSTED)</span>
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {massRescueData.unresolvedCount}
                    </span>
                  </div>
                  <div className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22]">
                    <span className="text-[10px] text-gray-400 block">DOUBLE BOOKINGS</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">0 (Locked)</span>
                  </div>
                </div>

                {/* Allocation Table */}
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a0f0d] text-gray-400 font-mono text-[10px] uppercase border-b border-[#182a20]">
                      <tr>
                        <th className="p-2.5">Passenger</th>
                        <th className="p-2.5">Assigned Rescue Service</th>
                        <th className="p-2.5">Seat Class</th>
                        <th className="p-2.5">Fare Delta</th>
                        <th className="p-2.5">Revised Arrival</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#15241b]">
                      {massRescueData.allocations.map((a) => (
                        <tr key={a.passengerId} className="hover:bg-[#0c1611]">
                          <td className="p-2.5 font-medium text-gray-200">{a.passengerName}</td>
                          <td className="p-2.5 text-gray-300">
                            {a.matchedOperatorName || (
                              <span className="text-rose-400">No compatible seat available</span>
                            )}
                          </td>
                          <td className="p-2.5 uppercase font-mono text-gray-400">
                            {a.assignedSeatClass || '—'}
                          </td>
                          <td className="p-2.5 font-mono text-emerald-400">
                            {a.fareDeltaInr !== null
                              ? a.fareDeltaInr > 0
                                ? `+₹${a.fareDeltaInr}`
                                : '₹0'
                              : '—'}
                          </td>
                          <td className="p-2.5 font-mono text-gray-300">
                            {a.revisedArrival ? a.revisedArrival.substring(11, 16) : '—'}
                          </td>
                          <td className="p-2.5">
                            {a.status === 'unresolved' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                                Unresolved
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Matched & Held
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Maintenance & Invariant Testing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <TimerReset className="w-4 h-4 text-amber-400" />
              <span>Expire Active Holds Now</span>
            </h4>
            <p className="text-xs text-gray-400">
              Immediately triggers timeout on all temporary seat holds to verify capacity release back
              to free inventory.
            </p>
            <button
              onClick={() => triggerAction('EXPIRE_HOLDS')}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#14221a] hover:bg-[#1a3024] text-xs font-medium text-amber-300 border border-[#233d2e] transition-all"
            >
              Expire Holds (Test Capacity Invariant)
            </button>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo State</span>
            </h4>
            <p className="text-xs text-gray-400">
              Restores all timetables, bookings, holds, and audit entries to the initial seed state.
            </p>
            <button
              onClick={() => triggerAction('RESET')}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-medium text-rose-300 border border-rose-800 transition-all"
            >
              Reset to Deterministic Seed
            </button>
          </div>
        </div>

        {/* 4. Audit Trail Log */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Audit Trail Log</span>
          </h3>

          <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] text-gray-300">
            {auditTrail.map((log) => (
              <div key={log.id} className="bg-[#0b120e] p-2 rounded border border-[#182a20] flex items-start gap-2">
                <span className="text-gray-500">{log.timestamp.substring(11, 19)}</span>
                <span className="text-emerald-400 uppercase font-semibold">[{log.actor}]</span>
                <span className="text-gray-300">{log.action}: {log.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
