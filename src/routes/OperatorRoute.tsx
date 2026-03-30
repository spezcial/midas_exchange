import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/api/services/authService";

interface OperatorRouteProps {
  children: React.ReactNode;
}

const OPERATOR_ROLES: UserRole[] = ["operator", "admin", "super_admin"];

export function OperatorRoute({ children }: OperatorRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);
  const user = useAuthStore((state) => state.user);

  if (!is_authenticated || !access_token) {
    return <Navigate to="/login" replace />;
  }

  if (!OPERATOR_ROLES.includes(user?.role as UserRole)) {
    return <Navigate to="/exchange" replace />;
  }

  return <>{children}</>;
}
