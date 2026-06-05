# Next.js Agency Starter

A full-featured agency/SaaS starter template built with Next.js 16, React 19, and TypeScript. Includes an admin portal, authentication scaffolding, branding customization, email template editor, and a public marketing site — all with dark mode support.

## Tech Stack

- **Framework:** Next.js 16.1 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, Radix UI, Class Variance Authority
- **Data Grid:** AG Grid Community
- **Charts:** AG Charts Community
- **Rich Text:** TipTap
- **Email Editor:** react-email-editor (Unlayer)
- **Auth:** WorkOS (scaffolded)
- **Database:** Convex (scaffolded)
- **Email:** Resend
- **Theming:** next-themes (light/dark mode)
- **Icons:** Lucide React
- **Toasts:** Sonner

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). The admin portal is at [/admin/dashboard](http://localhost:3000/admin/dashboard).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | Convex deploy key |
| `WORKOS_CLIENT_ID` | WorkOS client ID for authentication |
| `WORKOS_API_KEY` | WorkOS API key |
| `WORKOS_COOKIE_PASSWORD` | Secret for encrypting session cookies |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `NEXT_PUBLIC_APP_URL` | Public app URL (default: `http://localhost:3000`) |

> The app runs with mock data by default — no environment variables are required for local development.

## Project Structure

```
src/
├── app/
│   ├── (admin)/admin/          # Admin portal (dashboard, users, email templates, branding, legal)
│   ├── (auth)/                 # Auth pages (login, signup, forgot/reset password)
│   ├── (home)/                 # Public marketing pages (landing, about, terms, privacy)
│   ├── (main)/                 # Protected user pages (account settings)
│   ├── api/                    # API routes (branding, email, legal)
│   ├── globals.css             # Design tokens (HSL color system, light/dark mode)
│   └── layout.tsx              # Root layout (fonts, providers, metadata)
├── components/
│   ├── ui/                     # Base components (Button, Card, Dialog, Input, etc.)
│   ├── layout/                 # Layout components (Navbar, AdminSidebar, PageHeader)
│   └── home/                   # Marketing page components (Hero, Features, CTA)
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (cn, constants, email, rate-limit)
├── mock/                       # Mock data (users, dashboard, email templates, legal)
├── providers/                  # Context providers (auth, Convex)
└── types/                      # TypeScript type definitions
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/about` | About page |
| `/terms` | Terms of use |
| `/privacy` | Privacy policy |
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset password |
| `/account` | User account settings (profile, credentials, notifications, payment) |
| `/admin/dashboard` | Admin dashboard with charts (revenue, users, projects, email) |
| `/admin/users` | User management table (AG Grid) |
| `/admin/email-templates` | Email template list |
| `/admin/email-templates/new` | Create email template (Unlayer editor) |
| `/admin/email-templates/:id` | Edit email template |
| `/admin/branding` | Logo, favicon, and primary color customization |
| `/admin/legal` | Terms of use and privacy policy editor |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Customization

### Brand Colors

The primary color is defined as an HSL value in `src/app/globals.css`:

```css
:root {
  --primary: hsl(217 87% 50%);
}
```

Chart colors (`--chart-1` through `--chart-5`) use the same hue with varying lightness. The admin branding page at `/admin/branding` allows runtime color changes via a color picker.

### Logos and Favicons

Replace the files in `public/`:
- `logo.svg` — Light mode logo
- `logo-dark-mode.svg` — Dark mode logo
- `favicon.ico` — Light mode favicon
- `favicon-dark.ico` — Dark mode favicon

Or use the admin branding page to upload new assets.

### Mock Data

All pages use mock data from `src/mock/`. To connect real APIs:

1. **Users** — Replace `mockUsers` in `src/mock/users.ts` with API calls
2. **Dashboard stats** — Replace `mockDashboardStats` and chart data in `src/mock/dashboard.ts`
3. **Email templates** — Replace `mockEmailTemplates` in `src/mock/email-templates.ts`
4. **Legal pages** — Replace `mockLegalPages` in `src/mock/legal.ts`

### Authentication

Auth is scaffolded with a mock session in `src/providers/auth-provider.tsx`. The `useSession()` hook provides the current user. To integrate real auth:

1. Configure WorkOS environment variables
2. Update `src/middleware.ts` with WorkOS session verification
3. Replace the mock session in `auth-provider.tsx` with real session data

### Adding Components

UI components live in `src/components/ui/` and follow the shadcn/ui pattern — Radix UI primitives styled with Tailwind and CVA variants. The `cn()` utility from `src/lib/utils.ts` handles conditional class merging.
