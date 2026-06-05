"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/constants";
import { AuthFlowSdc } from "@/app/(auth)/_components/auth-flow-sdc";

/**
 * Fork of `/login` — same auth behavior, isolated layout/components under
 * `_components/auth-flow-sdc` and `auth-layout-sdc`.
 */
export default function LoginSdcPage() {
  useEffect(() => {
    document.title = `Sign In | ${APP_NAME}`;
  }, []);

  return <AuthFlowSdc />;
}
