'use client';

import React from 'react';
import { SlidersHorizontal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { TripConstraints } from '@/lib/domain/types';
import { enTranslations } from '@/lib/i18n/en';
import { teTranslations } from '@/lib/i18n/te';

interface ConstraintsEditorProps {
  constraints: TripConstraints;
  onChange: (updated: TripConstraints) => void;
  onReplan: () => void;
  lang: string;
  loading?: boolean;
}

export function ConstraintsEditor({
  constraints,
  onChange,
  onReplan,
  lang,
  loading = false,
}: ConstraintsEditorProps) {
  const t = lang === 'te' ? teTranslations : enTranslations;

  const updateField = <K extends keyof TripConstraints>(field: K, value: TripConstraints[K]) => {
    onChange({
      ...constraints,
      [field]: value,
    });
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-[#1b2e23] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1b2e23] pb-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            {t.constraintsTitle}
          </h3>
        </div>
        <button
          onClick={onReplan}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t.replanButton}</span>
        </button>
      </div>

      {/* Grid of editable constraints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Origin */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.originLabel}</label>
          <input
            type="text"
            value={constraints.origin}
            onChange={(e) => updateField('origin', e.target.value)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.destinationLabel}</label>
          <input
            type="text"
            value={constraints.destination}
            onChange={(e) => updateField('destination', e.target.value)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Departure Date */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.dateLabel}</label>
          <input
            type="date"
            value={constraints.departureDate}
            onChange={(e) => updateField('departureDate', e.target.value)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Arrival Deadline */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.deadlineLabel}</label>
          <input
            type="text"
            value={constraints.arrivalDeadline.substring(11, 16)}
            onChange={(e) => {
              const val = e.target.value;
              updateField('arrivalDeadline', `2026-10-11T${val}:00+05:30`);
            }}
            placeholder="09:00"
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Budget */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.budgetLabel}</label>
          <input
            type="number"
            value={constraints.budgetInr}
            onChange={(e) => updateField('budgetInr', parseInt(e.target.value, 10) || 1000)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Seat Class Preference */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.classLabel}</label>
          <select
            value={constraints.preferredClass}
            onChange={(e) => updateField('preferredClass', e.target.value as 'sleeper' | 'seater' | 'semi-sleeper' | 'any')}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500"
          >
            <option value="sleeper">Sleeper (AC/Non-AC)</option>
            <option value="seater">Seater</option>
            <option value="semi-sleeper">Semi-Sleeper</option>
            <option value="any">Any Class</option>
          </select>
        </div>

        {/* Passengers */}
        <div className="space-y-1">
          <label className="text-gray-400 font-medium">{t.passengersLabel}</label>
          <input
            type="number"
            min={1}
            max={6}
            value={constraints.passengers}
            onChange={(e) => updateField('passengers', parseInt(e.target.value, 10) || 1)}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] rounded-lg px-2.5 py-1.5 text-gray-200 outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Luggage & Accessibility Toggle */}
        <div className="space-y-1 flex flex-col justify-end">
          <div className="flex items-center space-x-3 pt-2">
            <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={constraints.hasLuggage}
                onChange={(e) => updateField('hasLuggage', e.target.checked)}
                className="rounded border-[#1b2e23] text-emerald-500 focus:ring-emerald-500"
              />
              <span>{t.luggageLabel}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Clarification notes */}
      {constraints.clarificationNeeded && constraints.clarificationNeeded.length > 0 && (
        <div className="bg-[#121c16] border border-[#1b2e23] p-2.5 rounded-lg flex items-start space-x-2 text-xs text-gray-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-400">Validated Boundary: </span>
            <span>{constraints.clarificationNeeded.join(' · ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
