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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyInfo } from "@/types";
import { exchangeRatesService } from "@/api/services/exchangeRatesService";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

interface CreateRateModalProps {
  is_open: boolean;
  on_close: () => void;
  on_success: () => void;
  currencies: CurrencyInfo[];
}

export function CreateRateModal({
  is_open,
  on_close,
  on_success,
  currencies,
}: CreateRateModalProps) {
  const { t } = useTranslation();

  const create_rate_schema = z.object({
    from_currency_id: z.string().min(1, t("admin.exchangeRates.createModal.selectCurrency")),
    to_currency_id: z.string().min(1, t("admin.exchangeRates.createModal.selectCurrency")),
    rate: z.number().positive(t("admin.exchangeRates.createModal.ratePositive")),
    fee: z.number().min(0, t("admin.exchangeRates.createModal.feeRange")).max(100, t("admin.exchangeRates.createModal.feeMax")),
  });

  type CreateRateFormValues = z.infer<typeof create_rate_schema>;
  const [is_submitting, set_is_submitting] = useState(false);

  const form = useForm<CreateRateFormValues>({
    resolver: zodResolver(create_rate_schema),
    defaultValues: {
      from_currency_id: "",
      to_currency_id: "",
      rate: undefined,
      fee: 0,
    },
  });

  useEffect(() => {
    if (!is_open) {
      form.reset();
    }
  }, [is_open, form]);

  const on_submit = async (values: CreateRateFormValues) => {
    if (values.from_currency_id === values.to_currency_id) {
      toast.error(t("admin.exchangeRates.createModal.differentCurrencies"));
      return;
    }

    set_is_submitting(true);
    try {
      await exchangeRatesService.create_rate({
        from_currency_id: parseInt(values.from_currency_id, 0),
        to_currency_id: parseInt(values.to_currency_id,0),
        rate: values.rate,
        fee: values.fee
      });
      toast.success(t("messages.rateCreated"));
      form.reset();
      on_success();
    } catch (error:any) {
      const error_message = error.response?.data?.error || t("messages.createRateFailed");
      toast.error(error_message);
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <Dialog open={is_open} onOpenChange={on_close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <DialogTitle>{t("admin.exchangeRates.createModal.title")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("admin.exchangeRates.createModal.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-4 py-4">
            {/* From Currency */}
            <FormField
              control={form.control}
              name="from_currency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.exchangeRates.createModal.fromCurrency")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.exchangeRates.createModal.selectCurrency")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.id+""}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Currency */}
            <FormField
              control={form.control}
              name="to_currency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.exchangeRates.createModal.toCurrency")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.exchangeRates.createModal.selectCurrency")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.id+""}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.exchangeRates.createModal.rate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.exchangeRates.createModal.fee")}</FormLabel>
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
                {is_submitting ? t("admin.exchangeRates.createModal.creating") : t("admin.exchangeRates.createModal.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
