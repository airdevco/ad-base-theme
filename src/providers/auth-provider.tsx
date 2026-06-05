"use client";

import { createContext, useContext } from "react";
import type { Session } from "@/types";
import { mockSession } from "@/mock/session";

const AuthContext = createContext<Session>(mockSession);

export function AuthProvider({
  session = mockSession,
  children,
}: {
  session?: Session;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useSession(): Session {
  return useContext(AuthContext);
}
