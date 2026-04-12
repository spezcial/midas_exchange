import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  Globe,
  Wallet,
  ArrowLeftRight,
  History,
  UserCircle,
  Share2,
  ClipboardList,
  TrendingUp,
  Users,
  UserCog,
  LogOut,
  Handshake,
  Settings2,
  BarChart2,
  Coins,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STAFF_ROLES = ["admin", "super_admin", "operator", "support", "aml_specialist", "compliance"];

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
  const is_staff = STAFF_ROLES.includes(user?.role ?? "");
  const is_super_admin = user?.role === "super_admin";
  const is_operator_or_admin = ["operator", "admin", "super_admin"].includes(user?.role ?? "");

  const otc_is_active = location.pathname.startsWith("/admin/otc");
  const [otc_open, set_otc_open] = useState(() => otc_is_active);

  useEffect(() => {
    if (otc_is_active) {
      set_otc_open(true);
    }
  }, [otc_is_active]);

  const nav_items: { path: string; icon: LucideIcon; label: string }[] = [
    { path: "/wallets", icon: Wallet, label: t("nav.wallets") },
    { path: "/exchange", icon: ArrowLeftRight, label: t("nav.exchange") },
    { path: "/otc", icon: Handshake, label: t("nav.otc") },
    { path: "/history", icon: History, label: t("nav.history") },
    { path: "/profile", icon: UserCircle, label: t("nav.profile") },
    { path: "/referral", icon: Share2, label: t("nav.referral") },
  ];

  const admin_nav_items: { path: string; icon: LucideIcon; label: string }[] = [
    { path: "/admin/exchanges", icon: ClipboardList, label: t("admin.nav.exchanges") },
    { path: "/admin/exchange-rates", icon: TrendingUp, label: t("admin.nav.exchangeRates") },
    { path: "/admin/users", icon: Users, label: t("admin.nav.users") },
    ...(["admin", "super_admin"].includes(user?.role ?? "") ? [
      { path: "/admin/platform-fees", icon: Coins, label: t("admin.platformFees.navLabel") },
    ] : []),
  ];

  const otc_children: { path: string; icon: LucideIcon; label: string }[] = [
    { path: "/admin/otc", icon: Handshake, label: t("admin.nav.otc") },
    { path: "/admin/otc/analytics", icon: BarChart2, label: t("admin.nav.otcAnalytics") },
    ...(is_super_admin ? [{ path: "/admin/otc/config", icon: Settings2, label: t("admin.nav.otcConfig") }] : []),
  ];

  const languages = [
    { code: "ru", name: "Русский", short: "RU" },
    { code: "en", name: "English", short: "EN" },
    { code: "kk", name: "Қазақша", short: "KZ" },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const nav_link_class = (path: string, exact = false) =>
    cn(
      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
      (exact ? location.pathname === path : location.pathname === path || location.pathname.startsWith(path + "/"))
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50"
    );

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
                  <span className="text-xs font-semibold">{languages.find((l) => l.code === i18n.language)?.short}</span>
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
                    <span className="mr-2 text-xs font-semibold text-muted-foreground">{lang.short}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {is_staff ? (
              <>
                {/* Flat admin items */}
                {admin_nav_items.map((item) => (
                  <Link key={item.path} to={item.path} className={nav_link_class(item.path)}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* OTC group */}
                {is_operator_or_admin && (
                  <div>
                    <button
                      onClick={() => set_otc_open((o) => !o)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                        otc_is_active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Handshake className="h-5 w-5 shrink-0" />
                      <span className="font-medium flex-1">OTC</span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition-transform", otc_open && "rotate-180")}
                      />
                    </button>

                    {otc_open && (
                      <div className="mt-1 ml-4 space-y-1 border-l border-gray-100 pl-3">
                        {otc_children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                              location.pathname === child.path
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff (super_admin only) */}
                {is_super_admin && (
                  <Link to="/admin/staff" className={nav_link_class("/admin/staff")}>
                    <UserCog className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{t("admin.nav.staff")}</span>
                  </Link>
                )}
              </>
            ) : (
              nav_items.map((item) => (
                <Link key={item.path} to={item.path} className={nav_link_class(item.path)}>
                  <item.icon className="h-5 w-5 shrink-0" />
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
            <LogOut className="h-5 w-5 shrink-0" />
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
