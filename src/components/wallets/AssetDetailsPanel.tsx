import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import type { Wallet, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "address" | "history";

interface Props {
  wallet: Wallet;
  transactions: Transaction[];
}

export function AssetDetailsPanel({ wallet, transactions }: Props) {
  const { t } = useTranslation();
  const [tab, set_tab] = useState<Tab>("history");
  const [copied, set_copied] = useState(false);

  const wallet_transactions = useMemo(() => {
    const wallet_id = wallet.id;
    const code = wallet.currency.code;
    const filtered = transactions.filter((tr) => {
      if (typeof wallet_id === "number" && tr.wallet_id === wallet_id) return true;
      return tr.from_currency === code || tr.to_currency === code;
    });
    return filtered.slice(0, 10);
  }, [transactions, wallet.id, wallet.currency.code]);

  const handle_copy = async () => {
    if (!wallet.deposit_address) return;
    try {
      await navigator.clipboard.writeText(wallet.deposit_address);
      set_copied(true);
      toast.success(t("messages.addressCopied"));
      setTimeout(() => set_copied(false), 2000);
    } catch {
      toast.error(t("messages.copyFailed"));
    }
  };

  const tab_class = (active: boolean) =>
    cn(
      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-900"
    );

  return (
    <div className="bg-gray-50/60 px-4 py-4 border-t border-gray-100">
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4 flex-wrap">
        <button
          type="button"
          onClick={() => set_tab("history")}
          className={tab_class(tab === "history")}
        >
          {t("wallets.details.tabs.history")}
        </button>
        {wallet.currency.is_crypto && (
          <button
            type="button"
            onClick={() => set_tab("address")}
            className={tab_class(tab === "address")}
          >
            {t("wallets.details.tabs.address")}
          </button>
        )}
      </div>

      {tab === "history" && (
        <div>
          {wallet_transactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              {t("wallets.details.history.empty")}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-200">
              {wallet_transactions.map((tr) => (
                <li key={tr.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        tr.type === "deposit" && "bg-green-100 text-green-700",
                        tr.type === "withdrawal" && "bg-orange-100 text-orange-700",
                        tr.type === "exchange" && "bg-blue-100 text-blue-700",
                        tr.type === "referral" && "bg-purple-100 text-purple-700"
                      )}
                    >
                      {tr.type}
                    </span>
                    <span className="text-gray-500 text-xs tabular-nums">
                      {format(new Date(tr.created_at), "dd.MM.yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-gray-900 font-medium">
                      {(() => {
                        const incoming = tr.type === "deposit" || tr.type === "otc_credit";
                        const outgoing = tr.type === "withdrawal" || tr.type === "otc_debit";
                        const value =
                          tr.amount ??
                          (incoming ? tr.to_amount : outgoing ? tr.from_amount : undefined);
                        if (value === undefined) return "—";
                        const sign = incoming ? "+" : outgoing ? "−" : "";
                        return `${sign}${value} ${wallet.currency.code}`;
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">{tr.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "address" && wallet.currency.is_crypto && (
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="space-y-3">
            {wallet.deposit_address ? (
              <>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md font-mono text-sm break-all">
                    {wallet.deposit_address}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handle_copy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {t("wallets.depositModal.sendTo", { currency: wallet.currency.code })}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                {t("wallets.depositModal.addressNotReady", {
                  defaultValue: "Deposit address is being generated.",
                })}
              </p>
            )}
          </div>
          {wallet.deposit_address && (
            <div className="bg-white rounded-md border border-gray-200 p-2 inline-block">
              <QRCodeSVG value={wallet.deposit_address} size={120} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
