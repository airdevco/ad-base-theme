export type UserRole = "admin" | "member";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Session {
  user: User;
  isAuthenticated: boolean;
}
