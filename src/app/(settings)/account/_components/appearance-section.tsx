"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/admin-sdc-ui/button";

const themes = [
  {
    id: "light",
    label: "Light",
    preview: "bg-background",
    previewBars: ["bg-accent", "bg-accent", "bg-accent"],
  },
  {
    id: "dark",
    label: "Dark",
    preview: "bg-[#1A1A1A]",
    previewBars: ["bg-[#333]", "bg-[#333]", "bg-[#333]"],
  },
  {
    id: "system",
    label: "System",
    preview: "bg-gradient-to-r from-white to-[#1A1A1A]",
    previewBars: [
      "bg-gradient-to-r from-accent to-[#333]",
      "bg-gradient-to-r from-accent to-[#333]",
      "bg-gradient-to-r from-accent to-[#333]",
    ],
  },
];

export function AppearanceSection() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const savedTheme = useRef<string | undefined>(undefined);
  const [draftTheme, setDraftTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || theme === undefined) return;
    if (savedTheme.current === undefined) {
      savedTheme.current = theme;
      setDraftTheme(theme);
    }
  }, [mounted, theme]);

  const isDirty = useMemo(() => {
    if (draftTheme === undefined || savedTheme.current === undefined) return false;
    return draftTheme !== savedTheme.current;
  }, [draftTheme]);

  function handleThemeSelect(id: string) {
    setDraftTheme(id);
  }

  function handleCancel() {
    setDraftTheme(savedTheme.current);
  }

  function handleSave() {
    if (draftTheme === undefined) return;
    setTheme(draftTheme);
    savedTheme.current = draftTheme;
    toast.success("Appearance updated");
  }

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-foreground">Appearance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize the look and feel of your platform
      </p>

      <div className="mt-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold leading-[30px] text-foreground">Theme</h2>
          <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const isActive = draftTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeSelect(t.id)}
                className={`group relative overflow-hidden rounded-xl border-2 transition-colors ${
                  isActive
                    ? "border-primary"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`flex h-[80px] flex-col items-center justify-center gap-1.5 ${t.preview}`}
                >
                  <div className="flex w-16 flex-col gap-1">
                    {t.previewBars.map((bar, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full ${bar}`}
                        style={{ width: `${100 - i * 20}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-background px-3 py-2">
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  {isActive && (
                    <div className="flex size-4 items-center justify-center rounded-full bg-primary">
                      <Check className="size-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isDirty ? (
        <div className="mt-8 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} className="h-9 max-h-[40px] rounded-lg px-4">
            Save Changes
          </Button>
        </div>
      ) : null}
    </div>
  );
}
