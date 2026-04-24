// ============================================================
// lib/auth.ts
// EmpowerTech Solutions — JWT Auth Helpers
// Uses jose (Edge-compatible, built into Next.js)
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { User } from "@/types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "empowertech-dev-secret-change-in-prod"
);
const COOKIE_NAME = "empowertech_token";

// ─────────────────────────────────────────────
// TOKEN
// ─────────────────────────────────────────────

export async function signToken(user: User): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, role: user.role, name: user.name, dept: user.dept })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as User["role"],
      name: payload.name as string,
      dept: payload.dept as string,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// COOKIE HELPERS
// ─────────────────────────────────────────────

export async function setAuthCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}