import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Dumbbell, Mic, MicOff } from 'lucide-react';
import { AxiosError } from 'axios';
import { cn } from '../../utils/cn';
import { chatService, type ChatMessage } from '../../services/chatService';
import {
  createSpeechRecognizer,
  isSpeechSupported,
  type SpeechRecognizer,
} from '../../services/speechService';
import type { ApiResponse } from '../../types';

const GREETING: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm Coach, your AI fitness assistant. Ask me about workouts, nutrition, or training tips. 💪",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const micSupported = isSpeechSupported();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Set up the speech recognizer once; it writes transcripts into the input.
  useEffect(() => {
    recognizerRef.current = createSpeechRecognizer({
      onTranscript: (text) => setInput(text),
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
    return () => recognizerRef.current?.abort();
  }, []);

  const toggleMic = () => {
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
    } else {
      recognizerRef.current?.start();
      setListening(true);
      inputRef.current?.focus();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (listening) {2
      recognizerRef.current?.stop();
      setListening(false);
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // Send only the real conversation (drop the local greeting).
      const history = nextMessages.filter((m) => m !== GREETING);
      const res = await chatService.send(history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const status = (err as AxiosError<ApiResponse<unknown>>).response?.status;
      const serverMsg = (err as AxiosError<ApiResponse<unknown>>).response?.data?.message;
      const content =
        status === 503
          ? 'The assistant is not set up yet. Please contact the gym.'
          : serverMsg || 'Something went wrong reaching the assistant. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open fitness assistant'}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={cn(
            'fixed bottom-24 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col',
            'h-[32rem] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border shadow-2xl',
            'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-brand-600 px-4 py-3 dark:border-slate-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
              <Dumbbell className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Coach</p>
              <p className="text-xs text-white/80">AI Fitness Assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-3 dark:bg-slate-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={2000}
                placeholder={listening ? 'Listening…' : 'Ask about workouts, diet, tips…'}
                className={cn(
                  'flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-colors',
                  'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400',
                  'focus:border-brand-500 focus:bg-white',
                  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800',
                )}
              />
              {micSupported && (
                <button
                  onClick={toggleMic}
                  disabled={loading}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={listening}
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    listening
                      ? 'animate-pulse bg-red-500 text-white hover:bg-red-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                  )}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors',
                  'hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
