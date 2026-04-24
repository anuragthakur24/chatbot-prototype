"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
    PlusCircle, CheckCircle2, AlertCircle, ChevronDown, Loader2,
    Tag, AlignLeft, Zap, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { TicketCategory, TicketPriority } from "@/types";

// ─────────────────────────────────────────────
// OPTIONS
// ─────────────────────────────────────────────

const CATEGORIES: { value: TicketCategory; label: string; emoji: string }[] = [
    { value: "Password Reset", label: "Password Reset", emoji: "🔑" },
    { value: "Software Help", label: "Software Help", emoji: "💻" },
    { value: "Network Issue", label: "Network Issue", emoji: "🌐" },
    { value: "Email Issue", label: "Email Issue", emoji: "📧" },
    { value: "Hardware Issue", label: "Hardware Issue", emoji: "🖥️" },
    { value: "Access Permission", label: "Access Permission", emoji: "🔐" },
    { value: "Working Hours", label: "Working Hours", emoji: "🕐" },
    { value: "Escalation", label: "Escalation", emoji: "🔺" },
    { value: "Other", label: "Other", emoji: "📋" },
];

const PRIORITIES: {
    value: TicketPriority;
    label: string;
    desc: string;
    color: string;
    dot: string;
}[] = [
        { value: "Low", label: "Low", desc: "Non-urgent, can wait", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
        { value: "Medium", label: "Medium", desc: "Affects productivity", color: "border-amber-500/30  bg-amber-500/10  text-amber-400", dot: "bg-amber-400" },
        { value: "High", label: "High", desc: "Blocking work", color: "border-red-500/30    bg-red-500/10    text-red-400", dot: "bg-red-400" },
        { value: "Critical", label: "Critical", desc: "System down / team impacted", color: "border-red-600/40    bg-red-600/15    text-red-300", dot: "bg-red-300" },
    ];

// ─────────────────────────────────────────────
// SELECT COMPONENT
// ─────────────────────────────────────────────

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; emoji?: string }[];
    placeholder: string;
    icon: React.ElementType;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-300 flex items-center gap-1.5">
                <Icon size={14} className="text-slate-500" />
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none bg-[#0f1117] border rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none transition-colors pr-9 ${error
                            ? "border-red-500/50 text-red-300"
                            : value
                                ? "border-white/12 text-slate-200"
                                : "border-white/[0.07] text-slate-500"
                        } focus:border-indigo-500/50`}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.emoji ? `${o.emoji} ${o.label}` : o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            {error && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────
// PRIORITY PICKER
// ─────────────────────────────────────────────

function PriorityPicker({
    value,
    onChange,
    error,
}: {
    value: TicketPriority | "";
    onChange: (v: TicketPriority) => void;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-300 flex items-center gap-1.5">
                <Zap size={14} className="text-slate-500" />
                Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                    <button
                        key={p.value}
                        type="button"
                        onClick={() => onChange(p.value)}
                        className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${value === p.value
                                ? p.color
                                : "border-white/[0.07] bg-[#0f1117] text-slate-500 hover:border-white/15 hover:text-slate-300"
                            }`}
                    >
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${value === p.value ? p.dot : "bg-slate-600"}`} />
                            <span className="text-[13px] font-medium">{p.label}</span>
                        </div>
                        <span className="text-[10px] opacity-70 leading-tight">{p.desc}</span>
                    </button>
                ))}
            </div>
            {error && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function RaiseTicketPage() {
    const router = useRouter();
    const { user, addTicket } = useStore();

    const [category, setCategory] = useState<TicketCategory | "">("");
    const [priority, setPriority] = useState<TicketPriority | "">("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Validation ─────────────────────────────────────────
    function validate() {
        const e: Record<string, string> = {};
        if (!category) e.category = "Please select a category";
        if (!priority) e.priority = "Please select a priority";
        if (!desc.trim()) e.desc = "Please describe your issue";
        if (desc.trim().length < 15) e.desc = "Please provide more detail (min 15 characters)";
        return e;
    }

    // ── Submit ─────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, priority, desc: desc.trim() }),
            });
            const json = await res.json();

            if (json.success && json.data) {
                addTicket(json.data);
                setSuccess(json.data.id);
                // Redirect to tickets list after 2s
                setTimeout(() => router.push("/dashboard/tickets"), 2000);
            } else {
                setErrors({ form: json.error?.message ?? "Something went wrong. Please try again." });
            }
        } catch {
            setErrors({ form: "Network error. Please check your connection." });
        } finally {
            setLoading(false);
        }
    }

    // ── Success state ──────────────────────────────────────
    if (success) {
        return (
            <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100 mb-1">Ticket Raised!</h2>
                <p className="text-[13.5px] text-slate-400 mb-2">
                    Your ticket <span className="font-mono text-indigo-400">{success}</span> has been submitted.
                </p>
                <p className="text-[12px] text-slate-600">Redirecting to your tickets...</p>
                <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-[grow_2s_ease-in-out_forwards]" style={{ width: "100%", transformOrigin: "left", animation: "none", transition: "width 2s linear" }} />
                </div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/dashboard/tickets"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft size={17} />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Raise a Ticket</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Describe your IT issue and our team will assist you</p>
                </div>
            </div>

            {/* Form card */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
            >
                {/* Prefilled user info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-[13px] font-semibold shrink-0">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-slate-200">{user?.name}</p>
                        <p className="text-[11px] text-slate-500">{user?.dept} · {user?.id}</p>
                    </div>
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        Employee
                    </span>
                </div>

                {/* Category */}
                <SelectField
                    label="Category"
                    value={category}
                    onChange={(v) => { setCategory(v as TicketCategory); setErrors((e) => ({ ...e, category: "" })); }}
                    options={CATEGORIES}
                    placeholder="Select issue category"
                    icon={Tag}
                    error={errors.category}
                />

                {/* Priority */}
                <PriorityPicker
                    value={priority}
                    onChange={(v) => { setPriority(v); setErrors((e) => ({ ...e, priority: "" })); }}
                    error={errors.priority}
                />

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-300 flex items-center gap-1.5">
                        <AlignLeft size={14} className="text-slate-500" />
                        Description
                    </label>
                    <textarea
                        value={desc}
                        onChange={(e) => { setDesc(e.target.value); setErrors((er) => ({ ...er, desc: "" })); }}
                        placeholder="Describe your issue in detail — what happened, when it started, and any steps you already tried..."
                        rows={5}
                        className={`bg-[#0a0d14] border rounded-xl px-3.5 py-3 text-[13.5px] text-slate-200 placeholder:text-slate-600 outline-none resize-none transition-colors leading-relaxed ${errors.desc ? "border-red-500/50" : "border-white/[0.07] focus:border-indigo-500/50"
                            }`}
                    />
                    <div className="flex items-center justify-between">
                        {errors.desc
                            ? <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.desc}</p>
                            : <span />
                        }
                        <span className={`text-[11px] ml-auto ${desc.length < 15 ? "text-slate-600" : "text-slate-500"}`}>
                            {desc.length} chars
                        </span>
                    </div>
                </div>

                {/* Form-level error */}
                {errors.form && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[13px]">
                        <AlertCircle size={15} className="shrink-0" />
                        {errors.form}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <Link
                        href="/dashboard/tickets"
                        className="flex-1 text-center py-2.5 rounded-xl border border-white/[0.07] text-[13.5px] text-slate-400 hover:bg-white/4 hover:text-slate-200 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-[13.5px] font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                        ) : (
                            <><PlusCircle size={15} /> Raise Ticket</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}