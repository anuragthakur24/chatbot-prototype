// ============================================================
// app/api/tickets/[id]/route.ts
// GET   /api/tickets/:id → single ticket
// PATCH /api/tickets/:id → update (admin only)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, Ticket, UpdateTicketInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json(
            { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Please log in." } },
            { status: 401 }
        );

        const ticket = await getTicketById(id);
        if (!ticket) return NextResponse.json(
            { success: false, data: null, error: { code: "NOT_FOUND", message: `Ticket ${id} not found.` } },
            { status: 404 }
        );

        if (user.role === "employee" && ticket.empId !== user.id) return NextResponse.json(
            { success: false, data: null, error: { code: "FORBIDDEN", message: "Access denied." } },
            { status: 403 }
        );

        const res: ApiResponse<Ticket> = { success: true, data: ticket, error: null };
        return NextResponse.json(res);

    } catch (error) {
        console.error(`[GET /api/tickets/${id}]`, error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json(
            { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Please log in." } },
            { status: 401 }
        );

        if (user.role !== "admin") return NextResponse.json(
            { success: false, data: null, error: { code: "FORBIDDEN", message: "Only admins can update tickets." } },
            { status: 403 }
        );

        const body: UpdateTicketInput = await req.json();
        const updated = await updateTicket(id, body);

        if (!updated) return NextResponse.json(
            { success: false, data: null, error: { code: "NOT_FOUND", message: `Ticket ${id} not found.` } },
            { status: 404 }
        );

        const res: ApiResponse<Ticket> = { success: true, data: updated, error: null };
        return NextResponse.json(res);

    } catch (error) {
        console.error(`[PATCH /api/tickets/${id}]`, error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}