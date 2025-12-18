import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);
  const user = useAuthStore((state) => state.user);

  // Check authentication first
  if (!is_authenticated || !access_token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (user?.role !== "admin") {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
