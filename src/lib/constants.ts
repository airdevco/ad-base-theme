export const APP_NAME = "Airdev";

/** Set to true to show the light/dark mode toggle in the user menu */
export const SHOW_THEME_TOGGLE = false;

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** Post-verify onboarding (`?step=1` … `?step=6`). */
  onboarding: "/onboarding",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  account: "/account",
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    emailTemplates: "/admin/email-templates",
    settings: "/admin/settings",
    pages: "/admin/pages",
  },
  themes: "/theme",
  terms: "/terms",
  privacy: "/privacy",
  setup: "/setup",
} as const;
