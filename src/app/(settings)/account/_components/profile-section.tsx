"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useSession } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { Button } from "@/components/admin-sdc-ui/button";
import { cn } from "@/lib/utils";

const aboutTextareaClass =
  "min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-[border-color] placeholder:text-muted-foreground focus-visible:border-primary";

export function ProfileSection() {
  const session = useSession();
  const { user } = session;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseline = useRef({
    firstName: user.firstName,
    lastName: user.lastName,
    about: "",
  });
  const committedAvatarUrl = useRef<string | null>(null);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarUrlRef = useRef<string | null>(null);
  avatarUrlRef.current = avatarUrl;

  const revokeIfBlob = useCallback((url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      const u = avatarUrlRef.current;
      if (u?.startsWith("blob:")) {
        URL.revokeObjectURL(u);
      }
    };
  }, []);

  const isDirty = useMemo(() => {
    const b = baseline.current;
    const avatarChanged = avatarUrl !== committedAvatarUrl.current;
    return (
      firstName !== b.firstName ||
      lastName !== b.lastName ||
      about !== b.about ||
      avatarChanged
    );
  }, [firstName, lastName, about, avatarUrl]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      revokeIfBlob(avatarUrl);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    revokeIfBlob(avatarUrl);
    setAvatarUrl(null);
  };

  const handleCancel = () => {
    const b = baseline.current;
    const prevAvatar = avatarUrl;
    setFirstName(b.firstName);
    setLastName(b.lastName);
    setAbout(b.about);
    setAvatarUrl(committedAvatarUrl.current);
    if (
      prevAvatar &&
      prevAvatar !== committedAvatarUrl.current &&
      prevAvatar.startsWith("blob:")
    ) {
      URL.revokeObjectURL(prevAvatar);
    }
  };

  const handleSave = () => {
    baseline.current = {
      firstName,
      lastName,
      about,
    };
    committedAvatarUrl.current = avatarUrl;
    toast.success("Profile updated");
  };

  const showCustomAvatar = avatarUrl !== null;

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your personal details across all of your workspaces
      </p>

      <div className="mt-8 flex flex-col items-center">
        <div
          className={cn(
            "relative size-20 shrink-0 rounded-full",
            showCustomAvatar && "ring-1 ring-border ring-offset-0"
          )}
        >
          <Avatar className="size-20 border-0">
            {showCustomAvatar ? (
              <AvatarImage src={avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <AvatarFallback className="bg-primary text-lg font-semibold text-white">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          {showCustomAvatar ? (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Remove profile photo"
            >
              <Trash2 className="size-4 text-white" strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 h-9 rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          Upload image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleAvatarFile}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="account-sdc-first-name">First name</Label>
          <Input
            id="account-sdc-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="account-sdc-last-name">Last name</Label>
          <Input
            id="account-sdc-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <Label htmlFor="account-sdc-about">About you</Label>
        <textarea
          id="account-sdc-about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className={aboutTextareaClass}
          placeholder="Tell people a little about yourself"
          rows={5}
        />
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
