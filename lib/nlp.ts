// ============================================================
// lib/nlp.ts
// EmpowerTech Solutions — Local Intent Classifier
// Runs client-side/server-side with zero API calls.
// Used as pre-classifier before sending to Groq.
// ============================================================

import type { NLPIntent, NLPIntentName, NLPEntity, QuickChip } from "@/types";

// ─────────────────────────────────────────────
// KEYWORD MAP — intent → trigger keywords
// ─────────────────────────────────────────────

const INTENT_KEYWORDS: Record<NLPIntentName, string[]> = {
    greeting: [
        "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
        "howdy", "greetings", "sup", "what's up", "hiya", "namaste"
    ],
    password_reset: [
        "password", "reset password", "forgot password", "change password",
        "can't login", "cannot login", "locked out", "account locked",
        "reset my password", "password expired", "new password"
    ],
    raise_ticket: [
        "raise ticket", "create ticket", "new ticket", "open ticket",
        "log issue", "report issue", "submit ticket", "raise an issue",
        "file a complaint", "register complaint", "need help with", "i have an issue"
    ],
    ticket_status: [
        "ticket status", "my ticket", "check ticket", "status of ticket",
        "ticket update", "what happened to my ticket", "ticket number",
        "tkt-", "ticket id", "follow up", "any update"
    ],
    software_help: [
        "software", "application", "app crash", "app not working", "install",
        "installation", "software issue", "program", "not opening", "keeps crashing",
        "licence", "license", "activation", "ms office", "excel", "word", "teams",
        "zoom", "vs code", "browser"
    ],
    network: [
        "internet", "network", "wifi", "wi-fi", "no internet", "slow internet",
        "connection", "vpn", "can't connect", "network issue", "disconnected",
        "no connection", "bandwidth", "proxy", "dns", "ping"
    ],
    email: [
        "email", "mail", "outlook", "inbox", "sending mail", "receiving mail",
        "email not working", "email issue", "spam", "email access", "configure email",
        "email setup", "can't send", "can't receive"
    ],
    hardware: [
        "hardware", "laptop", "computer", "pc", "monitor", "keyboard", "mouse",
        "printer", "scanner", "headset", "charger", "battery", "screen", "display",
        "not turning on", "hardware issue", "device", "peripheral"
    ],
    access_permission: [
        "access", "permission", "not authorized", "unauthorized", "access denied",
        "can't access", "need access", "folder access", "drive access", "grant access",
        "revoke access", "admin rights", "privilege", "permission denied"
    ],
    working_hours: [
        "working hours", "office hours", "support hours", "when are you available",
        "timing", "shift", "work from home", "wfh", "office policy", "leave",
        "holiday", "attendance", "business hours"
    ],
    escalate: [
        "escalate", "urgent", "critical", "emergency", "not resolved", "still broken",
        "speak to manager", "talk to human", "human agent", "real person",
        "no one is helping", "escalation", "serious issue", "asap"
    ],
    thanks: [
        "thanks", "thank you", "thank u", "thx", "ty", "much appreciated",
        "great help", "helpful", "appreciate it", "cheers"
    ],
    bye: [
        "bye", "goodbye", "see you", "see ya", "take care", "later",
        "that's all", "nothing else", "i'm done", "all good now", "exit"
    ],
    fallback: [],
};

// ─────────────────────────────────────────────
// QUICK CHIPS — suggested follow-ups per intent
// FIX #2: Added missing chips for hardware, email,
//         access_permission, working_hours
// ─────────────────────────────────────────────

export const INTENT_CHIPS: Partial<Record<NLPIntentName, QuickChip[]>> = {
    greeting: [
        { id: "c1", label: "🔑 Reset Password", payload: "I need to reset my password" },
        { id: "c2", label: "🎫 Raise a Ticket", payload: "I want to raise a support ticket" },
        { id: "c3", label: "📋 Check Ticket Status", payload: "What is the status of my ticket?" },
        { id: "c4", label: "🌐 Network Issue", payload: "I have a network connectivity issue" },
    ],
    password_reset: [
        { id: "c5", label: "🎫 Raise Ticket for This", payload: "Please raise a ticket for password reset" },
        { id: "c6", label: "🔒 Account Locked?", payload: "My account is locked" },
    ],
    ticket_status: [
        { id: "c7", label: "📝 View All My Tickets", payload: "Show me all my tickets" },
        { id: "c8", label: "🔺 Escalate Ticket", payload: "I want to escalate my ticket" },
    ],
    software_help: [
        { id: "c9", label: "🎫 Raise Software Ticket", payload: "Raise a ticket for my software issue" },
        { id: "c10", label: "🔺 Escalate", payload: "This is urgent, please escalate" },
    ],
    network: [
        { id: "c11", label: "🎫 Raise Network Ticket", payload: "Raise a ticket for network issue" },
        { id: "c12", label: "🔺 Urgent Escalation", payload: "This is critical, please escalate" },
    ],
    // ── FIX #2: Previously missing — now added ──────────────
    hardware: [
        { id: "c19", label: "🎫 Raise Hardware Ticket", payload: "Raise a ticket for my hardware issue" },
        { id: "c20", label: "💻 Which Device?", payload: "The issue is with my laptop" },
        { id: "c21", label: "🔺 Escalate", payload: "This is urgent, please escalate" },
    ],
    email: [
        { id: "c22", label: "🎫 Raise Email Ticket", payload: "Raise a ticket for my email issue" },
        { id: "c23", label: "📤 Can't Send Emails?", payload: "I cannot send emails" },
        { id: "c24", label: "📥 Can't Receive Emails?", payload: "I am not receiving any emails" },
    ],
    access_permission: [
        { id: "c25", label: "🎫 Request Access", payload: "Raise a ticket for access permission" },
        { id: "c26", label: "📁 Folder/Drive Access?", payload: "I need access to a shared folder or drive" },
        { id: "c27", label: "🔑 Admin Rights?", payload: "I need admin rights on my machine" },
    ],
    working_hours: [
        { id: "c28", label: "🕘 Office Hours?", payload: "What are the office working hours?" },
        { id: "c29", label: "🏠 WFH Policy?", payload: "What is the work from home policy?" },
        { id: "c30", label: "📅 Holiday Calendar?", payload: "Can I see the holiday calendar?" },
    ],
    // ────────────────────────────────────────────────────────
    escalate: [
        { id: "c16", label: "🎫 Raise Urgent Ticket", payload: "Raise an urgent ticket for me" },
    ],
    thanks: [
        { id: "c17", label: "🎫 Raise Another Ticket", payload: "I want to raise another ticket" },
        { id: "c18", label: "👋 Goodbye", payload: "Bye, that's all I needed" },
    ],
    fallback: [
        { id: "c13", label: "🎫 Raise a Ticket", payload: "I want to raise a support ticket" },
        { id: "c14", label: "🔑 Password Help", payload: "I need help with my password" },
        { id: "c15", label: "👨‍💼 Talk to an Agent", payload: "I want to speak to a human agent" },
    ],
};

// ─────────────────────────────────────────────
// ENTITY EXTRACTOR
// ─────────────────────────────────────────────

function extractEntities(input: string): NLPEntity[] {
    const entities: NLPEntity[] = [];

    // Extract ticket IDs — e.g. TKT-001, TKT-042
    const ticketIdRegex = /TKT-\d{3,}/gi;
    const ticketMatches = input.match(ticketIdRegex);
    if (ticketMatches) {
        ticketMatches.forEach((match) => {
            entities.push({
                type: "ticket_id",
                value: match.toUpperCase(),
                rawText: match,
            });
        });
    }

    // Extract priority keywords
    const priorityMap: Record<string, string> = {
        critical: "Critical", urgent: "Critical", emergency: "Critical",
        high: "High", important: "High",
        medium: "Medium", moderate: "Medium",
        low: "Low", minor: "Low",
    };
    for (const [keyword, value] of Object.entries(priorityMap)) {
        if (input.toLowerCase().includes(keyword)) {
            entities.push({ type: "priority", value, rawText: keyword });
            break;
        }
    }

    // Extract category keywords
    const categoryMap: Record<string, string> = {
        password: "Password Reset",
        network: "Network Issue",
        wifi: "Network Issue",
        internet: "Network Issue",
        email: "Email Issue",
        outlook: "Email Issue",
        software: "Software Help",
        hardware: "Hardware Issue",
        laptop: "Hardware Issue",
        printer: "Hardware Issue",
        access: "Access Permission",
        permission: "Access Permission",
    };
    for (const [keyword, value] of Object.entries(categoryMap)) {
        if (input.toLowerCase().includes(keyword)) {
            entities.push({ type: "category", value, rawText: keyword });
            break;
        }
    }

    return entities;
}

// ─────────────────────────────────────────────
// CORE CLASSIFIER
// FIX #1: Confidence formula corrected.
//   OLD: topScore / (totalScore + 1)  ← deflated by competing intents
//   NEW: topScore / (topScore + 1)    ← isolates top intent strength
// ─────────────────────────────────────────────

export function classifyIntent(rawInput: string): NLPIntent {
    const normalizedInput = rawInput.toLowerCase().trim();
    const scores: Partial<Record<NLPIntentName, number>> = {};
    const matchedKeywordsByIntent: Partial<Record<NLPIntentName, string[]>> = {};

    // Score each intent by counting keyword matches
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [NLPIntentName, string[]][]) {
        if (intent === "fallback") continue;
        let score = 0;
        const matched: string[] = [];

        for (const keyword of keywords) {
            if (normalizedInput.includes(keyword)) {
                // Longer keyword matches score higher (more specific)
                score += keyword.split(" ").length;
                matched.push(keyword);
            }
        }

        if (score > 0) {
            scores[intent] = score;
            matchedKeywordsByIntent[intent] = matched;
        }
    }

    // Find top intent
    let topIntent: NLPIntentName = "fallback";
    let topScore = 0;

    for (const [intent, score] of Object.entries(scores) as [NLPIntentName, number][]) {
        if (score > topScore) {
            topScore = score;
            topIntent = intent;
        }
    }

    // FIX #1: topScore / (topScore + 1) — independent of competing intents
    // A single strong match (score=5) → 5/6 = 0.83 confidence ✅
    // Old formula with 3 competing intents (total=15) → 5/16 = 0.31 ❌ (wrongly low)
    const confidence = topScore > 0
        ? Math.min(topScore / (topScore + 1), 0.99)
        : 0;

    // If confidence too low, fallback
    const finalIntent: NLPIntentName = confidence >= 0.25 ? topIntent : "fallback";

    return {
        name: finalIntent,
        confidence: finalIntent === "fallback" ? 0 : parseFloat(confidence.toFixed(2)),
        entities: extractEntities(rawInput),
        matchedKeywords: matchedKeywordsByIntent[topIntent] ?? [],
        rawInput,
        normalizedInput,
    };
}

// ─────────────────────────────────────────────
// INTENT → GROQ CONTEXT HINT
// Tells Groq what kind of response to generate
// ─────────────────────────────────────────────

export function getIntentContext(intent: NLPIntentName): string {
    const contextMap: Record<NLPIntentName, string> = {
        greeting:
            "The user is greeting you. Respond warmly, introduce yourself as EmpowerTech's AI support assistant, and ask how you can help.",
        password_reset:
            "The user needs password reset help. Give clear steps: they can reset via the IT portal at portal.empowertech.in or raise a ticket for manual reset. Ask if they're completely locked out.",
        raise_ticket:
            "The user wants to raise a support ticket. Ask them: (1) what the issue is, (2) how urgent it is. Tell them you can create the ticket directly from this chat.",
        ticket_status:
            "The user wants to check the status of a ticket. If they shared a ticket ID, acknowledge it. Tell them they can view all their tickets in the Tickets section of the portal.",
        software_help:
            "The user has a software/application issue. Ask which application is causing the problem and what exactly is happening. Offer common fixes (restart, reinstall, check license).",
        network:
            "The user has a network or internet connectivity issue. Ask if it's WiFi or LAN, whether it's affecting only their device or multiple. Suggest: restart router, check VPN, contact network team.",
        email:
            "The user has an email issue (Outlook/mail not working). Ask whether they can't send, receive, or access email at all. Suggest: check internet, reconfigure Outlook, or raise a ticket.",
        hardware:
            "The user has a hardware issue (laptop, printer, monitor, etc.). Ask which device and what the problem is. Advise them to raise a ticket so the hardware team can be dispatched.",
        access_permission:
            "The user has an access/permission issue. Ask which system or folder they need access to and their employee ID. Remind them approvals go through their manager.",
        working_hours:
            "The user is asking about office hours or company policies. EmpowerTech office hours are 9 AM – 6 PM IST, Monday to Friday. IT support is available 24/7 via this portal.",
        escalate:
            "The user wants to escalate their issue or speak to a human. Acknowledge urgency, reassure them, and tell them you're flagging this as high priority. Offer to raise an escalation ticket immediately.",
        thanks:
            "The user is thanking you. Respond warmly and ask if there's anything else you can help with.",
        bye:
            "The user is saying goodbye. Wish them well and remind them support is available 24/7.",
        fallback:
            "You couldn't understand the user's request clearly. Politely say you didn't quite catch that, and offer 2-3 common things you can help with (password reset, raise ticket, check ticket status).",
    };

    return contextMap[intent];
}