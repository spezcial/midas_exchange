import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Wallet, CurrencyPair, Transaction } from "@/types";
import { AssetRow } from "./AssetRow";
import { AssetDetailsPanel } from "./AssetDetailsPanel";
import { get_usdt_equivalence } from "@/lib/wallet";
import { cn } from "@/lib/utils";

export type SortKey = "total" | "usdt";
export type SortDir = "asc" | "desc";

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface Props {
  wallets: Wallet[];
  rates: CurrencyPair[];
  is_hidden: boolean;
  sort: SortState;
  expanded_code: string | null;
  transactions: Transaction[];
  on_toggle_expand: (code: string) => void;
  on_sort_change: (s: SortState) => void;
  on_deposit: (w: Wallet) => void;
  on_withdraw: (w: Wallet) => void;
  empty_message: string;
}

export function AssetTable({
  wallets,
  rates,
  is_hidden,
  sort,
  expanded_code,
  transactions,
  on_toggle_expand,
  on_sort_change,
  on_deposit,
  on_withdraw,
  empty_message,
}: Props) {
  const { t } = useTranslation();

  const handle_sort = (key: SortKey) => {
    if (sort.key === key) {
      on_sort_change({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      on_sort_change({ key, dir: "desc" });
    }
  };

  const sort_indicator = (key: SortKey) => {
    if (sort.key !== key) {
      return <ChevronDown className="h-3.5 w-3.5 text-gray-300" />;
    }
    return sort.dir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
    );
  };

  return (
    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500 border-b border-gray-200">
            <th className="py-3 px-4">{t("wallets.table.asset")}</th>
            <th className="py-3 px-4 text-right">
              <button
                type="button"
                onClick={() => handle_sort("total")}
                className={cn(
                  "inline-flex items-center gap-1 ml-auto",
                  "hover:text-gray-900 transition-colors"
                )}
              >
                {t("wallets.table.total")}
                {sort_indicator("total")}
              </button>
            </th>
            <th className="py-3 px-4 text-right">{t("wallets.table.available")}</th>
            <th className="py-3 px-4 text-right">{t("wallets.table.inOrder")}</th>
            <th className="py-3 px-4 text-right">
              <button
                type="button"
                onClick={() => handle_sort("usdt")}
                className={cn(
                  "inline-flex items-center gap-1 ml-auto",
                  "hover:text-gray-900 transition-colors"
                )}
              >
                {t("wallets.table.usdtValue")}
                {sort_indicator("usdt")}
              </button>
            </th>
            <th className="py-3 px-4 text-right">{t("wallets.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {wallets.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500">
                {empty_message}
              </td>
            </tr>
          ) : (
            wallets.map((wallet) => {
              const is_expanded = expanded_code === wallet.currency.code;
              return (
                <Fragment key={wallet.currency.code}>
                  <AssetRow
                    wallet={wallet}
                    usdt_value={get_usdt_equivalence(wallet, rates)}
                    is_hidden={is_hidden}
                    is_expanded={is_expanded}
                    on_toggle_expand={on_toggle_expand}
                    on_deposit={on_deposit}
                    on_withdraw={on_withdraw}
                  />
                  {is_expanded && (
                    <tr data-asset-details={wallet.currency.code}>
                      <td colSpan={6} className="p-0 border-b border-gray-100">
                        <AssetDetailsPanel wallet={wallet} transactions={transactions} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
