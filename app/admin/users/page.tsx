"use client";

import { useState, useEffect } from "react";
import { Search, XCircle, Shield, User, Mail, Building2, Hash, RefreshCw } from "lucide-react";

type DBUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    dept: string;
    createdAt: string;
};

const DEPT_COLORS: Record<string, string> = {
    Engineering:  "bg-indigo-500/10  text-indigo-400  border-indigo-500/20",
    HR:           "bg-pink-500/10    text-pink-400    border-pink-500/20",
    Finance:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Operations:   "bg-amber-500/10   text-amber-400   border-amber-500/20",
    Marketing:    "bg-violet-500/10  text-violet-400  border-violet-500/20",
    Sales:        "bg-sky-500/10     text-sky-400     border-sky-500/20",
    Legal:        "bg-orange-500/10  text-orange-400  border-orange-500/20",
    "IT Support": "bg-teal-500/10    text-teal-400    border-teal-500/20",
};

function UserRow({ user }: { user: DBUser }) {
    const isAdmin = user.role === "admin";
    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const deptColor = DEPT_COLORS[user.dept] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";

    return (
        <tr className="border-b border-white/4 hover:bg-white/2 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${isAdmin ? "bg-amber-500/15 border border-amber-500/25 text-amber-400" : "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400"}`}>
                        {initials}
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-slate-200">{user.name}</p>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                            <Hash size={9} />{user.id}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[12.5px] text-slate-400">
                    <Mail size={12} className="text-slate-600 shrink-0" />
                    {user.email}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${deptColor}`}>
                    <Building2 size={10} />{user.dept}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${isAdmin ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                    {isAdmin ? <Shield size={10} /> : <User size={10} />}
                    {isAdmin ? "Admin" : "Employee"}
                </span>
            </td>
            <td className="px-4 py-3 text-[11px] text-slate-600">
                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </td>
        </tr>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"" | "employee" | "admin">("");
    const [deptFilter, setDeptFilter] = useState("");

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const json = await res.json();
            if (json.success && json.data) setUsers(json.data);
        } catch (e) {
            console.error("Failed to fetch users", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchUsers(); }, []);

    const allDepts = Array.from(new Set(users.map((u) => u.dept))).sort();

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
        const matchRole = !roleFilter || u.role === roleFilter;
        const matchDept = !deptFilter || u.dept === deptFilter;
        return matchSearch && matchRole && matchDept;
    });

    const totalEmployees = users.filter((u) => u.role === "employee").length;
    const totalAdmins    = users.filter((u) => u.role === "admin").length;
    const hasFilters = !!search || !!roleFilter || !!deptFilter;

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Users</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">EmpowerTech Solutions · Chennai</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-slate-400 bg-[#0f1117] border border-white/[0.07] hover:border-white/[0.14] hover:text-slate-200 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Users",  value: users.length,   icon: User,   color: "bg-indigo-500/15 text-indigo-400" },
                    { label: "Employees",    value: totalEmployees,  icon: User,   color: "bg-slate-500/15  text-slate-400" },
                    { label: "Admins",       value: totalAdmins,     icon: Shield, color: "bg-amber-500/15  text-amber-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={17} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-100 tabular-nums leading-none">{value}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-50 flex items-center gap-2 bg-[#0f1117] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-indigo-500/40 transition-colors">
                    <Search size={15} className="text-slate-600 shrink-0" />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email or ID..."
                        className="flex-1 bg-transparent text-[13px] text-slate-200 placeholder:text-slate-600 outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400 transition-colors">
                            <XCircle size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {(["", "employee", "admin"] as const).map((r) => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-3 py-2 rounded-xl text-[12px] font-medium border transition-colors ${roleFilter === r ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-[#0f1117] text-slate-500 border-white/[0.07] hover:text-slate-300 hover:border-white/[0.14]"}`}>
                            {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                        className="appearance-none bg-[#0f1117] border border-white/[0.07] rounded-xl pl-3 pr-8 py-2.5 text-[12px] text-slate-400 outline-none cursor-pointer hover:border-white/[0.14] focus:border-indigo-500/40 transition-colors">
                        <option value="">All Departments</option>
                        {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Building2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600" />
                </div>

                {hasFilters && (
                    <button onClick={() => { setSearch(""); setRoleFilter(""); setDeptFilter(""); }}
                        className="text-[12px] text-slate-500 hover:text-red-400 transition-colors px-1">
                        Clear
                    </button>
                )}
            </div>

            <p className="text-[12px] text-slate-600">{filtered.length} user{filtered.length !== 1 ? "s" : ""}{hasFilters ? " match filters" : ""}</p>

            <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.07] bg-white/2">
                                {["User", "Email", "Department", "Role", "Joined"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/4 animate-pulse">
                                        {[140, 180, 100, 80, 80].map((w, j) => (
                                            <td key={j} className="px-4 py-3"><div className="h-3.5 bg-white/5 rounded" style={{ width: w }} /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16 text-center">
                                        <p className="text-[13px] text-slate-500">{hasFilters ? "No users match your filters" : "No users found"}</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => <UserRow key={user.id} user={user} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
