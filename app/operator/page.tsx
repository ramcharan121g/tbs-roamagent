'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { 
  ShieldCheck, 
  Bus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  AlertTriangle, 
  RefreshCw,
  IndianRupee,
  Layers
} from 'lucide-react';
import { TransportService, RecoveryCase } from '@/lib/domain/types';
import { formatTimeOnly } from '@/lib/domain/time';

export default function OperatorPage() {
  const [services, setServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Simulated queue of incoming rescue requests
  const [requests, setRequests] = useState([
    {
      id: 'req-rescue-01',
      passengerName: 'Ananya Sharma (Wheelchair assist)',
      paxCount: 1,
      targetServiceId: 'srv-tsrtc-viz-hyd-05',
      proposedFareInr: 950,
      destination: 'HITEC City, Hyderabad',
      arrivalDeadline: '08:45 AM',
      status: 'pending' as 'pending' | 'accepted' | 'held' | 'declined',
      holdExpiresSeconds: 300,
    },
    {
      id: 'req-rescue-02',
      passengerName: 'Rajesh Kumar & Family',
      paxCount: 2,
      targetServiceId: 'srv-orange-viz-hyd-06',
      proposedFareInr: 1960,
      destination: 'LB Nagar, Hyderabad',
      arrivalDeadline: '08:30 AM',
      status: 'pending' as 'pending' | 'accepted' | 'held' | 'declined',
      holdExpiresSeconds: 300,
    },
    {
      id: 'req-rescue-03',
      passengerName: 'Srinivas Varma',
      paxCount: 1,
      targetServiceId: 'srv-mstar-viz-hyd-07',
      proposedFareInr: 1020,
      destination: 'MGBS, Hyderabad',
      arrivalDeadline: '09:00 AM',
      status: 'pending' as 'pending' | 'accepted' | 'held' | 'declined',
      holdExpiresSeconds: 300,
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disruptions');
      const data = await res.json();
      if (data.services) {
        setServices(data.services.filter((s: TransportService) => s.mode === 'bus'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRequest = async (reqId: string, serviceId: string, paxCount: number) => {
    try {
      const res = await fetch('/api/holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          serviceId,
          passengerCount: paxCount,
          recoveryCaseId: reqId,
          ttlSeconds: 300,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'held' } : r))
        );
        setActionNotice(`Seat hold successfully created for ${reqId}. 5-minute timeout active.`);
        loadData();
      } else {
        setActionNotice(`Hold rejected: ${data.error || 'Insufficient capacity'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'declined' } : r))
    );
    setActionNotice(`Request ${reqId} declined. Returned to recovery engine.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c0a] text-gray-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b2e23] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              <span>Transport Operator Workbench</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Live fleet capacity management, temporary transactional seat holds, and cross-operator rescue dispatch.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#14221a] hover:bg-[#1a3024] text-xs text-gray-300 border border-[#1f382a] flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Fleet Manifest</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="bg-emerald-950/40 border border-emerald-700/60 p-3 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 1. Incoming Rescue Coordination Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Incoming Rescue Requests (Journey Rescue Network)</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Operator authorization required before passenger confirmation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#1b2e23] pb-2">
                  <span className="font-mono text-gray-400 text-[10px]">{req.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      req.status === 'held'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : req.status === 'declined'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {req.status === 'held' ? 'Seat Held (Awaiting Traveller)' : req.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-100">{req.passengerName}</div>
                  <div className="text-gray-400">Destination: {req.destination}</div>
                  <div className="text-gray-400">Deadline: {req.arrivalDeadline}</div>
                  <div className="text-emerald-400 font-mono font-semibold">
                    Proposed Fare: ₹{req.proposedFareInr} ({req.paxCount} seat)
                  </div>
                </div>

                {req.status === 'held' ? (
                  <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg text-amber-300 flex items-center justify-between font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hold TTL: 5:00 min</span>
                    </span>
                    <span className="text-gray-400">Locked in memory</span>
                  </div>
                ) : req.status === 'declined' ? (
                  <div className="text-rose-400 text-center py-2">Request Declined</div>
                ) : (
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req.id, req.targetServiceId, req.paxCount)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      Authorize & Hold Seat
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Fleet Services & Capacity Table */}
        <div className="glass-panel rounded-2xl border border-[#1b2e23] overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-[#1b2e23] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-emerald-400" />
              <span>Fleet Services & Live Capacity Manifest</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Total Fleet Services: {services.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b120e] text-gray-400 uppercase font-mono text-[10px] border-b border-[#182a20]">
                <tr>
                  <th className="p-3">Operator & Service</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Departure / Arrival</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Fare (INR)</th>
                  <th className="p-3">Confirmed / Capacity</th>
                  <th className="p-3">Active Holds</th>
                  <th className="p-3">Spare Seats</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15241b]">
                {services.map((s) => {
                  const spare = s.totalCapacity - s.confirmedSeats - s.heldSeats;
                  return (
                    <tr key={s.id} className="hover:bg-[#0c1611] transition-all">
                      <td className="p-3 font-semibold text-gray-200">
                        <div>{s.operatorName}</div>
                        <div className="text-[10px] font-mono text-gray-500">{s.routeCode}</div>
                      </td>
                      <td className="p-3 text-gray-300">Vizag ➔ Hyderabad</td>
                      <td className="p-3 font-mono text-gray-300">
                        {formatTimeOnly(s.departureTime)} ➔ {formatTimeOnly(s.arrivalTime)}
                      </td>
                      <td className="p-3 uppercase font-mono text-gray-300">{s.seatClass}</td>
                      <td className="p-3 font-mono text-emerald-400 font-semibold">₹{s.fareInr}</td>
                      <td className="p-3 font-mono text-gray-300">
                        {s.confirmedSeats} / {s.totalCapacity}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-semibold">
                        {s.heldSeats > 0 ? `${s.heldSeats} held` : '0'}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{spare}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            s.status === 'delayed'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : s.status === 'cancelled'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
