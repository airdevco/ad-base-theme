"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
  /** Inner scroll area padding (default p-6). Use p-0 for full-bleed content (e.g. app sidebar). */
  contentClassName?: string;
  /** Show the top-right close control (default true). */
  showCloseButton?: boolean;
}

function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  contentClassName,
  showCloseButton = true,
}: SheetProps) {
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-3/4 max-w-sm flex-col bg-background shadow-lg border transition-transform duration-300",
          side === "left" && "left-0 border-r",
          side === "right" && "right-0 border-l",
          className
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-sm p-1 text-muted-foreground opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            contentClassName ?? "p-6"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
Sheet.displayName = "Sheet";

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    style={{ fontFamily: 'var(--font-heading)', ...props.style }}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetHeader, SheetTitle, SheetDescription };
export type { SheetProps };
