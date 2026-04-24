import { NextResponse } from "next/server";
import { getAIAnalytics } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse } from "@/types";
import type { AIAnalytics } from "@/lib/db";

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

        const data = await getAIAnalytics(7);
        const res: ApiResponse<AIAnalytics> = { success: true, data, error: null };
        return NextResponse.json(res, { status: 200 });

    } catch (error) {
        console.error("[GET /api/admin/ai-stats]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}
