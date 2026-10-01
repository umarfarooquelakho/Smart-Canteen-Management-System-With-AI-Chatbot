import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, User,
  RotateCcw, Minimize2, Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { nanoid } from '../../utils/nanoid';
import heroImg from '../../assets/hero.png';
import {
  sendChatMessage,
  QUICK_SUGGESTIONS,
  type ChatMessage,
} from '../../services/chatService';

// ── Markdown-lite renderer (bold, newlines, bullets) ─────────────────────────
function renderText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-•]\s*/, '');
      return (
        <li key={i} className="ml-3 list-disc text-[13px] leading-relaxed">
          {renderInline(content)}
        </li>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, '');
      return (
        <li key={i} className="ml-3 list-decimal text-[13px] leading-relaxed">
          {renderInline(content)}
        </li>
      );
    }

    // Empty line
    if (!trimmed) return <div key={i} className="h-1.5" />;

    return (
      <p key={i} className="text-[13px] leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-charcoal-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
        />
      ))}
    </div>
  );
}

// ── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <div className={clsx('flex gap-2.5 items-end', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'shrink-0 h-7 w-7 rounded-full overflow-hidden shadow-sm border',
        isUser ? 'bg-primary border-primary' : 'border-charcoal-200',
      )}>
        {isUser
          ? <div className="h-full w-full flex items-center justify-center"><User className="h-3.5 w-3.5 text-white" /></div>
          : <img src={heroImg} alt="Assistant" className="h-full w-full object-cover" />
        }
      </div>

      {/* Bubble */}
      <div className={clsx(
        'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm',
        isUser
          ? 'bg-primary text-white rounded-br-sm'
          : msg.isError
          ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm'
          : 'bg-white border border-charcoal-100 text-charcoal rounded-bl-sm',
      )}>
        {msg.isLoading ? (
          <TypingDots />
        ) : (
          <div className={clsx('space-y-0.5', isUser && 'text-white')}>
            {renderText(msg.content)}
          </div>
        )}
        {/* Timestamp */}
        {!msg.isLoading && (
          <div className={clsx(
            'text-[10px] mt-1.5 select-none',
            isUser ? 'text-white/60 text-right' : 'text-charcoal-300',
          )}>
            {msg.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ChatBot component ────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]         = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput]           = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [unread, setUnread]         = useState(0);
  const [messages, setMessages]     = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm the **FataFat Food Assistant** 👋\n\nI can help you with:\n- Placing and tracking orders\n- Understanding tokens & pickup slots\n- Menu questions\n- Staff & manager features\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ]);

  const abortRef    = useRef<AbortController | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const open = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
  };

  const close = () => {
    abortRef.current?.abort();
    setIsOpen(false);
    setIsMinimized(false);
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setIsThinking(false);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: "Chat cleared! How can I help you with FataFat Food?",
        timestamp: new Date(),
      },
    ]);
    setInput('');
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: nanoid(8),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const loadingMsg: ChatMessage = {
      id: `loading-${nanoid(4)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsThinking(true);

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      // Pass current messages BEFORE the new user message (history only)
      const history = messages.filter((m) => !m.isLoading && !m.isError);
      const reply = await sendChatMessage(history, trimmed, abortRef.current.signal);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingMsg.id),
        { id: nanoid(8), role: 'assistant', content: reply, timestamp: new Date() },
      ]);

      // If chat is closed, bump unread count
      if (!isOpen || isMinimized) setUnread((n) => n + 1);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      const errorText =
        (err as Error)?.message?.includes('429')
          ? "I'm receiving too many requests right now. Please try again in a moment."
          : (err as Error)?.message?.includes('401')
          ? "Authentication error. Please contact support."
          : "Sorry, I couldn't reach the server right now. Please try again.";

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingMsg.id),
        { id: nanoid(8), role: 'assistant', content: errorText, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking, isOpen, isMinimized]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const showSuggestions = messages.length <= 2;

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={open}
          aria-label="Open FataFat Food Assistant"
          className={clsx(
            'fixed bottom-6 right-6 z-50',
            'h-16 w-16 rounded-full shadow-2xl',
            'bg-primary hover:bg-primary-600 active:scale-95',
            'flex items-center justify-center overflow-hidden',
            'transition-all duration-200',
            'group border-2 border-white',
          )}
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />

          {/* Hero logo image — fills the button */}
          <img
            src={heroImg}
            alt="FataFat Food Assistant"
            className="relative z-10 h-full w-full object-cover rounded-full"
          />

          {/* Unread badge */}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-charcoal text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20">
              {unread > 9 ? '9+' : unread}
            </span>
          )}

          {/* Tooltip */}
          <span className="absolute right-[72px] whitespace-nowrap bg-charcoal text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            FataFat Food Assistant
          </span>
        </button>
      )}

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={clsx(
            'fixed bottom-6 right-6 z-50',
            'w-[360px] sm:w-[380px]',
            'rounded-2xl shadow-2xl',
            'flex flex-col overflow-hidden',
            'border border-charcoal-100',
            'animate-slide-up',
            'transition-all duration-200',
            isMinimized ? 'h-auto' : 'h-[560px] max-h-[85vh]',
          )}
          role="dialog"
          aria-label="FataFat Food AI Assistant"
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-charcoal shrink-0">
            {/* Brand — circular hero image */}
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary shrink-0 shadow-md">
              <img
                src={heroImg}
                alt="FataFat Food"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm leading-tight flex items-center gap-1.5">
                Canteen Assistant
                <Sparkles className="h-3 w-3 text-primary-300" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-seagreen animate-pulse" />
                <span className="text-xs text-charcoal-300">
                  {isThinking ? 'Thinking…' : 'Online'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
                aria-label="Clear chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized((m) => !m)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={close}
                title="Close"
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Body (hidden when minimized) ────────────────────────────── */}
          {!isMinimized && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto bg-beige-50 px-3 py-4 space-y-3">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                {/* Quick suggestion chips — shown only at start */}
                {showSuggestions && (
                  <div className="pt-1">
                    <p className="text-[11px] text-charcoal-400 font-medium mb-2 px-1">
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SUGGESTIONS.slice(0, 6).map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          disabled={isThinking}
                          className={clsx(
                            'text-[11px] font-medium px-2.5 py-1 rounded-full border',
                            'bg-white border-primary/30 text-primary',
                            'hover:bg-primary hover:text-white hover:border-primary',
                            'transition-colors duration-150 disabled:opacity-40',
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Input bar ───────────────────────────────────────────── */}
              <div className="shrink-0 bg-white border-t border-charcoal-100 px-3 py-2.5">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about ordering, tokens, menu…"
                    disabled={isThinking}
                    className={clsx(
                      'flex-1 resize-none rounded-xl border border-charcoal-200 bg-beige-50',
                      'px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-400',
                      'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition duration-150 leading-relaxed',
                      'min-h-[38px] max-h-[120px] overflow-y-auto',
                    )}
                    style={{ height: '38px' }}
                    aria-label="Type your message"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isThinking}
                    aria-label="Send message"
                    className={clsx(
                      'h-[38px] w-[38px] rounded-xl flex items-center justify-center shrink-0',
                      'transition-all duration-150',
                      input.trim() && !isThinking
                        ? 'bg-primary text-white hover:bg-primary-600 active:scale-95 shadow-sm'
                        : 'bg-charcoal-100 text-charcoal-300 cursor-not-allowed',
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-300 mt-1.5 text-center">
                  FataFat Food topics only · Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

