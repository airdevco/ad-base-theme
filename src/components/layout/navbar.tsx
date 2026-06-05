"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "@/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { NavbarUserMenu } from "@/components/layout/navbar-user-menu";

export function Navbar() {
  const session = useSession();
  const { resolvedTheme } = useTheme();
  const isAdmin = session.user.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left section */}
        <Link href="/" className="flex items-center gap-2">
          <Logo height={24} dark={resolvedTheme === "dark"} />
        </Link>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
            >
              Admin
            </Link>
          )}
          <NavbarUserMenu />
        </div>
      </div>
    </header>
  );
}
