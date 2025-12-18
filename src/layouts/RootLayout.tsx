import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
