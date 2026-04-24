"use client";

import { useState, useEffect } from "react";
import {
    Ticket, CheckCircle2, Clock, AlertTriangle,
    TrendingUp, TrendingDown, Bot, Users, ArrowUpRight,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type {
    AdminDashboardData, NLPIntentName,
} from "@/types";


// ─────────────────────────────────────────────
// INTENT → DISPLAY LABEL MAP
// ─────────────────────────────────────────────

const INTENT_LABELS: Record<NLPIntentName, string> = {
    greeting: "Greeting",
    password_reset: "Password Reset",
    raise_ticket: "Raise Ticket",
    ticket_status: "Ticket Status",
    software_help: "Software Help",
    network: "Network Issue",
    email: "Email Issue",
    hardware: "Hardware Issue",
    access_permission: "Access Permission",
    working_hours: "Working Hours",
    escalate: "Escalation",
    thanks: "Thanks",
    bye: "Goodbye",
    fallback: "Fallback",
};

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

const C = {
    indigo: "#6366f1",
    emerald: "#34d399",
    amber: "#fbbf24",
    red: "#f87171",
    slate: "#64748b",
    violet: "#a78bfa",
};

const STATUS_PIE_COLORS = [C.indigo, C.amber, C.emerald, C.slate, C.red];

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1c2235] border border-white/10 rounded-xl px-3 py-2 shadow-xl text-[12px]">
            {label && <p className="text-slate-400 mb-1.5 font-medium">{label}</p>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-400">{p.name}:</span>
                    <span className="text-slate-200 font-semibold">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────

function KPICard({
    title, value, subtitle, icon: Icon, iconColor, trend, trendValue,
}: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
    trend?: "up" | "down";
    trendValue?: string;
}) {
    return (
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-3 hover:border-white/12 transition-colors">
            <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
                    <Icon size={18} />
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${trend === "up"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                        {trend === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[28px] font-bold text-slate-100 leading-none tracking-tight tabular-nums">
                    {value}
                </p>
                <p className="text-[13px] font-medium text-slate-400 mt-1">{title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5">
            <h2 className="text-[14px] font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block" />
                {title}
            </h2>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-36 bg-[#0f1117] border border-white/[0.07] rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-72 bg-[#0f1117] border border-white/[0.07] rounded-2xl" />
                <div className="h-72 bg-[#0f1117] border border-white/[0.07] rounded-2xl" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((j) => { if (j.success && j.data) setData(j.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 space-y-2">
                    <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-60 bg-white/5 rounded animate-pulse" />
                </div>
                <DashboardSkeleton />
            </div>
        );
    }

    if (!data) return null;

    const { ticketStats, chatbotStats, dailyTicketCounts } = data;

    const aiResolutionRate = Math.round(
        (chatbotStats.resolvedByChatbot / chatbotStats.totalSessions) * 100
    );

    // Map topIntents → chart-friendly shape with display labels
    const intentChartData = chatbotStats.topIntents.map((item) => ({
        label: INTENT_LABELS[item.intent],
        count: item.count,
    }));

    // Status pie data
    const statusPieData = [
        { name: "Open", value: ticketStats.open },
        { name: "In Progress", value: ticketStats.inProgress },
        { name: "Resolved", value: ticketStats.resolved },
        { name: "Closed", value: ticketStats.closed },
        { name: "Escalated", value: ticketStats.escalated },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Admin Dashboard</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">EmpowerTech IT Support Overview</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] text-emerald-400 font-medium">Live</span>
                </div>
            </div>

            {/* ── Ticket KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Tickets" value={ticketStats.total}
                    subtitle="All time"
                    icon={Ticket} iconColor="bg-indigo-500/15 text-indigo-400"
                />
                <KPICard
                    title="Open Tickets" value={ticketStats.open}
                    subtitle="Awaiting action"
                    icon={Clock} iconColor="bg-amber-500/15 text-amber-400"
                />
                <KPICard
                    title="Resolved" value={ticketStats.resolved}
                    subtitle="All time"
                    icon={CheckCircle2} iconColor="bg-emerald-500/15 text-emerald-400"
                />
                <KPICard
                    title="Escalated" value={ticketStats.escalated}
                    subtitle="Need attention"
                    icon={AlertTriangle} iconColor="bg-red-500/15 text-red-400"
                />
            </div>

            {/* ── AI KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="AI Sessions" value={chatbotStats.totalSessions}
                    subtitle="Unique users who chatted"
                    icon={Bot} iconColor="bg-violet-500/15 text-violet-400"
                />
                <KPICard
                    title="AI Resolved" value={chatbotStats.resolvedByChatbot}
                    subtitle="Without human agent"
                    icon={CheckCircle2} iconColor="bg-emerald-500/15 text-emerald-400"
                />
                <KPICard
                    title="Escalated to Human" value={chatbotStats.escalatedToHuman}
                    subtitle="Required live agent"
                    icon={Users} iconColor="bg-amber-500/15 text-amber-400"
                />
                <KPICard
                    title="AI Confidence" value={`${Math.round(chatbotStats.avgConfidence * 100)}%`}
                    subtitle="Average NLP accuracy"
                    icon={ArrowUpRight} iconColor="bg-indigo-500/15 text-indigo-400"
                />
            </div>

            {/* ── Charts row 1: Area + Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2">
                    <Section title="Ticket Trend — Last 7 Days">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={dailyTicketCounts} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.indigo} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.emerald} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                                <Area type="monotone" dataKey="created" name="Created" stroke={C.indigo} fill="url(#gCreated)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="resolved" name="Resolved" stroke={C.emerald} fill="url(#gResolved)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Section>
                </div>

                <Section title="Status Breakdown">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={statusPieData}
                                cx="50%" cy="50%"
                                innerRadius={55} outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {STATUS_PIE_COLORS.map((color, i) => (
                                    <Cell key={i} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Charts row 2: Category + AI Intents ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <Section title="Tickets by Category">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={ticketStats.byCategory}
                            layout="vertical"
                            margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                type="category" dataKey="category"
                                tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                                width={110}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="count" name="Tickets" fill={C.indigo} radius={[0, 4, 4, 0]} maxBarSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Top AI Chatbot Intents">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={intentChartData}
                            layout="vertical"
                            margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                type="category" dataKey="label"
                                tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                                width={110}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="count" name="Sessions" fill={C.violet} radius={[0, 4, 4, 0]} maxBarSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Priority breakdown ── */}
            <Section title="Tickets by Priority">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ticketStats.byPriority.map(({ priority, count }) => {
                        const styles: Record<string, string> = {
                            Low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                            Medium: "bg-amber-500/10  border-amber-500/20  text-amber-400",
                            High: "bg-red-500/10    border-red-500/20    text-red-400",
                            Critical: "bg-red-600/15    border-red-600/30    text-red-300",
                        };
                        const pct = Math.round((count / ticketStats.total) * 100);
                        return (
                            <div
                                key={priority}
                                className={`flex flex-col items-center p-3 rounded-xl border text-center ${styles[priority]}`}
                            >
                                <span className="text-2xl font-bold tabular-nums">{count}</span>
                                <span className="text-[12px] font-medium mt-0.5">{priority}</span>
                                <div className="w-full h-1 rounded-full bg-current/20 mt-2">
                                    <div className="h-full rounded-full bg-current" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] opacity-70 mt-1">{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            </Section>

        </div>
    );
}