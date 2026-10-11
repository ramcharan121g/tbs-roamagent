#!/usr/bin/env python3
"""
TBS RoamAgent - Local Faster-Whisper Speech Recognition Bridge
Executes zero-cost multilingual transcription using Faster-Whisper Small model.
Outputs standard JSON with detected_language, probability, and segments.
"""

import sys
import json
import os

VOCABULARY_HINTS = [
    "Visakhapatnam", "Vizag", "Hyderabad", "Vijayawada", "Rajahmundry",
    "Kakinada", "Tirupati", "Tirumala", "Araku", "Gandikota", "Belum Caves",
    "Lepakshi", "Amaravati", "Guntur", "Kurnool", "Kadapa", "Sleeper", "APSRTC"
]

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python faster_whisper_transcribe.py <audio_file> [language_hint]"
        }))
        sys.exit(1)

    audio_path = sys.argv[1]
    language_hint = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "auto" else None

    if not os.path.exists(audio_path):
        print(json.dumps({
            "success": False,
            "error": f"Audio file not found: {audio_path}"
        }))
        sys.exit(1)

    # Check file size
    if os.path.getsize(audio_path) == 0:
        print(json.dumps({
            "success": False,
            "error": "Audio file is empty"
        }))
        sys.exit(1)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        # Faster whisper package not installed
        print(json.dumps({
            "success": False,
            "engine": "fallback",
            "error": "faster-whisper is not installed. Use local JS transcriber."
        }))
        sys.exit(0)

    try:
        # Cache model locally in .cache/whisper
        cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".cache", "whisper")
        os.makedirs(cache_dir, exist_ok=True)

        # Small model (approx 244M params, ~2GB VRAM or CPU int8)
        model = WhisperModel(
            "small",
            device="auto",
            compute_type="int8",
            download_root=cache_dir
        )

        initial_prompt = "Travel in Andhra Pradesh and Telangana: " + ", ".join(VOCABULARY_HINTS)

        segments, info = model.transcribe(
            audio_path,
            language=language_hint,
            initial_prompt=initial_prompt,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )

        transcript_parts = []
        segment_list = []
        for segment in segments:
            transcript_parts.append(segment.text.strip())
            segment_list.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
            })

        full_transcript = " ".join(transcript_parts).strip()

        print(json.dumps({
            "success": True,
            "engine": "faster-whisper-small",
            "transcript": full_transcript,
            "detected_language": info.language,
            "language_probability": round(info.language_probability, 3) if hasattr(info, 'language_probability') else None,
            "segments": segment_list,
            "requires_review": True,
            "error": None
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
