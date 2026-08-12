// Framework-agnostic wrapper around the browser Web Speech API (speech-to-text).
// Lets the chat widget turn spoken words into text without any backend call.

// Minimal typings for the Web Speech API (not in the standard DOM lib).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechListeners {
  /** Fires with the latest full transcript as the user speaks. */
  onTranscript: (text: string) => void;
  /** Fires when recognition stops (naturally, on error, or via stop()). */
  onEnd?: () => void;
  /** Fires on a recognition error with the error code. */
  onError?: (error: string) => void;
}

export interface SpeechRecognizer {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/** True where the browser supports speech recognition (Chrome/Edge; not Firefox). */
export const isSpeechSupported = (): boolean => getRecognitionCtor() !== null;

/**
 * Create a speech recognizer. Returns null if the browser has no support,
 * so callers can hide the mic button.
 */
export function createSpeechRecognizer(
  listeners: SpeechListeners,
  lang = 'en-US',
): SpeechRecognizer | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    listeners.onTranscript(transcript);
  };
  recognition.onerror = (e) => listeners.onError?.(e.error);
  recognition.onend = () => listeners.onEnd?.();

  return {
    start: () => {
      // start() throws if called while already active — ignore.
      try {
        recognition.start();
      } catch {
        /* already listening */
      }
    },
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}