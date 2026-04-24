"use client";

import { useState, useEffect } from "react";
import { Bot, Users, Target, AlertTriangle, HelpCircle, CheckCircle2, RefreshCw, MessageSquare } from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import type { AIAnalytics } from "@/lib/db";

const C = {
    indigo:  "#6366f1",
    emerald: "#34d399",
    amber:   "#fbbf24",
    red:     "#f87171",
    violet:  "#a78bfa",
    sky:     "#38bdf8",
};

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

function Section({ title, children, className = "" }: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 ${className}`}>
            <h2 className="text-[14px] font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block" />
                {title}
            </h2>
            {children}
        </div>
    );
}

function KPICard({ title, value, subtitle, icon: Icon, iconColor }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
}) {
    return (
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconColor}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[24px] font-bold text-slate-100 tabular-nums leading-none">{value}</p>
                <p className="text-[12.5px] text-slate-400 mt-1">{title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot size={22} className="text-indigo-400" />
            </div>
            <p className="text-slate-300 font-medium text-[14px]">No chat data yet</p>
            <p className="text-slate-600 text-[12px] max-w-xs">
                AI analytics will appear here once users start chatting with the bot.
            </p>
        </div>
    );
}

export default function AdminAIAnalyticsPage() {
    const [data, setData] = useState<AIAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/ai-stats");
            const json = await res.json();
            if (json.success && json.data) setData(json.data);
        } catch (e) {
            console.error("Failed to fetch AI analytics", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    const isEmpty = !loading && (!data || data.totalInteractions === 0);

    return (
        <div className="max-w-6xl mx-auto space-y-5">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">AI Analytics</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Real chatbot performance data · Last 7 days</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-slate-400 bg-[#0f1117] border border-white/[0.07] hover:border-white/[0.14] hover:text-slate-200 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {isEmpty ? (
                <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl">
                    <EmptyState />
                </div>
            ) : (
                <>
                    {/* KPI row */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <KPICard
                            title="Total Interactions"
                            value={loading ? "—" : (data?.totalInteractions ?? 0)}
                            subtitle="All-time chat messages"
                            icon={MessageSquare}
                            iconColor="bg-indigo-500/15 text-indigo-400"
                        />
                        <KPICard
                            title="Unique Users"
                            value={loading ? "—" : (data?.uniqueUsers ?? 0)}
                            subtitle="Distinct employees"
                            icon={Users}
                            iconColor="bg-sky-500/15 text-sky-400"
                        />
                        <KPICard
                            title="Avg Confidence"
                            value={loading ? "—" : `${data?.avgConfidence ?? 0}%`}
                            subtitle="NLP classification score"
                            icon={Target}
                            iconColor="bg-violet-500/15 text-violet-400"
                        />
                        <KPICard
                            title="Resolved Rate"
                            value={loading ? "—" : `${data?.resolvedRate ?? 0}%`}
                            subtitle="Handled without escalation"
                            icon={CheckCircle2}
                            iconColor="bg-emerald-500/15 text-emerald-400"
                        />
                        <KPICard
                            title="Escalation Rate"
                            value={loading ? "—" : `${data?.escalationRate ?? 0}%`}
                            subtitle="Sent to human agent"
                            icon={AlertTriangle}
                            iconColor="bg-amber-500/15 text-amber-400"
                        />
                        <KPICard
                            title="Fallback Rate"
                            value={loading ? "—" : `${data?.fallbackRate ?? 0}%`}
                            subtitle="Unrecognised intent"
                            icon={HelpCircle}
                            iconColor="bg-red-500/15 text-red-400"
                        />
                    </div>

                    {/* Daily activity */}
                    <Section title="Daily Activity — Last 7 Days">
                        {loading ? (
                            <div className="h-[210px] animate-pulse bg-white/3 rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={210}>
                                <AreaChart data={data?.dailyActivity ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gCon" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={C.violet} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                                    <Area type="monotone" dataKey="interactions" name="Interactions" stroke={C.indigo} fill="url(#gI)" strokeWidth={2} dot={false} />
                                    <Area type="monotone" dataKey="avgConfidence" name="Avg Confidence %" stroke={C.violet} fill="url(#gCon)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Section>

                    {/* Intent distribution */}
                    <Section title="Intent Distribution">
                        {loading ? (
                            <div className="h-[260px] animate-pulse bg-white/3 rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart
                                    data={data?.intentDistribution ?? []}
                                    layout="vertical"
                                    margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        type="category" dataKey="intent"
                                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        axisLine={false} tickLine={false} width={120}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Bar dataKey="count" name="Messages" fill={C.indigo} radius={[0, 4, 4, 0]} maxBarSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Section>
                </>
            )}
        </div>
    );
}
