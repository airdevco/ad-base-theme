"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  height?: number;
  cacheBust?: string;
  dark?: boolean;
}

export function Logo({ className, height = 32, cacheBust, dark }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className={cn(
          "font-bold",
          dark ? "text-white" : "text-primary",
          className
        )}
        style={{ fontSize: height * 0.6 }}
      >
        Airdev
      </span>
    );
  }

  const file = dark ? "logo-dark-mode.svg" : "logo.svg";
  const src = cacheBust ? `/${file}?v=${cacheBust}` : `/${file}`;
  const width = Math.round(height * 3.85);

  return (
    <Image
      src={src}
      alt="Airdev logo"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      onError={() => setHasError(true)}
      priority
    />
  );
}
