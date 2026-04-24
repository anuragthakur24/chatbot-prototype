"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LogOut, Menu, Bot } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { user, setUser } = useStore();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setUser(null);
    router.push("/");
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-[#0f1117] border-b border-white/[0.07] shrink-0 z-50">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/6 hover:text-slate-200 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot size={17} />
          </div>
          <span className="text-[15px] font-semibold text-slate-100 tracking-tight">
            EmpowerTech
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* User info */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[13px] font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-slate-200">{user?.name ?? "User"}</span>
            <span className="text-[11px] text-slate-500">{user?.dept}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}