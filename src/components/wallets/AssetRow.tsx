import { useTranslation } from "react-i18next";
import { ArrowDownCircle, ArrowUpCircle, ChevronRight } from "lucide-react";
import type { Wallet } from "@/types";
import { Button } from "@/components/ui/button";
import { CurrencyIcon } from "./CurrencyIcon";
import { format_balance, format_usdt, mask_balance } from "@/lib/wallet";
import { cn } from "@/lib/utils";

interface Props {
  wallet: Wallet;
  usdt_value: number | null;
  is_hidden: boolean;
  is_expanded: boolean;
  on_toggle_expand: (code: string) => void;
  on_deposit: (w: Wallet) => void;
  on_withdraw: (w: Wallet) => void;
}

export function AssetRow({
  wallet,
  usdt_value,
  is_hidden,
  is_expanded,
  on_toggle_expand,
  on_deposit,
  on_withdraw,
}: Props) {
  const { t } = useTranslation();
  const total = wallet.balance + wallet.locked;
  const can_withdraw = wallet.currency.is_active && wallet.balance > 0;

  const balance_text = format_balance(wallet.balance);
  const locked_text = format_balance(wallet.locked);
  const total_text = format_balance(total);
  const usdt_text = usdt_value === null ? "—" : format_usdt(usdt_value);

  const display = (raw: string) => (is_hidden ? mask_balance(raw) : raw);
  const handle_row_click = () => on_toggle_expand(wallet.currency.code);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <tr
      data-asset-row={wallet.currency.code}
      onClick={handle_row_click}
      className={cn(
        "group border-b border-gray-100 transition-colors cursor-pointer",
        is_expanded ? "bg-gray-50/80" : "hover:bg-gray-50/70"
      )}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <CurrencyIcon
            code={wallet.currency.code}
            is_crypto={wallet.currency.is_crypto}
            size={36}
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{wallet.currency.code}</div>
            <div className="text-xs text-gray-500 truncate">{wallet.currency.name}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right tabular-nums">
        <span className="font-medium text-gray-900">{display(total_text)}</span>
      </td>
      <td className="py-4 px-4 text-right tabular-nums text-gray-700">
        {display(balance_text)}
      </td>
      <td className="py-4 px-4 text-right tabular-nums text-gray-500">
        {display(locked_text)}
      </td>
      <td className="py-4 px-4 text-right tabular-nums">
        <span className="text-gray-700">
          {usdt_value === null ? "—" : `≈ ${display(usdt_text)}`}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-2">
          <div
            className={cn(
              "flex items-center gap-2 transition-opacity",
              is_expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={stop}
          >
            <Button
              size="sm"
              variant="default"
              onClick={() => on_deposit(wallet)}
              disabled={!wallet.currency.is_active}
              className="gap-1.5"
            >
              <ArrowDownCircle className="h-3.5 w-3.5" />
              {t("wallets.deposit")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => on_withdraw(wallet)}
              disabled={!can_withdraw}
              className="gap-1.5"
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              {t("wallets.withdraw")}
            </Button>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              is_expanded && "rotate-90"
            )}
          />
        </div>
      </td>
    </tr>
  );
}
