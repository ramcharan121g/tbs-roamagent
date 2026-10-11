// Prayanam - Omnipresent AI Copilot & Prototype Controller
import { NextRequest, NextResponse } from 'next/server';
import { GroqConstraintParser } from '@/lib/ai/groq-parser';
import { DemoConstraintParser } from '@/lib/ai/demo-parser';
import { searchItineraries } from '@/lib/domain/route-search';
import { generateResiliencePassport } from '@/lib/domain/recovery';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { locationScraper } from '@/lib/services/location-scraper-service';
import { formatTimeOnly } from '@/lib/domain/time';
import { TripConstraints, Itinerary } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', currentPath = '/traveller' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();
    const isTelugu =
      language === 'te' ||
      /[\u0C00-\u0C7F]/.test(message) ||
      lower.includes('వైజాగ్') ||
      lower.includes('హైదరాబాద్') ||
      lower.includes('తెలుగు') ||
      lower.includes('ప్రయాణం') ||
      lower.includes('బుకింగ్');

    // Detect high-level command intent
    const isDisruption =
      lower.includes('delay') ||
      lower.includes('ఆలస్యం') ||
      lower.includes('90') ||
      lower.includes('cancel') ||
      lower.includes('రద్దు') ||
      lower.includes('missed') ||
      lower.includes('బోర్డింగ్') ||
      lower.includes('rescue') ||
      lower.includes('12') ||
      lower.includes('mass');

    const isBooking =
      lower.includes('book') ||
      lower.includes('బుకింగ్') ||
      lower.includes('confirm') ||
      lower.includes('proceed') ||
      lower.includes('select');

    const isBench =
      lower.includes('bench') ||
      lower.includes('test') ||
      lower.includes('టెస్ట్') ||
      lower.includes('verification');

    const isNavigation =
      lower.includes('operator') ||
      lower.includes('ఆపరేటర్') ||
      lower.includes('simulator') ||
      lower.includes('సిమ్యులేటర్') ||
      lower.includes('reset') ||
      lower.includes('రీసెట్');

    // 1. DISRUPTION ACTIONS
    if (isDisruption) {
      let disruptionType: 'DELAY_90' | 'CANCEL_BUS' | 'MISSED_BOARDING' | 'MASS_RESCUE_12' = 'DELAY_90';
      let replyText = '';

      if (lower.includes('cancel') || lower.includes('రద్దు')) {
        disruptionType = 'CANCEL_BUS';
        replyText = isTelugu
          ? 'బస్సు రద్దు చేయబడింది! జర్నీ రెస్క్యూ నెట్‌వర్క్ ప్రత్యామ్నాయ సర్వీసులను స్కాన్ చేస్తోంది.'
          : 'Service cancellation triggered! Journey Rescue Network is scanning compatible relief buses.';
      } else if (lower.includes('12') || lower.includes('mass') || lower.includes('rescue')) {
        disruptionType = 'MASS_RESCUE_12';
        replyText = isTelugu
          ? '12 మంది ప్రయాణికుల మాస్ రెస్క్యూ సిమ్యులేట్ చేస్తున్నాను. 11 మందికి సీట్లు కేటాయించబడతాయి, ఒకరు అపరిష్కృతంగా ఉంటారు.'
          : 'Simulating mass rescue for 12 impacted passengers across finite fleet capacity (11 available seats).';
      } else if (lower.includes('missed') || lower.includes('బోర్డింగ్')) {
        disruptionType = 'MISSED_BOARDING';
        replyText = isTelugu
          ? 'మిస్డ్ బోర్డింగ్ రికార్డ్ గుర్తించబడింది. స్మార్ట్ రీ-బోర్డింగ్ ఇంజిన్ తదుపరి బస్సును హోల్డ్ చేస్తోంది.'
          : 'Missed boarding detected post-departure. Smart Reboarding is coordinating a seat hold on the next departure.';
      } else {
        disruptionType = 'DELAY_90';
        replyText = isTelugu
          ? '90 నిమిషాల బస్సు ఆలస్యాన్ని సిమ్యులేట్ చేస్తున్నాను. కనెక్టింగ్ క్యాబ్ షిఫ్ట్ చేయబడుతుంది.'
          : 'Triggering 90-minute highway delay simulation on the active bus. Onward cab connection will be recalculated.';
      }

      return NextResponse.json({
        success: true,
        data: {
          replyText,
          language: isTelugu ? 'te' : 'en',
          action: {
            type: 'TRIGGER_DISRUPTION',
            disruptionType,
            targetPath: '/traveller',
          },
          suggestedPrompts: isTelugu
            ? ['ప్రత్యామ్నాయ బస్సు బుక్ చేయండి', 'ఆపరేటర్ కన్సోల్ చూడండి', 'రీసెట్ చేయండి']
            : ['Book Alternative Bus', 'Open Operator Console', 'Reset Demo'],
        },
      });
    }

    // 2. RUN BENCHMARK
    if (isBench) {
      return NextResponse.json({
        success: true,
        data: {
          replyText: isTelugu
            ? 'రికవరీ బెంచ్ ఆటోమేటెడ్ టెస్ట్ సూట్‌ను అమలు చేస్తున్నాను. 12/12 సినారియోలు ధృవీకరించబడతాయి.'
            : 'Opening RecoveryBench Suite and verifying 12/12 deterministic invariant test scenarios.',
          language: isTelugu ? 'te' : 'en',
          action: {
            type: 'RUN_BENCH',
            targetPath: '/admin/bench',
          },
          suggestedPrompts: isTelugu
            ? ['ప్రయాణం ప్లాన్ చేయండి', 'ఆపరేటర్ డ్యాష్‌బోర్డ్']
            : ['Plan a Journey', 'Open Operator Console'],
        },
      });
    }

    // 3. NAVIGATION & RESET
    if (isNavigation) {
      let targetPath = '/operator';
      let actionType = 'NAVIGATE';
      let replyText = isTelugu ? 'ఆపరేటర్ కన్సోల్‌కు తీసుకువెళ్తున్నాను.' : 'Navigating to Transport Operator Console.';

      if (lower.includes('simulator') || lower.includes('సిమ్యులేటర్')) {
        targetPath = '/admin/simulator';
        replyText = isTelugu ? 'డిస్రప్షన్ సిమ్యులేటర్‌కు తీసుకువెళ్తున్నాను.' : 'Opening Disruption Simulator.';
      } else if (lower.includes('reset') || lower.includes('రీసెట్')) {
        actionType = 'RESET_DEMO';
        targetPath = '/traveller';
        replyText = isTelugu
          ? 'డెమో పర్యావరణాన్ని మొదటి స్థితికి రీసెట్ చేస్తున్నాను.'
          : 'Resetting demo environment to initial deterministic seed state.';
      }

      return NextResponse.json({
        success: true,
        data: {
          replyText,
          language: isTelugu ? 'te' : 'en',
          action: {
            type: actionType,
            targetPath,
          },
          suggestedPrompts: isTelugu
            ? ['వైజాగ్ నుండి హైదరాబాద్ ప్లాన్ చేయండి', '90 నిమిషాల ఆలస్యం']
            : ['Plan Vizag to Hyderabad', 'Trigger 90-Min Delay'],
        },
      });
    }

    // 4. BOOKING INTENT
    if (isBooking) {
      const services = demoRepo.getServices();
      const currentTime = demoRepo.getSimulatedTime();
      const defaultParsed = await new DemoConstraintParser().parseRequest(
        'Vizag to Hyderabad reach by 9 AM sleeper',
        isTelugu ? 'te' : 'en',
        '2026-10-10'
      );
      const searchRes = searchItineraries(defaultParsed.constraints, services, currentTime);
      const chosen = searchRes.feasibleItineraries[0];

      return NextResponse.json({
        success: true,
        data: {
          replyText: isTelugu
            ? chosen
              ? `మీరు ఎంచుకున్న ప్రయాణానికి బుకింగ్ రివ్యూ మోడ్ ప్రారంభమైంది: ${chosen.legs[0]?.operatorName} (ఛార్జీ: ₹${chosen.totalFareInr}). దయచేసి వివరాలను పరిశీలించి ఆమోదించండి.`
              : 'బుకింగ్ రివ్యూ ప్రారంభించబడింది. దయచేసి ప్రయాణ వివరాలను నిర్ధారించండి.'
            : chosen
            ? `Opening booking review for ${chosen.legs[0]?.operatorName} (Total Fare: ₹${chosen.totalFareInr}, Arrival buffer: +${chosen.deadlineBufferMinutes}m). Please review passenger details and confirm your ticket.`
            : 'Opening Booking Review modal for your selected journey.',
          language: isTelugu ? 'te' : 'en',
          action: {
            type: 'BOOK_ITINERARY',
            targetPath: '/traveller',
            selectItineraryId: chosen?.id,
          },
          suggestedPrompts: isTelugu
            ? ['ధృవీకరించండి', 'బ్యాకప్ మార్గం చూడండి']
            : ['Confirm Booking', 'View Backup Plan'],
        },
      });
    }

    // 5. TRIP PLANNING (PRIMARY & BACKUP PLAN GENERATION)
    const parser = new GroqConstraintParser();
    const parseResult = await parser.parseRequest(message, isTelugu ? 'te' : 'en', '2026-10-10');
    const constraints: TripConstraints = parseResult.constraints;

    // Resolve any custom/scraped locations into demoRepo
    if (constraints.origin) {
      try { await locationScraper.resolveLocation(constraints.origin); } catch (_) {}
    }
    if (constraints.destination) {
      try { await locationScraper.resolveLocation(constraints.destination); } catch (_) {}
    }

    const services = demoRepo.getServices();
    const currentTime = demoRepo.getSimulatedTime();
    const searchRes = searchItineraries(constraints, services, currentTime);

    const feasible = searchRes.feasibleItineraries;
    const primary: Itinerary | undefined = feasible[0];
    const backup: Itinerary | undefined = feasible.length > 1 ? feasible[1] : undefined;

    // Format rich conversational voice & text response
    let replyText = '';
    if (primary) {
      const primaryLeg = primary.legs[0];
      const deptTime = formatTimeOnly(primary.departureTime);
      const arrTime = formatTimeOnly(primary.finalArrivalTime);
      const buffer = primary.deadlineBufferMinutes;

      if (isTelugu) {
        replyText = `${constraints.origin} నుండి ${constraints.destination} ప్రయాణానికి ఉదయం ${constraints.arrivalDeadline ? formatTimeOnly(constraints.arrivalDeadline) : '09:00'} గంటలలోపు ప్రణాళిక సిద్ధమైంది!

• ప్రధాన ప్లాన్: ${primaryLeg?.operatorName} (${primaryLeg?.seatClass}) - బయలుదేరే సమయం: ${deptTime}, గమ్యం చేరే సమయం: ${arrTime}, ఛార్జీ: ₹${primary.totalFareInr} (+${buffer} నిమిషాల సేఫ్టీ బఫర్).
${
  backup
    ? `• బ్యాకప్ ప్లాన్: ${backup.legs[0]?.operatorName} (${backup.legs[0]?.seatClass}) - చేరే సమయం: ${formatTimeOnly(backup.finalArrivalTime)}, ఛార్జీ: ₹${backup.totalFareInr} (+${backup.deadlineBufferMinutes} నిమిషాల బఫర్).`
    : '• బ్యాకప్ ప్లాన్: హైవే డిస్రప్షన్ రక్షణతో రెసిలెన్స్ పాస్‌పోర్ట్ బ్యాకప్ సిద్ధంగా ఉంది.'
}

ఈ ప్రయాణ వివరాలు మీ ప్రయాణికుల స్క్రీన్‌పై అప్‌డేట్ చేయబడ్డాయి. మీరు నేరుగా ఇక్కడే బుకింగ్ చేసుకోవచ్చు!`;
      } else {
        replyText = `I've planned your journey from ${constraints.origin} to ${constraints.destination} arriving before ${constraints.arrivalDeadline ? formatTimeOnly(constraints.arrivalDeadline) : '09:00 AM'}!

• Primary Plan: ${primaryLeg?.operatorName} (${primaryLeg?.seatClass}) departing at ${deptTime}, reaching at ${arrTime} for ₹${primary.totalFareInr} (+${buffer} mins deadline safety buffer).
${
  backup
    ? `• Backup Plan: ${backup.legs[0]?.operatorName} (${backup.legs[0]?.seatClass}) arriving at ${formatTimeOnly(backup.finalArrivalTime)} for ₹${backup.totalFareInr} (+${backup.deadlineBufferMinutes} mins safety buffer).`
    : '• Backup Plan: Alternative verified RTC service identified in Resilience Passport.'
}

Your Traveller Workbench has been populated. You can select and book directly from here!`;
      }
    } else {
      replyText = isTelugu
        ? `మీరు పేర్కొన్న కఠినమైన షరతుల ప్రకారం (${constraints.origin} ➔ ${constraints.destination}) ఏ సర్వీసులూ అందుబాటులో లేవు. దయచేసి బడ్జెట్ లేదా చేరవలసిన సమయాన్ని సడలించండి.`
        : `No feasible journeys found under these strict constraints (${constraints.origin} ➔ ${constraints.destination}). Try relaxing your deadline or budget limit.`;
    }

    // Build planData for rich in-chat card rendering
    const planData = primary
      ? {
          constraints,
          primary: {
            id: primary.id,
            operator: primary.legs[0]?.operatorName || 'APSRTC Express',
            fromStop: primary.legs[0]?.origin?.name || constraints.origin,
            toStop: primary.legs[primary.legs.length - 1]?.destination?.name || constraints.destination,
            departureTime: formatTimeOnly(primary.departureTime),
            arrivalTime: formatTimeOnly(primary.finalArrivalTime),
            fare: primary.totalFareInr,
            seatClass: primary.legs[0]?.seatClass || 'sleeper',
            bufferMins: primary.deadlineBufferMinutes,
            resilienceIndex: primary.heuristicResilience,
            legsCount: primary.legs.length,
          },
          backup: backup
            ? {
                id: backup.id,
                operator: backup.legs[0]?.operatorName || 'Orange Travels',
                fromStop: backup.legs[0]?.origin?.name || constraints.origin,
                toStop: backup.legs[backup.legs.length - 1]?.destination?.name || constraints.destination,
                departureTime: formatTimeOnly(backup.departureTime),
                arrivalTime: formatTimeOnly(backup.finalArrivalTime),
                fare: backup.totalFareInr,
                seatClass: backup.legs[0]?.seatClass || 'sleeper',
                bufferMins: backup.deadlineBufferMinutes,
                resilienceIndex: backup.heuristicResilience,
                legsCount: backup.legs.length,
              }
            : null,
          feasibleCount: feasible.length,
          infeasibleCount: searchRes.infeasibleItineraries.length,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        replyText,
        language: isTelugu ? 'te' : 'en',
        action: {
          type: 'PLAN_TRIP',
          targetPath: '/traveller',
          extractedConstraints: constraints,
          planData,
        },
        suggestedPrompts: isTelugu
          ? ['ప్రధాన ప్లాన్ బుక్ చేయండి', '90 నిమిషాల ఆలస్యం పరీక్షించండి', 'ఆపరేటర్ కన్సోల్']
          : ['Book Primary Plan', 'Trigger 90-Min Delay', 'Open Operator Console'],
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Agent command error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
