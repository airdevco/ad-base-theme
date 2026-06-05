"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "default" | "sm";
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, checked = false, onCheckedChange, disabled, size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "h-4 w-7" : "h-6 w-11",
          checked ? "bg-primary" : "bg-input",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform",
            size === "sm" ? "h-3 w-3" : "h-5 w-5",
            checked ? (size === "sm" ? "translate-x-3" : "translate-x-5") : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
export type { ToggleProps };
