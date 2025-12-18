import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);
  const user = useAuthStore((state) => state.user);

  // Only redirect if both authenticated and has valid token
  if (is_authenticated && access_token) {
    // Redirect based on user role
    if (user?.role === "admin") {
      return <Navigate to="/admin/exchanges" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
