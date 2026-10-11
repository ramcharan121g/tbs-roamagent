'use client';

import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Calendar, 
  Users, 
  Bus, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { StationSearchInput } from './StationSearchInput';
import { Location } from '@/lib/domain/types';

export interface StationSearchParams {
  origin: string;
  originLocationId?: string;
  destination: string;
  destinationLocationId?: string;
  departureDate: string;
  passengers: number;
  preferredClass: 'sleeper' | 'seater' | 'semi-sleeper' | 'any';
}

interface RedbusStationBarProps {
  onSearch: (params: StationSearchParams) => void;
  loading?: boolean;
  defaultOrigin?: string;
  defaultOriginId?: string;
  defaultDestination?: string;
  defaultDestinationId?: string;
}

export function RedbusStationBar({
  onSearch,
  loading = false,
  defaultOrigin = 'Visakhapatnam',
  defaultOriginId = 'vizag-rtc',
  defaultDestination = 'HITEC City, Hyderabad',
  defaultDestinationId = 'hyd-hitec-city',
}: RedbusStationBarProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [originId, setOriginId] = useState<string | undefined>(defaultOriginId);
  const [destination, setDestination] = useState(defaultDestination);
  const [destinationId, setDestinationId] = useState<string | undefined>(defaultDestinationId);
  const [departureDate, setDepartureDate] = useState('2026-10-10');
  const [passengers, setPassengers] = useState(1);
  const [preferredClass, setPreferredClass] = useState<'sleeper' | 'seater' | 'semi-sleeper' | 'any'>('sleeper');
  const [swapRotate, setSwapRotate] = useState(false);

  const handleSwap = () => {
    setSwapRotate(!swapRotate);
    const tempName = origin;
    const tempId = originId;
    setOrigin(destination);
    setOriginId(destinationId);
    setDestination(tempName);
    setDestinationId(tempId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    onSearch({
      origin: origin.trim(),
      originLocationId: originId,
      destination: destination.trim(),
      destinationLocationId: destinationId,
      departureDate,
      passengers,
      preferredClass,
    });
  };

  const handleQuickRoute = (from: string, fromId: string, to: string, toId: string) => {
    setOrigin(from);
    setOriginId(fromId);
    setDestination(to);
    setDestinationId(toId);
    onSearch({
      origin: from,
      originLocationId: fromId,
      destination: to,
      destinationLocationId: toId,
      departureDate,
      passengers,
      preferredClass,
    });
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0b1510] to-[#070d0a] shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2e23] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60">
            <Bus className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>AP Intercity & Tourist Route Search</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-700 font-mono uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                Live Scraper
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Blank search inputs: type any Andhra Pradesh hamlet, town, or tourist destination to scrape and book instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Paid APIs • OpenStreetMap + APSRTC Network</span>
        </div>
      </div>

      {/* Main RedBus / AbhiBus Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Origin Station (Blank Input) */}
          <div className="lg:col-span-4 relative">
            <StationSearchInput
              label="From (Origin Station)"
              placeholder="Type origin town, station or landmark..."
              value={origin}
              locationId={originId}
              onChange={(name, id) => {
                setOrigin(name);
                setOriginId(id);
              }}
            />
          </div>

          {/* Swap Button */}
          <div className="hidden lg:flex lg:col-span-1 justify-center items-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin and Destination"
              className={`p-3 rounded-xl bg-[#122018] hover:bg-emerald-900 text-emerald-300 border border-[#1f382a] transition-transform duration-300 shadow-md ${
                swapRotate ? 'rotate-180' : ''
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Station (Blank Input) */}
          <div className="lg:col-span-4 relative">
            <StationSearchInput
              label="To (Destination Station)"
              placeholder="Type destination town or tourist spot..."
              value={destination}
              locationId={destinationId}
              onChange={(name, id) => {
                setDestination(name);
                setDestinationId(id);
              }}
            />
          </div>

          {/* Date & Search Actions */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1b2e23] focus:border-emerald-500 rounded-xl text-xs text-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>Seats</span>
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1b2e23] focus:border-emerald-500 rounded-xl text-xs text-gray-200 outline-none"
              >
                <option value={1}>1 Seat</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats</option>
                <option value={4}>4 Seats</option>
                <option value={6}>6 Seats</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom row: Seat class and Search Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Seat Class Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Bus Tier:</span>
            {(['any', 'sleeper', 'semi-sleeper', 'seater'] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setPreferredClass(cls)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all capitalize font-medium ${
                  preferredClass === cls
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[#101b15] text-gray-400 hover:text-white border-[#1b2e23]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Primary CTA Search Button */}
          <button
            type="submit"
            disabled={loading || !origin.trim() || !destination.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'SCRAPING & SEARCHING...' : 'SEARCH BUSES'}</span>
          </button>
        </div>
      </form>

      {/* Popular Tourist Corridors Quick Chips */}
      <div className="pt-2 border-t border-[#18261e] flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Popular Corridors:
        </span>
        <button
          type="button"
          onClick={() => handleQuickRoute('Lambasingi', 'stop-lambasingi', 'Rajahmundry', 'stop-rjy-cbs')}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[#111e17] hover:bg-emerald-950 text-cyan-300 border border-cyan-800/40 transition-all font-mono"
        >
          Lambasingi ➔ Rajahmundry (via Narsipatnam)
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Visakhapatnam', 'vizag-rtc', 'Araku Valley', 'stop-araku-bus')}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[#111e17] hover:bg-emerald-950 text-emerald-300 border border-[#1e3427] transition-all font-mono"
        >
          Vizag ➔ Araku Valley
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Tirupati', 'stop-tpt-cbs', 'Tirumala', 'stop-trm-cro')}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[#111e17] hover:bg-emerald-950 text-emerald-300 border border-[#1e3427] transition-all font-mono"
        >
          Tirupati ➔ Tirumala CRO
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Vijayawada', 'stop-vja-pnbs', 'Srisailam', 'stop-srisailam-cbs')}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[#111e17] hover:bg-emerald-950 text-emerald-300 border border-[#1e3427] transition-all font-mono"
        >
          Vijayawada ➔ Srisailam Temple
        </button>
      </div>
    </div>
  );
}
