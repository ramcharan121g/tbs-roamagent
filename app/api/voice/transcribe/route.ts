// Prayanam - API Endpoint: Multilingual Voice Transcription (Whisper-Style Pipeline)
import { NextRequest, NextResponse } from 'next/server';
import { VoiceTranscriptionService } from '@/lib/services/voice-transcription-service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioEntry = formData.get('audio');
    const languageHint = (formData.get('language') as string) || 'auto';
    const clientHint = (formData.get('clientHint') as string) || '';

    if (!audioEntry || !(audioEntry instanceof Blob)) {
      return NextResponse.json(
        {
          success: false,
          transcript: '',
          detected_language: 'en',
          language_probability: null,
          segments: [],
          requires_review: true,
          error: "I couldn't hear any speech. Please try recording again.",
        },
        { status: 400 }
      );
    }

    const mimeType = audioEntry.type || 'audio/webm';
    const arrayBuffer = await audioEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const service = VoiceTranscriptionService.getInstance();
    const result = await service.transcribeAudio(buffer, mimeType, languageHint, clientHint);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Audio transcription failed';
    return NextResponse.json(
      {
        success: false,
        transcript: '',
        detected_language: 'en',
        language_probability: null,
        segments: [],
        requires_review: true,
        error: msg,
      },
      { status: 500 }
    );
  }
}
