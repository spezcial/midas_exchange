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
import type { CreateExchangeResponse, CurrencyInfo } from "@/types";
import { Copy, Check, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface ExchangeSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchange: CreateExchangeResponse | null;
  from_currency: CurrencyInfo | null;
  to_currency: CurrencyInfo | null;
}

export function ExchangeSuccessModal({
  open,
  onOpenChange,
  exchange,
  from_currency,
  to_currency,
}: ExchangeSuccessModalProps) {
  const { t } = useTranslation();
  const [uid_copied, set_uid_copied] = useState(false);

  if (!exchange || !from_currency || !to_currency) return null;

  const handle_copy_uid = async () => {
    try {
      await navigator.clipboard.writeText(exchange.uid);
      set_uid_copied(true);
      toast.success(t("messages.copied"));
      setTimeout(() => set_uid_copied(false), 2000);
    } catch (error) {
      toast.error(t("messages.copyFailed"));
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">{t('exchange.successModal.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('exchange.successModal.success')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Exchange Summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('exchange.successModal.exchangedFrom')}</span>
              <span className="font-medium">
                {format_number(exchange.from_amount)} {from_currency.code}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('exchange.successModal.exchangedTo')}</span>
              <span className="font-medium text-green-600">
                {format_number(exchange.to_amount_with_fee)} {to_currency.code}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('exchange.successModal.exchangeRate')}</span>
              <span className="font-medium">
                1 {from_currency.code} = {format_number(exchange.exchange_rate)} {to_currency.code}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('exchange.successModal.feeCharged')}</span>
              <span className="font-medium">{exchange.fee}%</span>
            </div>
          </div>

          {/* UID Section */}
          <div className="space-y-2">
            <Label>{t('exchange.successModal.orderNumber')}</Label>
            <div className="flex items-center gap-2">
              <Input
                value={exchange.uid}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handle_copy_uid}
                className="shrink-0"
              >
                {uid_copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {t('exchange.successModal.status')}: {t('history.statuses.completed')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
