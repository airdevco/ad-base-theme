import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { ResetPasswordClient } from "./reset-password-client";

export const metadata: Metadata = {
  title: `Reset Password | ${APP_NAME}`,
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
