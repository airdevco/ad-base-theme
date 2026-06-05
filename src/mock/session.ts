import type { Session } from "@/types";

export const mockSession: Session = {
  user: {
    id: "usr_01",
    email: "admin@agency.com",
    firstName: "Jane",
    lastName: "Smith",
    avatarUrl: null,
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T09:00:00Z",
    lastLoginAt: "2025-06-10T14:32:00Z",
  },
  isAuthenticated: true,
};

export const mockMemberSession: Session = {
  user: {
    id: "usr_02",
    email: "member@agency.com",
    firstName: "John",
    lastName: "Doe",
    avatarUrl: null,
    role: "member",
    status: "active",
    createdAt: "2024-03-22T11:15:00Z",
    lastLoginAt: "2025-06-09T08:45:00Z",
  },
  isAuthenticated: true,
};
