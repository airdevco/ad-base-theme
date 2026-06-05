"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const GAP = 8;

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  delayMs?: number;
}

function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  className,
  delayMs = 200,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left?: number; right?: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [adjustX, setAdjustX] = React.useState(0);

  React.useEffect(() => { setMounted(true); }, []);

  React.useLayoutEffect(() => {
    if (!visible || !pos || (side !== "top" && side !== "bottom")) {
      setAdjustX(0);
      return;
    }
    const el = tooltipRef.current;
    if (!el) return;
    const pad = 8;
    const clamp = () => {
      const rect = el.getBoundingClientRect();
      let delta = 0;
      if (rect.right > window.innerWidth - pad) {
        delta += window.innerWidth - pad - rect.right;
      }
      if (rect.left + delta < pad) {
        delta += pad - (rect.left + delta);
      }
      setAdjustX(delta);
    };
    clamp();
    requestAnimationFrame(clamp);
  }, [visible, pos, content, side]);

  const compute = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    if (side === "bottom") {
      const top = r.bottom + GAP;
      if (align === "end")    setPos({ top, right: window.innerWidth - r.right });
      else if (align === "start") setPos({ top, left: r.left });
      else                    setPos({ top, left: r.left + r.width / 2 });
    } else if (side === "top") {
      const top = r.top - GAP;
      if (align === "end")    setPos({ top, right: window.innerWidth - r.right });
      else if (align === "start") setPos({ top, left: r.left });
      else                    setPos({ top, left: r.left + r.width / 2 });
    } else if (side === "left") {
      setPos({ top: r.top + r.height / 2, right: window.innerWidth - r.left + GAP });
    } else {
      setPos({ top: r.top + r.height / 2, left: r.right + GAP });
    }
  }, [side, align]);

  const handleMouseEnter = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      compute();
      setVisible(true);
    }, delayMs);
  }, [delayMs, compute]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setVisible(false);
  }, []);

  React.useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const caretBase = "pointer-events-none absolute h-0 w-0";

  const tooltipStyle: React.CSSProperties = pos
    ? {
        position: "fixed",
        zIndex: 9999,
        top:
          side === "top"
            ? undefined
            : side === "bottom"
              ? pos.top
              : pos.top,
        bottom: side === "top" ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        right: pos.right,
        transform: (() => {
          if (side === "left" || side === "right") {
            return "translateY(-50%)";
          }
          if ((side === "bottom" || side === "top") && align === "center") {
            return `translateX(calc(-50% + ${adjustX}px))`;
          }
          if (adjustX !== 0) {
            return `translateX(${adjustX}px)`;
          }
          return undefined;
        })(),
      }
    : { display: "none" };

  return (
    <span
      ref={triggerRef}
      style={{ display: "inline-flex" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {mounted && visible && pos && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={tooltipStyle}
          className={cn(
            "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow-md",
            className
          )}
        >
          {side === "bottom" && (
            <span
              className={cn(caretBase, "-top-[6px] border-x-[6px] border-b-[6px] border-x-transparent border-t-0",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "end"    && "right-[10px]",
                align === "start"  && "left-[10px]")}
              style={{ borderBottomColor: "var(--popover)" }}
              aria-hidden
            />
          )}
          {side === "top" && (
            <span
              className={cn(caretBase, "-bottom-[6px] border-x-[6px] border-t-[6px] border-x-transparent border-b-0",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "end"    && "right-[10px]",
                align === "start"  && "left-[10px]")}
              style={{ borderTopColor: "var(--popover)" }}
              aria-hidden
            />
          )}
          {side === "left" && (
            <span
              className={cn(caretBase, "-right-[5px] top-1/2 -translate-y-1/2 border-y-[6px] border-l-[6px] border-y-transparent border-r-0")}
              style={{ borderLeftColor: "var(--popover)" }}
              aria-hidden
            />
          )}
          {side === "right" && (
            <span
              className={cn(caretBase, "-left-[5px] top-1/2 -translate-y-1/2 border-y-[6px] border-r-[6px] border-y-transparent border-l-0")}
              style={{ borderRightColor: "var(--popover)" }}
              aria-hidden
            />
          )}
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}
Tooltip.displayName = "Tooltip";

export { Tooltip };
export type { TooltipProps };
