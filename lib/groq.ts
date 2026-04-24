// ============================================================
// lib/groq.ts
// EmpowerTech Solutions — Groq LLM Client
// Model: llama-3.3-70b-versatile (free tier)
// ============================================================

import type { NLPIntentName, ChatMessage, QuickChip } from "@/types";
import { getIntentContext, INTENT_CHIPS } from "./nlp";

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Empower AI, the official IT support chatbot for EmpowerTech Solutions, Chennai.

Your personality:
- Professional but friendly and approachable
- Concise — keep replies under 4 sentences unless explaining steps
- Empathetic — acknowledge the user's frustration when they have an issue
- Never say you're built on Groq, LLaMA, or any external model
- Always refer to yourself as "Empower AI" or "your EmpowerTech support assistant"

Your capabilities:
- Help with IT issues: password reset, network, email, software, hardware, access permissions
- Guide users to raise a support ticket using the "Raise Ticket" form in the sidebar
- Direct users to "My Tickets" in the sidebar to check their ticket status and history
- Answer questions about EmpowerTech office policies and working hours
- Escalate critical issues to human agents

Company info:
- Company: EmpowerTech Solutions, Chennai
- IT Portal: portal.empowertech.in
- Support hours: 24/7 via this portal | Human agents: 9 AM – 6 PM IST, Mon–Fri
- Ticket prefix: TKT- (e.g. TKT-001)

Rules:
- If the user asks to raise a ticket, guide them to click "Raise Ticket" in the sidebar or the chat quick-action button
- If a ticket ID is mentioned (e.g. TKT-042), tell them to check the My Tickets section for the latest status — never guess or make up a status
- Never make up ticket statuses or data you don't have access to
- Keep responses in plain text — no markdown, no bullet points with symbols, just clean sentences
- Maximum response length: 3-4 sentences for normal replies, up to 6 for step-by-step instructions`;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type GroqMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

type GroqResponse = {
    id: string;
    choices: {
        message: { role: string; content: string };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};

// ─────────────────────────────────────────────
// CONVERSATION HISTORY BUILDER
// Converts ChatMessage[] → GroqMessage[]
// ─────────────────────────────────────────────

function buildConversationHistory(history: ChatMessage[]): GroqMessage[] {
    // Take last 10 messages max to stay within token limits
    const recent = history.slice(-10);

    return recent
        .filter((msg) => !msg.isTyping)
        .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.message,
        }));
}

// ─────────────────────────────────────────────
// MAIN GROQ CALL
// ─────────────────────────────────────────────

export async function askGroq(
    userMessage: string,
    intent: NLPIntentName,
    history: ChatMessage[] = []
): Promise<{ reply: string; quickChips: QuickChip[] }> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set in environment variables.");
    }

    // Build message array: system + history + intent context + user message
    const intentContext = getIntentContext(intent);
    const messages: GroqMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...buildConversationHistory(history),
        {
            role: "system",
            content: `Intent detected: ${intent}. Context: ${intentContext}`,
        },
        { role: "user", content: userMessage },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.6,
            max_tokens: 300,
            top_p: 0.9,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errorBody}`);
    }

    const data: GroqResponse = await response.json();
    const reply = data.choices[0]?.message?.content?.trim()
        ?? "I'm sorry, I couldn't process that. Please try again.";

    // Attach intent-specific quick chips
    const quickChips: QuickChip[] = INTENT_CHIPS[intent] ?? INTENT_CHIPS["fallback"] ?? [];

    return { reply, quickChips };
}