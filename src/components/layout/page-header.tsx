import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  filterBar?: React.ReactNode;
  children?: React.ReactNode;
  /** Two-level breadcrumb: [{ label, href }] shown before the title */
  breadcrumb?: Breadcrumb;
  /** Make the header sticky at the top of the scroll container */
  sticky?: boolean;
  /** Prepended before breadcrumb (e.g. sidebar collapse + divider). */
  lead?: React.ReactNode;
}

export function PageHeader({
  title,
  actions,
  toolbar,
  filterBar,
  children,
  breadcrumb,
  sticky,
  lead,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        sticky && "sticky top-0 z-30"
      )}
    >
      {/* Row 1 — Top bar: breadcrumb/title + icon actions */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {lead}
          <div className="flex min-w-0 items-center gap-1.5 truncate text-sm">
            {breadcrumb && (
              <>
                <Link
                  href={breadcrumb.href}
                  className="shrink-0 font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {breadcrumb.label}
                </Link>
                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
              </>
            )}
            <span className="min-w-0 truncate font-medium text-foreground">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {actions}
        </div>
      </div>

      {/* Row 2 — Toolbar: filters + primary action */}
      {(toolbar || children) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          {toolbar || <div />}
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      )}

      {/* Row 3 — Sort/Filter bar */}
      {filterBar && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-2">
          {filterBar}
        </div>
      )}
    </div>
  );
}
