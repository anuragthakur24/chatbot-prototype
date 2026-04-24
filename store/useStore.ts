import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Ticket, ChatMessage } from "@/types";

interface Store {
    // Auth
    user: User | null;
    setUser: (user: User | null) => void;

    // Tickets
    tickets: Ticket[];
    setTickets: (tickets: Ticket[]) => void;
    addTicket: (ticket: Ticket) => void;

    // Chat
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    clearMessages: () => void;
}

export const useStore = create<Store>()(
    persist(
        (set) => ({
            // Auth
            user: null,
            setUser: (user) => set({ user }),

            // Tickets
            tickets: [],
            setTickets: (tickets) => set({ tickets }),
            addTicket: (ticket) => set((state) => ({ tickets: [ticket, ...state.tickets] })),

            // Chat
            messages: [],
            addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: "empowertech-store",
            partialize: (state) => ({ user: state.user }),
        }
    )
);
