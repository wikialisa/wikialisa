# AXQ Vietnam — UI/UX & Security Audit

> **Scope:** `apps/app-web` (Next.js 14 PWA, port 3010)
> **Date:** July 2025
> **Auditor:** Internal Engineering Review
> **TypeScript baseline:** 0 errors after pre-audit fixes (49 TS2352 casts corrected across `admin/cms`, `admin/finance`, `admin/kyc`, `admin/users`)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Security Issues](#2-critical-security-issues)
3. [High Severity Issues](#3-high-severity-issues)
4. [Medium Severity Issues](#4-medium-severity-issues)
5. [Low / UX Issues](#5-low--ux-issues)
6. [Screen-by-Screen Findings](#6-screen-by-screen-findings)
7. [Missing Implementations (TODO)](#7-missing-implementations-todo)
8. [Admin Portal Findings](#8-admin-portal-findings)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Recommendations Priority Matrix](#10-recommendations-priority-matrix)

---

## 1. Executive Summary

The `app-web` frontend is a well-structured Next.js 14 PWA using a consistent design system (`@wikialisa/ui-kit`). The visual language is polished and the component architecture is clean. However, the application is **not production-ready** in its current state due to pervasive use of mock data, hardcoded credentials, insecure credential storage patterns, and incomplete authentication flows.

**Issue count by severity:**

| Severity | Count |
|----------|-------|
| CRITICAL | 4     |
| HIGH     | 6     |
| MEDIUM   | 12    |
| LOW/UX   | 18    |
| **Total**| **40**|

---

## 2. Critical Security Issues

### CRIT-01 — Mã OTP hardcode `"0000"` trong `/otp`

**File:** `apps/app-web/src/app/(auth)/otp/page.tsx`

```ts
const MOCK_OTP = "0000";
```

Any 4-digit value is accepted but the constant is never conditionally disabled. Shipping this to production allows anyone to bypass OTP verification with `0000`. Must be replaced with real server-side OTP validation before any production deployment.

**Inconsistency:** `/forgot-password` uses a real 6-digit OTP flow via `/api/v1/auth/forgot-password`; `/otp` uses a 4-digit mock. The digit length should be consistent (6 recommended per Vietnamese banking standards).

---

### CRIT-02 — Demo credentials visible in production UI

**Files:** `apps/app-web/src/app/(auth)/enter-pin/page.tsx`, `apps/app-web/src/app/(app)/card/page.tsx`, `apps/app-web/src/app/(app)/reset-pin/page.tsx`

```tsx
<Text variant="caption" color="#A0AEC0">Demo: PIN là 123456</Text>
```

This text is rendered directly in the UI in three separate screens. Users in production would see "Demo: PIN là 123456". This is a development aid that must be removed or gated behind an environment flag before any release.

---

### CRIT-03 — PIN stored in plaintext in `localStorage`

**File:** `apps/app-web/src/app/(auth)/confirm-pin/page.tsx`

```ts
localStorage.setItem("pin", pin);          // 4-digit PIN, cleartext
sessionStorage.setItem("pin_temp", pin);   // set-pin stage, cleartext
```

PINs must never be stored in web storage. `localStorage` is accessible to any JavaScript running in the same origin — making it trivially readable by XSS attacks. The correct pattern is: hash the PIN client-side (e.g., PBKDF2 with a per-user salt) and only store the hash, or validate PIN exclusively server-side over HTTPS.

---

### CRIT-04 — No real authentication guard; `auth_state` is bypassable

**File:** `apps/app-web/src/app/(app)/layout.tsx`

The authentication check reads `localStorage.getItem("auth_state") === "onboarded"`. A user can open DevTools and set this value to bypass the entire onboarding/auth flow. There is no JWT validation, no session cookie check, and no server-side route protection.

---

## 3. High Severity Issues

### HIGH-01 — JWT tokens stored in `localStorage` (XSS-vulnerable)

**File:** `apps/app-web/src/app/(auth)/login/page.tsx`

```ts
localStorage.setItem("access_token", data.accessToken);
localStorage.setItem("refresh_token", data.refreshToken);
```

`localStorage` is accessible to any script on the page. The industry standard for web apps handling financial data is to store JWTs in `httpOnly` cookies, which are inaccessible to JavaScript. This prevents token theft via XSS.

---

### HIGH-02 — Logout does not clear tokens

**File:** `apps/app-web/src/app/(app)/more/page.tsx`

The logout button shows a confirmation modal but does not call `localStorage.removeItem()` on any auth keys (`access_token`, `refresh_token`, `pin`, `auth_state`). After "logout" the user's tokens remain in storage, allowing session persistence and potential session hijacking.

---

### HIGH-03 — PIN digit-length inconsistency (4 vs 6 digits)

Three separate PIN entry flows use different lengths:

| Screen | Expected length | Note |
|--------|----------------|-------|
| `/set-pin` | 4 digits | `PinPad length={4}` |
| `/confirm-pin` | 4 digits | `PinPad length={4}` |
| `/enter-pin` | 6 digits | `PinPad length={6}`, hardcoded `CORRECT_PIN = "123456"` |
| `/card` (CVV reveal) | 6 digits | `PinPad length={6}` |
| `/reset-pin` | 6 digits | `PinPad length={6}` |

A user setting a 4-digit PIN at registration can never successfully enter it on screens that expect 6 digits. This breaks the entire PIN-based auth loop.

---

### HIGH-04 — Card CVV PIN check hardcoded to `"123456"`

**File:** `apps/app-web/src/app/(app)/card/page.tsx`

```ts
if (pin === "123456") { /* show CVV */ }
```

The CVV reveal check is entirely client-side and compares against a hardcoded string. This is not a real PIN verification — it must call an authenticated API endpoint.

---

### HIGH-05 — `window.location.href` navigation causes full page reload

**Files:** `admin/layout.tsx`, `(app)/card/page.tsx`, multiple screens

```ts
window.location.href = item.href;       // admin/layout.tsx
window.location.href = "/reset-pin";   // card/page.tsx
```

Using `window.location.href` discards the React component tree, loses all in-memory state, and causes a full network round-trip. For a PWA this is particularly harmful as it defeats the shell architecture. These must be replaced with `router.push()` from `next/navigation`.

---

### HIGH-06 — eKYC liveness detection is entirely simulated

**File:** `apps/app-web/src/app/(app)/ekyc/page.tsx`

The liveness step uses a `setTimeout` to fake a result. Real regulatory KYC requires a server-validated liveness check (e.g., ISO 30107 PAD level 2). The current implementation will not satisfy Nghị định 284/2025/NĐ-CP identity verification requirements.

---

## 4. Medium Severity Issues

### MED-01 — Phone registration lacks `+84` normalization and proper format validation

**File:** `apps/app-web/src/app/(auth)/register/page.tsx`

Validation only checks `phone.length >= 8`. Vietnamese mobile numbers have 10 digits (post-2018 migration). The form should:
- Strip leading `0` and prepend `+84` before API submission
- Validate the format against Vietnamese carrier patterns: `/(03|05|07|08|09)\d{8}/`
- Show a real-time error for invalid formats

---

### MED-02 — Transfer contacts are hardcoded mock data

**File:** `apps/app-web/src/app/(app)/transfer/page.tsx`

```ts
const CONTACTS = [
  { id: "1", name: "Nguyễn Văn A", account: "0901234567", bank: "AXQ" },
  ...
];
```

The contact list is never fetched from an API. Any actual user's contacts would not appear.

---

### MED-03 — P2P, SWIFT, crypto, onramp — all transactions are mock

All transaction submission handlers simulate an API call with `setTimeout` and immediately show a success state. There are no real API calls being made. These screens cannot process real money.

---

### MED-04 — Chart timeframe selector does nothing

**File:** `apps/app-web/src/app/(app)/crypto/page.tsx`, `apps/app-web/src/app/(app)/home/page.tsx`

Buttons for `1D / 1W / 1M / 3M / 1Y` timeframes are rendered and clickable but the underlying chart data array never changes when a different period is selected. Users see the same chart regardless of selection.

---

### MED-05 — 2FA TOTP setup QR is a `Math.random()` pixel grid

**File:** `apps/app-web/src/app/(app)/security/page.tsx`

```tsx
{Array.from({ length: 25 }).map((_, i) => (
  <div key={i} style={{ background: Math.random() > 0.5 ? "#000" : "#fff" }} />
))}
```

The "QR code" is a 5×5 randomly generated black/white pixel grid. It is not a valid QR code, cannot be scanned, and does not contain a real TOTP secret. Users enabling 2FA receive no real protection. This requires integration with a real TOTP library (e.g., `otpauth`) and a proper QR rendering library (e.g., `qrcode.react`).

---

### MED-06 — QR auto-scan picks from `MOCK_SCANS` (no real camera API)

**File:** `apps/app-web/src/app/(app)/qr-scan/page.tsx`

After 3 seconds a random entry from `MOCK_SCANS` is "detected". There is no integration with a camera or QR decoding library (e.g., `jsQR`, `@zxing/library`). Real QR scanning requires `getUserMedia`.

---

### MED-07 — Dynamic QR deposit code has no real value

**File:** `apps/app-web/src/app/(app)/qr-scan/page.tsx`

The QR code generated for receiving payments uses a hardcoded placeholder string. VietQR codes must encode a specific format (`NAPAS247` bank transfer standard) with real account details from an authenticated API.

---

### MED-08 — Auto-debit: `nextDue` date hardcoded to July 2025

**File:** `apps/app-web/src/app/(app)/auto-debit/page.tsx`

```ts
nextDue: `${newDay.padStart(2, "0")}/07/2025`,
```

When a new bill is added, `nextDue` is always set to July 2025 regardless of the current date. This should calculate the next occurrence of `dueDay` from `new Date()`.

---

### MED-09 — Card: "Add card" generates random last4 and CVV client-side

**File:** `apps/app-web/src/app/(app)/card/page.tsx`

```ts
last4: String(Math.floor(1000 + Math.random() * 9000)),
cvv:   String(Math.floor(100 + Math.random() * 900)),
```

Card numbers and CVV codes are generated client-side using `Math.random()`. Real card issuance must happen server-side with a PCI-DSS compliant card management system.

---

### MED-10 — `/learn/:courseId` route does not exist

**File:** `apps/app-web/src/app/(app)/learn/page.tsx`

Course list items link to `/learn/${courseId}` but there is no corresponding page under `apps/app-web/src/app/(app)/learn/[courseId]/`. Clicking any course leads to a Next.js 404 page.

---

### MED-11 — Referral claim requires no PIN (inconsistent with cashback withdrawal)

**File:** `apps/app-web/src/app/(app)/referral/page.tsx`

Cashback withdrawal correctly routes to `/enter-pin?action=withdraw` before releasing funds. The referral commission claim has no such gate — clicking "Nhận thưởng" immediately shows a success modal. Financial actions should require consistent authentication.

---

### MED-12 — `alert()` used in admin compliance page

**File:** `apps/app-web/src/app/admin/compliance/page.tsx`

```ts
if (!nq05From || !nq05To) { alert("Vui lòng chọn khoảng thời gian"); return; }
```

Native `alert()` is visually inconsistent with the rest of the UI which uses `toast`. It also blocks the main thread. Replace with `toast.warning()` or inline validation.

---

## 5. Low / UX Issues

### UX-01 — Splash screen auto-navigation has no skip affordance

**File:** `apps/app-web/src/app/(auth)/splash/page.tsx`

The 2-second timer forces all users through `/splash → /onboarding`. Returning users who reopen the PWA are shown onboarding slides every time. Add a check for `auth_state` to redirect authenticated users directly to `/home`.

---

### UX-02 — Home balance toggle state persisted too broadly

**File:** `apps/app-web/src/app/(app)/home/page.tsx`

`balanceVisible` is stored in `localStorage`, meaning the balance-hidden preference persists across all sessions and devices. This is likely unintentional — most users would want to see their balance by default when opening the app.

---

### UX-03 — Transfer OTP threshold (>20M VND) hardcoded

**File:** `apps/app-web/src/app/(app)/transfer/page.tsx`

```ts
if (amount > 20_000_000) { /* require OTP */ }
```

The OTP threshold is hardcoded. Per SBV regulations, this threshold may change. It should be a server-side config value fetched on page load.

---

### UX-04 — P2P escrow timer does not survive page refresh

**File:** `apps/app-web/src/app/(app)/p2p/page.tsx`

The 15-minute escrow countdown is initialized from `useState(15 * 60)` and ticks with `setInterval`. Refreshing the page resets it to 15 minutes. The timer should be anchored to a server-provided expiry timestamp.

---

### UX-05 — SWIFT 60-second FX rate lock has same persistence problem

**File:** `apps/app-web/src/app/(app)/swift/page.tsx`

The FX rate lock countdown is purely client-side. A page refresh resets the 60-second window, allowing rate manipulation by repeatedly refreshing to get a favorable rate before the backend actually locks it.

---

### UX-06 — Home chart 5% random error simulation left in code

**File:** `apps/app-web/src/app/(app)/home/page.tsx`

```ts
if (Math.random() < 0.05) throw new Error("Simulated chart error");
```

This causes the chart to randomly fail on ~5% of renders in all environments including production. Remove or gate behind `process.env.NODE_ENV === "development"`.

---

### UX-07 — onramp FX rate lock 30s also client-side only

Same class of issue as UX-05. The countdown is decorative — the backend does not enforce the rate lock window.

---

### UX-08 — Receipt page uses `window.print()` only

**File:** `apps/app-web/src/app/(app)/receipt/page.tsx`

Receipt export only uses `window.print()`. On mobile PWA, print dialogs are poorly supported. A proper PDF generation approach (e.g., `jsPDF`, or a server-side PDF endpoint) should be used.

---

### UX-09 — Support ticket ID generated client-side

**File:** `apps/app-web/src/app/(app)/support/page.tsx`

```ts
const ticketId = `TKT-${Date.now()}`;
```

Ticket IDs generated client-side with `Date.now()` can collide and are not traceable by the backend. Ticket IDs should be assigned by the server.

---

### UX-10 — UETR search simulates a 1.2s delay with no real lookup

**File:** `apps/app-web/src/app/(app)/uetr/page.tsx`

All UETR queries return the same mock timeline regardless of the input UETR value. Real integration with SWIFT gpi API is needed.

---

### UX-11 — `/more` settings page: items link to non-existent routes

**File:** `apps/app-web/src/app/(app)/more/page.tsx`

Several settings list items (language, notification preferences, privacy policy, terms of service) navigate to routes that have no corresponding page in the app directory.

---

### UX-12 — Admin sidebar uses `window.location.href` for navigation

**File:** `apps/app-web/src/app/admin/layout.tsx`

```ts
if (item?.href) window.location.href = item.href;
```

The admin sidebar `onNavChange` callback uses `window.location.href`. In a Next.js App Router layout, this causes a full page reload on every nav item click. Use `router.push()` via `useRouter()`.

---

### UX-13 — Card `WalletCard` uses `window.innerWidth` in SSR context

**File:** `apps/app-web/src/app/(app)/card/page.tsx`

```ts
width={Math.min(320, typeof window !== "undefined" ? window.innerWidth - 40 : 320)}
```

While guarded, this can cause a layout shift (CLS) because the server renders at 320px and the client may render a different width. Use a CSS-based responsive approach or `useEffect` + state.

---

### UX-14 — `crypto-deposit` withdraw: minimum validation uses deposit `minDeposit` field

**File:** `apps/app-web/src/app/(app)/crypto-deposit/page.tsx`

The withdrawal form validates `amt < network.minDeposit`. The minimum for withdrawal is typically different from minimum deposit (especially for gas fee coverage). Separate `minWithdraw` config should exist per network.

---

### UX-15 — Auto-debit `retryBill`: off-by-one in retry date labels

**File:** `apps/app-web/src/app/(app)/auto-debit/page.tsx`

```ts
const retryDates = ["T+1 (ngày mai)", "T+3 (3 ngày nữa)"];
return { ...b, retrySchedule: [...b.retrySchedule, { attempt: nextRetry + 1, date: retryDates[nextRetry - 1] ?? "—" }] };
```

On the first retry call (`retryCount` goes from 0 → 1), `retryDates[0]` = "T+1". On second retry (0 → 2 after `nextRetry + 1` of previous call), `retryDates[1]` = "T+3". However the initial bills already have `retryCount: 2` and `retrySchedule` pre-populated — clicking retry a third time sets `status: "cancelled"` correctly, but the `attempt` field shows `4` (nextRetry+1 = 3+1), while logically this is the 3rd attempt. Minor confusion for support agents reviewing logs.

---

### UX-16 — eKYC file upload uses `<input type="file">` with no size/type validation

**File:** `apps/app-web/src/app/(app)/ekyc/page.tsx`

The document photo upload has no client-side file size or MIME type validation. A user could upload a 50MB video file. Add: `accept="image/jpeg,image/png,image/webp"` and `maxSize: 5MB`.

---

### UX-17 — `security` page device list shows mock data, revoke is client-only

**File:** `apps/app-web/src/app/(app)/security/page.tsx`

The list of "trusted devices" is static mock data. Revoking a device only removes it from local state — no API call is made, so the device remains active on the backend.

---

### UX-18 — `learn` page filter by level changes UI state but data is not actually filtered

**File:** `apps/app-web/src/app/(app)/learn/page.tsx`

The level filter buttons (`Cơ bản`, `Trung cấp`, `Nâng cao`) update a `selectedLevel` state that changes button styling but the course list below is not filtered by it. The filtering logic is missing.

---

## 6. Screen-by-Screen Findings

### Auth Screens

| Screen | Route | Status | Key Issues |
|--------|-------|--------|------------|
| Splash | `/splash` | ⚠️ | No returning-user redirect (UX-01) |
| Onboarding | `/onboarding` | ✅ | Clean; swipe + dots work correctly |
| Register | `/register` | ⚠️ | No phone format validation (MED-01), no email field despite type having it |
| OTP | `/otp` | 🔴 | MOCK_OTP hardcoded `"0000"` (CRIT-01), 4 vs 6 digit inconsistency |
| Set PIN | `/set-pin` | 🔴 | 4 digits (inconsistent with enter-pin's 6 digits) |
| Confirm PIN | `/confirm-pin` | 🔴 | PIN stored plaintext in localStorage (CRIT-03) |
| Enter PIN | `/enter-pin` | 🔴 | Hardcoded `CORRECT_PIN = "123456"`, demo text visible (CRIT-02) |
| Forgot Password | `/forgot-password` | ✅ | Calls real API; only screen with real auth logic |
| Login | `/login` | 🔴 | Calls real API but stores JWT in localStorage (HIGH-01) |

### App Screens

| Screen | Route | Status | Key Issues |
|--------|-------|--------|------------|
| Home | `/home` | ⚠️ | 5% random chart error (UX-06), timeframe selector broken (MED-04) |
| Transfer | `/transfer` | ⚠️ | Mock contacts (MED-02), mock submission (MED-03), hardcoded OTP threshold (UX-03) |
| P2P | `/p2p` | ⚠️ | Client-side timer (UX-04), all mock data |
| SWIFT | `/swift` | ⚠️ | Rate lock client-only (UX-05), all mock data |
| Crypto | `/crypto` | ⚠️ | Timeframe selector broken (MED-04) |
| Cashback | `/cashback` | ✅ | Good PIN routing, fraud double-use prevention logic present |
| QR Scan | `/qr-scan` | ⚠️ | Mock auto-scan (MED-06), no real camera API |
| Onramp | `/onramp` | ⚠️ | Rate lock client-only (UX-07), mock submission |
| eKYC | `/ekyc` | 🔴 | Liveness is fake (HIGH-06), no file validation (UX-16) |
| Security | `/security` | 🔴 | TOTP QR is random pixels (MED-05), device revoke is mock (UX-17) |
| Reset PIN | `/reset-pin` | 🔴 | Demo credentials visible (CRIT-02) |
| UETR | `/uetr` | ⚠️ | Mock search (UX-10) |
| Receipt | `/receipt` | ⚠️ | Static mock receipt, print-only PDF (UX-08) |
| Referral | `/referral` | ⚠️ | No PIN gate on claim (MED-11) |
| Learn | `/learn` | ⚠️ | Filter broken (UX-18), courseId route missing (MED-10) |
| Support | `/support` | ⚠️ | Client-side ticket ID (UX-09) |
| More | `/more` | 🔴 | Logout doesn't clear tokens (HIGH-02), dead links (UX-11) |
| Auto-Debit | `/auto-debit` | ⚠️ | Hardcoded July 2025 nextDue (MED-08), no real API |
| Card | `/card` | 🔴 | CVV PIN hardcoded (HIGH-04), card generated client-side (MED-09), `window.location.href` (HIGH-05) |
| Crypto Deposit | `/crypto-deposit` | ⚠️ | No real blockchain integration, minWithdraw != minDeposit (UX-14) |

**Legend:** ✅ Acceptable | ⚠️ Needs work | 🔴 Blocker for production

---

## 7. Missing Implementations (TODO)

The following features are UI shells with no backend integration:

| Feature | Screen | Required for Production |
|---------|--------|------------------------|
| Real OTP verification | `/otp` | ✅ Critical |
| Real PIN storage (hashed, server-side) | `/confirm-pin`, `/enter-pin` | ✅ Critical |
| JWT in httpOnly cookies | `/login` | ✅ Critical |
| Server-side route auth guard | `(app)/layout.tsx` | ✅ Critical |
| Logout token clearing | `/more` | ✅ Critical |
| Real liveness detection (SDK) | `/ekyc` | ✅ Critical |
| Real TOTP QR generation | `/security` | ✅ Critical |
| Contact list API | `/transfer` | High |
| Transfer submission API | `/transfer` | High |
| P2P transaction API | `/p2p` | High |
| SWIFT submission API | `/swift` | High |
| Crypto portfolio API | `/crypto` | High |
| QR decode (`jsQR` / `@zxing`) | `/qr-scan` | High |
| VietQR standard encode | `/qr-scan` | High |
| Onramp order API | `/onramp` | High |
| Security device list API | `/security` | Medium |
| Device revoke API | `/security` | Medium |
| Course detail route | `/learn/[courseId]` | Medium |
| Course filter logic | `/learn` | Medium |
| Referral claim PIN gate | `/referral` | Medium |
| Ticket ID from server | `/support` | Medium |
| Auto-debit subscription API | `/auto-debit` | Medium |
| Card issuance API (PCI-DSS) | `/card` | Medium |
| Blockchain deposit webhook | `/crypto-deposit` | Medium |
| `/more` settings sub-routes | `/more` | Low |
| UETR real gpi lookup | `/uetr` | Low |
| SWIFT UETR tracker API | `/uetr` | Low |

---

## 8. Admin Portal Findings

### Admin-01 — No authentication/authorization on admin routes

**File:** `apps/app-web/src/app/admin/layout.tsx`

The admin layout performs no role check. Any user who navigates to `/admin/dashboard` directly in their browser can access the admin portal. There is no middleware, no role claim check, no redirect to login. This must be gated behind a role-based check (e.g., `role === "admin"` from JWT claims) before any deployment.

---

### Admin-02 — "Cài đặt Hệ thống" nav item links to `/admin/system` which does not exist

**File:** `apps/app-web/src/app/admin/layout.tsx`

The sidebar includes a "Cài đặt Hệ thống" link to `/admin/system`, but no corresponding page exists in the codebase. Clicking it shows a 404.

---

### Admin-03 — Compliance report "Tải về" button links to `"#"`

**File:** `apps/app-web/src/app/admin/compliance/page.tsx`

```ts
{ id: "RPT-001", ..., url: "#" }
```

All report download links point to `"#"`, so clicking Download does nothing. The generated report also has no real file — `setGenerated(true)` only shows a success banner.

---

### Admin-04 — KYC approve/reject, finance approve/reject are client-only

**Files:** `apps/app-web/src/app/admin/kyc/page.tsx`, `apps/app-web/src/app/admin/finance/page.tsx`

Approving or rejecting a KYC submission / withdrawal only updates local component state. No API calls are made to the backend, so decisions have no real effect.

---

### Admin-05 — User lock/suspend/unlock operations are client-only

**File:** `apps/app-web/src/app/admin/users/page.tsx`

Same pattern — user management actions only modify local state.

---

### Admin-06 — CMS blog/course create/delete are client-only

**File:** `apps/app-web/src/app/admin/cms/page.tsx`

No persistence. Content created through the CMS UI disappears on page refresh.

---

### Admin-07 — AML flagged transactions have no action buttons

**File:** `apps/app-web/src/app/admin/compliance/page.tsx`

The AML flags table shows CRITICAL/HIGH risk transactions but provides no way to review, freeze accounts, or escalate. Per NĐ-284/2025 compliance requirements, flagged transactions need an audit trail of reviewer actions.

---

## 9. Cross-Cutting Concerns

### CC-01 — Build errors suppressed globally

**File:** `apps/app-web/next.config.mjs`

```js
typescript: { ignoreBuildErrors: true },
eslint:     { ignoreDuringBuilds: true },
```

These flags mean TypeScript and ESLint errors never fail CI/CD. They were presumably added to ship quickly but create a safety net that can hide regressions. Both should be removed and the build should fail on type errors.

---

### CC-02 — No error boundaries

There are no React `ErrorBoundary` components in any screen or layout. An unhandled error in a single component will crash the entire page rather than showing a graceful fallback.

---

### CC-03 — No loading states on deep-link navigation

When navigating directly to a protected screen (e.g., `/home`), the auth check reads from `localStorage` synchronously. There is no loading skeleton shown during the check, causing a flash of unauthenticated content before redirect.

---

### CC-04 — All money amounts formatted with `toLocaleString("vi-VN")` inconsistently

Some screens append `đ`, some append `VNĐ`, some use neither. The `currency: "VND"` option of `Intl.NumberFormat` would standardize this automatically.

---

### CC-05 — No offline / PWA service worker cache invalidation strategy

The `next.config.mjs` configures a PWA via `next-pwa`. There is no cache invalidation for API responses cached by the service worker. Stale financial data (balances, rates) could be served from the service worker cache.

---

### CC-06 — `Math.random()` used for financial simulation

Multiple screens use `Math.random()` to simulate 5–10% failure rates for API calls. These simulated failures must not exist in production code as they create unpredictable UX in demos and can confuse stakeholders during testing.

---

## 10. Recommendations Priority Matrix

### Phase 1 — Must fix before any public access

| # | Issue | Action |
|---|-------|--------|
| 1 | CRIT-01 | Replace mock OTP with real `/api/v1/auth/otp/verify` |
| 2 | CRIT-02 | Remove all "Demo: PIN là 123456" text (3 files) |
| 3 | CRIT-03 | Never store PIN in localStorage; validate server-side |
| 4 | CRIT-04 | Implement real JWT-based route guards |
| 5 | HIGH-01 | Move JWT to httpOnly cookies |
| 6 | HIGH-02 | Implement proper logout (clear all tokens) |
| 7 | HIGH-04 | Replace client-side PIN check with API call |
| 8 | Admin-01 | Add admin role check to `admin/layout.tsx` |

### Phase 2 — Before beta launch

| # | Issue | Action |
|---|-------|--------|
| 9  | HIGH-03 | Standardize PIN length to 6 digits across all screens |
| 10 | HIGH-05 | Replace all `window.location.href` with `router.push()` |
| 11 | HIGH-06 | Integrate real liveness SDK (e.g., FPT eKYC, VNPTeKYC) |
| 12 | MED-05 | Integrate `otpauth` + `qrcode.react` for real TOTP QR |
| 13 | MED-01 | Add phone number format validation + `+84` normalization |
| 14 | MED-10 | Create `/learn/[courseId]/page.tsx` |
| 15 | MED-11 | Add PIN gate to referral commission claim |
| 16 | CC-01  | Remove `ignoreBuildErrors` / `ignoreDuringBuilds` |

### Phase 3 — Production readiness

| # | Issue | Action |
|---|-------|--------|
| 17 | MED-02 | Connect transfer contacts to real user API |
| 18 | MED-03 | Wire all transaction screens to real API endpoints |
| 19 | MED-04 | Implement timeframe-based chart data fetching |
| 20 | MED-06 | Integrate `jsQR` or `@zxing/library` for camera scanning |
| 21 | MED-07 | Implement VietQR (NAPAS247) standard for QR generation |
| 22 | MED-08 | Fix `nextDue` calculation to use `new Date()` |
| 23 | UX-01  | Skip splash/onboarding for returning authenticated users |
| 24 | UX-04,05,07 | Anchor countdowns to server-issued expiry timestamps |
| 25 | UX-06  | Remove 5% random chart error from all builds |
| 26 | CC-02  | Add `ErrorBoundary` at layout level |
| 27 | CC-05  | Configure PWA service worker cache invalidation |
| 28 | Admin-02–07 | Connect all admin actions to backend API |

---

*End of audit report.*
