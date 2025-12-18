import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { walletService } from "@/api/services/walletService";
import { exchangeService } from "@/api/services/exchangeService";
import type { Wallet, CurrencyPair } from "@/types";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepositModal, WithdrawModal } from "@/components/modals";

export function Wallets() {
  const { t } = useTranslation();
  const [wallets, set_wallets] = useState<Wallet[]>([]);
  const [exchange_rates, set_exchange_rates] = useState<CurrencyPair[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [selected_wallet, set_selected_wallet] = useState<Wallet | null>(null);
  const [is_deposit_modal_open, set_is_deposit_modal_open] = useState(false);
  const [is_withdraw_modal_open, set_is_withdraw_modal_open] = useState(false);

  useEffect(() => {
    load_data();
  }, []);

  const load_data = async () => {
    try {
      set_is_loading(true);
      const [wallets_data, rates_data] = await Promise.all([
        walletService.get_wallets(),
        exchangeService.get_exchange_pairs(),
      ]);
      set_wallets(wallets_data);
      set_exchange_rates(rates_data.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t("messages.loadFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  const load_wallets = async () => {
    try {
      const data = await walletService.get_wallets();
      set_wallets(data);
    } catch (error) {
      console.error("Failed to load wallets:", error);
      toast.error(t("messages.loadFailed"));
    }
  };

  const handle_deposit = (wallet: Wallet) => {
    set_selected_wallet(wallet);
    set_is_deposit_modal_open(true);
  };

  const handle_withdraw = (wallet: Wallet) => {
    set_selected_wallet(wallet);
    set_is_withdraw_modal_open(true);
  };

  const handle_deposit_success = () => {
    load_wallets();
    set_is_deposit_modal_open(false);
    set_selected_wallet(null);
  };

  const handle_withdraw_success = () => {
    load_wallets();
    set_is_withdraw_modal_open(false);
    set_selected_wallet(null);
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  // Get USDT equivalence for a wallet
  const get_usdt_equivalence = (wallet: Wallet): number => {
    if (wallet.currency.code === "USDT") {
      return wallet.balance;
    }

    // Find exchange rate from wallet currency to USDT
    const rate_pair = exchange_rates.find(
      (pair) =>
        pair.from_currency.code === wallet.currency.code &&
        pair.to_currency.code === "USDT"
    );

    if (rate_pair) {
      return wallet.balance * rate_pair.rate;
    }

    // If no direct pair, try reverse (USDT to currency) and invert
    const reverse_pair = exchange_rates.find(
      (pair) =>
        pair.from_currency.code === "USDT" &&
        pair.to_currency.code === wallet.currency.code
    );

    if (reverse_pair && reverse_pair.rate > 0) {
      return wallet.balance / reverse_pair.rate;
    }

    // No rate found, return 0
    return 0;
  };

  const calculate_total_balance = () => {
    return wallets.reduce((total, wallet) => {
      return total + get_usdt_equivalence(wallet);
    }, 0);
  };

  if (is_loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("wallets.title")}</h1>
        <p className="text-gray-600 mt-1">{t("wallets.subtitle")}</p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">{t("wallets.totalBalance")}</p>
            <h2 className="text-4xl font-bold">{format_number(calculate_total_balance(), 2)} USDT</h2>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("wallets.noWallets")}
            </h3>
            <p className="text-gray-500">
              {t("wallets.noWalletsDescription")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div
              key={wallet.currency.code}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Currency Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      wallet.currency.is_crypto
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <WalletIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {wallet.currency.code}
                      </h3>
                      <p className="text-sm text-gray-500">{wallet.currency.name}</p>
                    </div>
                  </div>
                  {!wallet.currency.is_active && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {t("wallets.inactive")}
                    </span>
                  )}
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">{t("wallets.availableBalance")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {format_number(wallet.balance)}
                  </p>
                  {wallet.currency.code !== "USDT" && (
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ {format_number(get_usdt_equivalence(wallet), 2)} USDT
                    </p>
                  )}
                </div>

                {/* Locked Balance */}
                {wallet.locked > 0 && (
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">{t("wallets.locked")}:</span>
                    <span className="font-medium text-gray-700">
                      {format_number(wallet.locked)}
                    </span>
                  </div>
                )}

                {/* Created At */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-xs text-gray-400">
                    {t("wallets.created")}: {format(new Date(wallet.created_at), "dd.MM.yyyy")}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handle_deposit(wallet)}
                    className="w-full gap-2"
                    variant="default"
                    disabled={!wallet.currency.is_active}
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    {t("wallets.deposit")}
                  </Button>
                  <Button
                    onClick={() => handle_withdraw(wallet)}
                    className="w-full gap-2"
                    variant="outline"
                    disabled={!wallet.currency.is_active || wallet.balance <= 0}
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    {t("wallets.withdraw")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <DepositModal
        is_open={is_deposit_modal_open}
        wallet={selected_wallet}
        on_close={() => {
          set_is_deposit_modal_open(false);
          set_selected_wallet(null);
        }}
        on_success={handle_deposit_success}
      />

      <WithdrawModal
        is_open={is_withdraw_modal_open}
        wallet={selected_wallet}
        on_close={() => {
          set_is_withdraw_modal_open(false);
          set_selected_wallet(null);
        }}
        on_success={handle_withdraw_success}
      />
    </div>
  );
}
