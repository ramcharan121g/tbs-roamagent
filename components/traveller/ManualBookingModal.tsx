'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bus, 
  Calendar, 
  User, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TransportService, Itinerary, Location, Booking } from '@/lib/domain/types';
import { SEED_LOCATIONS, getLocationById } from '@/lib/seed/locations';
import { formatTimeOnly, diffMinutes } from '@/lib/domain/time';
import { StationSearchInput } from './StationSearchInput';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
  onSelectItinerary?: (itinerary: Itinerary, passengers: number, leadName: string) => void;
  lang: string;
}

export function ManualBookingModal({
  isOpen,
  onClose,
  onBookingConfirmed,
  onSelectItinerary,
  lang,
}: ManualBookingModalProps) {
  const [originName, setOriginName] = useState('Visakhapatnam (Dwaraka RTC Complex)');
  const [originId, setOriginId] = useState('vizag-rtc');
  const [destinationName, setDestinationName] = useState('Hyderabad (MGBS Terminal)');
  const [destinationId, setDestinationId] = useState('hyd-mgbs');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [passengerName, setPassengerName] = useState('Ramesh Chowdary');
  const [passengerCount, setPassengerCount] = useState(1);
  const [hasLuggage, setHasLuggage] = useState(true);
  const [availableServices, setAvailableServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOriginChange = async (name: string, id?: string) => {
    setOriginName(name);
    if (id) {
      setOriginId(id);
    } else if (name.trim().length > 2) {
      try {
        const res = await fetch(`/api/locations/search?query=${encodeURIComponent(name.trim())}`);
        const data = await res.json();
        if (data.success && data.result) {
          setOriginId(data.result.location.id);
          if (data.result.synthesizedServices) {
            setAvailableServices((prev) => [...prev, ...data.result.synthesizedServices]);
          }
        }
      } catch (_) {}
    }
  };

  const handleDestinationChange = async (name: string, id?: string) => {
    setDestinationName(name);
    if (id) {
      setDestinationId(id);
    } else if (name.trim().length > 2) {
      try {
        const res = await fetch(`/api/locations/search?query=${encodeURIComponent(name.trim())}`);
        const data = await res.json();
        if (data.success && data.result) {
          setDestinationId(data.result.location.id);
          if (data.result.synthesizedServices) {
            setAvailableServices((prev) => [...prev, ...data.result.synthesizedServices]);
          }
        }
      } catch (_) {}
    }
  };

  // Fetch services when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/disruptions')
      .then((res) => res.json())
      .then((data) => {
        if (data.services) {
          setAvailableServices(data.services.filter((s: TransportService) => s.mode === 'bus'));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter services matching selected origin and destination
  const matchedServices = availableServices.filter((s) => {
    // Match origin
    const matchOrigin = s.originId === originId || 
      (originId === 'vizag-rtc' && s.originId.startsWith('vizag'));
    // Match destination
    const matchDest = s.destinationId === destinationId ||
      (destinationId === 'hyd-mgbs' && s.destinationId.startsWith('hyd'));
    return matchOrigin && matchDest && s.status !== 'cancelled';
  });

  // Selected service object
  const activeService = availableServices.find((s) => s.id === selectedServiceId) || matchedServices[0];

  const handleConfirmManualBooking = async () => {
    if (!activeService) {
      setError('Please select an active scheduled service.');
      return;
    }

    if (!passengerName.trim()) {
      setError('Passenger name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const originLoc = getLocationById(activeService.originId) || SEED_LOCATIONS[0];
      const destLoc = getLocationById(activeService.destinationId) || SEED_LOCATIONS[3];

      const durationMins = diffMinutes(activeService.departureTime, activeService.arrivalTime);
      const totalFare = activeService.fareInr * passengerCount;

      // Construct verified Itinerary
      const manualItinerary: Itinerary = {
        id: `itin-manual-${activeService.id}-${Date.now()}`,
        legs: [
          {
            id: `leg-${activeService.id}`,
            serviceId: activeService.id,
            mode: 'bus',
            operatorName: activeService.operatorName,
            origin: originLoc,
            destination: destLoc,
            departureTime: activeService.departureTime,
            arrivalTime: activeService.arrivalTime,
            durationMinutes: durationMins,
            fareInr: activeService.fareInr,
            seatClass: activeService.seatClass,
            delayMinutes: activeService.delayMinutes || 0,
            status: activeService.status,
          },
        ],
        totalFareInr: totalFare,
        departureTime: activeService.departureTime,
        finalArrivalTime: activeService.arrivalTime,
        totalDurationMinutes: durationMins,
        transferTimeMinutes: 0,
        lastMileDurationMinutes: 0,
        lastMileFareInr: 0,
        transferCount: 0,
        deadlineBufferMinutes: 60,
        isFeasible: true,
        constraintViolations: [],
        preferenceMatches: ['Manual schedule selection'],
        heuristicResilience: 'Moderate',
        resilienceReason: 'Direct verified service selection with guaranteed seat hold lock.',
        backupCount: 1,
        rankingScore: 90,
        badge: 'Direct Manual Reservation',
        simulated: true,
      };

      // Fulfill Section 4: Manual booking enters shared Human Approval & Payment workflow
      if (onSelectItinerary) {
        onClose();
        onSelectItinerary(manualItinerary, passengerCount, passengerName);
        return;
      }

      const idempotencyKey = `manual-book-${activeService.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary: manualItinerary,
          passengerCount,
          passengerName,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || data.error || 'Capacity changed or validation failed');
        return;
      }

      onBookingConfirmed(data.booking);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error during manual booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-panel-glow max-w-2xl w-full p-6 sm:p-8 rounded-2xl text-left space-y-6 max-h-[92vh] overflow-y-auto border border-emerald-600/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b2e23] pb-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Manual Direct Bus Booking</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Direct Timetable
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Select your route, schedule, and passengers directly without conversational AI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#121c16] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Origin & Destination Blank Scraper Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StationSearchInput
            label="1. ORIGIN STATION (BLANK SEARCH)"
            placeholder="Type or search origin station..."
            value={originName}
            locationId={originId}
            onChange={handleOriginChange}
          />
          <StationSearchInput
            label="2. DESTINATION (BLANK SEARCH)"
            placeholder="Type or search destination station..."
            value={destinationName}
            locationId={destinationId}
            onChange={handleDestinationChange}
          />
        </div>

        {/* 2. Available Services List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300 font-mono">
              3. SELECT SCHEDULED SERVICE ({matchedServices.length} AVAILABLE)
            </label>
            <span className="text-[11px] text-emerald-400 font-mono">Real-Time Seat Validation</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400 font-mono">Loading active timetable...</div>
          ) : matchedServices.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0e1713] border border-[#1b2e23] text-center space-y-2">
              <p className="text-xs text-amber-300">
                No direct non-stop service matches this exact pair right now.
              </p>
              <p className="text-[11px] text-gray-400">
                Tip: Try Visakhapatnam ➔ Hyderabad, Jammalamadugu ➔ Gandikota, Visakhapatnam ➔ Araku Valley, or Tirupati ➔ Tirumala.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {matchedServices.map((srv) => {
                const isSelected = activeService?.id === srv.id;
                const availableSeats = srv.totalCapacity - srv.confirmedSeats - srv.heldSeats;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#0b130f] border-[#1b2e23] hover:border-emerald-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">{srv.operatorName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                          {srv.seatClass.toUpperCase()}
                        </span>
                        {srv.busType && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16271e] text-gray-300">
                            {srv.busType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                        <span>Dep: {formatTimeOnly(srv.departureTime)}</span>
                        <span>➔</span>
                        <span>Arr: {formatTimeOnly(srv.arrivalTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 sm:text-right">
                      <div>
                        <div className="text-xs text-gray-400 font-mono">
                          Seats: <span className="font-bold text-emerald-300">{availableSeats}</span> / {srv.totalCapacity}
                        </div>
                        <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-0.5 justify-end">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{srv.fareInr}</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-gray-600'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Passenger Details & Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#1b2e23] pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 font-mono">PRIMARY PASSENGER NAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Enter full name"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0e1713] border border-[#1b2e23] text-sm text-gray-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 font-mono">PASSENGER COUNT</label>
            <div className="relative">
              <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <select
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value, 10))}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0e1713] border border-[#1b2e23] text-sm text-gray-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value={1}>1 Passenger (Solo)</option>
                <option value={2}>2 Passengers</option>
                <option value={3}>3 Passengers</option>
                <option value={4}>4 Passengers (Family)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Total Calculation Summary */}
        {activeService && (
          <div className="p-4 rounded-xl bg-[#09110d] border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block">CALCULATED TOTAL FARE</span>
              <span className="text-sm font-bold text-white">
                ₹{activeService.fareInr} × {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">TOTAL PAYABLE</span>
              <span className="text-lg font-black text-emerald-400 flex items-center gap-1 sm:justify-end">
                <IndianRupee className="w-5 h-5" />
                <span>{activeService.fareInr * passengerCount}</span>
              </span>
            </div>
          </div>
        )}

        {/* 5. Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#121c16] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmManualBooking}
            disabled={submitting || !activeService}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center space-x-2"
          >
            {submitting ? (
              <span>Preparing Itinerary...</span>
            ) : (
              <>
                <span>Proceed to Review & Approval</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
