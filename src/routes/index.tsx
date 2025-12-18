import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { PublicRoute } from "./PublicRoute";

// Import pages from /src/pages
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Exchange } from "@/pages/Exchange";
import { Wallets } from "@/pages/Wallets";
import { History } from "@/pages/History";
import { Profile } from "@/pages/Profile";
import { Referral } from "@/pages/Referral";
import { About } from "@/pages/About";
import { HowItWorks } from "@/pages/HowItWorks";
import { AdminExchanges } from "@/pages/AdminExchanges";
import { AdminExchangeRates } from "@/pages/AdminExchangeRates";

// Helper component to prevent admin access to client routes
function ClientRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "admin") {
    return <Navigate to="/admin/exchanges" replace />;
  }

  return <>{children}</>;
}

// Import useAuthStore for ClientRoute
import { useAuthStore } from "@/store/authStore";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with Header */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>

      {/* Auth routes (centered layout, no header/footer) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected client routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ClientRoute><Dashboard /></ClientRoute>} />
        <Route path="/exchange" element={<ClientRoute><Exchange /></ClientRoute>} />
        <Route path="/wallets" element={<ClientRoute><Wallets /></ClientRoute>} />
        <Route path="/history" element={<ClientRoute><History /></ClientRoute>} />
        <Route path="/profile" element={<ClientRoute><Profile /></ClientRoute>} />
        <Route path="/referral" element={<ClientRoute><Referral /></ClientRoute>} />

        {/* Admin routes */}
        <Route path="/admin/exchanges" element={<AdminRoute><AdminExchanges /></AdminRoute>} />
        <Route path="/admin/exchange-rates" element={<AdminRoute><AdminExchangeRates /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
