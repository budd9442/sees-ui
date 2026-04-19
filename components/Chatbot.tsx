'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, GraduationCap, Loader2,
  Database, ChevronDown, Trash2, Maximize2, Minimize2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  dbAccess?: boolean; // true = answer was computed from live DB data
};

const STORAGE_KEY = 'sees_chatbot_messages';
const MAX_STORED = 30;

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  ts: Date.now(),
  content: "Hi! I'm your SEES academic assistant. I can answer questions about module performance, GPA statistics, pass rates, enrollment data, and general curriculum questions — all from live data. Ask me anything!",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [INITIAL_MESSAGE];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [INITIAL_MESSAGE];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.length > 0 ? parsed : [INITIAL_MESSAGE];
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED)));
  } catch { /* quota exceeded — ignore */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMessages(loadMessages());
    setHasHydrated(true);
  }, []);

  // Persist messages whenever they change
  useEffect(() => {
    if (hasHydrated) saveMessages(messages);
  }, [messages, hasHydrated]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Collapse fullscreen when panel closes
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // ESC collapses fullscreen (second ESC closes panel)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen, isOpen]);

  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Build history for the API (last 6 turns, excluding welcome)
  const buildHistory = (msgs: ChatMessage[]) =>
    msgs
      .filter(m => m.id !== 'welcome')
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      ts: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setIsAtBottom(true);

    try {
      const body: Record<string, unknown> = {
        message: text,
        history: buildHistory(nextMessages),
      };

      // Only send user context if logged in
      if (user) {
        body.userContext = { user: { role: user.role, name: user.name, email: user.email } };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // 401 → not logged in
      if (response.status === 401) {
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response ?? 'Please log in to use the SEES AI assistant.',
          ts: Date.now(),
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response.',
        ts: Date.now(),
        dbAccess: data.dbAccess === true,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: unknown) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error. Please try again. ${error instanceof Error ? `(${error.message})` : ''}`,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, user]);

  const handleClearHistory = useCallback(() => {
    const fresh = [{ ...INITIAL_MESSAGE, ts: Date.now() }];
    setMessages(fresh);
    saveMessages(fresh);
  }, []);

  return (
    <>
      {/* ── Floating Action Button ────────────────────────────────────────── */}
      <button
        id="chatbot-fab"
        aria-label="Open SEES AI assistant"
        onClick={() => setIsOpen(true)}
        className={[
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full',
          'bg-gradient-to-br from-primary to-primary/80',
          'text-primary-foreground shadow-lg',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary/40',
          'flex items-center justify-center transition-all duration-200',
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ].join(' ')}
      >
        <MessageCircle className="h-6 w-6" />
        {/* Unread dot (only when closed and has messages beyond welcome) */}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Fullscreen backdrop */}
          {isFullscreen && (
            <div
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsFullscreen(false)}
            />
          )}

          <div
            id="chatbot-panel"
            role="dialog"
            aria-modal="true"
            aria-label="SEES AI assistant"
            className={[
              'fixed z-50 flex flex-col',
              'border border-border/60 bg-background/98 backdrop-blur-md shadow-2xl',
              isFullscreen
                ? 'inset-4 rounded-2xl'
                : 'bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl',
              'transition-all duration-300 ease-in-out',
            ].join(' ')}
            style={isFullscreen ? {} : { maxHeight: 'min(620px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">SEES Assistant</p>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  {isLoggedIn ? 'Full Access' : 'Visitor Access'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Clear chat history"
                onClick={handleClearHistory}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
                onClick={() => setIsFullscreen(fs => !fs)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {isFullscreen
                  ? <Minimize2 className="h-3.5 w-3.5" />
                  : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                aria-label="Close assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-muted-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground">Querying database…</span>
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {!isAtBottom && (
            <div className="flex justify-center py-1 flex-shrink-0">
              <button
                onClick={scrollToBottom}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted px-2 py-1 rounded-full transition-colors"
              >
                <ChevronDown className="h-3 w-3" /> Scroll to latest
              </button>
            </div>
          )}

          {/* Suggestion chips */}
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 pt-0 border-t border-border/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="chatbot-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isLoggedIn ? 'Ask about modules, GPA, pass rates…' : 'Ask a curriculum question…'}
                disabled={isLoading}
                aria-label="Message input"
                className={[
                  'flex-1 h-10 rounded-xl border bg-muted/50 px-3 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
                  'placeholder:text-muted-foreground/60 transition-all',
                  isLoading ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              />
              <button
                id="chatbot-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={[
                  'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 active:scale-95 transition-all',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
                ].join(' ')}
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message: m }: { message: ChatMessage }) {
  const isBot = m.role === 'assistant';

  if (isBot) {
    return (
      <div className="flex items-start gap-2 group">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
            {m.content}
          </div>
          {m.dbAccess && (
            <div className="flex items-center gap-1 mt-1 ml-1">
              <Database className="h-2.5 w-2.5 text-green-500" />
              <span className="text-[10px] text-muted-foreground">Verified from live database</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%] whitespace-pre-line">
        {m.content}
      </div>
    </div>
  );
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Mean GPA for INTE 31356',
  'Pass rate for L2 modules',
  'MIT vs IT enrollment',
  'Top 5 performers in L3',
  'Grade distribution this year',
];
