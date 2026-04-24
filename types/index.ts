export type UserRole = "employee" | "admin";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed" | "Escalated";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export type TicketCategory =
    | "Password Reset"
    | "Software Help"
    | "Network Issue"
    | "Email Issue"
    | "Hardware Issue"
    | "Access Permission"
    | "Working Hours"
    | "Escalation"
    | "Other";

export type NLPIntentName =
    | "greeting"
    | "password_reset"
    | "raise_ticket"
    | "ticket_status"
    | "software_help"
    | "network"
    | "email"
    | "hardware"
    | "access_permission"
    | "working_hours"
    | "escalate"
    | "thanks"
    | "bye"
    | "fallback";

export type MessageSender = "user" | "bot";

export type MessageStatus = "sending" | "sent" | "error";

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export type User = {
    id: string;           // e.g. "EMP001", "ADMIN001"
    name: string;
    email: string;
    role: UserRole;       // was: string — now strictly typed
    dept: string;         // kept as-is (your existing field)
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export type AuthPayload = {
    user: User;
    token: string;
};

// ─────────────────────────────────────────────
// TICKET
// ─────────────────────────────────────────────

export type Ticket = {
    id: string;                   // e.g. "TKT-001"
    empId: string;                // kept as-is (your existing field)
    empName: string;              // kept as-is
    dept: string;                 // kept as-is
    category: TicketCategory;     // was: string — now strictly typed
    priority: TicketPriority;     // extended: added "Critical"
    status: TicketStatus;         // extended: added "Closed", "Escalated"
    desc: string;                 // kept as-is
    resolution: string;           // kept as-is
    createdAt: string;            // ISO 8601
    updatedAt: string;            // ISO 8601
    assignedTo?: string;          // admin/agent name (optional)
    resolvedAt?: string;          // ISO 8601 (optional)
};

export type CreateTicketInput = {
    category: TicketCategory;
    priority: TicketPriority;
    desc: string;
};

export type UpdateTicketInput = {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    resolution?: string;
};

export type TicketFilters = {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    dept?: string;
};

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────

export type QuickChip = {
    id: string;
    label: string;
    payload: string;      // text sent when chip is clicked
};

export type ChatMessage = {
    id: string;
    role: MessageSender;          // was: "user" | "bot" — same, just uses the named type
    message: string;              // kept as-is (your existing field)
    intent?: NLPIntentName;       // was: string — now strictly typed to your 14 intents
    timestamp: Date;              // kept as-is
    status?: MessageStatus;       // "sending" | "sent" | "error"
    quickChips?: QuickChip[];     // follow-up chips after a bot reply
    isTyping?: boolean;           // true while bot is "thinking"
    relatedTicketId?: string;     // if this message spawned/refers to a ticket
};

export type ChatSession = {
    id: string;
    userId: string;
    messages: ChatMessage[];
    startedAt: string;            // ISO 8601
    lastMessageAt: string;        // ISO 8601
};

export type ChatRequest = {
    sessionId: string;
    userId: string;
    message: string;
    history?: ChatMessage[]; // client sends recent messages so serverless keeps context
};

export type ChatResponse = {
    reply: ChatMessage;
    quickChips?: QuickChip[];
    createdTicketId?: string;     // set if bot auto-created a ticket
};

// ─────────────────────────────────────────────
// NLP ENGINE
// ─────────────────────────────────────────────

export type NLPEntity = {
    type: "ticket_id" | "category" | "priority" | "keyword";
    value: string;
    rawText: string;
};

export type NLPIntent = {
    name: NLPIntentName;
    confidence: number;           // 0.0 – 1.0
    entities: NLPEntity[];
    matchedKeywords: string[];
    rawInput: string;
    normalizedInput: string;      // lowercased + trimmed
};

export type NLPResponse = {
    intent: NLPIntent;
    reply: string;
    quickChips?: QuickChip[];
};

// ─────────────────────────────────────────────
// API RESPONSE WRAPPER
// ─────────────────────────────────────────────

/**
 * Every API route returns this shape.
 *
 * Success → { success: true,  data: T,    error: null  }
 * Failure → { success: false, data: null, error: ApiError }
 */
export type ApiResponse<T = unknown> = {
    success: boolean;
    data: T | null;
    error: ApiError | null;
    meta?: ApiMeta;
};

export type ApiError = {
    code: string;         // machine-readable: "UNAUTHORIZED", "NOT_FOUND" etc.
    message: string;      // human-readable
    field?: string;       // for validation errors — which field failed
};

export type ApiMeta = {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
};

// ─────────────────────────────────────────────
// ADMIN / ANALYTICS
// ─────────────────────────────────────────────

export interface TicketCategoryCount {
    category: TicketCategory;
    count: number;
}

export interface TicketPriorityCount {
    priority: TicketPriority;
    count: number;
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    escalated: number;
    byCategory: TicketCategoryCount[];
    byPriority: TicketPriorityCount[];
}

export interface TopIntent {
    intent: NLPIntentName;
    count: number;
}

export interface ChatbotStats {
    totalSessions: number;
    resolvedByChatbot: number;
    escalatedToHuman: number;
    avgConfidence: number;
    topIntents: TopIntent[];
}

export interface DailyTicketCount {
    date: string;
    created: number;
    resolved: number;
}

export interface AdminDashboardData {
    ticketStats: TicketStats;
    chatbotStats: ChatbotStats;
    dailyTicketCounts: DailyTicketCount[];
}
