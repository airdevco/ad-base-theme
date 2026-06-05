"use client";

import { useSession } from "@/providers/auth-provider";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const session = useSession();
  const name = session.user.firstName || "there";

  return (
    <div>
      <h2 className="text-[28px] font-bold leading-tight text-foreground">
        {getGreeting()}, {name}!
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening with your agency today.
      </p>
    </div>
  );
}
