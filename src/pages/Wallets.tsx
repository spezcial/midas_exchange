import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Wallet, CurrencyPair, Transaction } from "@/types";
import { useWalletStore } from "@/store/walletStore";
import { exchangeService } from "@/api/services/exchangeService";
import { transactionService } from "@/api/services/transactionService";
import { DepositModal, WithdrawModal } from "@/components/modals";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AssetTypeFilter, type AssetTypeFilterValue } from "@/components/wallets/AssetTypeFilter";
import { AssetTable, type SortState } from "@/components/wallets/AssetTable";
import { AssetCardList } from "@/components/wallets/AssetCardList";
import { ExpandingSearch } from "@/components/wallets/ExpandingSearch";
import { format_usdt, get_usdt_equivalence, mask_balance } from "@/lib/wallet";
import { ru_layout_to_en } from "@/lib/keyboard";

export function Wallets() {
  const { t } = useTranslation();
  const wallets = useWalletStore((s) => s.wallets);
  const is_loading = useWalletStore((s) => s.is_loading);
  const is_hidden = useWalletStore((s) => s.is_balance_hidden);
  const toggle_hidden = useWalletStore((s) => s.toggle_balance_visibility);
  const load_wallets = useWalletStore((s) => s.load_wallets);

  const [rates, set_rates] = useState<CurrencyPair[]>([]);
  const [transactions, set_transactions] = useState<Transaction[]>([]);
  const [filter, set_filter] = useState<AssetTypeFilterValue>("all");
  const [query, set_query] = useState("");
  const [hide_zero, set_hide_zero] = useState(false);
  const [sort, set_sort] = useState<SortState>({ key: "usdt", dir: "desc" });
  const [expanded_code, set_expanded_code] = useState<string | null>(null);

  const toggle_expand = (code: string) => {
    set_expanded_code((prev) => (prev === code ? null : code));
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-asset-row="${code}"]`);
      if (target) target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  const [selected_wallet, set_selected_wallet] = useState<Wallet | null>(null);
  const [is_deposit_modal_open, set_is_deposit_modal_open] = useState(false);
  const [is_withdraw_modal_open, set_is_withdraw_modal_open] = useState(false);

  const load_transactions = () => {
    transactionService
      .get_history({ limit: 50 })
      .then(set_transactions)
      .catch(() => set_transactions([]));
  };

  useEffect(() => {
    load_wallets();
    exchangeService
      .get_exchange_pairs()
      .then((res) => set_rates(res.data))
      .catch(() => toast.error(t("messages.loadFailed")));
    load_transactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active_wallets = useMemo(
    () => wallets.filter((w) => w.currency.is_active),
    [wallets]
  );

  const counts = useMemo(
    () => ({
      all: active_wallets.length,
      crypto: active_wallets.filter((w) => w.currency.is_crypto).length,
      fiat: active_wallets.filter((w) => !w.currency.is_crypto).length,
    }),
    [active_wallets]
  );

  const visible_wallets = useMemo(() => {
    let list = active_wallets;
    if (filter === "crypto") list = list.filter((w) => w.currency.is_crypto);
    if (filter === "fiat") list = list.filter((w) => !w.currency.is_crypto);
    if (hide_zero) list = list.filter((w) => w.balance + w.locked > 0);
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      const q_alt = ru_layout_to_en(q);
      list = list.filter((w) => {
        const code = w.currency.code.toLowerCase();
        const name = w.currency.name.toLowerCase();
        return (
          code.includes(q) ||
          name.includes(q) ||
          code.includes(q_alt) ||
          name.includes(q_alt)
        );
      });
    }

    const sorted = [...list].sort((a, b) => {
      let a_val: number | null;
      let b_val: number | null;
      if (sort.key === "total") {
        a_val = a.balance + a.locked;
        b_val = b.balance + b.locked;
      } else {
        a_val = get_usdt_equivalence(a, rates);
        b_val = get_usdt_equivalence(b, rates);
      }
      if (a_val === null && b_val === null) return 0;
      if (a_val === null) return 1;
      if (b_val === null) return -1;
      return sort.dir === "asc" ? a_val - b_val : b_val - a_val;
    });

    return sorted;
  }, [active_wallets, filter, hide_zero, sort, rates, query]);

  const total_usdt = useMemo(
    () =>
      active_wallets.reduce((sum, w) => {
        const v = get_usdt_equivalence(w, rates);
        return sum + (v ?? 0);
      }, 0),
    [active_wallets, rates]
  );

  const handle_deposit = (w: Wallet) => {
    set_selected_wallet(w);
    set_is_deposit_modal_open(true);
  };

  const handle_withdraw = (w: Wallet) => {
    set_selected_wallet(w);
    set_is_withdraw_modal_open(true);
  };

  const handle_withdraw_success = () => {
    set_is_withdraw_modal_open(false);
    set_selected_wallet(null);
    load_wallets();
    load_transactions();
  };

  if (is_loading && wallets.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const total_text = format_usdt(total_usdt);
  const total_display = is_hidden ? mask_balance(total_text) : total_text;

  const empty_message =
    active_wallets.length === 0
      ? t("wallets.noWallets")
      : visible_wallets.length === 0
        ? t("wallets.noResults")
        : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("wallets.title")}</h1>
          <p className="text-gray-600 mt-1">{t("wallets.subtitle")}</p>
        </div>
      </div>

      {/* Total Equity */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-blue-100 text-sm mb-1">{t("wallets.totalEquity")}</p>
            <h2 className="text-4xl font-bold tabular-nums">{total_display} USDT</h2>
          </div>
          <button
            type="button"
            onClick={toggle_hidden}
            aria-label={is_hidden ? t("wallets.showBalance") : t("wallets.hideBalance")}
            className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg"
          >
            {is_hidden ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <AssetTypeFilter value={filter} on_change={set_filter} counts={counts} />
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
          <div className="flex items-center gap-2 order-2 md:order-1">
            <Switch
              id="hide-zero"
              checked={hide_zero}
              onCheckedChange={set_hide_zero}
            />
            <Label htmlFor="hide-zero" className="text-sm text-gray-600 cursor-pointer">
              {t("wallets.hideZeroBalances")}
            </Label>
          </div>
          <div className="order-1 md:order-2 w-full md:w-auto">
            <ExpandingSearch value={query} on_change={set_query} />
          </div>
        </div>
      </div>

      {/* Table */}
      <AssetTable
        wallets={visible_wallets}
        rates={rates}
        is_hidden={is_hidden}
        sort={sort}
        expanded_code={expanded_code}
        transactions={transactions}
        on_toggle_expand={toggle_expand}
        on_sort_change={set_sort}
        on_deposit={handle_deposit}
        on_withdraw={handle_withdraw}
        empty_message={empty_message}
      />

      <AssetCardList
        wallets={visible_wallets}
        rates={rates}
        is_hidden={is_hidden}
        expanded_code={expanded_code}
        transactions={transactions}
        on_toggle_expand={toggle_expand}
        on_deposit={handle_deposit}
        on_withdraw={handle_withdraw}
        empty_message={empty_message}
      />

      {/* Modals */}
      <DepositModal
        is_open={is_deposit_modal_open}
        wallet={selected_wallet}
        on_close={() => {
          set_is_deposit_modal_open(false);
          set_selected_wallet(null);
        }}
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
