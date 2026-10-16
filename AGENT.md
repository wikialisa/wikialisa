# AXQ Vietnam — Agent Reference

> Operational reference for AI agents (Bob, Cursor, Copilot, etc.) working in this codebase.
> Read this before making any changes to `apps/app-web` or related packages.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Product | AXQ Vietnam — Mobile FinTech PWA |
| Stack | Next.js 14 (App Router) + Fastify + Solana (Anchor) |
| Language | TypeScript throughout |
| Package scope | `@wikialisa/*` (not `@vnkr/*`) |
| UI language | Vietnamese (vi-VN) |
| Currency | VND (Vietnamese Dong) — format: `number.toLocaleString("vi-VN") + "đ"` |
| Node | ≥ 18 |
| Package manager | `pnpm` (workspace protocol) |

---

## 2. High-Confidence Edits (Safe to make)

These changes are safe to make without extensive investigation:

### Replacing `window.location.href` with router navigation
```tsx
// BEFORE (wrong)
window.location.href = "/reset-pin";

// AFTER (correct)
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/reset-pin");
```

### Removing demo credential text
Remove any `<Text>` or `<p>` element containing:
- `"Demo: PIN là 123456"`
- `"CORRECT_PIN"` references
- `"MOCK_OTP"`

### Replacing `alert()` with `toast`
```tsx
// BEFORE
alert("Vui lòng chọn khoảng thời gian");

// AFTER
import { toast } from "@wikialisa/ui-kit";
toast.warning("Vui lòng chọn khoảng thời gian");
```

### Adding phone validation
```ts
// Vietnamese mobile: starts with 03|05|07|08|09 + 8 digits
const isValidPhone = /^(03|05|07|08|09)\d{8}$/.test(phone.replace(/^0/, "0"));
```

### Fixing `nextDue` date calculation in auto-debit
```ts
// BEFORE (hardcoded)
nextDue: `${newDay.padStart(2, "0")}/07/2025`,

// AFTER (dynamic)
function getNextDueDate(dueDay: number): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (next <= now) next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
```

---

## 3. Requires Caution — Investigate First

These areas have non-obvious interdependencies:

### Auth state flow
The current auth uses `localStorage` flags. Any change to auth must maintain compatibility with:
- `(app)/layout.tsx` — reads `auth_state`
- `enter-pin/page.tsx` — reads and validates PIN
- `confirm-pin/page.tsx` — writes `pin` and `auth_state`
- `more/page.tsx` — logout (currently broken — does not clear storage)

Do not change auth storage keys without updating all consumers.

### PIN length
There is a known inconsistency: set-pin/confirm-pin use 4 digits; enter-pin/card/reset-pin use 6 digits.
**Do not fix this silently** — coordinate with the team as it affects stored PIN values. Changing to 6 digits requires migrating or invalidating all existing stored PINs.

### `WalletCard` component
The `WalletCard` component in `@wikialisa/ui-kit` accepts `bg: CardBg` — the valid values are `"greeny" | "violet" | "pink" | "dark" | "orange" | "yellow"`. Do not pass hex colors directly.

### Admin layout active item detection
```ts
const activeId = pathname.split("/").slice(-1)[0] ?? "dashboard";
```
This extracts the last URL segment as the nav active ID. Any new admin route must have its page slug match the `id` field in `ADMIN_NAV`.

---

## 4. Never Do

| Rule | Reason |
|------|--------|
| Never store sensitive data in `localStorage` | XSS-accessible; PIN and tokens must not live there |
| Never add more hardcoded credentials | CRIT-02 is an existing issue; do not multiply it |
| Never use `window.location.href` for in-app navigation | Causes full PWA reload, loses shell state |
| Never use `alert()` | Use `toast.*` from `@wikialisa/ui-kit` |
| Never use `@vnkr/*` package imports | Scope is `@wikialisa/*` |
| Never import from `react-icons` | All icons are in `@wikialisa/ui-kit` |
| Never add `Math.random()` to simulate failures | Causes unpredictable production UX |
| Never add inline `<script>` tags | CSP violation |
| Never import from `../../packages/ui-kit/src` directly | Use the package name `@wikialisa/ui-kit` |

---

## 5. Common File Locations

| What | Where |
|------|-------|
| App screens | `apps/app-web/src/app/(app)/[screen]/page.tsx` |
| Auth screens | `apps/app-web/src/app/(auth)/[screen]/page.tsx` |
| Admin screens | `apps/app-web/src/app/admin/[screen]/page.tsx` |
| App layout (auth guard) | `apps/app-web/src/app/(app)/layout.tsx` |
| Auth layout (blank shell) | `apps/app-web/src/app/(auth)/layout.tsx` |
| Admin layout (sidebar) | `apps/app-web/src/app/admin/layout.tsx` |
| Root layout (fonts, metadata) | `apps/app-web/src/app/layout.tsx` |
| Global styles | `apps/app-web/src/app/globals.css` |
| Next.js config | `apps/app-web/next.config.mjs` |
| Shared types | `packages/types/src/index.ts` |
| Feature flags | `packages/config/src/features.ts` |
| API gateway routes | `services/api-gateway/src/routes/` |
| JWT utilities | `services/api-gateway/src/lib/jwt.ts` |
| Solana contract addresses | `packages/contracts/exports/addresses.json` |
| PM2 process config | `ecosystem.config.cjs` |
| Audit findings | `AUDIT.md` |
| Dev skill reference | `SKILL.md` |

---

## 6. TypeScript Rules

- All screens are `"use client"` — no server components in `(app)/` or `(auth)/`
- `export const dynamic = "force-dynamic"` is required on admin pages
- Type assertions follow the pattern `(row as unknown as TargetType)` — not `(row as TargetType)` which fails `TS2352`
- Run type check: `pnpm --filter app-web exec tsc --noEmit`
- Build errors are currently suppressed in `next.config.mjs` — TypeScript errors will not fail `pnpm build`

---

## 7. Screen Development Checklist

When adding or editing a screen in `apps/app-web`, verify:

- [ ] File starts with `"use client";`
- [ ] No `window.location.href` — uses `router.push()` instead
- [ ] No `alert()` — uses `toast.*` instead
- [ ] No hardcoded credentials, PIN values, or mock OTPs
- [ ] No `Math.random()` failure simulations
- [ ] All imports from `@wikialisa/*` (not `@vnkr/*`)
- [ ] Financial action buttons are protected by PIN gate or auth check
- [ ] Modals use `variant="sheet"` (bottom sheet, mobile-friendly) or `variant="center"` for confirmations
- [ ] Money amounts use `amount.toLocaleString("vi-VN") + "đ"` formatting
- [ ] Error states shown via `toast.error()` or inline error component
- [ ] Loading states use `loading={true}` prop on `<Button>`
- [ ] No direct DOM manipulation (`document.querySelector`, etc.)
- [ ] `paddingBottom: 32` on root container to clear bottom nav

---

## 8. Current Audit Status

See `AUDIT.md` for the complete findings. Summary:

- **4 CRITICAL** issues — all blocking production
- **6 HIGH** issues — blocking beta launch
- **12 MEDIUM** issues — required before GA
- **18 LOW/UX** issues — planned for hardening sprints

The most common type of issue is **mock data / simulated API calls** that need to be replaced with real backend integration. Almost every screen has at least one `setTimeout`-based fake API call.

---

## 9. Turbo / Build Commands

```bash
# Full monorepo build
pnpm turbo run build

# app-web only — dev server
pnpm --filter app-web dev

# app-web only — production build
pnpm --filter app-web build

# Type check (critical — do this before PRs)
pnpm --filter app-web exec tsc --noEmit

# Lint
pnpm --filter app-web lint

# Install all deps
pnpm install

# PM2 (production)
pm2 start ecosystem.config.cjs
pm2 logs app-web
pm2 restart app-web
```

---

## 10. Monorepo Dependency Graph (simplified)

```
apps/app-web
  └── @wikialisa/ui-kit
  └── @wikialisa/types
  └── @wikialisa/config
  └── @wikialisa/core-sdk
       └── @wikialisa/types

services/api-gateway
  └── @wikialisa/db
  └── @wikialisa/types
  └── @wikialisa/config

services/fiat-connector-api
  └── @wikialisa/swift-adapter
  └── @wikialisa/types

services/role-engine
  └── @wikialisa/db
  └── @wikialisa/types
```

When changing `packages/types`, rebuild all downstream packages.
When changing `packages/ui-kit`, restart `apps/app-web` dev server.
