// ============================================================
// app/api/tickets/route.ts
// GET  /api/tickets → list (employee sees own, admin sees all)
// POST /api/tickets → create
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getTickets, createTicket } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, Ticket, CreateTicketInput, TicketFilters } from "@/types";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Please log in." } },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);

        // Build a properly typed TicketFilters — no "as never" hacks
        const filters: TicketFilters = {};
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const category = searchParams.get("category");
        const dept = searchParams.get("dept");

        if (status) filters.status = status as TicketFilters["status"];
        if (priority) filters.priority = priority as TicketFilters["priority"];
        if (category) filters.category = category as TicketFilters["category"];
        if (dept) filters.dept = dept;

        const tickets = await getTickets(user.id, user.role, filters);
        const res: ApiResponse<Ticket[]> = {
            success: true,
            data: tickets,
            error: null,
            meta: { total: tickets.length },
        };
        return NextResponse.json(res, { status: 200 });

    } catch (error) {
        console.error("[GET /api/tickets]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Please log in." } },
                { status: 401 }
            );
        }

        const body: CreateTicketInput = await req.json();

        if (!body.category || !body.priority || !body.desc?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "category, priority and desc are required.",
                    },
                },
                { status: 400 }
            );
        }

        const ticket = await createTicket(body, user);
        const res: ApiResponse<Ticket> = { success: true, data: ticket, error: null };
        return NextResponse.json(res, { status: 201 });

    } catch (error) {
        console.error("[POST /api/tickets]", error);
        return NextResponse.json(
            { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}