// TBS RoamAgent - API: Instant Location Intelligence & Scraper Search (<10ms Fast Index)
import { NextRequest, NextResponse } from 'next/server';
import { locationScraper } from '@/lib/services/location-scraper-service';
import { searchFastAPStations } from '@/lib/seed/ap-comprehensive-stations';
import { DemoRepository } from '@/lib/repositories/demo-repository';

export async function GET(req: NextRequest) {
  const start = performance.now();
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const date = searchParams.get('date') || '2026-10-10';

    if (!query || query.trim().length === 0) {
      // Return top fast stations for instant dropdown gratification
      const fastList = searchFastAPStations('', 12);
      return NextResponse.json({
        success: true,
        locations: fastList,
        suggestions: fastList,
        latencyMs: Math.round(performance.now() - start),
      });
    }

    const trimmed = query.trim();

    // 1. Ultra-fast pre-indexed station match (<2ms)
    const fastHits = searchFastAPStations(trimmed, 8);
    if (fastHits.length > 0) {
      const topHit = fastHits[0];
      // Asynchronously ensure services are prepared without blocking
      locationScraper.resolveLocation(topHit.name, date).catch(() => {});

      return NextResponse.json({
        success: true,
        result: {
          location: topHit,
          source: 'seed',
          confidence: 0.99,
          verifiedAt: new Date().toISOString(),
        },
        suggestions: fastHits,
        latencyMs: Math.round(performance.now() - start),
      });
    }

    // 2. Fallback to Location Scraper (resolves custom unlisted towns)
    const result = await locationScraper.resolveLocation(trimmed, date);
    return NextResponse.json({
      success: true,
      result,
      suggestions: [result.location],
      latencyMs: Math.round(performance.now() - start),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Location search failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const start = performance.now();
  try {
    const body = await req.json();
    const { query, simulatedDate = '2026-10-10' } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const trimmed = query.trim();
    const fastHits = searchFastAPStations(trimmed, 8);
    if (fastHits.length > 0) {
      const topHit = fastHits[0];
      locationScraper.resolveLocation(topHit.name, simulatedDate).catch(() => {});

      return NextResponse.json({
        success: true,
        result: {
          location: topHit,
          source: 'seed',
          confidence: 0.99,
          verifiedAt: new Date().toISOString(),
        },
        suggestions: fastHits,
        latencyMs: Math.round(performance.now() - start),
      });
    }

    const result = await locationScraper.resolveLocation(trimmed, simulatedDate);
    return NextResponse.json({
      success: true,
      result,
      suggestions: [result.location],
      latencyMs: Math.round(performance.now() - start),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Location resolution failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
