"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, Check, X, KeyRound, Mail, Eye, EyeOff } from "lucide-react";
import { useSession } from "@/providers/auth-provider";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const strengthColors = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-emerald-400",
];

const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

const footerOutlineBtnClass =
  "h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground";
const footerPrimaryBtnClass = "h-9 max-h-[40px] rounded-lg px-4";

export function SecuritySection() {
  const session = useSession();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(session.user.email);
  const [authenticatorCode, setAuthenticatorCode] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const hasMinLength = newPassword.length >= 8;
  const hasMixedCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const isValid =
    currentPassword &&
    hasMinLength &&
    hasMixedCase &&
    hasNumber &&
    passwordsMatch &&
    confirmPassword;

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordFocused(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  function handleUpdatePassword() {
    if (!passwordsMatch) {
      toast.error("Passwords don't match");
      return;
    }
    toast.success("Password updated");
    resetPasswordForm();
    setPasswordDialogOpen(false);
  }

  function handlePasswordDialogChange(open: boolean) {
    setPasswordDialogOpen(open);
    if (!open) resetPasswordForm();
  }

  function handleTwoFactorDialogChange(open: boolean) {
    setTwoFactorDialogOpen(open);
    if (!open) setAuthenticatorCode("");
  }

  function handleVerifyAuthenticator() {
    if (authenticatorCode.length !== 6) return;
    toast.success("Authenticator app connected");
    handleTwoFactorDialogChange(false);
  }

  function handleDeleteAccount() {
    setDeleteDialogOpen(false);
    toast.success("Account deletion requested");
  }

  const requirements = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Uppercase and lowercase letters", met: hasMixedCase },
    { label: "At least one number", met: hasNumber },
  ];

  useEffect(() => {
    if (!currentPassword) setShowCurrentPassword(false);
  }, [currentPassword]);
  useEffect(() => {
    if (!newPassword) setShowNewPassword(false);
  }, [newPassword]);
  useEffect(() => {
    if (!confirmPassword) setShowConfirmPassword(false);
  }, [confirmPassword]);

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-foreground">Security</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your password and account security
      </p>

      <div className="mt-8 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
              <Mail className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Email address</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmailDialogOpen(true)}
            className="flex h-8 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
              <KeyRound className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Last changed 3 months ago</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPasswordDialogOpen(true)}
            className="flex h-8 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
              <Shield className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Authenticator App</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Not configured</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorDialogOpen(true)}
            className="flex h-8 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Set up
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-[20px] font-bold leading-[30px] text-black dark:text-foreground">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Irreversible actions for your account</p>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Delete Account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-[13px]"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={handlePasswordDialogChange}
        contentClassName="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-6 pb-4 pt-0">
          <div className="flex flex-col gap-1">
            <Label htmlFor="account-sdc-current-password">Current password</Label>
            <div className="relative">
              <Input
                id="account-sdc-current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={cn("h-9", currentPassword.length > 0 && "pr-10")}
              />
              {currentPassword.length > 0 ? (
                <button
                  type="button"
                  data-password-toggle
                  className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <Eye className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="account-sdc-new-password" className="shrink-0">
                New password
              </Label>
              {newPassword ? (
                <div className="flex min-w-0 items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">
                    {strengthLabels[strength - 1] || "Too short"}
                  </span>
                  <div className="flex w-[88px] shrink-0 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i < strength ? strengthColors[strength - 1] : "bg-accent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="relative">
              <Input
                id="account-sdc-new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={(e) => {
                  const next = e.relatedTarget as HTMLElement | null;
                  if (next?.closest?.("[data-password-toggle]")) return;
                  if (next?.id === "account-sdc-confirm-password") return;
                  setNewPasswordFocused(false);
                }}
                className={cn("h-9", newPassword.length > 0 && "pr-10")}
              />
              {newPassword.length > 0 ? (
                <button
                  type="button"
                  data-password-toggle
                  className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <Eye className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
            {newPasswordFocused ? (
              <div className="mt-2">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Password requirements</p>
                <ul className="flex flex-col gap-1">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {newPassword ? (
                        req.met ? (
                          <Check className="size-3 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="size-3 shrink-0 text-red-400" />
                        )
                      ) : (
                        <div className="size-3 shrink-0 rounded-full border border-border" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-sdc-confirm-password">Confirm new password</Label>
            <div className="relative">
              <Input
                id="account-sdc-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={(e) => {
                  const next = e.relatedTarget as HTMLElement | null;
                  if (next?.closest?.("[data-password-toggle]")) return;
                  if (next?.id === "account-sdc-new-password") return;
                  setNewPasswordFocused(false);
                }}
                className={cn("h-9", confirmPassword.length > 0 && "pr-10")}
              />
              {confirmPassword.length > 0 ? (
                <button
                  type="button"
                  data-password-toggle
                  className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <Eye className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
            {confirmPassword && !passwordsMatch ? (
              <p className="text-xs text-red-500">Passwords do not match</p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePasswordDialogChange(false)}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleUpdatePassword}
            disabled={!isValid}
            className={footerPrimaryBtnClass}
          >
            Update Password
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        contentClassName="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            Enter your new email address. A verification link will be sent to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-6 pb-4 pt-0">
          <div className="flex flex-col gap-1">
            <Label htmlFor="account-sdc-new-email">New email address</Label>
            <Input
              id="account-sdc-new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEmailDialogOpen(false)}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!newEmail || newEmail === session.user.email}
            className={footerPrimaryBtnClass}
            onClick={() => {
              toast.success("Verification email sent");
              setEmailDialogOpen(false);
            }}
          >
            Update Email
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={twoFactorDialogOpen} onOpenChange={handleTwoFactorDialogChange}>
        <DialogHeader>
          <DialogTitle>Set up authenticator app</DialogTitle>
          <DialogDescription>
            Scan the QR code with an app such as Google Authenticator or Authy, then enter the 6-digit code to
            verify and enable two-factor authentication.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-6 pb-4 pt-0">
          <div className="flex justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8">
            <div
              className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground"
              role="img"
              aria-label="Placeholder for QR code"
            >
              QR code
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="account-sdc-2fa-code">Verification code</Label>
            <Input
              id="account-sdc-2fa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={authenticatorCode}
              onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-9"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTwoFactorDialogChange(false)}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={authenticatorCode.length !== 6}
            className={footerPrimaryBtnClass}
            onClick={handleVerifyAuthenticator}
          >
            Verify and enable
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        contentClassName="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be
            permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(false)}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" size="sm" className={footerPrimaryBtnClass} onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
