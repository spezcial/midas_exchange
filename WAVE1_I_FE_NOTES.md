# Wave 1 — Stage I (Frontend) — Notes

Branch: `security/i-resilience` (no commits made by agent — caller will commit).
Scope: H-2, H-6, H-9 from `SECURITY_HARDENING_PLAN.md` §3a.

## H-9 — ErrorBoundary at root

- **New file:** `src/components/ErrorBoundary.tsx`
  - Class component with `state: { hasError: boolean, error?: Error }`.
  - `getDerivedStateFromError` flips `hasError` for fallback rendering.
  - `componentDidCatch(error, errorInfo)` logs via `console.error('ErrorBoundary caught:', error, errorInfo)` and best-effort calls `window.Sentry?.captureException` and `window.posthog?.capture('error_boundary_triggered', …)` (both wrapped in try/catch — no hard dependency).
  - Fallback UI uses Tailwind + shadcn `Button` (matches project style). Bilingual text: "Что-то пошло не так" / "Something went wrong"; Reload button calls `window.location.reload()`.
  - Props typed `{ children: React.ReactNode }`.
- **Wired in `src/main.tsx`:** `<App />` is now wrapped in `<ErrorBoundary>` inside `<StrictMode>`. Wrapping at `main.tsx` (not `App.tsx`) catches errors thrown inside `BrowserRouter` and any future top-level providers.

## H-2 — `PublicRoute` redirects staff to `/admin/exchanges`

- **File:** `src/routes/PublicRoute.tsx`
- Imported `UserRole` type from `@/api/services/authService` and added a module-scope `STAFF_ROLES` array (mirrors the constants already in `src/routes/index.tsx:41` and `src/layouts/DashboardLayout.tsx:33`). Inlined to avoid a cross-import cycle (`routes/index.tsx` imports `PublicRoute`).
- New redirect logic for authenticated sessions with a valid `access_token`:
  1. `role === "client"` → `<Navigate to="/exchange" replace />`.
  2. `role` missing OR `STAFF_ROLES.includes(role)` → `<Navigate to="/admin/exchanges" replace />`. Unknown roles default to admin area to avoid the previous loop with `ClientRoute`.
  3. Final fallback (future role we forgot to map) → `/exchange`.
- Public component signature, props (`{ children: React.ReactNode }`), and `replace` flag preserved.
- Acceptance: `super_admin`/`operator`/`support`/`aml_specialist`/`compliance` now land on `/admin/exchanges` directly, eliminating the double-redirect through `/exchange`.

## H-6 — Remove dead `src/store/exchangeStore.ts`

- **Pre-check grep:** the only consumer was `src/pages/Home.tsx:33` (`import { useExchangeStore } from "@/store/exchangeStore"`), used solely to drive the landing-page mock calculator. No other file in `src/` referenced the store.
- **`src/pages/Home.tsx` refactor (minimally invasive — kept the calculator):**
  - Replaced `useExchangeStore` selectors with local React state: `useState<Currency>` for `from_currency`/`to_currency`, `useState<number>` for `from_amount`.
  - `useMemo` recomputes `{ rate, fee, to_amount }` from the inline `mock_rates` array on dependency change. Fee/rate math identical to the deleted store (`fee_amount = from_amount * rate_info.fee; to_amount = (from_amount - fee_amount) * rate_info.rate`).
  - Local `swap_currencies` swaps both currencies and seeds `from_amount` with the previous `to_amount` (matches old store behavior).
  - Trimmed `mock_rates` rows: dropped unused `min`/`max`/`updated_at` fields (those were only consumed by the now-deleted store) — kept `from`/`to`/`rate`/`fee` (4 fields × 8 rows). Same currency pairs and same numbers as before.
  - Removed `useEffect` that pushed `mock_rates` into the store on mount; replaced `useEffect` import with `useMemo, useState`.
  - All UI markup, classNames, `t()` keys, `format_number` calls, and rendered output preserved.
- **File deleted:** `src/store/exchangeStore.ts` (no replacement — the live exchange path uses `exchangesService` in `Exchange.tsx`).
- **Final grep verification:** `grep -rn "exchangeStore" src/` → 0 matches.

## Verification

- `PATH=…/v22.22.2/bin:$PATH npx tsc -b --noEmit` → **exit 0** (clean).
- `PATH=…/v22.22.2/bin:$PATH npm run build` → **success** (`tsc -b && vite build`, 3362 modules transformed, `dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css` produced; only the pre-existing chunk-size warning remains).

## Out of scope (intentionally not touched)

- `src/store/authStore.ts` — Stage B.
- `src/types/index.ts` — Stage A.
- OTC stale closure, `Profile.tsx`, `any` cleanup, `eslint.config.js`.
- `CLAUDE.md` "State Management" section still mentions `exchangeStore`. Not updated per the strict scope of this stage; should be refreshed in a follow-up doc pass.

## Blockers

None. All three items closed. `tsc` and `vite build` are green.
