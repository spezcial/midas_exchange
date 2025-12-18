import { useState, useEffect } from "react";
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
import type { CurrencyPair } from "@/types";
import { exchangeRatesService } from "@/api/services/exchangeRatesService";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";

interface EditRateModalProps {
  is_open: boolean;
  on_close: () => void;
  on_success: () => void;
  rate: CurrencyPair | null;
}

export function EditRateModal({
  is_open,
  on_close,
  on_success,
  rate,
}: EditRateModalProps) {
  const { t } = useTranslation();

  const edit_rate_schema = z.object({
    fee: z.number().min(0, t("admin.exchangeRates.createModal.feeRange")).max(100, t("admin.exchangeRates.createModal.feeMax")),
  });

  type EditRateFormValues = z.infer<typeof edit_rate_schema>;
  const [is_submitting, set_is_submitting] = useState(false);

  const form = useForm<EditRateFormValues>({
    resolver: zodResolver(edit_rate_schema),
    defaultValues: {
      fee: rate?.fee || 0,
    },
  });

  useEffect(() => {
    if (rate) {
      form.reset({
        fee: rate.fee,
      });
    }
  }, [rate, form]);

  const on_submit = async (values: EditRateFormValues) => {
    if (!rate) return;

    set_is_submitting(true);
    try {
      await exchangeRatesService.update_rate(rate.id, values);
      toast.success(t("messages.rateUpdated"));
      on_success();
    } catch (error: any) {
      const error_message = error.response?.data?.error || t("messages.updateRateFailed");
      toast.error(error_message);
    } finally {
      set_is_submitting(false);
    }
  };

  if (!rate) return null;

  return (
    <Dialog open={is_open} onOpenChange={on_close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <DialogTitle>{t("admin.exchangeRates.editModal.title")}</DialogTitle>
          </div>
          <DialogDescription>
            {rate.from_currency.code} → {rate.to_currency.code}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-4 py-4">
            {/* Rate (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.exchangeRates.editModal.rate")}</label>
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">
                  1 {rate.from_currency.code} = {rate.rate.toFixed(8).replace(/\.?0+$/, "")} {rate.to_currency.code}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.exchangeRates.editModal.rateReadonly")}
              </p>
            </div>

            {/* Fee */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.exchangeRates.editModal.fee")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={on_close} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={is_submitting}
                className="flex-1"
              >
                {is_submitting ? t("admin.exchangeRates.editModal.saving") : t("admin.exchangeRates.editModal.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
