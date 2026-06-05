import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href: string;
}

interface AdminSdcPageHeaderProps {
  title: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  filterBar?: ReactNode;
  /** Breadcrumb is accepted for API parity but not shown in SDC chrome. */
  breadcrumb?: Breadcrumb;
  sticky?: boolean;
  lead?: ReactNode;
  /** Shown below the top bar; same typography as dashboard `Greeting`. */
  introTitle?: string;
  introDescription?: string;
  /** Primary actions to the right of the title (desktop); stacks below the description on small screens. */
  introTrailing?: ReactNode;
  /** Renders below the title / description / introTrailing row (e.g. page-level search). */
  introBelow?: ReactNode;
  /**
   * When false, no border under `introBelow` (use when a table directly below draws the top rule of the sticky header block).
   */
  introBelowDivider?: boolean;
}

/** Top bar for `/admin/*` — minimal chrome (no breadcrumb row border in row 1). */
export function AdminSdcPageHeader({
  title,
  actions,
  toolbar,
  filterBar,
  sticky,
  lead,
  introTitle,
  introDescription,
  introTrailing,
  introBelow,
  introBelowDivider = true,
}: AdminSdcPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        sticky && "sticky top-0 z-30 shrink-0"
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 overflow-visible py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {lead}
          <span className="sr-only">{title}</span>
        </div>
        <div className="flex shrink-0 items-center justify-self-end gap-1 overflow-visible">
          {actions}
        </div>
      </div>

      {(introTitle || introDescription || introTrailing || introBelow) && (
        <div
          className={cn(
            "overflow-visible max-md:pt-4 md:pt-6",
            introBelow ? "mb-0" : "mb-3"
          )}
        >
          <div className="flex flex-col gap-4 overflow-visible sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              {introTitle && (
                <h2 className="text-[28px] font-bold leading-tight text-foreground">{introTitle}</h2>
              )}
              {introDescription && (
                <p className="mt-1 text-sm text-muted-foreground">{introDescription}</p>
              )}
            </div>
            {introTrailing && (
              <div className="flex w-fit max-w-full flex-col gap-2.5 overflow-visible self-start sm:max-w-[min(100%,42rem)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:self-auto">
                {introTrailing}
              </div>
            )}
          </div>
          {introBelow && (
            <div
              className={cn(
                "mt-4 w-full min-w-0",
                introBelowDivider ? "border-b border-border pb-2" : "pb-3"
              )}
            >
              {introBelow}
            </div>
          )}
        </div>
      )}

      {toolbar && (
        <div className="flex items-end justify-between border-b border-border pt-2.5 pb-0">
          {toolbar}
        </div>
      )}

      {filterBar && (
        <div className="flex items-center gap-3 border-b border-border py-2.5">
          {filterBar}
        </div>
      )}
    </div>
  );
}
