"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/constants";
import { AuthFlowSdc } from "@/app/(auth)/_components/auth-flow-sdc";

/**
 * Fork of `/signup` — same flow and onboarding steps as `AuthFlow` signup,
 * isolated layout/components (`auth-flow-sdc`, `auth-layout-sdc`).
 */
export default function SignupSdcPage() {
  useEffect(() => {
    document.title = `Sign Up | ${APP_NAME}`;
  }, []);

  return <AuthFlowSdc mode="signup" />;
}
