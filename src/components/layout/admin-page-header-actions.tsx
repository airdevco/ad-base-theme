"use client";

import { Search, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/layout/admin-sidebar";
import { Tooltip } from "@/components/admin-ui/tooltip";

export function AdminPageHeaderActions() {
  const { openCommandPalette } = useSidebar();

  return (
    <>
      <Tooltip content="Search records" side="bottom" align="end">
        <button
          type="button"
          onClick={() => openCommandPalette("records")}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60"
          aria-label="Search records"
        >
          <Search className="size-4" />
        </button>
      </Tooltip>
      <Tooltip content="Copy link to clipboard" side="bottom" align="end">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
          }}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60"
          aria-label="Copy link to clipboard"
        >
          <Share2 className="size-4" />
        </button>
      </Tooltip>
      <Tooltip content="Documentation" side="bottom" align="end">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60"
          aria-label="Documentation"
        >
          <Info className="size-4" />
        </button>
      </Tooltip>
    </>
  );
}
