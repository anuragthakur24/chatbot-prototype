"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useStore();
    const router = useRouter();

    useEffect(() => { setHydrated(true); }, []);

    useEffect(() => {
        if (hydrated && user === null) router.push("/");
    }, [hydrated, user, router]);

    if (!hydrated || !user) return null;

    const SidebarComponent = user.role === "admin" ? AdminSidebar : Sidebar;

    return (
        <div className="flex flex-col h-dvh overflow-hidden bg-[#0a0d14]">
            {/* Navbar */}
            <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <SidebarComponent
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                {/* Main */}
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