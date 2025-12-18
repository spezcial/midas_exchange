import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Wallet } from "@/types";
import { walletService } from "@/api/services/walletService";
import { ArrowUpCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface WithdrawModalProps {
  is_open: boolean;
  wallet: Wallet | null;
  on_close: () => void;
  on_success: () => void;
}

export function WithdrawModal({
  is_open,
  wallet,
  on_close,
  on_success,
}: WithdrawModalProps) {
  const { t } = useTranslation();
  const [is_submitting, set_is_submitting] = useState(false);

  const create_withdraw_schema = (max_amount: number, is_crypto: boolean) => {
    return z.object({
      amount: z
        .number()
        .positive(t("errors.invalidAmount"))
        .max(max_amount, t("errors.maxAmount", { amount: max_amount }))
        .min(0.0001, t("errors.minAmount", { amount: "0.0001" })),
      address: is_crypto
        ? z.string().min(10, t("errors.email"))
        : z.string().optional(),
    });
  };

  type WithdrawFormValues = z.infer<ReturnType<typeof create_withdraw_schema>>;

  const form = useForm<WithdrawFormValues>({
    resolver: wallet
      ? zodResolver(create_withdraw_schema(wallet.balance, wallet.currency.is_crypto))
      : undefined,
    defaultValues: {
      amount: undefined,
      address: "",
    },
  });

  if (!wallet) return null;

  const on_submit = async (values: WithdrawFormValues) => {
    set_is_submitting(true);
    try {
      await walletService.withdraw({
        currency: wallet.currency.code as any,
        amount: values.amount,
        address: values.address || "",
      });
      toast.success(t("messages.withdrawRequestCreated", { amount: values.amount, currency: wallet.currency.code }));
      form.reset();
      on_success();
    } catch (error: any) {
      const error_message = error.response?.data?.error || t("messages.withdrawFailed");
      toast.error(error_message);
    } finally {
      set_is_submitting(false);
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  const set_max_amount = () => {
    form.setValue("amount", wallet.balance);
  };

  return (
    <Dialog open={is_open} onOpenChange={on_close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-orange-600" />
            <DialogTitle>{t("wallets.withdrawForm.title", { currency: wallet.currency.code })}</DialogTitle>
          </div>
          <DialogDescription>
            {wallet.currency.name} - {t("wallets.withdrawForm.currentBalance")}: {format_number(wallet.balance)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-4 py-4">
            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("wallets.withdrawForm.amount")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        value={field.value || ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                        onClick={set_max_amount}
                      >
                        {t("wallets.withdrawForm.max")}
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {t("wallets.available")}: {format_number(wallet.balance)} {wallet.currency.code}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field (for crypto only) */}
            {wallet.currency.is_crypto && (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("wallets.withdrawForm.address", { currency: wallet.currency.code })}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("wallets.withdrawForm.addressPlaceholder", { currency: wallet.currency.code })}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Fee Information */}
            <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("wallets.withdrawForm.networkFee")}</span>
                <span className="font-medium">
                  {wallet.currency.is_crypto ? "0.0001" : "0"} {wallet.currency.code}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-900 font-medium">{t("wallets.withdrawForm.youWillReceive")}</span>
                <span className="font-bold text-green-600">
                  ~{format_number((form.watch("amount") || 0) - (wallet.currency.is_crypto ? 0.0001 : 0))}{" "}
                  {wallet.currency.code}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">{t("wallets.withdrawForm.important")}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {wallet.currency.is_crypto ? (
                      <>
                        <li>{t("wallets.withdrawForm.checkAddress")}</li>
                        <li>{t("wallets.withdrawForm.irreversible")}</li>
                        <li>{t("wallets.withdrawForm.processingTime")}</li>
                      </>
                    ) : (
                      <>
                        <li>{t("wallets.withdrawForm.bankWithdraw")}</li>
                        <li>{t("wallets.withdrawForm.bankProcessingTime")}</li>
                        <li>{t("wallets.withdrawForm.bankFeeNote")}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={on_close} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={is_submitting}
                className="flex-1"
              >
                {is_submitting ? t("wallets.withdrawForm.withdrawing") : t("wallets.withdrawForm.withdraw")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
