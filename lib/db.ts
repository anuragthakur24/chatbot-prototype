// ============================================================
// lib/db.ts
// EmpowerTech Solutions — Prisma Data Layer
// NeonDB (PostgreSQL) + Prisma Neon adapter
// ============================================================

import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import type {
  User,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  TicketStats,
  TicketCategoryCount,
  TicketPriorityCount,
  DailyTicketCount,
  ChatbotStats,
  TopIntent,
  NLPIntentName,
} from "@/types";

// ─────────────────────────────────────────────
// PRISMA SINGLETON (your existing pattern — kept as-is)
// ─────────────────────────────────────────────

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─────────────────────────────────────────────
// AUTH QUERIES
// ─────────────────────────────────────────────

export async function validateCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) return null;
  return mapUser(user);
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? mapUser(user) : null;
}

// ─────────────────────────────────────────────
// TICKET QUERIES
// ─────────────────────────────────────────────

export async function getTickets(
  requesterId: string,
  role: string,
  filters?: TicketFilters
): Promise<Ticket[]> {
  const where: Record<string, unknown> = {};
  if (role === "employee") where.empId = requesterId;
  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.category) where.category = filters.category;
  if (filters?.dept) where.dept = filters.dept;

  const rows = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapTicket);
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const row = await prisma.ticket.findUnique({ where: { id } });
  return row ? mapTicket(row) : null;
}

export async function createTicket(
  input: CreateTicketInput,
  user: User
): Promise<Ticket> {
  const latest = await prisma.ticket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  let nextNum = 1001;
  if (latest) {
    const num = parseInt(latest.id.replace("TKT-", ""), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const row = await prisma.ticket.create({
    data: {
      id: `TKT-${nextNum}`,
      empId: user.id,
      empName: user.name,
      dept: user.dept,
      category: input.category,
      priority: input.priority,
      status: "Open",
      desc: input.desc,
      resolution: "",
    },
  });
  return mapTicket(row);
}

export async function updateTicket(
  id: string,
  update: UpdateTicketInput
): Promise<Ticket | null> {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) return null;

  const isBeingResolved =
    update.status === "Resolved" || update.status === "Closed";

  const row = await prisma.ticket.update({
    where: { id },
    data: {
      ...(update.status && { status: update.status }),
      ...(update.priority && { priority: update.priority }),
      ...(update.assignedTo && { assignedTo: update.assignedTo }),
      ...(update.resolution && { resolution: update.resolution }),
      ...(isBeingResolved && { resolvedAt: new Date() }),
    },
  });
  return mapTicket(row);
}

// ─────────────────────────────────────────────
// CHAT LOG
// ─────────────────────────────────────────────

export async function saveChatLog(
  empId: string,
  intent: string,
  message: string,
  response: string,
  confidence?: number
): Promise<void> {
  await prisma.chatLog.create({
    data: { empId, intent, message, response, confidence },
  });
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

export async function getTicketStats(): Promise<TicketStats> {
  const tickets = await prisma.ticket.findMany();

  // Accumulators — plain Record<string, number> for counting
  const catCounts: Record<string, number> = {};
  const priCounts: Record<string, number> = {};
  let totalMs = 0;
  let resolvedCount = 0;

  for (const t of tickets) {
    // Count by category
    catCounts[t.category] = (catCounts[t.category] ?? 0) + 1;
    // Count by priority
    priCounts[t.priority] = (priCounts[t.priority] ?? 0) + 1;
    // Accumulate resolution time
    if (t.resolvedAt) {
      totalMs += new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime();
      resolvedCount++;
    }
  }

  // Convert plain Records → typed arrays matching TicketCategoryCount[] / TicketPriorityCount[]
  const byCategory: TicketCategoryCount[] = Object.entries(catCounts).map(
    ([category, count]) => ({ category: category as TicketCategoryCount["category"], count })
  );

  const byPriority: TicketPriorityCount[] = Object.entries(priCounts).map(
    ([priority, count]) => ({ priority: priority as TicketPriorityCount["priority"], count })
  );

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
    closed: tickets.filter((t) => t.status === "Closed").length,
    escalated: tickets.filter((t) => t.status === "Escalated").length,
    byCategory,
    byPriority,
  };
}

export async function getDailyTicketTrend(
  days = 7
): Promise<DailyTicketCount[]> {
  const tickets = await prisma.ticket.findMany({
    select: { createdAt: true, resolvedAt: true },
  });

  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split("T")[0];

    return {
      date: dateStr,
      created: tickets.filter((t) =>
        t.createdAt.toISOString().startsWith(dateStr)
      ).length,
      resolved: tickets.filter((t) =>
        t.resolvedAt?.toISOString().startsWith(dateStr)
      ).length,
    } satisfies DailyTicketCount;
  });
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, dept: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: {
  name: string; email: string; password: string; dept: string;
}) {
  const latest = await prisma.user.findFirst({
    where: { id: { startsWith: "EMP" } },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  let nextNum = 1;
  if (latest) {
    const n = parseInt(latest.id.replace("EMP", ""), 10);
    if (!isNaN(n)) nextNum = n + 1;
  }
  const id = `EMP${String(nextNum).padStart(3, "0")}`;
  return prisma.user.create({
    data: { id, name: data.name, email: data.email, password: data.password, role: "employee", dept: data.dept },
  });
}

// ─────────────────────────────────────────────
// AI ANALYTICS
// ─────────────────────────────────────────────

export type AIAnalytics = {
  totalInteractions: number;
  uniqueUsers: number;
  avgConfidence: number;   // 0–100 %
  resolvedRate: number;    // 0–100 %
  escalationRate: number;  // 0–100 %
  fallbackRate: number;    // 0–100 %
  intentDistribution: { intent: string; count: number }[];
  dailyActivity: { date: string; interactions: number; avgConfidence: number }[];
};

export async function getAIAnalytics(days = 7): Promise<AIAnalytics> {
  const logs = await prisma.chatLog.findMany({
    select: { intent: true, confidence: true, empId: true, createdAt: true },
  });

  const total = logs.length;
  const uniqueUsers = new Set(logs.map((l) => l.empId)).size;

  const withConf = logs.filter((l) => l.confidence != null);
  const avgConfidence =
    withConf.length > 0
      ? withConf.reduce((s, l) => s + (l.confidence ?? 0), 0) / withConf.length
      : 0;

  const escalated = logs.filter((l) => l.intent === "escalate").length;
  const fallback   = logs.filter((l) => l.intent === "fallback").length;
  const resolved   = total - escalated - fallback;

  const intentMap: Record<string, number> = {};
  for (const l of logs) intentMap[l.intent] = (intentMap[l.intent] ?? 0) + 1;

  const intentDistribution = Object.entries(intentMap)
    .sort(([, a], [, b]) => b - a)
    .map(([intent, count]) => ({ intent, count }));

  const dailyActivity = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const prefix = d.toISOString().split("T")[0];
    const dayLogs = logs.filter((l) => l.createdAt.toISOString().startsWith(prefix));
    const dayConf = dayLogs.filter((l) => l.confidence != null);
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      interactions: dayLogs.length,
      avgConfidence:
        dayConf.length > 0
          ? parseFloat(
              ((dayConf.reduce((s, l) => s + (l.confidence ?? 0), 0) / dayConf.length) * 100).toFixed(1)
            )
          : 0,
    };
  });

  return {
    totalInteractions: total,
    uniqueUsers,
    avgConfidence: parseFloat((avgConfidence * 100).toFixed(1)),
    resolvedRate:   total > 0 ? parseFloat(((resolved   / total) * 100).toFixed(1)) : 0,
    escalationRate: total > 0 ? parseFloat(((escalated  / total) * 100).toFixed(1)) : 0,
    fallbackRate:   total > 0 ? parseFloat(((fallback   / total) * 100).toFixed(1)) : 0,
    intentDistribution,
    dailyActivity,
  };
}

export async function getChatbotStats(): Promise<ChatbotStats> {
  const logs = await prisma.chatLog.findMany({
    select: { intent: true, confidence: true, empId: true },
  });

  const uniqueUsers = new Set(logs.map((l) => l.empId)).size;
  const escalated = logs.filter((l) => l.intent === "escalate").length;
  const resolved = logs.filter(
    (l) => l.intent !== "escalate" && l.intent !== "fallback"
  ).length;

  const withConf = logs.filter((l) => l.confidence !== null && l.confidence !== undefined);
  const avgConfidence =
    withConf.length > 0
      ? withConf.reduce((sum, l) => sum + (l.confidence ?? 0), 0) / withConf.length
      : 0;

  const intentCounts: Record<string, number> = {};
  for (const l of logs) {
    intentCounts[l.intent] = (intentCounts[l.intent] ?? 0) + 1;
  }

  const topIntents: TopIntent[] = Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([intent, count]) => ({
      intent: intent as NLPIntentName,
      count,
    }));

  return {
    totalSessions: uniqueUsers,
    resolvedByChatbot: resolved,
    escalatedToHuman: escalated,
    avgConfidence: parseFloat(avgConfidence.toFixed(2)),
    topIntents,
  };
}

// ─────────────────────────────────────────────
// MAPPERS
// ─────────────────────────────────────────────

function mapUser(u: {
  id: string; name: string; email: string; role: string; dept: string;
}): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User["role"],
    dept: u.dept,
  };
}

function mapTicket(row: {
  id: string; empId: string; empName: string; dept: string;
  category: string; priority: string; status: string; desc: string;
  resolution: string; assignedTo: string | null;
  resolvedAt: Date | null; createdAt: Date; updatedAt: Date;
}): Ticket {
  return {
    id: row.id,
    empId: row.empId,
    empName: row.empName,
    dept: row.dept,
    category: row.category as Ticket["category"],
    priority: row.priority as Ticket["priority"],
    status: row.status as Ticket["status"],
    desc: row.desc,
    resolution: row.resolution,
    assignedTo: row.assignedTo ?? undefined,
    resolvedAt: row.resolvedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}