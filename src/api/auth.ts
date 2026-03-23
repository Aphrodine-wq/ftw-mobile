import { apiFetch } from "./client";
import type { AuthResponse, AuthUser } from "@src/types";

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(attrs: {
  email: string;
  password: string;
  name: string;
  role: "homeowner" | "contractor";
  location?: string;
}): Promise<AuthResponse> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(attrs),
  });
}

export async function meApi(): Promise<{ user: AuthUser }> {
  return apiFetch("/api/auth/me");
}
