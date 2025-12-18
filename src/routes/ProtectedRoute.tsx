import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const access_token = useAuthStore((state) => state.access_token);

  // Check both authentication flag and token presence
  if (!is_authenticated || !access_token) {
    // Redirect to login if not authenticated or no token
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
