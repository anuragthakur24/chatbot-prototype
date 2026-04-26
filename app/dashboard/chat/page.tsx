"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from "lucide-react";
import type { ChatMessage, QuickChip } from "@/types";

// ─────────────────────────────────────────────
// Employee main dashboard component
// ─────────────────────────────────────────────

function generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateSessionId() {
    return `session_${Date.now()}`;
}

function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "bot",
    message:
        "👋 Hi! I'm **Empower AI**, your EmpowerTech IT support assistant. I can help you with password resets, network issues, software problems, raising tickets, and more. How can I help you today?",
    timestamp: new Date(),
    status: "sent",
    quickChips: [
        { id: "w1", label: "🔑 Reset Password", payload: "I need to reset my password" },
        { id: "w2", label: "🎫 Raise a Ticket", payload: "I want to raise a support ticket" },
        { id: "w3", label: "📋 Check Ticket Status", payload: "What is the status of my ticket?" },
        { id: "w4", label: "🌐 Network Issue", payload: "I have a network connectivity issue" },
        { id: "w5", label: "💻 Software Help", payload: "I need help with a software issue" },
    ],
};

// ─────────────────────────────────────────────
// MARKDOWN-LITE RENDERER (bold only)
// ─────────────────────────────────────────────

function renderMessage(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i} className="font-semibold text-white">
                {part.slice(2, -2)}
            </strong>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

// ─────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-indigo-400" />
            </div>
            <div className="bg-[#1c2235] border border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────

function MessageBubble({
    msg,
    onChipClick,
}: {
    msg: ChatMessage;
    onChipClick: (payload: string) => void;
}) {
    const isBot = msg.role === "bot";

    return (
        <div className={`flex items-end gap-2 mb-4 ${isBot ? "" : "flex-row-reverse"}`}>
            {/* Avatar */}
            <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isBot
                        ? "bg-indigo-500/20 border border-indigo-500/30"
                        : "bg-slate-700/60 border border-white/10"
                    }`}
            >
                {isBot ? (
                    <Bot size={14} className="text-indigo-400" />
                ) : (
                    <User size={14} className="text-slate-400" />
                )}
            </div>

            <div className={`flex flex-col gap-1.5 max-w-[75%] ${isBot ? "items-start" : "items-end"}`}>
                {/* Bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${isBot
                            ? "bg-[#1c2235] border border-white/[0.07] text-slate-200 rounded-bl-sm"
                            : "bg-indigo-600 text-white rounded-br-sm"
                        }`}
                >
                    {renderMessage(msg.message)}
                </div>

                {/* Timestamp */}
                <span className="text-[11px] text-slate-600 px-1">
                    {formatTime(msg.timestamp)}
                    {msg.role === "user" && (
                        <span className="ml-1 text-indigo-400/60">
                            {msg.status === "sending" ? "·" : "✓"}
                        </span>
                    )}
                </span>

                {/* Quick chips */}
                {isBot && msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.quickChips.map((chip) => (
                            <button
                                key={chip.id}
                                onClick={() => onChipClick(chip.payload)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-400/40 transition-all active:scale-95"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function ChatPage() {
    const { user, messages, addMessage, clearMessages } = useStore();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(generateSessionId);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const initialized = useRef(false);

    // Show welcome message on first load — ref guard prevents double-fire in Strict Mode
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        if (messages.length === 0) addMessage(WELCOME_MESSAGE);
    }, []);  // eslint-disable-line

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Auto-resize textarea
    function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }

    // Send message
    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isTyping) return;

            setInput("");
            if (inputRef.current) {
                inputRef.current.style.height = "auto";
            }

            // Add user message immediately (optimistic)
            const userMsg: ChatMessage = {
                id: generateId(),
                role: "user",
                message: trimmed,
                timestamp: new Date(),
                status: "sending",
            };
            addMessage(userMsg);
            setIsTyping(true);

            try {
                // Send last 10 messages as context so the bot remembers the conversation
                // even across serverless cold starts
                const recentHistory = messages.filter((m) => !m.isTyping).slice(-10);

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        userId: user?.id ?? "guest",
                        message: trimmed,
                        history: recentHistory,
                    }),
                });

                const json = await res.json();

                if (json.success && json.data?.reply) {
                    const botMsg: ChatMessage = {
                        ...json.data.reply,
                        timestamp: new Date(json.data.reply.timestamp),
                    };
                    addMessage(botMsg);
                } else {
                    // API error fallback
                    addMessage({
                        id: generateId(),
                        role: "bot",
                        message:
                            "Sorry, I'm having trouble responding right now. Please try again in a moment.",
                        timestamp: new Date(),
                        status: "sent",
                        quickChips: [
                            { id: "fb1", label: "🔄 Try Again", payload: trimmed },
                            { id: "fb2", label: "🎫 Raise a Ticket", payload: "I want to raise a support ticket" },
                        ],
                    });
                }
            } catch {
                addMessage({
                    id: generateId(),
                    role: "bot",
                    message:
                        "Connection error. Please check your network and try again.",
                    timestamp: new Date(),
                    status: "sent",
                    quickChips: [
                        { id: "fb3", label: "🔄 Retry", payload: trimmed },
                    ],
                });
            } finally {
                setIsTyping(false);
            }
        },
        [isTyping, sessionId, user, addMessage]
    );

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    function handleClear() {
        clearMessages();
        setTimeout(() => addMessage(WELCOME_MESSAGE), 50);
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full max-h-[calc(100dvh-56px)] bg-[#0a0d14]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#0f1117] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <Bot size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold text-slate-100 tracking-tight">Empower AI</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-emerald-400/80">Online · Powered by LLaMA 3.3</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <Sparkles size={11} className="text-indigo-400" />
                        <span className="text-[11px] text-indigo-400 font-medium">AI Powered</span>
                    </div>

                    <button
                        onClick={handleClear}
                        title="Clear chat"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0 scroll-smooth">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onChipClick={(payload) => sendMessage(payload)}
                    />
                ))}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="px-4 py-3 border-t border-white/[0.07] bg-[#0f1117] shrink-0">
                <div className="flex items-end gap-2 bg-[#161b27] border border-white/9 rounded-2xl px-3 py-2 focus-within:border-indigo-500/40 transition-colors">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about IT support..."
                        rows={1}
                        disabled={isTyping}
                        className="flex-1 bg-transparent text-[13.5px] text-slate-200 placeholder:text-slate-600 resize-none outline-none leading-relaxed py-1 max-h-30 disabled:opacity-50"
                        aria-label="Chat input"
                    />

                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        aria-label="Send message"
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                    >
                        {isTyping ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Send size={15} />
                        )}
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-center text-[11px] text-slate-700">
                        Press <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-500 text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-500 text-[10px]">Shift+Enter</kbd> for new line
                    </p>
                    <span className="text-slate-700 text-[11px]">·</span>
                    <a
                        href="https://github.com/anuragthakur24/chatbot-prototype"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-[11px] transition-colors"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        Source Code
                    </a>
                </div>
            </div>
        </div>
    );
} 

