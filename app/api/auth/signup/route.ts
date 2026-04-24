import { NextRequest, NextResponse } from "next/server";
import { prisma, createUser } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import type { ApiResponse, AuthPayload } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, dept } = await req.json();

        if (!name?.trim() || !email?.trim() || !password?.trim() || !dept?.trim()) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "VALIDATION_ERROR", message: "All fields are required." } },
                { status: 400 }
            );
        }
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters.", field: "password" } },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
        if (existing) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "DUPLICATE_EMAIL", message: "An account with this email already exists.", field: "email" } },
                { status: 409 }
            );
        }

        const row = await createUser({ name: name.trim(), email: email.trim(), password, dept });
        const user = { id: row.id, name: row.name, email: row.email, role: row.role as "employee", dept: row.dept };

        const token = await signToken(user);
        await setAuthCookie(token);

        const res: ApiResponse<AuthPayload> = { success: true, data: { user, token }, error: null };
        return NextResponse.json(res, { status: 201 });

    } catch (error) {
        console.error("[POST /api/auth/signup]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}
