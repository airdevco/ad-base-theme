"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  className,
}: DropdownMenuProps & { className?: string }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </DropdownMenuContext.Provider>
  );
}
DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);

  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current =
        node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [ref, triggerRef]
  );

  return (
    <button
      ref={combinedRef}
      type="button"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      className={className}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number;
    align?: "start" | "center" | "end";
    side?: "bottom" | "top";
    /** Set panel width to match the menu trigger (e.g. sidebar switchers). */
    matchTriggerWidth?: boolean;
  }
>(({ className, sideOffset: _sideOffset, align = "start", side = "bottom", matchTriggerWidth, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const positionContent = React.useCallback(() => {
    const content = contentRef.current;
    const trigger = triggerRef.current;
    if (!content || !trigger) return;

    const triggerRect = trigger.getBoundingClientRect();

    if (matchTriggerWidth) {
      const w = `${triggerRect.width}px`;
      content.style.minWidth = w;
      content.style.width = w;
    } else {
      content.style.minWidth = "";
      content.style.width = "";
    }

    const contentRect = content.getBoundingClientRect();

    let left: number;
    if (align === "end") {
      left = triggerRect.right - contentRect.width;
    } else if (align === "center") {
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    } else {
      left = triggerRect.left;
    }

    // Clamp to viewport
    const maxLeft = window.innerWidth - contentRect.width - 8;
    left = Math.max(8, Math.min(left, maxLeft));

    if (side === "top") {
      content.style.top = `${triggerRect.top - contentRect.height - 4}px`;
    } else {
      content.style.top = `${triggerRect.bottom + 4}px`;
    }
    content.style.left = `${left}px`;
  }, [triggerRef, align, side, matchTriggerWidth]);

  React.useLayoutEffect(() => {
    if (open) positionContent();
  }, [open, positionContent]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={(node) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
        if (node) positionContent();
      }}
      role="menu"
      data-state={open ? "open" : "closed"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-none animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    />,
    document.body
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** When false, menu stays open (e.g. multi-select). Still closes on outside click. Default true. */
    closeOnSelect?: boolean;
  }
>(({ className, onClick, closeOnSelect = true, ...props }, ref) => {
  const { setOpen } = React.useContext(DropdownMenuContext);

  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-sidebar-accent/60 hover:text-foreground focus:bg-sidebar-accent/60 focus:text-foreground",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnSelect) setOpen(false);
      }}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
