// ============================================================
// app/api/chat/route.ts
// EmpowerTech Solutions — Chat API Route
// POST /api/chat
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { classifyIntent } from "@/lib/nlp";
import { askGroq } from "@/lib/groq";
import { saveChatLog } from "@/lib/db";
import type { ApiResponse, ChatMessage, ChatRequest, ChatResponse } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();
        const { userId, message, history: clientHistory = [] } = body;

        // ── Validation ────────────────────────────────────────
        if (!userId || !message?.trim()) {
            const response: ApiResponse<null> = {
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "userId and message are required.",
                },
            };
            return NextResponse.json(response, { status: 400 });
        }

        // ── Step 1: Classify intent locally (fast, no API) ────
        const intent = classifyIntent(message);

        // ── Step 2: Get AI response from Groq ─────────────────
        // History comes from the client so this works across serverless cold starts
        const { reply, quickChips } = await askGroq(message, intent.name, clientHistory);

        // ── Build bot message ─────────────────────────────────
        const botMessage: ChatMessage = {
            id: `msg_${Date.now()}_bot`,
            role: "bot",
            message: reply,
            intent: intent.name,
            timestamp: new Date(),
            status: "sent",
            quickChips,
            relatedTicketId: intent.entities.find((e) => e.type === "ticket_id")?.value,
        };

        // ── Persist to DB (non-blocking) ──────────────────────
        saveChatLog(userId, intent.name, message.trim(), reply, intent.confidence).catch(
            (e) => console.error("[/api/chat] saveChatLog failed:", e)
        );

        // ── Return response ───────────────────────────────────
        const response: ApiResponse<ChatResponse> = {
            success: true,
            data: {
                reply: botMessage,
                quickChips,
            },
            error: null,
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[/api/chat] Error:", error);

        const response: ApiResponse<null> = {
            success: false,
            data: null,
            error: {
                code: "INTERNAL_ERROR",
                message: error instanceof Error ? error.message : "Something went wrong.",
            },
        };

        return NextResponse.json(response, { status: 500 });
    }
}