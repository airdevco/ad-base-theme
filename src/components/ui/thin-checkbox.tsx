"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native checkbox with a thinner checkmark than the OS default (appearance-none + Lucide Check).
 */
export const ThinCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      className={cn(
        "relative inline-flex size-3.5 shrink-0 items-center justify-center align-middle",
        className
      )}
    >
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer size-3.5 cursor-pointer appearance-none rounded border border-muted-foreground/35 bg-background dark:border-muted-foreground/45",
          "checked:border-primary checked:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "read-only:cursor-default"
        )}
        {...props}
      />
      <Check
        className="pointer-events-none absolute size-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
        strokeWidth={2}
        aria-hidden
      />
    </span>
  );
});
ThinCheckbox.displayName = "ThinCheckbox";
