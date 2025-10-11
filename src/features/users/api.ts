import { apiFetch } from "@/api/client";

import type { ApiResponse, UserProfile } from "./types";

type UpdateUserPayload = Partial<
  Pick<
    UserProfile,
    "firstName" | "lastName" | "displayName" | "username" | "phone" | "profileImage"
  >
>;

export const fetchUserById = (id: string) =>
  apiFetch<ApiResponse<UserProfile>>(`/api/users/${id}`);

export const updateUserProfile = (id: string, payload: UpdateUserPayload) =>
  apiFetch<ApiResponse<UserProfile>>(`/api/users/update/${id}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteUserAccount = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/users/delete/${id}`, {
    method: "DELETE",
  });
