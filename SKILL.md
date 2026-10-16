---
name: wikialisa
description: >
  Project-specific development skill for the AXQ Vietnam monorepo.
  Covers architecture, conventions, package scopes, service topology,
  and common patterns across apps, packages, and services.
  Use when working on any code in this repository.
---

# AXQ Vietnam — Developer Skill

## Repository Overview

**Monorepo** managed with `pnpm` workspaces + Turborepo.

```
/
├── apps/
│   ├── app-web/          Next.js 14 App Router PWA  (port 3010)
│   └── landing/          Marketing landing page
├── packages/
│   ├── ui-kit/           Shared React component library
│   ├── types/            Shared TypeScript interfaces & enums
│   ├── config/           Feature flags & environment config
│   ├── core-sdk/         Client SDK for API gateway
│   ├── db/               Database schema & Prisma client
│   ├── contracts/        Solana smart contract bindings (Anchor)
│   ├── merchant-sdk/     Merchant integration SDK
│   └── swift-adapter/    SWIFT message formatting utilities
├── services/
│   ├── api-gateway/      Fastify REST API            (port 3000)
│   ├── fiat-connector-api/ Bank connector service    (port 3001)
│   └── role-engine/      RBAC permission service     (port 3002)
└── docs/
    └── INFRASTRUCTURE_STANDARDS.md
```

## Package Scope

All packages use the **`@wikialisa/*`** scope (not `@vnkr/*`).

A webpack alias in `apps/app-web/next.config.mjs` maps legacy `@vnkr/ui-kit` → `@wikialisa/ui-kit`.

```js
// apps/app-web/next.config.mjs
config.resolve.alias["@vnkr/ui-kit"] = path.resolve("../../packages/ui-kit/src");
```

When writing new imports, always use `@wikialisa/*`.

## apps/app-web Conventions

### Tech Stack

- **Framework:** Next.js 14 (App Router, `"use client"` pattern throughout)
- **Language:** TypeScript (strict mode; `ignoreBuildErrors` currently true — do not rely on this)
- **Styling:** Inline styles with CSS-in-JS objects (no Tailwind, no CSS Modules in page files)
- **Component library:** `@wikialisa/ui-kit`
- **State:** `useState` / `useEffect` — no Redux, no Zustand
- **Navigation:** `next/navigation` (`useRouter`, `usePathname`) — **do not use `window.location.href`**
- **Fonts:** Work Sans (Google Fonts, loaded in root layout)
- **PWA:** `next-pwa` plugin, service worker auto-generated

### Route Groups

```
src/app/
├── (auth)/          Unauthenticated screens (blank AppShell, no bottom nav)
│   ├── layout.tsx   AppShell layout="blank"
│   ├── splash/
│   ├── onboarding/
│   ├── register/
│   ├── otp/
│   ├── set-pin/
│   ├── confirm-pin/
│   ├── enter-pin/
│   ├── forgot-password/
│   └── login/
├── (app)/           Authenticated screens (BottomNav chrome)
│   ├── layout.tsx   Auth guard + AppShell with nav
│   ├── home/
│   ├── transfer/
│   ├── p2p/
│   ├── swift/
│   ├── crypto/
│   ├── cashback/
│   ├── qr-scan/
│   ├── onramp/
│   ├── ekyc/
│   ├── security/
│   ├── reset-pin/
│   ├── uetr/
│   ├── receipt/
│   ├── referral/
│   ├── learn/
│   ├── support/
│   ├── more/
│   ├── auto-debit/
│   ├── card/
│   └── crypto-deposit/
└── admin/           Admin portal (SidebarLayout chrome)
    ├── layout.tsx   SidebarLayout + ADMIN_NAV sections
    ├── dashboard/
    ├── kyc/
    ├── finance/
    ├── users/
    ├── cms/
    └── compliance/
```

### UI Kit Import Pattern

```tsx
import {
  Button, Text, Input, Modal, Badge, Toggle, ListItem,
  toast, PinPad, WalletCard, QRCodeModal,
  // icons:
  Plus, Trash, ArrowRight, ShieldCheck, AlertCircle,
} from "@wikialisa/ui-kit";
```

All components and icons come from the single package. Do not import from `react-icons` or other icon libraries.

### Color Palette (brand)

| Token | Value | Usage |
|-------|-------|-------|
| Brand black | `#1A1F36` | Primary text, filled buttons |
| Brand green | `#BEFF6C` | Accent on dark backgrounds |
| Muted | `#A0AEC0` | Secondary text, captions |
| Success | `#00D68F` | Positive states |
| Error | `#FF3D71` | Destructive actions, failures |
| Warning | `#FFAA00` | Alerts, anomaly warnings |
| Info | `#0095FF` | Informational states |
| Violet | `#AF96FB` | Crypto / Web3 contexts |

### Common Component Patterns

#### Page skeleton
```tsx
"use client";
import React, { useState } from "react";
import { Text, Button } from "@wikialisa/ui-kit";

export default function MyPage() {
  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 8px" }}>
        <Text variant="h6" weight="semibold" color="#1A1F36">Title</Text>
      </div>
      {/* Content */}
    </div>
  );
}
```

#### Modal pattern
```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  variant="sheet"          // "sheet" | "center"
  title="Title"
  subtitle="Subtitle"
  footer={<Button variant="filled" color="dark" size="lg" fullWidth onClick={onConfirm}>Xác nhận</Button>}
>
  {/* body */}
</Modal>
```

#### Toast notifications
```tsx
toast.success("Thành công");
toast.error("Lỗi");
toast.warning("Cảnh báo");
toast.info("Thông tin");
```

### Auth State (current — to be replaced)

> ⚠️ Current auth is localStorage-based mock. All of the below should eventually be replaced with real JWT/cookie auth.

| Key | Storage | Value |
|-----|---------|-------|
| `auth_state` | localStorage | `"onboarded"` when authenticated |
| `pin` | localStorage | 4-digit PIN (plaintext — **must be fixed**) |
| `pin_temp` | sessionStorage | PIN during set-pin step |
| `access_token` | localStorage | JWT access token |
| `refresh_token` | localStorage | JWT refresh token |
| `balance_visible` | localStorage | `"true"` / `"false"` |

### Navigation (App Screens)

Always use `useRouter` from `next/navigation`:

```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/home");
router.back();
```

**Never use `window.location.href`** — it causes full page reloads in the PWA shell.

## packages/types

Central TypeScript interfaces. Key types:

```ts
UserProfile       // user identity
Transaction       // financial transaction
TransferRequest   // P2P/bank transfer
KYCSubmission     // eKYC document data
WalletBalance     // multi-currency balance
SwiftPayment      // SWIFT transfer fields
CryptoAsset       // crypto portfolio entry
```

Import: `import type { UserProfile } from "@wikialisa/types";`

## packages/config

Feature flags:

```ts
import { FEATURES } from "@wikialisa/config";
// FEATURES.CRYPTO_ENABLED, FEATURES.P2P_ENABLED, etc.
```

## services/api-gateway

- **Framework:** Fastify
- **Auth:** JWT (`services/api-gateway/src/lib/jwt.ts`) — access + refresh token pair
- **Base URL:** `http://localhost:3000` (dev), env var `API_GATEWAY_URL` (prod)
- **Routes:** `/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/transactions/*`

Real API routes available:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

## Known Issues (from AUDIT.md)

See `AUDIT.md` for the full audit. Critical items to keep in mind when editing code:

1. **Do not add more `window.location.href`** — use `router.push()`
2. **Do not store sensitive data in localStorage** — no tokens, no PINs
3. **Do not add more hardcoded credentials** — no `"123456"`, no `"0000"`
4. **Do not add more `Math.random()` failure simulations**
5. **Always call `toast.*`** instead of `alert()`
6. **Build errors are suppressed** — TypeScript errors will not fail `pnpm build`; run `pnpm typecheck` manually

## Running the App

```bash
# Install
pnpm install

# Dev (all services)
pnpm dev

# Dev (app-web only)
pnpm --filter app-web dev

# Type-check (app-web)
pnpm --filter app-web exec tsc --noEmit

# Build (app-web)
pnpm --filter app-web build

# PM2 production
pm2 start ecosystem.config.cjs
```

## Turbo Pipeline

```bash
pnpm turbo run build      # build all packages in dependency order
pnpm turbo run typecheck  # type-check all packages
pnpm turbo run lint       # lint all packages
```
