# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Midas Exchange is a cryptocurrency exchange platform built with React + TypeScript + Vite. The frontend communicates with a backend API for wallet management, currency exchanges (instant swaps), user authentication, and admin operations.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript check + Vite build)
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint on the codebase
```

## Architecture

### State Management
The application uses **Zustand** for state management with three main stores:

1. **authStore** (`src/store/authStore.ts`)
   - Manages authentication state (user, tokens, login/logout)
   - Persisted to localStorage via `zustand/middleware`
   - Handles token refresh automatically

2. **walletStore** (`src/store/walletStore.ts`)
   - Manages user wallets and balances
   - Handles deposit/withdrawal operations

3. **exchangeStore** (`src/store/exchangeStore.ts`)
   - Manages currency exchange state
   - Calculates exchange rates and fees
   - Handles instant wallet-to-wallet swaps

### API Layer
Located in `src/api/`:

- **client.ts**: Axios instance with interceptors for:
  - Automatic token attachment to requests
  - Token refresh on 401 errors
  - Global error handling

- **services/**: Service modules for different API domains
  - `authService.ts`: Authentication (login, register, logout, refresh)
  - `walletService.ts`: Wallet operations
  - `exchangeService.ts`: Currency exchange operations (now using `/exchanges` endpoints)
  - `userService.ts`: User profile operations
  - `transactionService.ts`: Transaction history

### Key API Patterns

1. **Authentication Flow**:
   - JWT-based with access and refresh tokens
   - Tokens stored in Zustand store (persisted to localStorage)
   - Automatic refresh via axios interceptor when access token expires

2. **Exchange System** (Recently Updated):
   - Changed from OTC model (`/orders`) to instant swap model (`/exchanges`)
   - Exchanges are completed instantly - no payment proof submission needed
   - All successful exchanges have `status: "completed"`

### Type Definitions
Central types in `src/types/index.ts`:
- Currency types (CryptoCurrency, FiatCurrency)
- CurrencyInfo, CurrencyPair
- User, Wallet, Transaction
- Exchange-related types

### Routing
Routes defined in `src/routes/` (exact structure TBD):
- Public routes: Home, Login, Register, About, How It Works
- Protected routes: Dashboard, Exchange, Wallets, History, Profile, Referral
- Admin routes: Admin Orders/Exchanges

### UI Components
- **shadcn/ui** components in `src/components/ui/`
- Layout components in `src/components/layout/` (Header, Footer, Layout)
- Auth components in `src/components/auth/` (ProtectedRoute)

### Internationalization (i18n)
- Uses `react-i18next`
- Config in `src/i18n/config.ts`
- Translations in `src/i18n/locales/` (e.g., `ru.json`)

### Styling
- **TailwindCSS** for styling
- Custom utilities in `src/lib/utils.ts` (includes `cn()` for class merging)

## Environment Variables

Create a `.env` file with:
```
VITE_API_URL=http://localhost:8080/api/v1
```

## Important Notes

### Recent Backend Changes (Orders → Exchanges)
The backend has been refactored from an OTC order system to an instant exchange system:

- **Endpoints changed**: `/orders` → `/exchanges`, `/admin/orders` → `/admin/exchanges`
- **Removed fields**: `payment_method`, `payment_proof`, `company_wallet_info`, `company_bank_info`, `user_payment_details`, `rejection_reason`, `processed_by_admin_id`, `processed_at`
- **New field**: `to_amount_with_fee` - actual amount received after fee deduction
- **Status values simplified**: `pending | completed | canceled` (removed `payment_sent`, `processing`, `rejected`)
- **No payment submission**: Exchanges happen instantly, no payment proof upload needed
- **Admin role simplified**: Admin can only view exchanges, not approve/reject them

### Form Handling
- Uses `react-hook-form` with `@hookform/resolvers` for validation
- Zod for schema validation

### Notifications
- `react-hot-toast` for toast notifications
- Toasts triggered from store actions (login, exchange, errors, etc.)

### Path Aliases
The project uses `@/` as an alias for `src/`:
- Import example: `import { useAuthStore } from "@/store/authStore"`
- Configured in `vite.config.ts` and `tsconfig.json`

## Common Development Patterns

### Creating a New API Service
1. Add service file in `src/api/services/`
2. Import `apiClient` from `../client.ts`
3. Define TypeScript interfaces for request/response
4. Export service object with methods

### Adding a New Store
1. Create store file in `src/store/`
2. Import `create` from `zustand`
3. Define state interface
4. Use `persist` middleware if persistence is needed
5. Import and use in components via hooks

### Protected Routes
Wrap routes with `ProtectedRoute` component to require authentication:
```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

---

## Maintenance Rule

**Always update this CLAUDE.md** when adding new pages, routes, API services, or significant architectural changes. Keep the "OTC Features" section and route tables in sync with actual code.

---

## RBAC — 7 Roles + Staff Management (implemented)

The backend has 7 roles. All roles use `/api/v1/auth/login`. The `role` field is in the login response `user` object.

### Role values (`UserRole` exported from `src/api/services/authService.ts`)

```ts
type UserRole = "client" | "admin" | "super_admin" | "operator" | "support" | "aml_specialist" | "compliance";
```

### Route guards
- `AdminRoute` — allows `admin` and `super_admin`
- `SuperAdminRoute` — allows `super_admin` only (redirects to `/admin/exchanges` otherwise)
- `ClientRoute` — redirects any staff role (`admin`, `super_admin`, `operator`, `support`, `aml_specialist`, `compliance`) to `/admin/exchanges`

### Staff management
- Service: `src/api/services/staffService.ts` — endpoints at `/admin/super/staff` (no `{ success, data }` envelope)
- Page: `src/pages/AdminStaff.tsx` — staff table with create/edit/deactivate; temp password shown once after creation
- Route: `/admin/staff` protected by `SuperAdminRoute`
- Sidebar "Staff" link visible only when `user.role === "super_admin"`

### Staff role dropdown options (no `"client"`)
`admin | super_admin | operator | support | aml_specialist | compliance`

### Bootstrap
First `super_admin` must be inserted directly in the DB. After that, login via `/api/v1/auth/login`.

---

## OTC Features (OTC-013, implemented 2026-04-03)

### New Admin Routes
| Path | Component | Access |
|---|---|---|
| `/admin/otc` | `AdminOTCOrders` | operator/admin/super_admin |
| `/admin/otc/analytics` | `AdminOTCAnalytics` | operator/admin/super_admin |
| `/admin/otc/:uid` | `AdminOTCOrderDetail` | operator/admin/super_admin |
| `/admin/otc/config` | `AdminOTCConfig` | super_admin only |

### New API Methods (`src/api/services/otcService.ts`)
- `admin_get_audit_log(uid)` — GET `/admin/otc/orders/:uid/audit-log`
- `admin_get_analytics({ from, to, granularity })` — GET `/admin/otc/analytics`
- `admin_export_orders(params)` — GET `/admin/otc/orders/export` (returns Blob for CSV download)

### Extended List Filters (`AdminListOTCOrdersParams` in `src/types/index.ts`)
`status`, `email`, `from_date`, `to_date`, `from_currency_id`, `to_currency_id`, `operator_id`

### New Types (`src/types/index.ts`)
- `OTCAuditLog` — single operator action entry
- `OTCAnalytics` / `OTCAnalyticsSummary` / `OTCAnalyticsPeriod` — analytics response shapes
- `AdminListOTCOrdersParams` — moved here from service file (canonical location)

### i18n Keys Added
`admin.nav.otcAnalytics`, `otc.admin.export`, `otc.admin.filters.*`, `otc.admin.auditLog.*`, `otc.admin.analytics.*` — in all 3 locales (en/ru/kk).

---

## Code Quality Rules (established 2026-04-10)

### TypeScript
- Never use `catch (err: any)` — use `catch (err: unknown)` with explicit inline cast: `(err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? fallback`
- Never use non-null assertions (`!`) — prefer optional chaining with a fallback (`?.` / `?? []`)

### i18n
- Never use `t("key") || "fallback"` — `t()` always returns a string; the fallback is dead code. Ensure the key exists in all 3 locale files instead.
- `common.total`, `common.submit` keys exist in all 3 locales.
- `otc.fields.*` section exists in all 3 locales (added during review).
- **en.json is the canonical source** — ru.json and kk.json have more keys; keep en.json in sync when adding new UI strings.

### Dead props
- `DepositModal` has no `on_success` prop — the modal only shows static deposit instructions, so there is no submission event to respond to.

### Module boundaries
- `AdminListOTCOrdersParams` is canonical in `src/types/index.ts` — import from there, not from `otcService`.
- `STAFF_ROLES` used in `DashboardLayout` is defined at module scope (not inside the component).

### WebSocket auth
- The OTC order detail WebSocket (`/ws/otc/:uid`) passes `access_token` as a query param due to WS handshake limitations. This exposes the token in server access logs. A ticket-based short-lived auth endpoint should be used if log security is a concern.

### OAuth CSRF
- CSRF state validation lives in `GoogleOAuthCallback.tsx` (lines 29–48): gets `oauth_state` from sessionStorage, clears it, then validates it against the `state` URL param — all before calling `complete_google_login`.
- `authStore.complete_google_login` does NOT re-validate (sessionStorage key is already cleared by the time it is called). Do not add a state check inside the store method.
