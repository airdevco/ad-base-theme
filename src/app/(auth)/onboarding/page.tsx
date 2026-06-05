import { Suspense } from "react";
import { OnboardingSdcFlow } from "@/app/(auth)/_components/onboarding-sdc-flow";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background" />
      }
    >
      <OnboardingSdcFlow />
    </Suspense>
  );
}
