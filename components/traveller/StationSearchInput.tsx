'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Check, Bus, Sparkles } from 'lucide-react';
import { Location } from '@/lib/domain/types';

interface StationSearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  locationId?: string;
  onChange: (name: string, locationId?: string, location?: Location) => void;
  accentColor?: 'emerald' | 'amber' | 'rose' | 'cyan';
  popularPlaces?: string[];
}

const DEFAULT_POPULAR = [
  'Visakhapatnam',
  'Hyderabad',
  'Vijayawada',
  'Tirupati',
  'Rajahmundry',
  'Lambasingi',
  'Araku Valley',
  'Srisailam',
  'Gandikota',
];

export function StationSearchInput({
  label,
  placeholder,
  value,
  locationId,
  onChange,
  accentColor = 'emerald',
  popularPlaces = DEFAULT_POPULAR,
}: StationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      // Show default popular places or all seed locations
      fetch('/api/locations/search')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.locations) {
            setSuggestions(data.locations.slice(0, 8));
          }
        })
        .catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/locations/search?query=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          } else if (data.success && data.result) {
            const hit = data.result.location as Location;
            const extra = data.result.nearestHub as Location | undefined;
            const combined = extra && extra.id !== hit.id ? [hit, extra] : [hit];
            setSuggestions(combined);
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (loc: Location) => {
    setQuery(loc.name);
    setIsOpen(false);
    onChange(loc.name, loc.id, loc);
  };

  const handleClear = () => {
    setQuery('');
    onChange('', undefined, undefined);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
        <span>{label}</span>
        {locationId && (
          <span className="text-[10px] font-mono text-emerald-400 lowercase">
            ID: {locationId.replace('stop-', '').replace('-cbs', '')}
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-gray-400 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-emerald-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange(e.target.value, undefined, undefined);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-3 bg-[#0a0f0d] border border-[#1b2e23] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-all shadow-inner font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#1b2e23] transition-all"
            title="Clear station"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Auto-Complete & Scraper Suggestions Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[#0c1410] border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 overflow-y-auto">
          {/* Header pill */}
          <div className="px-3.5 py-2 bg-[#101b15] border-b border-[#1b2e23] flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{query ? 'Scraper Live Matches' : 'Popular AP Transit Hubs'}</span>
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">₹0 Live Geocoder</span>
          </div>

          {/* Quick chips if query is empty */}
          {!query && (
            <div className="p-2.5 border-b border-[#18261e] bg-[#0a0f0d]/50">
              <div className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Quick Select:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularPlaces.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => {
                      setQuery(place);
                      setLoading(true);
                      fetch(`/api/locations/search?query=${encodeURIComponent(place)}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.success && data.result) {
                            handleSelect(data.result.location);
                          }
                        });
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#131f18] hover:bg-emerald-950 text-emerald-300 border border-[#1f3628] transition-all"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of matching locations */}
          <div className="divide-y divide-[#18261e]">
            {suggestions.map((loc) => {
              const isSelected = loc.id === locationId || loc.name === query;
              const isScraped = loc.source === 'osm_live' || loc.source === 'scraped_ap';

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-all hover:bg-[#14231b] ${
                    isSelected ? 'bg-emerald-950/40' : ''
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-gray-100 flex items-center gap-2">
                        <span>{loc.name}</span>
                        {isScraped ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                            Scraped Live
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                            APSRTC Timetable
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {loc.district ? `${loc.district} District • ` : ''}
                        {loc.city}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}

            {suggestions.length === 0 && !loading && (
              <div className="px-4 py-4 text-center text-xs text-gray-400">
                Type any city or town name. The web scraper will geocode it automatically.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
