// Prayanam - API: Trip Constraint Parsing & Extraction
import { NextRequest, NextResponse } from 'next/server';
import { GroqConstraintParser } from '@/lib/ai/groq-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = 'en', simulatedDate = '2026-10-10' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Travel goal text is required' }, { status: 400 });
    }

    const parser = new GroqConstraintParser();
    const result = await parser.parseRequest(text, language, simulatedDate);

    return NextResponse.json({
      success: true,
      constraints: result.constraints,
      providerUsed: result.providerUsed,
      clarifications: result.clarifications,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parsing failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
