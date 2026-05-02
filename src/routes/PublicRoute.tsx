import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/api/services/authService";

interface PublicRouteProps {
  children: React.ReactNode;
}

// Keep in sync with STAFF_ROLES in src/routes/index.tsx and src/layouts/DashboardLayout.tsx
const STAFF_ROLES: UserRole[] = [
  "admin",
  "super_admin",
  "operator",
  "support",
  "aml_specialist",
  "compliance",
];

export function PublicRoute({ children }: PublicRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);
  const user = useAuthStore((state) => state.user);

  // Only redirect if both authenticated and has valid token
  if (is_authenticated && access_token) {
    const role = user?.role as UserRole | undefined;

    // Client users go to the exchange page.
    if (role === "client") {
      return <Navigate to="/exchange" replace />;
    }

    // Any staff role (admin, super_admin, operator, support, aml_specialist, compliance)
    // — and authenticated sessions with an unknown/missing role — go to the admin area.
    // Sending unknown roles to /admin/exchanges is safer: the admin guards will
    // reject them, while sending them to /exchange would loop with ClientRoute.
    if (!role || STAFF_ROLES.includes(role)) {
      return <Navigate to="/admin/exchanges" replace />;
    }

    // Fallback for any future role we forgot to map: keep client-facing default.
    return <Navigate to="/exchange" replace />;
  }

  return <>{children}</>;
}
