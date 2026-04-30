import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownCircle, ArrowUpCircle, ChevronDown } from "lucide-react";
import type { Wallet, CurrencyPair, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { AssetDetailsPanel } from "./AssetDetailsPanel";
import { CurrencyIcon } from "./CurrencyIcon";
import { format_balance, format_usdt, get_usdt_equivalence, mask_balance } from "@/lib/wallet";
import { cn } from "@/lib/utils";

interface Props {
  wallets: Wallet[];
  rates: CurrencyPair[];
  is_hidden: boolean;
  expanded_code: string | null;
  transactions: Transaction[];
  on_toggle_expand: (code: string) => void;
  on_deposit: (w: Wallet) => void;
  on_withdraw: (w: Wallet) => void;
  empty_message: string;
}

export function AssetCardList({
  wallets,
  rates,
  is_hidden,
  expanded_code,
  transactions,
  on_toggle_expand,
  on_deposit,
  on_withdraw,
  empty_message,
}: Props) {
  const { t } = useTranslation();

  if (wallets.length === 0) {
    return (
      <div className="md:hidden bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
        {empty_message}
      </div>
    );
  }

  const display = (raw: string) => (is_hidden ? mask_balance(raw) : raw);

  return (
    <div className="md:hidden space-y-3">
      {wallets.map((wallet) => {
        const is_expanded = expanded_code === wallet.currency.code;
        const usdt = get_usdt_equivalence(wallet, rates);
        const total_text = format_balance(wallet.balance + wallet.locked);
        const usdt_text = usdt === null ? "—" : format_usdt(usdt);
        const can_withdraw = wallet.currency.is_active && wallet.balance > 0;

        return (
          <Fragment key={wallet.currency.code}>
            <div
              className={cn(
                "bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow",
                is_expanded && "shadow-md"
              )}
            >
              <button
                type="button"
                onClick={() => on_toggle_expand(wallet.currency.code)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <CurrencyIcon
                  code={wallet.currency.code}
                  is_crypto={wallet.currency.is_crypto}
                  size={40}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{wallet.currency.code}</div>
                  <div className="text-xs text-gray-500 truncate">{wallet.currency.name}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-medium text-gray-900">{display(total_text)}</div>
                  <div className="text-xs text-gray-500">
                    {usdt === null ? "—" : `≈ ${display(usdt_text)} USDT`}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform shrink-0",
                    is_expanded && "rotate-180"
                  )}
                />
              </button>

              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => on_deposit(wallet)}
                  disabled={!wallet.currency.is_active}
                  className="gap-1.5 w-full"
                >
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  {t("wallets.deposit")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => on_withdraw(wallet)}
                  disabled={!can_withdraw}
                  className="gap-1.5 w-full"
                >
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  {t("wallets.withdraw")}
                </Button>
              </div>

              {is_expanded && (
                <AssetDetailsPanel wallet={wallet} transactions={transactions} />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
