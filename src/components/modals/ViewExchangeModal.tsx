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
import type { AdminCurrencyExchange } from "@/types";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface ViewExchangeModalProps {
  is_open: boolean;
  exchange: AdminCurrencyExchange | null;
  on_close: () => void;
}

export function ViewExchangeModal({
  is_open,
  exchange,
  on_close,
}: ViewExchangeModalProps) {
  const { t } = useTranslation();
  if (!exchange) return null;

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  const get_status_info = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          text: t('history.statuses.completed'),
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-900",
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          text: t('history.statuses.pending'),
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-900",
        };
      case "canceled":
        return {
          icon: <XCircle className="h-5 w-5 text-gray-600" />,
          text: t('history.statuses.cancelled'),
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-900",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          text: status,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-900",
        };
    }
  };

  const status_info = get_status_info(exchange.status);

  return (
    <Dialog open={is_open} onOpenChange={(open) => !open && on_close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('exchange.viewModal.title')} #{exchange.id}</DialogTitle>
          <DialogDescription>
            {t('exchange.viewModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Badge */}
          <div className={`rounded-lg p-4 border ${status_info.bgColor} ${status_info.borderColor}`}>
            <div className="flex items-center gap-2">
              {status_info.icon}
              <div>
                <p className={`text-sm font-medium ${status_info.textColor}`}>
                  {t('history.status')}: {status_info.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {exchange.status === "completed" && t('exchange.viewModal.exchangeCompleted')}
                  {exchange.status === "pending" && t('exchange.viewModal.exchangePending')}
                  {exchange.status === "canceled" && t('exchange.viewModal.exchangeCanceled')}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-sm text-gray-900 mt-1">#{exchange.user_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900 mt-1">{exchange.email}</p>
            </div>
          </div>

          {/* Exchange Info */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{t('exchange.viewModal.exchangeInfo')}</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">UID</span>
                <span className="font-mono text-gray-900">{exchange.uid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.fromCurrency')}</span>
                <span className="font-medium text-gray-900">
                  {exchange.from_currency.name} ({exchange.from_currency.code})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.toCurrency')}</span>
                <span className="font-medium text-gray-900">
                  {exchange.to_currency.name} ({exchange.to_currency.code})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.sent')}</span>
                <span className="font-medium text-gray-900">
                  {format_number(exchange.from_amount)} {exchange.from_currency.code}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.rate')}</span>
                <span className="font-medium text-gray-900">
                  1 {exchange.from_currency.code} = {format_number(exchange.exchange_rate)} {exchange.to_currency.code}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.fee')}</span>
                <span className="font-medium text-gray-900">{exchange.fee}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.amountBeforeFee')}</span>
                <span className="font-medium text-gray-900">
                  {format_number(exchange.to_amount)} {exchange.to_currency.code}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>{t('exchange.viewModal.received')}</span>
                <span className="text-green-600">
                  {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{t('exchange.viewModal.timestamps')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.created')}</span>
                <span className="text-gray-900">
                  {format(new Date(exchange.created_at), "dd.MM.yyyy HH:mm:ss")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('exchange.viewModal.updated')}</span>
                <span className="text-gray-900">
                  {format(new Date(exchange.updated_at), "dd.MM.yyyy HH:mm:ss")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={on_close} className="w-full">
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
