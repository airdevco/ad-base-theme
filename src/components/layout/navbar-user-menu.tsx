"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SHOW_THEME_TOGGLE } from "@/lib/constants";
import { useSession } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavbarUserMenu() {
  const session = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session.user;
  const initials =
    (user.firstName?.charAt(0) ?? "") + (user.lastName?.charAt(0) ?? "");

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="h-8 w-8">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.firstName} />
          )}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/account" className="w-full">
            Account
          </Link>
        </DropdownMenuItem>
        {SHOW_THEME_TOGGLE && (
          <>
            <DropdownMenuSeparator />
            {mounted && (
              <div className="flex items-center gap-3 px-2 py-1.5">
                <span className="text-sm">Mode</span>
                <div className="flex flex-1 items-center justify-between rounded-full bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1.5 rounded-full p-1.5 text-xs font-medium transition-all duration-200 ${
                      theme === "light"
                        ? "bg-background text-foreground shadow-sm px-4"
                        : "text-muted-foreground hover:text-foreground px-1.5"
                    }`}
                  >
                    <Sun className={`h-3.5 w-3.5 transition-transform duration-200 ${theme === "light" ? "rotate-0" : "rotate-90"}`} />
                    <span className={`overflow-hidden transition-all duration-200 ${theme === "light" ? "max-w-[3rem] opacity-100" : "max-w-0 opacity-0"}`}>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1.5 rounded-full p-1.5 text-xs font-medium transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-background text-foreground shadow-sm px-4"
                        : "text-muted-foreground hover:text-foreground px-1.5"
                    }`}
                  >
                    <Moon className={`h-3.5 w-3.5 transition-transform duration-200 ${theme === "dark" ? "rotate-0" : "-rotate-90"}`} />
                    <span className={`overflow-hidden transition-all duration-200 ${theme === "dark" ? "max-w-[3rem] opacity-100" : "max-w-0 opacity-0"}`}>Dark</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
