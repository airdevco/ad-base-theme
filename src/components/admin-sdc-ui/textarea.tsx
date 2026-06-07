import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** When true, border is destructive (e.g. validation error). */
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const invalid =
      error === true ||
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      ariaInvalid === "grammar" ||
      ariaInvalid === "spelling";

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };
