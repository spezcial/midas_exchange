import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);
  const user = useAuthStore((state) => state.user);

  if (!is_authenticated || !access_token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "super_admin") {
    return <Navigate to="/admin/exchanges" replace />;
  }

  return <>{children}</>;
}
