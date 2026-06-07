import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** When true, border is destructive (e.g. validation error). */
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const invalid =
      error === true ||
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      ariaInvalid === "grammar" ||
      ariaInvalid === "spelling";

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-destructive focus-visible:border-destructive"
            : "border-input focus-visible:border-primary",
          className
        )}
        ref={ref}
        aria-invalid={ariaInvalid}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
