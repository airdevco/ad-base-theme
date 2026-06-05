"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Applied to the modal panel (e.g. wider layouts). Default: max-w-lg */
  contentClassName?: string;
  /** Stacking order when multiple dialogs are open (e.g. nested confirm). Default: z-50 */
  stackClassName?: string;
}

function Dialog({
  open,
  onOpenChange,
  children,
  contentClassName,
  stackClassName,
}: DialogProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

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
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center",
        stackClassName ?? "z-50"
      )}
    >
      {/* Overlay — light tint in light mode, dim scrim in dark (matches Sheet / theme) */}
      <div
        className="fixed inset-0 bg-[rgba(207,216,229,0.45)] transition-opacity dark:bg-black/60"
        onClick={() => onOpenChange(false)}
      />

      {/* Content — single border, clip children to rounded corners */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 outline-none ring-0 focus:outline-none",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
Dialog.displayName = "Dialog";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 px-6 pb-4 pt-7", className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    style={{ fontFamily: 'var(--font-heading)', ...props.style }}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className="flex flex-col pt-3">
    <div
      className={cn(
        "flex justify-end gap-2 rounded-b-xl border-t border-border bg-muted px-6 py-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  </div>
));
DialogFooter.displayName = "DialogFooter";

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
