"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareText, Ticket, PlusCircle } from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquareText },
    { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
    { href: "/dashboard/raise", label: "Raise Ticket", icon: PlusCircle },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 top-14 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                aria-label="Main navigation"
                className={[
                    "fixed top-14 left-0 bottom-0 z-45 w-55 flex flex-col",
                    "bg-[#0f1117] border-r border-white/[0.07] px-2 py-3",
                    "transition-transform duration-200 md:static md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-2 pb-2">
                    Employee Portal
                </p>

                <nav className="flex-1">
                    <ul role="list" className="flex flex-col gap-0.5">
                        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href || pathname.startsWith(href + "/");
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        onClick={onClose}
                                        aria-current={active ? "page" : undefined}
                                        className={[
                                            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors",
                                            active
                                                ? "bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                                        ].join(" ")}
                                    >
                                        <Icon size={17} aria-hidden="true" />
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="mt-auto pt-3 border-t border-white/[0.07] px-2">
                    <p className="text-[12px] font-medium text-slate-500">EmpowerTech Solutions</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">IT Support Portal</p>
                </div>
            </aside>
        </>
    );
}