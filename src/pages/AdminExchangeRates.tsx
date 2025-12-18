import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { exchangeRatesService } from "@/api/services/exchangeRatesService";
import { walletService } from "@/api/services/walletService";
import type { CurrencyPair, CurrencyInfo } from "@/types";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateRateModal } from "@/components/modals/CreateRateModal";
import { EditRateModal } from "@/components/modals/EditRateModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminExchangeRates() {
  const { t } = useTranslation();
  const [rates, set_rates] = useState<CurrencyPair[]>([]);
  const [currencies, set_currencies] = useState<CurrencyInfo[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_create_modal_open, set_is_create_modal_open] = useState(false);
  const [is_edit_modal_open, set_is_edit_modal_open] = useState(false);
  const [selected_rate, set_selected_rate] = useState<CurrencyPair | null>(null);
  const [rate_to_delete, set_rate_to_delete] = useState<CurrencyPair | null>(null);
  const [is_deleting, set_is_deleting] = useState(false);

  useEffect(() => {
    load_data();
  }, []);

  const load_data = async () => {
    try {
      set_is_loading(true);
      const [rates_data, currencies_data] = await Promise.all([
        exchangeRatesService.get_all_rates(),
        walletService.get_currencies(),
      ]);
      set_rates(rates_data);
      set_currencies(currencies_data);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      toast.error(t("messages.loadRatesFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  const handle_edit = (rate: CurrencyPair) => {
    set_selected_rate(rate);
    set_is_edit_modal_open(true);
  };

  const handle_delete_click = (rate: CurrencyPair) => {
    set_rate_to_delete(rate);
  };

  const handle_delete_confirm = async () => {
    if (!rate_to_delete) return;

    set_is_deleting(true);
    try {
      await exchangeRatesService.delete_rate(rate_to_delete.id);
      toast.success(t("messages.rateDeleted"));
      set_rate_to_delete(null);
      load_data();
    } catch (error: any) {
      const error_message = error.response?.data?.error || t("messages.deleteRateFailed");
      toast.error(error_message);
    } finally {
      set_is_deleting(false);
    }
  };

  const handle_success = () => {
    set_is_create_modal_open(false);
    set_is_edit_modal_open(false);
    set_selected_rate(null);
    load_data();
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  if (is_loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("admin.exchangeRates.title")}</h1>
          <p className="text-gray-600 mt-1">{t("admin.exchangeRates.subtitle")}</p>
        </div>
        <Button onClick={() => set_is_create_modal_open(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.exchangeRates.createRate")}
        </Button>
      </div>

      {/* Rates Table */}
      {rates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("admin.exchangeRates.noRates")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("admin.exchangeRates.createFirstRate")}
            </p>
            <Button onClick={() => set_is_create_modal_open(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("admin.exchangeRates.createRate")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.exchanges.id")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.exchangeRates.pair")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.exchangeRates.rateValue")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.exchangeRates.feeValue")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.exchanges.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{rate.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {rate.from_currency.code}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {rate.to_currency.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {rate.from_currency.name} → {rate.to_currency.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        1 {rate.from_currency.code} = {format_number(rate.rate)} {rate.to_currency.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {rate.fee.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handle_edit(rate)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          {t("admin.exchangeRates.editFee")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handle_delete_click(rate)}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("admin.exchangeRates.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateRateModal
        is_open={is_create_modal_open}
        on_close={() => set_is_create_modal_open(false)}
        on_success={handle_success}
        currencies={currencies}
      />

      {/* Edit Modal */}
      <EditRateModal
        is_open={is_edit_modal_open}
        on_close={() => {
          set_is_edit_modal_open(false);
          set_selected_rate(null);
        }}
        on_success={handle_success}
        rate={selected_rate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!rate_to_delete} onOpenChange={() => set_rate_to_delete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.exchangeRates.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.exchangeRates.deleteMessage")}{" "}
              <strong>
                {rate_to_delete?.from_currency.code} → {rate_to_delete?.to_currency.code}
              </strong>
              ? {t("admin.exchangeRates.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={is_deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handle_delete_confirm}
              disabled={is_deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {is_deleting ? t("admin.exchangeRates.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
