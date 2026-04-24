// ============================================================
// app/api/admin/stats/route.ts
// GET /api/admin/stats — full admin dashboard data (admin only)
// ============================================================

import { NextResponse } from "next/server";
import { getTicketStats, getDailyTicketTrend, getChatbotStats } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, AdminDashboardData } from "@/types";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Please log in." } },
                { status: 401 }
            );
        }
        if (user.role !== "admin") {
            return NextResponse.json(
                { success: false, data: null, error: { code: "FORBIDDEN", message: "Admin access required." } },
                { status: 403 }
            );
        }

        const [ticketStats, rawDailyTrend, chatbotStats] = await Promise.all([
            getTicketStats(),
            getDailyTicketTrend(7),
            getChatbotStats(),
        ]);

        // Format dates for chart display
        const dailyTicketCounts = rawDailyTrend.map((d) => ({
            ...d,
            date: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
            }),
        }));

        const data: AdminDashboardData = { ticketStats, chatbotStats, dailyTicketCounts };
        const res: ApiResponse<AdminDashboardData> = { success: true, data, error: null };
        return NextResponse.json(res, { status: 200 });

    } catch (error) {
        console.error("[GET /api/admin/stats]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}
