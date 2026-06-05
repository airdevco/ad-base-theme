"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { hexToRgb, rgbToHex } from "./theme-state";

// ── HSV utilities (better for color pickers than HSL) ──

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function hsvToHsl(h: number, s: number, v: number) {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h: Math.round(h), s: Math.round(sl * 100), l: Math.round(l * 100) };
}

function hslToHsv(h: number, sPercent: number, lPercent: number) {
  const sl = sPercent / 100;
  const l = lPercent / 100;
  const v = l + sl * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h, s: sv, v };
}

// ── Dragging hook ──

function useDrag(onMove: (x: number, y: number, rect: DOMRect) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      onMove(x, y, rect);
    },
    [onMove]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { ref, onPointerDown, onPointerMove, onPointerUp };
}

// ── Component ──

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync HSV when value changes externally
  useEffect(() => {
    setHsv(hexToHsv(value));
    setHexInput(value);
  }, [value]);

  const emitColor = useCallback(
    (h: number, s: number, v: number) => {
      const newHsv = { h, s, v };
      setHsv(newHsv);
      const hex = hsvToHex(h, s, v);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  // Saturation/Value area
  const svDrag = useDrag(
    useCallback((x: number, y: number) => emitColor(hsv.h, x, 1 - y), [hsv.h, emitColor])
  );

  // Hue slider
  const hueDrag = useDrag(
    useCallback((x: number) => emitColor(x * 360, hsv.s, hsv.v), [hsv.s, hsv.v, emitColor])
  );

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const hueColor = hsvToHex(hsv.h, 1, 1);
  const hslDisplay = hsvToHsl(hsv.h, hsv.s, hsv.v);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger row */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-zinc-200 transition-shadow hover:shadow-md"
          style={{ backgroundColor: value }}
          title="Open color picker"
        />
        <div className="flex-1">
          <div className="mb-0.5 text-xs font-medium text-zinc-700">
            {label}
          </div>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onChange(e.target.value.toLowerCase());
              }
            }}
            onBlur={() => setHexInput(value)}
            className="w-full rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-mono text-zinc-600 outline-none focus:border-zinc-400"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[260px] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
          {/* Saturation/Value area */}
          <div
            ref={svDrag.ref}
            onPointerDown={svDrag.onPointerDown}
            onPointerMove={svDrag.onPointerMove}
            onPointerUp={svDrag.onPointerUp}
            className="relative h-[160px] w-full cursor-crosshair overflow-hidden rounded-lg"
            style={{ backgroundColor: hueColor }}
          >
            {/* White overlay left→right */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, #fff, transparent)",
              }}
            />
            {/* Black overlay top→bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent, #000)",
              }}
            />
            {/* Thumb */}
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: value,
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            ref={hueDrag.ref}
            onPointerDown={hueDrag.onPointerDown}
            onPointerMove={hueDrag.onPointerMove}
            onPointerUp={hueDrag.onPointerUp}
            className="relative mt-3 h-3 w-full cursor-pointer rounded-full"
            style={{
              background:
                "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: hueColor,
              }}
            />
          </div>

          {/* HSL inputs */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              { label: "H", value: hslDisplay.h, max: 360, suffix: "°" },
              { label: "S", value: hslDisplay.s, max: 100, suffix: "%" },
              { label: "L", value: hslDisplay.l, max: 100, suffix: "%" },
            ] as const).map((ch) => (
              <div key={ch.label}>
                <label className="mb-0.5 block text-center text-[10px] font-medium uppercase text-zinc-400">
                  {ch.label}
                </label>
                <input
                  type="number"
                  min={0}
                  max={ch.max}
                  value={ch.value}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(ch.max, parseInt(e.target.value) || 0));
                    const newH = ch.label === "H" ? v : hslDisplay.h;
                    const newS = ch.label === "S" ? v : hslDisplay.s;
                    const newL = ch.label === "L" ? v : hslDisplay.l;
                    const newHsv = hslToHsv(newH, newS, newL);
                    emitColor(newHsv.h, newHsv.s, newHsv.v);
                  }}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-center text-xs tabular-nums text-zinc-700 outline-none focus:border-zinc-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
