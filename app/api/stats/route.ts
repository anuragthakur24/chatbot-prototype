// ============================================================
// app/api/stats/route.ts
// GET /api/stats — admin-only summary counts
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse } from "@/types";

type StatsData = {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    chatLogs: number;
};

export async function GET() {
    try {
        // ── Auth guard — admin only ──────────────────────────────
        const user = await getCurrentUser();
        if (!user) {
            const res: ApiResponse<null> = {
                success: false,
                data: null,
                error: { code: "UNAUTHORIZED", message: "Please log in." },
            };
            return NextResponse.json(res, { status: 401 });
        }

        if (user.role !== "admin") {
            const res: ApiResponse<null> = {
                success: false,
                data: null,
                error: { code: "FORBIDDEN", message: "Admin access required." },
            };
            return NextResponse.json(res, { status: 403 });
        }

        // ── Queries ──────────────────────────────────────────────
        const [total, open, inProgress, resolved, chatLogs] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: "Open" } }),
            prisma.ticket.count({ where: { status: "In Progress" } }),
            prisma.ticket.count({ where: { status: "Resolved" } }),
            prisma.chatLog.count(),
        ]);

        const res: ApiResponse<StatsData> = {
            success: true,
            data: { total, open, inProgress, resolved, chatLogs },
            error: null,
            meta: { total },
        };
        return NextResponse.json(res, { status: 200 });

    } catch (error) {
        console.error("[GET /api/stats]", error);
        const res: ApiResponse<null> = {
            success: false,
            data: null,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong." },
        };
        return NextResponse.json(res, { status: 500 });
    }
}