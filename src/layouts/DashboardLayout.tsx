import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const handle_logout = async () => {
    await logout();
    navigate("/");
  };
  const user = useAuthStore((state) => state.user);
  const is_admin = user?.role === "admin";

  const nav_items = [
    { path: "/dashboard", icon: "🏠", label: t("nav.dashboard") },
    { path: "/wallets", icon: "💳", label: t("nav.wallets") },
    { path: "/exchange", icon: "🔄", label: t("nav.exchange") },
    { path: "/history", icon: "📊", label: t("nav.history") },
    { path: "/profile", icon: "⚙️", label: t("nav.profile") },
    { path: "/referral", icon: "🎁", label: t("nav.referral") },
  ];

  const admin_nav_items = [
    { path: "/admin/exchanges", icon: "📋", label: t("admin.nav.exchanges") },
    { path: "/admin/exchange-rates", icon: "💱", label: t("admin.nav.exchangeRates") },
  ];

  const languages = [
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "kk", name: "Қазақша", flag: "🇰🇿" },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Midas Exchange</span>
          </div>

          {/* Language Switcher */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{languages.find((l) => l.code === i18n.language)?.flag}</span>
                  <span className="flex-1 text-left">{languages.find((l) => l.code === i18n.language)?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {is_admin ? (
              /* Admin Navigation */
              admin_nav_items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))
            ) : (
              /* Client Navigation */
              nav_items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))
            )}
          </nav>
        </div>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t bg-white">
          <button
            onClick={handle_logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">{t("nav.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
