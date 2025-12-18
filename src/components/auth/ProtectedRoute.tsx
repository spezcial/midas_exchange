import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function ProtectedRoute() {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);

  if (!is_authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}