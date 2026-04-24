"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Navbar from "@/components/layout/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useStore();
    const router = useRouter();

    useEffect(() => { setHydrated(true); }, []);

    useEffect(() => {
        if (!hydrated) return;
        if (!user) { router.push("/"); return; }
        if (user.role !== "admin") router.push("/dashboard/chat");
    }, [hydrated, user, router]);

    if (!hydrated || !user || user.role !== "admin") return null;

    return (
        <div className="flex flex-col h-dvh overflow-hidden bg-[#0a0d14]">
            <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-6 bg-[#0a0d14]"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
