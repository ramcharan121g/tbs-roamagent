'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TripIntake } from '@/components/traveller/TripIntake';
import { ConstraintsEditor } from '@/components/traveller/ConstraintsEditor';
import { ItineraryCard } from '@/components/traveller/ItineraryCard';
import { ResiliencePassportModal } from '@/components/traveller/ResiliencePassportModal';
import { DecisionEvidenceModal } from '@/components/traveller/DecisionEvidenceModal';
import { HumanBookingFlowModal } from '@/components/traveller/HumanBookingFlowModal';
import { SimulatedPass } from '@/components/traveller/SimulatedPass';
import { ManualBookingModal } from '@/components/traveller/ManualBookingModal';
import { RedbusStationBar, StationSearchParams } from '@/components/traveller/RedbusStationBar';
import { AgentReactionFeed, AgentReactionState } from '@/components/traveller/AgentReactionFeed';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { WhisperVoiceModal } from '@/components/voice/WhisperVoiceModal';
import { VoiceAssistantWidget } from '@/components/voice/VoiceAssistantWidget';
import { 
  TripConstraints, 
  Itinerary, 
  ResiliencePassport, 
  DecisionEvidence, 
  Booking,
  DisruptionEvent 
} from '@/lib/domain/types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  RefreshCw, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  IndianRupee,
  Bus,
  Sparkles
} from 'lucide-react';
import { formatTimeOnly } from '@/lib/domain/time';

const INITIAL_AGENT_REACTION: AgentReactionState = {
  reactionId: 'Reaction 1',
  title: 'Welcome to Prayanam',
  message:
    'Welcome to Prayanam.\nTell me where you want to travel, when you need to arrive, and what matters most to you.\nI\'ll compare feasible journeys, explain the trade-offs, and help you recover if your plans change.\nYou remain in control of every booking and journey change.',
  whatHappensNext:
    'Type your destination in the AI concierge prompt below, or click "Manual Direct Booking" to reserve verified schedules directly from the Andhra Pradesh transport network.',
  currentStep: 'Respond',
  statusType: 'info',
};

export default function TravellerPage() {
  const [lang, setLang] = useState<string>('en');
  const [constraints, setConstraints] = useState<TripConstraints | null>(null);
  const [feasibleRoutes, setFeasibleRoutes] = useState<
    { itinerary: Itinerary; resiliencePassport: ResiliencePassport; decisionEvidence: DecisionEvidence }[]
  >([]);
  const [infeasibleRoutes, setInfeasibleRoutes] = useState<
    { itinerary: Itinerary; reasons: string[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [agentReaction, setAgentReaction] = useState<AgentReactionState>(INITIAL_AGENT_REACTION);

  // Modals state
  const [activePassport, setActivePassport] = useState<ResiliencePassport | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<DecisionEvidence | null>(null);
  const [candidateBookingItinerary, setCandidateBookingItinerary] = useState<Itinerary | null>(null);
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  // Confirmed booking & disruption state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [activeDisruption, setActiveDisruption] = useState<DisruptionEvent | null>(null);
  const [recoveryOptions, setRecoveryOptions] = useState<Itinerary[]>([]);
  const [recoveryApproved, setRecoveryApproved] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  // Auto-load default initial search or resume from Copilot plan
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prayanam_copilot_trip');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.constraints) {
          setConstraints(parsed.constraints);
          searchRoutes(parsed.constraints);
          return;
        }
      }
    } catch (_) {}

    fetch('/api/parse-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Vizag to Hyderabad, reach by 9 AM, prefer sleeper, budget ₹1200, with luggage',
        language: 'en',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.constraints) {
          setConstraints(data.constraints);
          searchRoutes(data.constraints);
        }
      })
      .catch(console.error);
  }, []);

  // Listen for copilot trip commands and auto-booking requests
  useEffect(() => {
    const handleCopilotTrip = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (data?.constraints) {
        setConstraints(data.constraints);
        searchRoutes(data.constraints);
      }
    };

    const handleCopilotBook = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { itineraryId } = customEvent.detail || {};
      if (itineraryId) {
        const target = feasibleRoutes.find((f) => f.itinerary.id === itineraryId)?.itinerary;
        if (target) {
          setCandidateBookingItinerary(target);
          setShowManualBooking(true);
        } else {
          setTimeout(() => {
            const retryTarget = feasibleRoutes.find((f) => f.itinerary.id === itineraryId)?.itinerary;
            if (retryTarget) {
              setCandidateBookingItinerary(retryTarget);
              setShowManualBooking(true);
            }
          }, 600);
        }
      }
    };

    window.addEventListener('prayanam_copilot_trip', handleCopilotTrip);
    window.addEventListener('prayanam_copilot_book', handleCopilotBook);

    return () => {
      window.removeEventListener('prayanam_copilot_trip', handleCopilotTrip);
      window.removeEventListener('prayanam_copilot_book', handleCopilotBook);
    };
  }, [feasibleRoutes]);

  const searchRoutes = async (currentConstraints: TripConstraints) => {
    setLoading(true);
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ constraints: currentConstraints }),
      });
      const data = await res.json();
      if (data.success) {
        const feasible = data.feasibleRoutes || [];
        setFeasibleRoutes(feasible);
        setInfeasibleRoutes(data.infeasibleRoutes || []);

        if (feasible.length > 0) {
          const routes = feasible.map((f: { itinerary: Itinerary }) => f.itinerary);
          const cheapest = [...routes].sort((a: Itinerary, b: Itinerary) => a.totalFareInr - b.totalFareInr)[0];
          const fastest = [...routes].sort((a: Itinerary, b: Itinerary) => a.totalDurationMinutes - b.totalDurationMinutes)[0];
          const fareDiff = Math.abs(fastest.totalFareInr - cheapest.totalFareInr);
          const timeDiff = Math.abs(cheapest.totalDurationMinutes - fastest.totalDurationMinutes);

          setAgentReaction({
            reactionId: 'Reaction 8 & 9',
            title: `${feasible.length} Feasible Journeys Verified`,
            message: `I found ${feasible.length} journeys that satisfy all your hard constraints in our simulated dataset.\n• Lowest-Cost Option: ₹${cheapest.totalFareInr} (arrives ${formatTimeOnly(cheapest.finalArrivalTime)})\n• Fastest Option: ₹${fastest.totalFareInr} (arrives ${formatTimeOnly(fastest.finalArrivalTime)})\n${fareDiff > 0 ? `The faster option costs ₹${fareDiff} more but gives you an additional ${timeDiff} minutes before your deadline.` : 'Both options provide verified resilience buffers.'}`,
            whatHappensNext: 'Review the journey cards below. Inspect the Resilience Passport to check disruption backup services, or click "Book Journey" to review and confirm.',
            currentStep: 'Respond',
            statusType: 'success',
          });
        } else {
          setAgentReaction({
            reactionId: 'Reaction 10',
            title: 'No Feasible Journeys Under Current Constraints',
            message:
              'I couldn\'t find a journey that satisfies all your current requirements in the available dataset.\nThe available routes were rejected due to arrival deadline breaches, budget constraints, or transfer buffer limits.',
            whatHappensNext:
              'Review the rejected alternatives in the Infeasible Options panel below. You can adjust your budget or arrival deadline using the Interactive Constraints Editor.',
            currentStep: 'Respond',
            statusType: 'warning',
          });
        }
      }
    } catch (err) {
      console.error(err);
      setAgentReaction({
        reactionId: 'Reaction 41',
        title: 'Planning Calculation Alert',
        message:
          'I couldn\'t complete the journey calculation because of a temporary connection error. Your requirements have been preserved. Please retry or adjust constraints.',
        whatHappensNext: 'Click "Re-Calculate Feasible Routes" or select "Manual Direct Booking" to proceed.',
        currentStep: 'Respond',
        statusType: 'alert',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParsed = (parsedResponse: { constraints: TripConstraints }) => {
    if (parsedResponse.constraints) {
      setConstraints(parsedResponse.constraints);
      setAgentReaction({
        reactionId: 'Reaction 2',
        title: 'Requirements Understood & Validated',
        message: `I've understood your travel requirements.\n• Origin: ${parsedResponse.constraints.origin}\n• Destination: ${parsedResponse.constraints.destination}\n• Travel Date: ${parsedResponse.constraints.departureDate}\n• Arrival Deadline: ${formatTimeOnly(parsedResponse.constraints.arrivalDeadline)}\n• Preferred Class: ${parsedResponse.constraints.preferredClass.toUpperCase()}\n• Budget: ₹${parsedResponse.constraints.budgetInr}\n• Luggage: ${parsedResponse.constraints.hasLuggage ? 'Yes' : 'No'}\nPlease review these details before I search for suitable journeys.`,
        whatHappensNext:
          'The deterministic itinerary engine is validating candidate transport timetables against your arrival deadline and budget constraints.',
        currentStep: 'Validate',
        statusType: 'info',
      });
      searchRoutes(parsedResponse.constraints);
    }
  };

  const handleReplan = () => {
    if (constraints) {
      setAgentReaction({
        reactionId: 'Reaction 5',
        title: 'Constraints Updated — Recomputing Routes',
        message: `Your travel constraints have been updated (Budget: ₹${constraints.budgetInr}, Deadline: ${formatTimeOnly(constraints.arrivalDeadline)}).\nRecalculating available simulated journeys with updated limits.`,
        whatHappensNext: 'Running deterministic validation across all scheduled services on the corridor.',
        currentStep: 'Act',
        statusType: 'info',
      });
      searchRoutes(constraints);
    }
  };

  const handleRedbusSearch = async (params: StationSearchParams) => {
    setLoading(true);
    try {
      // 1. Ensure both stations are resolved through location scraper
      const oRes = await fetch(`/api/locations/search?query=${encodeURIComponent(params.origin)}`).then((r) => r.json());
      const dRes = await fetch(`/api/locations/search?query=${encodeURIComponent(params.destination)}`).then((r) => r.json());

      const originLocationId = params.originLocationId || (oRes.success && oRes.result?.location?.id) || 'vizag-rtc';
      const destinationLocationId = params.destinationLocationId || (dRes.success && dRes.result?.location?.id) || 'hyd-hitec-city';

      // For intercity journeys, overnight bus arrivals reach the following morning:
      const depDate = new Date(params.departureDate);
      const nextDay = new Date(depDate.getTime() + 24 * 60 * 60 * 1000);
      const nextDayStr = !isNaN(nextDay.getTime()) ? nextDay.toISOString().split('T')[0] : '2026-10-11';
      const arrivalDeadline = `${nextDayStr}T14:00:00+05:30`;

      const newConstraints: TripConstraints = {
        origin: params.origin,
        destination: params.destination,
        originLocationId,
        destinationLocationId,
        departureDate: params.departureDate,
        earliestDeparture: `${params.departureDate}T04:00:00+05:30`,
        arrivalDeadline,
        passengers: params.passengers,
        budgetInr: 1500 * params.passengers,
        budgetScope: 'per_person',
        preferredClass: params.preferredClass,
        hasLuggage: true,
        accessibilityNeeds: [],
        maxTransfers: 1,
        language: lang,
        hardConstraints: ['arrivalDeadline', 'budgetInr'],
        softPreferences: params.preferredClass !== 'any' ? ['preferredClass'] : [],
        clarificationNeeded: [`Station pair search: ${params.origin} ➔ ${params.destination}`],
        dataSource:
          originLocationId.startsWith('scraped-') ||
          originLocationId.startsWith('stop-lambasingi') ||
          destinationLocationId.startsWith('scraped-')
            ? 'scraped_live'
            : 'verified_timetable',
      };

      setConstraints(newConstraints);
      setAgentReaction({
        reactionId: 'Reaction 8',
        title: `Searching Routes: ${params.origin} ➔ ${params.destination}`,
        message: `Web scraper and routing engine evaluated journeys between ${params.origin} and ${params.destination}.\n• Class: ${params.preferredClass.toUpperCase()}\n• Date: ${params.departureDate}\n• Seats: ${params.passengers}`,
        whatHappensNext: 'Review available scheduled services below and click "Book This Journey" to review and confirm.',
        currentStep: 'Act',
        statusType: 'success',
      });

      await searchRoutes(newConstraints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRouteForBooking = (itin: Itinerary) => {
    setCandidateBookingItinerary(itin);
    setAgentReaction({
      reactionId: 'Reaction 14',
      title: 'Itinerary Selected — Reviewing Consent',
      message:
        'You\'ve selected this journey. Before confirming, review the complete route, total fare, travel conditions, and simulated seat availability.\nNo booking has been confirmed yet.',
      whatHappensNext:
        'Review the itinerary details in the Booking Consent dialog and click "Confirm Simulated Booking" to proceed.',
      currentStep: 'Validate',
      statusType: 'info',
    });
  };

  const handleBookingConfirmed = (booking: unknown) => {
    const b = booking as Booking;
    setActiveBooking(b);
    setCandidateBookingItinerary(null);
    if (isRecoveryFlow) {
      setRecoveryApproved(true);
      setActiveDisruption(null);
      setIsRecoveryFlow(false);
      setAgentReaction({
        reactionId: 'Reaction 28',
        title: 'Replacement Journey Approved & Confirmed',
        message: `Your replacement journey with ${b.itinerary.legs[0].operatorName} has been approved and confirmed in the simulation.\nI've updated your itinerary and generated the revised simulated boarding pass with verified operator capacity.`,
        whatHappensNext:
          'Your revised boarding pass is ready below. Real-time corridor monitoring continues for all journey segments.',
        currentStep: 'Respond',
        statusType: 'success',
      });
      return;
    }
    setAgentReaction({
      reactionId: 'Reaction 15',
      title: 'Simulated Booking Confirmed & Monitored',
      message: `Your simulated booking has been confirmed.\nPassenger: ${b.passengerName} (Pass ID: ${b.boardingPassId || b.id})\nService: ${b.itinerary.legs[0].operatorName} (Fare: ₹${b.totalFareInr})\nThis is a demonstration booking with transactional capacity protection.`,
      whatHappensNext:
        'Prayanam has placed your journey under active disruption monitoring. If delays occur on the corridor, the Journey Rescue Network will automatically notify you with verified alternatives.',
      currentStep: 'Respond',
      statusType: 'success',
    });
  };

  // Simulate delay or cancellation on the active booking
  const handleTriggerDisruption = async (actionType: 'DELAY_90' | 'CANCEL_BUS' = 'DELAY_90') => {
    try {
      const res = await fetch('/api/disruptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveDisruption(data.event);
        if (data.recoveryCases && data.recoveryCases.length > 0) {
          setRecoveryOptions(data.recoveryCases[0].proposedItineraries || []);
        }

        if (actionType === 'DELAY_90') {
          setAgentReaction({
            reactionId: 'Reaction 18',
            title: 'Simulated 90-Minute Delay Detected',
            message:
              'Your bus has a simulated delay of 90 minutes.\nI\'ve recalculated your expected arrival and checked whether your onward connections remain feasible.\nYour original plan is still valid only if its updated timeline passes those checks. Review the recovery options below.',
            whatHappensNext:
              'Inspect the revised arrival timeline and alternative services below. Click "Approve Recovery" or "Decline".',
            currentStep: 'Act',
            statusType: 'warning',
          });
        } else {
          setAgentReaction({
            reactionId: 'Reaction 19',
            title: 'Bus Cancellation Detected & Rescue Network Activated',
            message:
              'Your bus has been cancelled in the simulation.\nI\'m checking replacement services that can still be reached from your current journey state. I\'ll compare arrival times, additional costs, and available capacity before presenting alternatives.',
            whatHappensNext:
              'Review the operator-coordinated replacement capacity below. Explicit traveller consent is required to confirm the replacement.',
            currentStep: 'Act',
            statusType: 'alert',
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fulfill Section 5: Recovery replacement enters shared Human Approval & Payment workflow
  const handleApproveRecovery = (replacementItin: Itinerary) => {
    setIsRecoveryFlow(true);
    setCandidateBookingItinerary(replacementItin);
  };

  const handleDeclineRecovery = () => {
    setActiveDisruption(null);
    setAgentReaction({
      reactionId: 'Reaction 29',
      title: 'Replacement Journey Declined',
      message:
        'You\'ve declined this replacement. Your proposed journey has not been confirmed.\nI\'ll search for another suitable alternative or explain why no feasible replacement remains in the current inventory.',
      whatHappensNext:
        'Your original disrupted booking record is preserved. You can search other routes or reset the simulation.',
      currentStep: 'Respond',
      statusType: 'info',
    });
  };

  const handleSamplePrompt = (prompt: string) => {
    fetch('/api/parse-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: prompt, language: lang }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.constraints) {
          handleParsed(data);
        }
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c0a] text-gray-100">
      <Navbar 
        currentLang={lang} 
        onLangChange={setLang} 
        onOpenVoiceAssistant={() => setShowVoiceAssistant(true)} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b2e23] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-emerald-400" />
              <span>Traveller Concierge Workbench</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Natural-language goal planning with deterministic constraints, transparent resilience, and explicit approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowManualBooking(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Bus className="w-4 h-4" />
              <span>Manual Direct Booking</span>
            </button>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300">
              Corridor: AP Tourist Network & Intercity
            </span>
          </div>
        </div>

        {/* Prayanam Active Reaction & Explanation Feed */}
        <AgentReactionFeed
          reaction={agentReaction}
          onOpenManualBooking={() => setShowManualBooking(true)}
          onSelectSamplePrompt={handleSamplePrompt}
          onTriggerDisruption={activeBooking ? handleTriggerDisruption : undefined}
          lang={lang}
        />

        {/* 1. AbhiBus / RedBus Style Blank Station Search Bar */}
        <RedbusStationBar 
          onSearch={handleRedbusSearch} 
          loading={loading}
          defaultOrigin={constraints?.origin || 'Visakhapatnam'}
          defaultOriginId={constraints?.originLocationId || 'vizag-rtc'}
          defaultDestination={constraints?.destination || 'HITEC City, Hyderabad'}
          defaultDestinationId={constraints?.destinationLocationId || 'hyd-hitec-city'}
        />

        {/* 2. Conversational Intake */}
        <TripIntake onParsed={handleParsed} lang={lang} />

        {/* 2. Interactive Constraints Editor */}
        {constraints && (
          <ConstraintsEditor
            constraints={constraints}
            onChange={setConstraints}
            onReplan={handleReplan}
            lang={lang}
            loading={loading}
          />
        )}

        {/* Disruption Alert & Coordinated Recovery Banner */}
        {activeDisruption && (
          <div className="glass-panel-glow border-amber-500/60 p-6 rounded-2xl bg-amber-950/20 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 text-amber-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Disruption Detected: {activeDisruption.description}
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Agent recalculated alternatives from current simulated state and location.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-900/60 text-amber-200 border border-amber-700">
                +90m Highway Delay
              </span>
            </div>

            {/* Recovery Alternative Offer */}
            {recoveryOptions.length > 0 ? (
              <div className="bg-[#0b1410] p-4 rounded-xl border border-emerald-800/60 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182a20] pb-2">
                  <div className="font-semibold text-gray-200">
                    Recommended Recovery Route: {recoveryOptions[0].legs[0].operatorName}
                  </div>
                  <div className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Total Fare: ₹{recoveryOptions[0].totalFareInr}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-300 font-mono">
                  <div>Departure: {formatTimeOnly(recoveryOptions[0].departureTime)}</div>
                  <div>Final Arrival: {formatTimeOnly(recoveryOptions[0].finalArrivalTime)}</div>
                  <div className="text-emerald-400">
                    Remaining Deadline Buffer: +{recoveryOptions[0].deadlineBufferMinutes} mins
                  </div>
                  <div>Operator Hold: 5m Active</div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setActiveDisruption(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                  >
                    Decline / Stay with Delay
                  </button>
                  <button
                    onClick={() => handleApproveRecovery(recoveryOptions[0])}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Replacement Journey</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-300">
                Shifted arrival with onward cab is calculated at 08:45 AM. 15-minute buffer remains
                before the 09:00 AM deadline. No alternate bus rebooking required.
              </div>
            )}
          </div>
        )}

        {/* 3. Confirmed Boarding Pass Section */}
        {activeBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Your Active Simulated Journey</span>
              </h2>
              {recoveryApproved && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600">
                  Replacement Confirmed & Re-issued
                </span>
              )}
            </div>

            <SimulatedPass
              booking={activeBooking}
              onSimulateDisruption={!activeDisruption ? () => handleTriggerDisruption('DELAY_90') : undefined}
            />
          </div>
        )}

        {/* 4. Ranked Feasible Itineraries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Verified Candidate Itineraries</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {feasibleRoutes.length} Feasible
              </span>
            </h2>
            <span className="text-xs text-gray-400">
              Ranked by Fare, Total Duration, and Disruption Resilience
            </span>
          </div>

          {feasibleRoutes.length === 0 && !loading && (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
              <Info className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-semibold text-white">No Feasible Routes Meeting Hard Constraints</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                All candidates were rejected because they breached arrival deadlines, exceeded maximum
                budget, or lacked required accessibility. Try increasing budget or adjusting deadline.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feasibleRoutes.map((item, idx) => (
              <ItineraryCard
                key={item.itinerary.id || idx}
                itinerary={item.itinerary}
                resiliencePassport={item.resiliencePassport}
                decisionEvidence={item.decisionEvidence}
                onOpenPassport={setActivePassport}
                onOpenEvidence={setActiveEvidence}
                onSelectBooking={handleSelectRouteForBooking}
                lang={lang}
              />
            ))}
          </div>
        </div>

        {/* 5. Infeasible Routes Section with Factual Rejection Reasons */}
        {infeasibleRoutes.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[#1b2e23]">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span>Options Requiring Changed Constraints ({infeasibleRoutes.length})</span>
              <span className="text-[10px] text-gray-500 font-normal">
                (Excluded from feasible recommendations)
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {infeasibleRoutes.slice(0, 4).map((inf, i) => (
                <div
                  key={i}
                  className="bg-[#0b120e] p-3 rounded-xl border border-[#1f2b23] space-y-1.5 opacity-75"
                >
                  <div className="flex justify-between font-semibold text-gray-300">
                    <span>{inf.itinerary.legs[0].operatorName}</span>
                    <span className="font-mono text-gray-400">₹{inf.itinerary.totalFareInr}</span>
                  </div>
                  <div className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/40">
                    {inf.reasons.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ResiliencePassportModal
        passport={activePassport}
        onClose={() => setActivePassport(null)}
      />

      <DecisionEvidenceModal
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
      />

      {/* Central 6-Stage Human Approval & Simulated Payment Gateway Modal */}
      <HumanBookingFlowModal
        isOpen={!!candidateBookingItinerary}
        itinerary={candidateBookingItinerary}
        onClose={() => {
          setCandidateBookingItinerary(null);
          setIsRecoveryFlow(false);
        }}
        onBookingConfirmed={handleBookingConfirmed}
        initialPassengerCount={constraints?.passengers || 1}
        isRecovery={isRecoveryFlow}
        recoveryFareDifference={0}
      />

      {/* Manual Booking Modal - Funnels through HumanBookingFlowModal */}
      <ManualBookingModal
        isOpen={showManualBooking}
        onClose={() => setShowManualBooking(false)}
        onBookingConfirmed={handleBookingConfirmed}
        onSelectItinerary={(itin) => {
          setCandidateBookingItinerary(itin);
        }}
        lang={lang}
      />

      {/* Floating Two-Way Voice Assistant Widget */}
      <VoiceAssistantWidget
        onClick={() => setShowVoiceAssistant(true)}
        currentLangCode={lang}
      />

      {/* Multilingual Whisper Speech-Recognition & Travel Intent Pipeline */}
      <WhisperVoiceModal
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        currentLangCode={lang}
        onParsedTrip={(c) => {
          setConstraints(c);
          searchRoutes(c);
        }}
        onTriggerManualBooking={() => {
          setShowVoiceAssistant(false);
          setShowManualBooking(true);
        }}
      />
    </div>
  );
}
