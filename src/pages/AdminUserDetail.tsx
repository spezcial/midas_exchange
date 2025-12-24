import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminUsersService } from "@/api/services/adminUsersService";
import type { User, Wallet } from "@/types";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ArrowLeft, Wallet as WalletIcon, CheckCircle2, XCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualDepositModal } from "@/components/modals/ManualDepositModal";

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, set_user] = useState<User | null>(null);
  const [wallets, set_wallets] = useState<Wallet[]>([]);
  const [is_loading, set_is_loading] = useState(false);
  const [is_deposit_modal_open, set_is_deposit_modal_open] = useState(false);
  const [selected_currency, set_selected_currency] = useState<string>("");

  useEffect(() => {
    const fetch_user = async () => {
      if (!id) return;

      try {
        set_is_loading(true);
        const response = await adminUsersService.get_user_by_id(parseInt(id));
        set_user(response.data.user);
        set_wallets(response.data.wallets);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error(t("messages.loadUserFailed") || "Failed to load user");
        navigate("/admin/users");
      } finally {
        set_is_loading(false);
      }
    };

    fetch_user();
  }, [id, navigate, t]);

  const handle_deposit = (currency_code: string) => {
    set_selected_currency(currency_code);
    set_is_deposit_modal_open(true);
  };

  const handle_deposit_success = async () => {
    set_is_deposit_modal_open(false);

    // Refresh user data to show updated wallet balances
    if (id) {
      try {
        const response = await adminUsersService.get_user_by_id(parseInt(id));
        set_user(response.data.user);
        set_wallets(response.data.wallets);
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  const get_kyc_badge = (kyc_level: number) => {
    const badges = [
      { label: "Level 0", className: "bg-gray-100 text-gray-800" },
      { label: "Level 1", className: "bg-blue-100 text-blue-800" },
      { label: "Level 2", className: "bg-green-100 text-green-800" },
      { label: "Level 3", className: "bg-purple-100 text-purple-800" },
    ];

    const badge = badges[kyc_level] || badges[0];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (is_loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/admin/users")}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back") || "Back"}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.userDetail.title") || "User Details"}
          </h1>
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t("admin.userDetail.information") || "User Information"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.id") || "ID"}</p>
            <p className="text-base font-medium text-gray-900">#{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.email") || "Email"}</p>
            <p className="text-base font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.name") || "Name"}</p>
            <p className="text-base font-medium text-gray-900">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.phone") || "Phone"}</p>
            <p className="text-base font-medium text-gray-900">{user.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.kycLevel") || "KYC Level"}</p>
            <div className="mt-1">{get_kyc_badge(user.kyc_level)}</div>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.status") || "Status"}</p>
            <div className="mt-1">
              {user.is_blocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3" />
                  {t("admin.users.blocked") || "Blocked"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("admin.users.active") || "Active"}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.referralCode") || "Referral Code"}</p>
            <p className="text-base font-medium text-gray-900">{user.referral_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.referredBy") || "Referred By"}</p>
            <p className="text-base font-medium text-gray-900">{user.referred_by || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.registeredAt") || "Registered"}</p>
            <p className="text-base font-medium text-gray-900">
              {format(new Date(user.created_at), "dd.MM.yyyy HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.users.twoFactor") || "2FA"}</p>
            <p className="text-base font-medium text-gray-900">
              {user.two_factor_enabled ? (
                <span className="text-green-600">{t("common.enabled") || "Enabled"}</span>
              ) : (
                <span className="text-gray-600">{t("common.disabled") || "Disabled"}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Wallets Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("admin.userDetail.wallets") || "Wallets"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.currency.code}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{wallet.currency.name}</p>
                    <p className="text-xs text-gray-500">{wallet.currency.code}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">{t("wallets.balance") || "Balance"}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format_number(wallet.balance)} {wallet.currency.code}
                  </p>
                </div>
                {wallet.locked > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">{t("wallets.locked") || "Locked"}</p>
                    <p className="text-sm font-medium text-orange-600">
                      {format_number(wallet.locked)} {wallet.currency.code}
                    </p>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handle_deposit(wallet.currency.code)}
                variant="outline"
                size="sm"
                className="w-full mt-4 gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {t("admin.userDetail.deposit") || "Deposit"}
              </Button>
            </div>
          ))}
        </div>
        {wallets.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            {t("admin.userDetail.noWallets") || "No wallets found"}
          </p>
        )}
      </div>

      {/* Manual Deposit Modal */}
      <ManualDepositModal
        is_open={is_deposit_modal_open}
        user_id={user.id}
        currency_code={selected_currency}
        on_close={() => set_is_deposit_modal_open(false)}
        on_success={handle_deposit_success}
      />
    </div>
  );
}
