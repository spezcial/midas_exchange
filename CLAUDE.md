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
