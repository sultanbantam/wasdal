import os
import tempfile
import logging
from typing import List
from openai import OpenAI

logger = logging.getLogger(__name__)

# Configure FFmpeg binary for pydub
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    from pydub import AudioSegment
    AudioSegment.converter = ffmpeg_exe
    logger.info(f"Using imageio-ffmpeg executable: {ffmpeg_exe}")
except Exception as e:
    logger.warning(f"Could not initialize imageio-ffmpeg: {e}")
    try:
        from pydub import AudioSegment
    except ImportError:
        AudioSegment = None

# Max size in bytes before splitting (20 MB to leave safe buffer below OpenAI 25 MB limit)
MAX_DIRECT_WHISPER_BYTES = 20 * 1024 * 1024
CHUNK_DURATION_MS = 10 * 60 * 1000  # 10 minutes per chunk


def split_and_transcribe_audio(file_path: str, client: OpenAI) -> str:
    """
    Transcribes audio files of ANY duration or size by compressing & chunking if necessary.
    """
    if AudioSegment is None:
        # Fallback to direct upload if pydub is not installed
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return transcript.text

    # Load audio using pydub
    try:
        audio = AudioSegment.from_file(file_path)
    except Exception as e:
        logger.warning(f"Failed to load audio with pydub from {file_path}: {e}. Trying direct Whisper upload...")
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return transcript.text

    duration_ms = len(audio)
    file_size = os.path.getsize(file_path)
    
    # If audio is short (< 12 minutes) and small (< 20MB), attempt direct transcription
    if duration_ms <= 12 * 60 * 1000 and file_size <= MAX_DIRECT_WHISPER_BYTES:
        try:
            with open(file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                return transcript.text
        except Exception as e:
            logger.info(f"Direct transcription failed ({e}), proceeding with compression & chunking...")

    # For long audio (> 10 mins or > 20MB), process in chunks with optimized speech settings (mono, 64k)
    # Convert to mono to halve the data size without speech degradation
    audio = audio.set_channels(1)
    
    transcripts: List[str] = []
    chunk_paths: List[str] = []

    try:
        total_chunks = (duration_ms + CHUNK_DURATION_MS - 1) // CHUNK_DURATION_MS
        logger.info(f"Splitting {duration_ms / 1000:.1f}s audio into {total_chunks} chunks...")

        for idx, start_ms in enumerate(range(0, duration_ms, CHUNK_DURATION_MS)):
            end_ms = min(start_ms + CHUNK_DURATION_MS, duration_ms)
            chunk = audio[start_ms:end_ms]

            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_chunk_{idx}.mp3") as tmp_chunk:
                chunk_path = tmp_chunk.name
                chunk_paths.append(chunk_path)
                # Export with 64kbps mono MP3 (approx 4.8MB per 10 mins)
                chunk.export(chunk_path, format="mp3", bitrate="64k")

            logger.info(f"Transcribing chunk {idx + 1}/{total_chunks} ({chunk_path}, size={os.path.getsize(chunk_path)} bytes)...")
            with open(chunk_path, "rb") as audio_file:
                chunk_transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                if chunk_transcript.text and chunk_transcript.text.strip():
                    transcripts.append(chunk_transcript.text.strip())

        return "\n\n".join(transcripts)

    finally:
        # Clean up chunk files
        for cp in chunk_paths:
            if os.path.exists(cp):
                try:
                    os.remove(cp)
                except Exception as e:
                    logger.warning(f"Failed to remove chunk temp file {cp}: {e}")


def process_document_or_audio(file_path: str, suffix: str, client: OpenAI) -> str:
    """
    Extracts text from PDF, TXT, CSV, MD, or transcribes any Audio/Video file.
    """
    if suffix == ".pdf":
        import pypdf
        text = ""
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    elif suffix in [".txt", ".md", ".csv", ".json"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    else:
        # Audio / Video formats (e.g. .webm, .mp3, .wav, .m4a, .ogg, .mp4, .aac, .flac)
        return split_and_transcribe_audio(file_path, client)
