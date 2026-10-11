// Prayanam - Optional Groq Llama Parser with Safe Fallback to Deterministic Demo Parser
import { IConstraintParser, TripConstraintsSchema } from './parser-interface';
import { DemoConstraintParser } from './demo-parser';
import { TripConstraints } from '../domain/types';

export class GroqConstraintParser implements IConstraintParser {
  private demoFallback = new DemoConstraintParser();

  async parseRequest(
    text: string,
    languageHint: string = 'en',
    currentSimulatedDate = '2026-10-10'
  ): Promise<{
    constraints: TripConstraints;
    providerUsed: 'demo' | 'groq';
    clarifications: string[];
    rawParsed?: unknown;
  }> {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    if (!apiKey) {
      // Offline fallback: No spend, immediate reliable execution
      return this.demoFallback.parseRequest(text, languageHint, currentSimulatedDate);
    }

    try {
      const prompt = `You are Prayanam extraction engine for Indian intercity travel and tourist corridors across Andhra Pradesh, Telangana, and South India.
Extract structured travel constraints from this user query: "${text}".
Language hint: "${languageHint}".

Supported Location IDs:
- Visakhapatnam: "vizag-rtc" (RTC Complex), "vizag-maddilapalem", "vizag-gajuwaka"
- Hyderabad: "hyd-mgbs" (MGBS), "hyd-lb-nagar", "hyd-ameerpet", "hyd-hitec-city", "hyd-gachibowli", "hyd-secunderabad"
- Tirupati / Tirumala: "stop-tpt-cbs" (Tirupati CBS), "stop-trm-cro" (Tirumala CRO), "stop-skht-cbs" (Srikalahasti)
- Araku Valley: "stop-araku-bus", "stop-borra" (Borra Caves)
- Vijayawada / Amaravati: "stop-vja-pnbs" (Vijayawada PNBS), "stop-amr-temple" (Amaravati), "stop-gnt-cbs" (Guntur)
- Gandikota / Belum Caves: "stop-kadapa-cbs", "stop-jmdg-cbs", "stop-gandikota", "stop-belum-caves", "stop-kurnool-cbs"
- Rajahmundry / Maredumilli: "stop-rjy-cbs", "stop-maredumilli", "stop-polavaram", "stop-kakinada-cbs"
- Lepakshi: "stop-hindupur-cbs", "stop-lepakshi-temple", "stop-anantapur-cbs", "stop-blr-majestic" (Bengaluru)

Map the user's spoken or typed origin and destination to the closest supported location ID. If origin is omitted, infer the logical connecting terminal (e.g. Tirupati for Tirumala, Vizag for Araku, Vijayawada for Amaravati).
Budget rules: For Indian intercity corridors (Vizag to Hyderabad, overnight routes), standard bus fares range from ₹880 to ₹1400. If the user mentions "low budget", "cheap", "affordable", or does not state an exact rupee number, ALWAYS set "budgetInr": 1200. Do NOT set budget under 1000 unless the user explicitly wrote an exact small number.
Return ONLY a valid JSON object matching this schema:
{
  "origin": string,
  "destination": string,
  "originLocationId": string,
  "destinationLocationId": string,
  "departureDate": "${currentSimulatedDate}",
  "earliestDeparture": "${currentSimulatedDate}T19:00:00+05:30",
  "arrivalDeadline": "2026-10-11T09:00:00+05:30",
  "passengers": number,
  "budgetInr": number,
  "budgetScope": "per_person",
  "preferredClass": "sleeper" | "seater" | "semi-sleeper" | "any",
  "hasLuggage": boolean,
  "accessibilityNeeds": string[],
  "maxTransfers": 1,
  "language": "${languageHint || 'en'}"
}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(6000), // Strict 6-second timeout
      });

      if (!res.ok) {
        console.warn(`Groq API returned ${res.status}. Falling back to deterministic demo parser.`);
        return this.demoFallback.parseRequest(text, languageHint, currentSimulatedDate);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return this.demoFallback.parseRequest(text, languageHint, currentSimulatedDate);
      }

      const parsed = JSON.parse(content);

      // Protect against overly strict budget filter when user said "low budget" without a number
      const explicitNumMatch = text.match(/(?:₹|rs\.?|inr|రూ)?\s*(\d{3,5})/i);
      let parsedBudget = typeof parsed.budgetInr === 'number' ? parsed.budgetInr : 1200;
      if (!explicitNumMatch && parsedBudget < 1000) {
        parsedBudget = 1200;
      }

      // Ensure arrival deadline defaults to next morning for overnight intercity
      let deadline = parsed.arrivalDeadline;
      if (!deadline || !deadline.includes('T')) {
        deadline = '2026-10-11T09:00:00+05:30';
      }

      // Validate schema with Zod
      const validated = TripConstraintsSchema.parse({
        ...parsed,
        departureDate: currentSimulatedDate,
        arrivalDeadline: deadline,
        budgetInr: parsedBudget,
        hardConstraints: ['arrivalDeadline', 'budgetInr'],
        softPreferences: ['preferredClass'],
        clarificationNeeded: ['Validated via Groq Llama with deterministic schema bounds.'],
      });

      return {
        constraints: validated,
        providerUsed: 'groq',
        clarifications: validated.clarificationNeeded,
        rawParsed: parsed,
      };
    } catch (err) {
      console.warn('Groq parsing failed or timed out. Falling back to demo parser:', err);
      return this.demoFallback.parseRequest(text, languageHint, currentSimulatedDate);
    }
  }
}
