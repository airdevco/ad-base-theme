"use client";

import { useState } from "react";
import { toast } from "sonner";
import { themePresets } from "@/lib/themes";
import { ThemePreviewCard } from "@/components/theme/theme-preview-card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ThemesClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleRequest() {
    if (!selectedId) return;
    const theme = themePresets.find((t) => t.id === selectedId);
    toast.success(`Theme "${theme?.name}" requested! We'll be in touch.`);
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-16 pt-20 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
          <Sparkles className="size-3" />
          Choose your look
        </div>
        <h1 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          Themes built for
          <br />
          modern brands
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          Pick a curated theme to match your brand identity. Each palette is
          designed for readability, elegance, and visual consistency.
        </p>
      </section>

      {/* Theme grid */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {themePresets.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              selected={selectedId === theme.id}
              onSelect={() =>
                setSelectedId((prev) =>
                  prev === theme.id ? null : theme.id
                )
              }
            />
          ))}
        </div>

        {/* Request CTA */}
        {selectedId && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Button size="lg" className="rounded-lg px-8" onClick={handleRequest}>
              Request This Theme
            </Button>
            <p className="text-xs text-muted-foreground">
              Need modifications?{" "}
              <a
                href="mailto:hello@airdev.co?subject=Theme customization request"
                className="underline hover:text-foreground"
              >
                Contact us
              </a>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
