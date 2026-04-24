// ============================================================
// app/api/auth/route.ts
// POST   /api/auth → login
// DELETE /api/auth → logout
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/db";
import { signToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import type { ApiResponse, AuthPayload, LoginCredentials } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const { email, password }: LoginCredentials = await req.json();

        if (!email || !password) {
            const res: ApiResponse<null> = {
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
            };
            return NextResponse.json(res, { status: 400 });
        }

        const user = await validateCredentials(email, password);
        if (!user) {
            const res: ApiResponse<null> = {
                success: false, data: null,
                error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
            };
            return NextResponse.json(res, { status: 401 });
        }

        const token = await signToken(user);
        await setAuthCookie(token);

        const res: ApiResponse<AuthPayload> = { success: true, data: { user, token }, error: null };
        return NextResponse.json(res, { status: 200 });

    } catch (error) {
        console.error("[POST /api/auth]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    await clearAuthCookie();
    return NextResponse.json({ success: true, data: null, error: null }, { status: 200 });
}