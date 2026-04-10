import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Wallet } from "@/types";
import { ArrowDownCircle, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

interface DepositModalProps {
  is_open: boolean;
  wallet: Wallet | null;
  on_close: () => void;
}

export function DepositModal({
  is_open,
  wallet,
  on_close,
}: DepositModalProps) {
  const { t } = useTranslation();
  const [address_copied, set_address_copied] = useState(false);

  if (!wallet) return null;

  const deposit_address = wallet.currency.is_crypto ? wallet.deposit_address ?? null : null;

  const handle_copy_address = async () => {
    if (deposit_address) {
      try {
        await navigator.clipboard.writeText(deposit_address);
        set_address_copied(true);
        toast.success(t("messages.addressCopied"));
        setTimeout(() => set_address_copied(false), 2000);
      } catch (error) {
        toast.error(t("messages.copyFailed"));
      }
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  return (
    <Dialog open={is_open} onOpenChange={on_close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-blue-600" />
            <DialogTitle>{t("wallets.depositModal.title", { currency: wallet.currency.code })}</DialogTitle>
          </div>
          <DialogDescription>
            {wallet.currency.name} - {t("wallets.depositModal.currentBalance")}: {format_number(wallet.balance)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {wallet.currency.is_crypto ? (
            <>
              {/* Crypto Deposit Instructions */}
              <div className="space-y-4">
                <div>
                  <Label>{t("wallets.depositModal.depositAddress")}</Label>
                  {deposit_address ? (
                    <>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={deposit_address}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handle_copy_address}
                          className="shrink-0"
                        >
                          {address_copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("wallets.depositModal.sendTo", { currency: wallet.currency.code })}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("wallets.depositModal.addressNotReady", { defaultValue: "Deposit address is being generated. Please try again shortly." })}
                    </p>
                  )}
                </div>

                {/* QR Code */}
                {deposit_address && (
                  <div className="flex justify-center p-4 bg-white border rounded-lg">
                    <QRCodeSVG value={deposit_address} size={180} />
                  </div>
                )}

                {/* Important Notes */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {t("wallets.depositModal.importantInfo")}
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>{t("wallets.depositModal.sendOnlyThis", { currency: wallet.currency.code })}</li>
                    <li>{t("wallets.depositModal.minAmount", { currency: wallet.currency.code })}</li>
                    <li>{t("wallets.depositModal.confirmationsRequired")}</li>
                    <li>{t("wallets.depositModal.autoCredit")}</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Fiat Deposit Instructions */}
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    {t("wallets.depositModal.bankTransfer")}
                  </p>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>{t("wallets.depositModal.recipient")}</p>
                    <p>{t("wallets.depositModal.bin")}</p>
                    <p>{t("wallets.depositModal.iban")}</p>
                    <p>{t("wallets.depositModal.bik")}</p>
                    <p>{t("wallets.depositModal.bank")}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {t("wallets.depositModal.paymentPurpose")}
                  </p>
                  <p className="text-sm text-blue-800">
                    {t("wallets.depositModal.paymentPurposeText", { currency: wallet.currency.code })}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">
                    {t("wallets.depositModal.processingTime")}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={on_close} variant="outline" className="w-full">
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
