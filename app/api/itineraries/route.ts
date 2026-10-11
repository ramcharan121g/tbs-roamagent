// Prayanam - API: Multi-Leg Itinerary Planning & Ranking
import { NextRequest, NextResponse } from 'next/server';
import { searchItineraries } from '@/lib/domain/route-search';
import { generateResiliencePassport, buildDecisionEvidence } from '@/lib/domain/recovery';
import { demoRepo } from '@/lib/repositories/demo-repository';
import { locationScraper } from '@/lib/services/location-scraper-service';
import { TripConstraints } from '@/lib/domain/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const constraints: TripConstraints = body.constraints;

    if (!constraints) {
      return NextResponse.json({ error: 'Constraints object is required' }, { status: 400 });
    }

    // Ensure dynamically scraped/custom locations have services loaded in demoRepo
    if (constraints.origin) {
      try { await locationScraper.resolveLocation(constraints.origin); } catch (_) {}
    }
    if (constraints.destination) {
      try { await locationScraper.resolveLocation(constraints.destination); } catch (_) {}
    }

    const services = demoRepo.getServices();
    const currentTime = demoRepo.getSimulatedTime();
    const searchRes = searchItineraries(constraints, services, currentTime);

    // Attach Resilience Passport and Decision Evidence to feasible routes
    const enrichedFeasible = searchRes.feasibleItineraries.map((it) => ({
      itinerary: it,
      resiliencePassport: generateResiliencePassport(it, constraints, services),
      decisionEvidence: buildDecisionEvidence(it, constraints, services),
    }));

    return NextResponse.json({
      success: true,
      feasibleCount: searchRes.feasibleItineraries.length,
      infeasibleCount: searchRes.infeasibleItineraries.length,
      feasibleRoutes: enrichedFeasible,
      infeasibleRoutes: searchRes.infeasibleItineraries,
      searchTimestamp: searchRes.searchTimestamp,
      simulatedTime: currentTime,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Itinerary search failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
