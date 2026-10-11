// Prayanam - Full-Prototype Agentic Voice & Chatbot Controller
// Powered by Groq: openai/gpt-oss-20b with smart deterministic action execution
import { NextRequest, NextResponse } from 'next/server';
import { DemoConstraintParser } from '@/lib/ai/demo-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', currentPath = '/traveller' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    const isTelugu =
      language === 'te' ||
      /[\u0C00-\u0C7F]/.test(message) ||
      message.toLowerCase().includes('వైజాగ్') ||
      message.toLowerCase().includes('హైదరాబాద్') ||
      message.toLowerCase().includes('తెలుగు');

    // System prompt instructing openai/gpt-oss-20b to act as the master travel concierge & prototype controller
    const systemPrompt = `You are Prayanam Omnipresent AI Travel Concierge and Prototype Controller.
You control EVERY INCH of the prototype: trip intake, constraint validation, multi-leg planning, Resilience Passport, booking confirmation, disruption simulation (90-min delay, bus cancellation, missed boarding, 12-passenger mass rescue), operator fleet dispatch, and RecoveryBench.

Current Page: ${currentPath}
Language: ${isTelugu ? 'Telugu' : 'English'}

Analyze the user's message: "${message}".
Classify the user intent and return ONLY a valid JSON object with:
{
  "replyText": string (in ${isTelugu ? 'Telugu' : 'English'}, conversational, concise, natural for voice TTS),
  "language": "${isTelugu ? 'te' : 'en'}",
  "action": {
    "type": "PLAN_TRIP" | "UPDATE_CONSTRAINT" | "TRIGGER_DISRUPTION" | "NAVIGATE" | "BOOK_ITINERARY" | "RUN_BENCH" | "RESET_DEMO" | "NONE",
    "disruptionType": "DELAY_90" | "CANCEL_BUS" | "MISSED_BOARDING" | "MASS_RESCUE_12" | "EXPIRE_HOLDS" | null,
    "targetPath": "/traveller" | "/operator" | "/admin/simulator" | "/admin/bench" | null,
    "extractedConstraints": object or null
  },
  "suggestedPrompts": string[] (2-3 quick follow-up prompt chips)
}

Rules:
1. If the user mentions traveling between Vizag and Hyderabad, set action.type = "PLAN_TRIP".
2. If the user asks for disruptions (e.g. "delay 90 min", "delay bus", "cancel bus", "missed boarding", "12 passengers", "mass rescue"), set action.type = "TRIGGER_DISRUPTION" and set appropriate disruptionType.
3. If the user asks to navigate (e.g. "show operator", "go to simulator", "open benchmark"), set action.type = "NAVIGATE" and targetPath.
4. If the user says "reset demo" or "clear data", set action.type = "RESET_DEMO".
5. If the user asks to book or confirm, set action.type = "BOOK_ITINERARY".
6. If the user asks about benchmark or tests, set action.type = "RUN_BENCH".
7. replyText must be helpful, direct, and ready for audio voice playback.`;

    let responsePayload = null;

    if (apiKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            responsePayload = JSON.parse(content);
          }
        }
      } catch (err) {
        console.warn('Groq agent call failed, using deterministic controller fallback:', err);
      }
    }

    // Deterministic fallback if Groq call is absent or fails
    if (!responsePayload) {
      const lower = message.toLowerCase();
      let actionType = 'NONE';
      let disruptionType = null;
      let targetPath = null;
      let replyText = isTelugu
        ? 'నమస్కారం! నేను TBS ప్రయాణం. ప్రయాణ ప్రణాళిక, ఆటంకాల పరిష్కారం లేదా ఆపరేటర్ వివరాల కోసం నన్ను అడగండి.'
        : 'Hello! I am Prayanam. I can plan your journeys, inject highway disruptions, coordinate operator rescue, or run benchmarks.';

      if (lower.includes('delay') || lower.includes('ఆలస్యం') || lower.includes('90')) {
        actionType = 'TRIGGER_DISRUPTION';
        disruptionType = 'DELAY_90';
        replyText = isTelugu
          ? '90 నిమిషాల బస్సు ఆలస్యాన్ని సిమ్యులేట్ చేస్తున్నాను. కనెక్టింగ్ క్యాబ్ షిఫ్ట్ చేయబడుతుంది.'
          : 'Triggering 90-minute highway delay simulation on the active bus. Onward cab connection will be recalculated.';
      } else if (lower.includes('cancel') || lower.includes('రద్దు')) {
        actionType = 'TRIGGER_DISRUPTION';
        disruptionType = 'CANCEL_BUS';
        replyText = isTelugu
          ? 'బస్సు రద్దు చేయబడింది! జర్నీ రెస్క్యూ నెట్‌వర్క్ ప్రత్యామ్నాయ సర్వీసులను వెతుకుతోంది.'
          : 'Service cancellation triggered! Journey Rescue Network is scanning compatible relief buses.';
      } else if (lower.includes('12') || lower.includes('mass') || lower.includes('rescue')) {
        actionType = 'TRIGGER_DISRUPTION';
        disruptionType = 'MASS_RESCUE_12';
        replyText = isTelugu
          ? '12 మంది ప్రయాణికుల మాస్ రెస్క్యూ సిమ్యులేట్ చేస్తున్నాను. 11 మందికి సీట్లు కేటాయించబడతాయి, ఒకరు అపరిష్కృతంగా ఉంటారు.'
          : 'Simulating mass rescue for 12 impacted passengers across finite fleet capacity (11 available seats).';
      } else if (lower.includes('missed') || lower.includes('బోర్డింగ్')) {
        actionType = 'TRIGGER_DISRUPTION';
        disruptionType = 'MISSED_BOARDING';
        replyText = isTelugu
          ? 'మిస్డ్ బోర్డింగ్ రికార్డ్ గుర్తించబడింది. స్మార్ట్ రీ-బోర్డింగ్ ఇంజిన్ తదుపరి బస్సును హోల్డ్ చేస్తోంది.'
          : 'Missed boarding detected post-departure. Smart Reboarding is coordinating a seat hold on the next departure.';
      } else if (lower.includes('bench') || lower.includes('test') || lower.includes('టెస్ట్')) {
        actionType = 'RUN_BENCH';
        targetPath = '/admin/bench';
        replyText = isTelugu
          ? 'రికవరీ బెంచ్ ఆటోమేటెడ్ టెస్ట్ సూట్‌ను అమలు చేస్తున్నాను.'
          : 'Opening RecoveryBench and executing deterministic test suite.';
      } else if (lower.includes('operator') || lower.includes('ఆపరేటర్') || lower.includes('fleet')) {
        actionType = 'NAVIGATE';
        targetPath = '/operator';
        replyText = isTelugu
          ? 'ట్రాన్స్‌పోర్ట్ ఆపరేటర్ వర్క్‌బెంచ్‌కు తీసుకువెళ్తున్నాను.'
          : 'Switching to Transport Operator Console.';
      } else if (lower.includes('simulator') || lower.includes('సిమ్యులేటర్')) {
        actionType = 'NAVIGATE';
        targetPath = '/admin/simulator';
        replyText = isTelugu
          ? 'డిస్రప్షన్ సిమ్యులేటర్‌కు తీసుకువెళ్తున్నాను.'
          : 'Opening Disruption Simulator.';
      } else if (lower.includes('vizag') || lower.includes('hyderabad') || lower.includes('వైజాగ్')) {
        actionType = 'PLAN_TRIP';
        targetPath = '/traveller';
        replyText = isTelugu
          ? 'వైజాగ్ నుండి హైదరాబాద్ ప్రయాణ వివరాలను విశ్లేషించి ఉత్తమ మార్గాలను చూపిస్తున్నాను.'
          : 'Analyzing travel goal from Vizag to Hyderabad and calculating feasible multi-leg itineraries.';
      } else if (lower.includes('reset') || lower.includes('రీసెట్')) {
        actionType = 'RESET_DEMO';
        replyText = isTelugu
          ? 'డెమో పర్యావరణాన్ని మొదటి స్థితికి రీసెట్ చేస్తున్నాను.'
          : 'Resetting demo environment to initial deterministic seed state.';
      }

      responsePayload = {
        replyText,
        language: isTelugu ? 'te' : 'en',
        action: {
          type: actionType,
          disruptionType,
          targetPath,
        },
        suggestedPrompts: isTelugu
          ? ['90 నిమిషాల ఆలస్యం చేయండి', '12 మంది రెస్క్యూ సిమ్యులేట్ చేయండి', 'ఆపరేటర్ కన్సోల్ చూడండి']
          : ['Simulate 90-Min Delay', 'Run 12 Passenger Rescue', 'Open Operator Console'],
      };
    }

    return NextResponse.json({
      success: true,
      data: responsePayload,
      modelUsed: apiKey ? model : 'demo-deterministic',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Agent command error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
