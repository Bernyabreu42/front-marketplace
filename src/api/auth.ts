import { apiFetch } from "@/api/client";

export interface AuthMessageResponse {
  success?: boolean;
  message?: string;
}

export const loginUser = (payload: { email: string; password: string }) =>
  apiFetch<AuthMessageResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });

export const registerUser = (payload: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) =>
  apiFetch<AuthMessageResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });

export const verifyAccountByToken = (token: string) =>
  apiFetch<AuthMessageResponse>(`/api/auth/verify-email?accessToken=${encodeURIComponent(token)}`, {
    method: "GET",
  });

export const requestPasswordReset = (payload: { email: string }) =>
  apiFetch<AuthMessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });

export const resetPassword = (payload: { token: string; password: string; confirmPassword?: string }) =>
  apiFetch<AuthMessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
