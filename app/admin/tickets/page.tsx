"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Filter, RefreshCw, XCircle, ChevronDown,
    Ticket, Clock, CheckCircle2, ArrowUpCircle, User,
    AlertTriangle, MoreHorizontal, Save, X,
} from "lucide-react";
import type {
    Ticket as TicketType, TicketStatus, TicketPriority,
    UpdateTicketInput, ApiResponse,
} from "@/types";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const STATUS_OPTIONS: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed", "Escalated"];
const PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

const AGENTS = [
    "Rahul Sharma", "Priya Nair", "Arun Kumar",
    "Sneha Reddy", "Vikram Singh", "Meena Iyer",
];

const STATUS_STYLE: Record<TicketStatus, string> = {
    "Open": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "In Progress": "bg-amber-500/10  text-amber-400  border-amber-500/20",
    "Resolved": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Closed": "bg-slate-500/10  text-slate-400  border-slate-500/20",
    "Escalated": "bg-red-500/10    text-red-400    border-red-500/20",
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
    "Low": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Medium": "bg-amber-500/10  text-amber-400  border-amber-500/20",
    "High": "bg-red-500/10    text-red-400    border-red-500/20",
    "Critical": "bg-red-600/20    text-red-300    border-red-500/30",
};

// ─────────────────────────────────────────────
// INLINE EDIT ROW — status, priority, assignee
// ─────────────────────────────────────────────

function InlineSelect({
    value, options, onChange, colorMap, disabled,
}: {
    value: string;
    options: string[];
    onChange: (v: string) => void;
    colorMap?: Record<string, string>;
    disabled?: boolean;
}) {
    const color = colorMap?.[value] ?? "text-slate-300 border-white/[0.1]";
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`appearance-none bg-[#0a0d14] border rounded-lg pl-2.5 pr-7 py-1.5 text-[12px] font-medium outline-none cursor-pointer transition-colors disabled:opacity-40 ${color} focus:border-indigo-500/50`}
            >
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
    );
}

// ─────────────────────────────────────────────
// TICKET ROW
// ─────────────────────────────────────────────

function TicketRow({
    ticket, onSave,
}: {
    ticket: TicketType;
    onSave: (id: string, payload: UpdateTicketInput) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<TicketStatus>(ticket.status);
    const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
    const [assignedTo, setAssigned] = useState(ticket.assignedTo ?? "");

    const isDirty =
        status !== ticket.status ||
        priority !== ticket.priority ||
        assignedTo !== (ticket.assignedTo ?? "");

    function handleCancel() {
        setStatus(ticket.status);
        setPriority(ticket.priority);
        setAssigned(ticket.assignedTo ?? "");
        setEditing(false);
    }

    async function handleSave() {
        if (!isDirty) { setEditing(false); return; }
        setSaving(true);
        await onSave(ticket.id, {
            status,
            priority,
            assignedTo: assignedTo || undefined,
        });
        setSaving(false);
        setEditing(false);
    }

    return (
        <tr className="border-b border-white/4 hover:bg-white/2 transition-colors group">

            {/* ID */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono text-[12px] text-indigo-400/80">{ticket.id}</span>
            </td>

            {/* Employee */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-400 shrink-0">
                        {ticket.empName?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12.5px] text-slate-300 font-medium truncate">{ticket.empName}</p>
                        <p className="text-[11px] text-slate-600 truncate">{ticket.dept}</p>
                    </div>
                </div>
            </td>

            {/* Description */}
            <td className="px-4 py-3 max-w-55">
                <p className="text-[12.5px] text-slate-300 truncate" title={ticket.desc}>{ticket.desc}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{ticket.category}</p>
            </td>

            {/* Status — editable */}
            <td className="px-4 py-3">
                {editing ? (
                    <InlineSelect
                        value={status}
                        options={STATUS_OPTIONS}
                        onChange={(v) => setStatus(v as TicketStatus)}
                        colorMap={STATUS_STYLE}
                    />
                ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLE[ticket.status]}`}>
                        {ticket.status}
                    </span>
                )}
            </td>

            {/* Priority — editable */}
            <td className="px-4 py-3">
                {editing ? (
                    <InlineSelect
                        value={priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(v) => setPriority(v as TicketPriority)}
                        colorMap={PRIORITY_STYLE}
                    />
                ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${PRIORITY_STYLE[ticket.priority]}`}>
                        {ticket.priority}
                    </span>
                )}
            </td>

            {/* Assigned To — editable */}
            <td className="px-4 py-3">
                {editing ? (
                    <div className="relative">
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssigned(e.target.value)}
                            className="appearance-none bg-[#0a0d14] border border-white/10 rounded-lg pl-2.5 pr-7 py-1.5 text-[12px] text-slate-300 outline-none cursor-pointer focus:border-indigo-500/50 transition-colors"
                        >
                            <option value="">Unassigned</option>
                            {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-600 shrink-0" />
                        <span className="text-[12px] text-slate-400 truncate">
                            {ticket.assignedTo || <span className="text-slate-600 italic">Unassigned</span>}
                        </span>
                    </div>
                )}
            </td>

            {/* Date */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Clock size={10} />
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                    })}
                </div>
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {saving ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />}
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[11px] font-medium hover:bg-white/9 disabled:opacity-50 transition-colors"
                            >
                                <X size={11} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <MoreHorizontal size={13} /> Edit
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────

function TableSkeleton() {
    return (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-white/4 animate-pulse">
                    {[60, 120, 180, 80, 70, 100, 80, 60].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-3.5 bg-white/5 rounded" style={{ width: w }} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ─────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────

function StatsBar({ tickets }: { tickets: TicketType[] }) {
    const counts: Record<TicketStatus, number> = {
        "Open": 0, "In Progress": 0, "Resolved": 0, "Closed": 0, "Escalated": 0,
    };
    tickets.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });

    const items = [
        { label: "Total", value: tickets.length, color: "text-slate-300" },
        { label: "Open", value: counts["Open"], color: "text-indigo-400" },
        { label: "In Progress", value: counts["In Progress"], color: "text-amber-400" },
        { label: "Resolved", value: counts["Resolved"], color: "text-emerald-400" },
        { label: "Escalated", value: counts["Escalated"], color: "text-red-400" },
    ];

    return (
        <div className="flex items-center gap-4 flex-wrap">
            {items.map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                    <span className={`text-[18px] font-bold tabular-nums ${color}`}>{value}</span>
                    <span className="text-[11px] text-slate-600">{label}</span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    // ── Fetch ────────────────────────────────────────────────
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (priorityFilter) params.set("priority", priorityFilter);
            const res = await fetch(`/api/tickets?${params}`);
            const json: ApiResponse<TicketType[]> = await res.json();
            if (json.success && json.data) setTickets(json.data);
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, priorityFilter]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // ── Toast helper ─────────────────────────────────────────
    function showToast(msg: string, ok: boolean) {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    }

    // ── PATCH handler ────────────────────────────────────────
    async function handleSave(id: string, payload: UpdateTicketInput) {
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json: ApiResponse<TicketType> = await res.json();

            if (json.success && json.data) {
                setTickets((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, ...json.data } : t))
                );
                showToast(`Ticket ${id} updated`, true);
            } else {
                showToast(json.error?.message ?? "Update failed", false);
            }
        } catch {
            showToast("Network error — update failed", false);
        }
    }

    // ── Client-side search ───────────────────────────────────
    const filtered = tickets.filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            t.id.toLowerCase().includes(q) ||
            t.empName.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.dept ?? "").toLowerCase().includes(q)
        );
    });

    const hasFilters = !!statusFilter || !!priorityFilter || !!search;

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="max-w-300 mx-auto space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">All Tickets</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Manage and update support requests</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-slate-400 bg-[#0f1117] border border-white/[0.07] hover:border-white/[0.14] hover:text-slate-200 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Stats bar */}
            {!loading && <StatsBar tickets={tickets} />}

            {/* Search + filter bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-[#0f1117] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-indigo-500/40 transition-colors">
                    <Search size={15} className="text-slate-600 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, name, description, department..."
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
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-medium border transition-colors whitespace-nowrap ${showFilters || statusFilter || priorityFilter
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-[#0f1117] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <Filter size={14} />
                    Filters
                    {(statusFilter || priorityFilter) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="flex flex-wrap items-start gap-4 p-4 bg-[#0f1117] border border-white/[0.07] rounded-xl">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Status</span>
                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${statusFilter === s
                                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                            : "bg-transparent text-slate-500 border-white/[0.07] hover:text-slate-300 hover:border-white/15"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/6 hidden sm:block self-center" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Priority</span>
                        <div className="flex flex-wrap gap-1.5">
                            {PRIORITY_OPTIONS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(priorityFilter === p ? "" : p)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${priorityFilter === p
                                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                            : "bg-transparent text-slate-500 border-white/[0.07] hover:text-slate-300 hover:border-white/15"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasFilters && (
                        <>
                            <div className="w-px h-10 bg-white/6 hidden sm:block self-center" />
                            <button
                                onClick={() => { setStatusFilter(""); setPriorityFilter(""); setSearch(""); }}
                                className="text-[12px] text-slate-500 hover:text-red-400 transition-colors self-center"
                            >
                                Clear all
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Result count */}
            {!loading && (
                <p className="text-[12px] text-slate-600">
                    {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                    {hasFilters ? " match filters" : " total"}
                </p>
            )}

            {/* Table */}
            <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.07] bg-white/2">
                                {["Ticket ID", "Employee", "Issue", "Status", "Priority", "Assigned To", "Created", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center">
                                                <Ticket size={20} className="text-slate-600" />
                                            </div>
                                            <p className="text-[13px] text-slate-500">
                                                {hasFilters ? "No tickets match your filters" : "No tickets found"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ticket) => (
                                    <TicketRow key={ticket.id} ticket={ticket} onSave={handleSave} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Toast notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-[13px] font-medium border z-50 transition-all ${toast.ok
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/15 border-red-500/30 text-red-400"
                        }`}
                >
                    {toast.ok
                        ? <CheckCircle2 size={15} />
                        : <AlertTriangle size={15} />
                    }
                    {toast.msg}
                </div>
            )}
        </div>
    );
}