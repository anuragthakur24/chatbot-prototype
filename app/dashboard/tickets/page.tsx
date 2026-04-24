"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import {
    Ticket, Search, Filter, RefreshCw, PlusCircle,
    Clock, CheckCircle2, AlertCircle, XCircle, ArrowUpCircle, Copy, Check
} from "lucide-react";
import Link from "next/link";
import type { Ticket as TicketType, TicketStatus, TicketPriority } from "@/types";

// ─────────────────────────────────────────────
// BADGE HELPERS
// ─────────────────────────────────────────────

const STATUS_STYLES: Record<TicketStatus, { label: string; className: string; icon: React.ReactNode }> = {
    "Open": { label: "Open", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: <Clock size={11} /> },
    "In Progress": { label: "In Progress", className: "bg-amber-500/10  text-amber-400  border-amber-500/20", icon: <RefreshCw size={11} /> },
    "Resolved": { label: "Resolved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 size={11} /> },
    "Closed": { label: "Closed", className: "bg-slate-500/10  text-slate-400  border-slate-500/20", icon: <XCircle size={11} /> },
    "Escalated": { label: "Escalated", className: "bg-red-500/10    text-red-400    border-red-500/20", icon: <ArrowUpCircle size={11} /> },
};

const PRIORITY_STYLES: Record<TicketPriority, { className: string }> = {
    "Low": { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    "Medium": { className: "bg-amber-500/10  text-amber-400  border-amber-500/20" },
    "High": { className: "bg-red-500/10    text-red-400    border-red-500/20" },
    "Critical": { className: "bg-red-600/20    text-red-300    border-red-500/30" },
};

function StatusBadge({ status }: { status: TicketStatus }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES["Open"];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.className}`}>
            {s.icon}{s.label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
    const p = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES["Medium"];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${p.className}`}>
            {priority}
        </span>
    );
}

// ─────────────────────────────────────────────
// TICKET CARD (mobile)
// ─────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: TicketType }) {
    const [copied, setCopied] = useState(false);

    function handleCopy(e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(ticket.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-indigo-400/70">{ticket.id}</span>
                    <button
                        onClick={handleCopy}
                        title="Copy ticket ID"
                        className="flex items-center justify-center w-5 h-5 rounded text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                        {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                    <PriorityBadge priority={ticket.priority} />
                </div>
                <StatusBadge status={ticket.status} />
            </div>
            <p className="text-[13.5px] text-slate-200 font-medium line-clamp-1 mb-1">{ticket.desc}</p>
            <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-500">{ticket.category}</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Clock size={10} />
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function TicketSkeleton() {
    return (
        <div className="animate-pulse bg-[#0f1117] border border-white/[0.07] rounded-xl p-4">
            <div className="flex justify-between mb-3">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-4 w-16 bg-white/5 rounded-full" />
            </div>
            <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
            <div className="h-3 w-1/3 bg-white/5 rounded" />
        </div>
    );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Ticket size={24} className="text-indigo-400/60" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-300 mb-1">
                {filtered ? "No tickets match your filters" : "No tickets yet"}
            </h3>
            <p className="text-[13px] text-slate-600 max-w-xs mb-5">
                {filtered
                    ? "Try adjusting your filters or search query."
                    : "Raise your first support ticket and we'll get right on it."}
            </p>
            {!filtered && (
                <Link
                    href="/dashboard/raise"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-[13px] font-medium hover:bg-indigo-500 transition-colors"
                >
                    <PlusCircle size={15} />
                    Raise a Ticket
                </Link>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const STATUS_OPTIONS: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed", "Escalated"];
const PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

export default function TicketsPage() {
    const { user, tickets, setTickets } = useStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
    const [showFilters, setShowFilters] = useState(false);

    // ── Fetch tickets ──────────────────────────────────────
    async function fetchTickets() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (priorityFilter) params.set("priority", priorityFilter);

            const res = await fetch(`/api/tickets?${params}`);
            const json = await res.json();
            if (json.success) setTickets(json.data ?? []);
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchTickets(); }, [statusFilter, priorityFilter]); // eslint-disable-line

    // ── Client-side search filter ──────────────────────────
    const filtered = tickets.filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            t.id.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    });

    const hasFilters = !!statusFilter || !!priorityFilter || !!search;

    // ── Stats row ──────────────────────────────────────────
    const stats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === "Open").length,
        inProgress: tickets.filter((t) => t.status === "In Progress").length,
        resolved: tickets.filter((t) => t.status === "Resolved").length,
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto">

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">My Tickets</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                        {user?.name} · {user?.dept}
                    </p>
                </div>
                <Link
                    href="/dashboard/raise"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-[13px] font-medium hover:bg-indigo-500 transition-colors active:scale-95"
                >
                    <PlusCircle size={15} />
                    <span className="hidden sm:inline">New Ticket</span>
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: "Total", value: stats.total, color: "text-slate-300" },
                    { label: "Open", value: stats.open, color: "text-indigo-400" },
                    { label: "In Progress", value: stats.inProgress, color: "text-amber-400" },
                    { label: "Resolved", value: stats.resolved, color: "text-emerald-400" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#0f1117] border border-white/[0.07] rounded-xl p-3 text-center">
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Search + filter bar */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 bg-[#0f1117] border border-white/[0.07] rounded-xl px-3 py-2 focus-within:border-indigo-500/40 transition-colors">
                    <Search size={15} className="text-slate-600 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, description or category..."
                        className="flex-1 bg-transparent text-[13px] text-slate-200 placeholder:text-slate-600 outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400 transition-colors">
                            <XCircle size={14} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters((f) => !f)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-colors ${showFilters || statusFilter || priorityFilter
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-[#0f1117] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <Filter size={14} />
                    <span className="hidden sm:inline">Filters</span>
                    {(statusFilter || priorityFilter) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                </button>

                <button
                    onClick={fetchTickets}
                    title="Refresh"
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0f1117] border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/12 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filter dropdowns */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-[#0f1117] border border-white/[0.07] rounded-xl">
                    {/* Status filter */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Status</span>
                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${statusFilter === s
                                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                            : "bg-transparent text-slate-500 border-white/[0.07] hover:border-white/15 hover:text-slate-300"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/[0.07] hidden sm:block" />

                    {/* Priority filter */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Priority</span>
                        <div className="flex flex-wrap gap-1.5">
                            {PRIORITY_OPTIONS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(priorityFilter === p ? "" : p)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${priorityFilter === p
                                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                            : "bg-transparent text-slate-500 border-white/[0.07] hover:border-white/15 hover:text-slate-300"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasFilters && (
                        <>
                            <div className="w-px h-8 bg-white/[0.07] hidden sm:block" />
                            <button
                                onClick={() => { setStatusFilter(""); setPriorityFilter(""); setSearch(""); }}
                                className="text-[12px] text-slate-500 hover:text-red-400 transition-colors"
                            >
                                Clear all
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Result count */}
            {!loading && (
                <p className="text-[12px] text-slate-600 mb-3">
                    {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                    {hasFilters ? " match your filters" : ""}
                </p>
            )}

            {/* Ticket list */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map((i) => <TicketSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState filtered={hasFilters} />
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
}