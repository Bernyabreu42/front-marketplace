import type { Role } from "@/auth/AuthContext";

export interface UserStoreSummary {
  id: string;
  name: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  phone: string | null;
  status: string;
  isOnline: boolean;
  emailVerified: boolean;
  role: Role;
  lastLogin: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
  profileImage: string | null;
  store: UserStoreSummary | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    next: boolean;
    prev: boolean;
  };
}
