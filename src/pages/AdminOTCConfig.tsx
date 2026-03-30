import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { otcService } from "@/api/services/otcService";
import { walletService } from "@/api/services/walletService";
import type { OTCConfigWithCurrencies, CurrencyInfo } from "@/types";

interface ConfigForm {
  from_currency_id: number;
  to_currency_id: number;
  min_from_amount: number;
  payment_timeout_min: number;
  is_active: boolean;
}

const EMPTY_FORM: ConfigForm = {
  from_currency_id: 0,
  to_currency_id: 0,
  min_from_amount: 0,
  payment_timeout_min: 30,
  is_active: true,
};

export function AdminOTCConfig() {
  const { t } = useTranslation();
  const [configs, set_configs] = useState<OTCConfigWithCurrencies[]>([]);
  const [currencies, set_currencies] = useState<CurrencyInfo[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  // Create dialog
  const [create_open, set_create_open] = useState(false);
  const [create_form, set_create_form] = useState<ConfigForm>(EMPTY_FORM);
  const [is_creating, set_is_creating] = useState(false);

  // Edit dialog
  const [edit_target, set_edit_target] = useState<OTCConfigWithCurrencies | null>(null);
  const [edit_form, set_edit_form] = useState<Pick<ConfigForm, "min_from_amount" | "payment_timeout_min" | "is_active">>({
    min_from_amount: 0,
    payment_timeout_min: 30,
    is_active: true,
  });
  const [is_saving, set_is_saving] = useState(false);

  // Delete dialog
  const [delete_target, set_delete_target] = useState<OTCConfigWithCurrencies | null>(null);
  const [is_deleting, set_is_deleting] = useState(false);

  useEffect(() => {
    load_data();
  }, []);

  const load_data = async () => {
    try {
      set_is_loading(true);
      const [cfg, cur] = await Promise.all([
        otcService.admin_get_configs(),
        walletService.get_currencies(),
      ]);
      set_configs(cfg);
      set_currencies(cur.filter((c) => c.is_active));
    } catch {
      toast.error(t("messages.loadFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  const open_create = () => {
    set_create_form(EMPTY_FORM);
    set_create_open(true);
  };

  const handle_create = async () => {
    if (!create_form.from_currency_id || !create_form.to_currency_id) {
      toast.error(t("errors.required"));
      return;
    }
    if (create_form.from_currency_id === create_form.to_currency_id) {
      toast.error(t("admin.exchangeRates.createModal.differentCurrencies"));
      return;
    }
    try {
      set_is_creating(true);
      await otcService.admin_create_config(create_form);
      toast.success(t("common.saved"));
      set_create_open(false);
      load_data();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_creating(false);
    }
  };

  const open_edit = (cfg: OTCConfigWithCurrencies) => {
    set_edit_target(cfg);
    set_edit_form({
      min_from_amount: cfg.min_from_amount,
      payment_timeout_min: cfg.payment_timeout_min,
      is_active: cfg.is_active,
    });
  };

  const handle_save = async () => {
    if (!edit_target) return;
    try {
      set_is_saving(true);
      await otcService.admin_update_config(edit_target.id, edit_form);
      toast.success(t("common.saved"));
      set_edit_target(null);
      load_data();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_saving(false);
    }
  };

  const handle_delete = async () => {
    if (!delete_target) return;
    try {
      set_is_deleting(true);
      await otcService.admin_delete_config(delete_target.id);
      toast.success(t("common.deleted"));
      set_delete_target(null);
      load_data();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_deleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("otc.config.title")}</h1>
          <p className="text-gray-600 mt-1">{t("otc.config.subtitle")}</p>
        </div>
        <Button onClick={open_create} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("otc.config.addPair")}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.config.pair")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.config.minAmount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.config.timeout")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.config.active")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t("otc.config.noPairs")}
                  </td>
                </tr>
              ) : (
                configs.map((cfg) => (
                  <tr key={cfg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <span>{cfg.from_currency.code}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                        <span>{cfg.to_currency.code}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {cfg.from_currency.name} → {cfg.to_currency.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cfg.min_from_amount.toLocaleString()} {cfg.from_currency.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cfg.payment_timeout_min} {t("otc.config.minutes")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cfg.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-sm font-medium">
                          <Check className="h-4 w-4" />
                          {t("common.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                          <X className="h-4 w-4" />
                          {t("common.inactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => open_edit(cfg)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => set_delete_target(cfg)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={create_open} onOpenChange={set_create_open}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("otc.config.addPair")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("otc.create.fromCurrency")}</Label>
              <Select
                value={create_form.from_currency_id ? String(create_form.from_currency_id) : ""}
                onValueChange={(v) => set_create_form((f) => ({ ...f, from_currency_id: Number(v) }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("otc.create.toCurrency")}</Label>
              <Select
                value={create_form.to_currency_id ? String(create_form.to_currency_id) : ""}
                onValueChange={(v) => set_create_form((f) => ({ ...f, to_currency_id: Number(v) }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("otc.config.minAmount")}</Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                value={create_form.min_from_amount || ""}
                onChange={(e) => set_create_form((f) => ({ ...f, min_from_amount: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>{t("otc.config.timeout")} ({t("otc.config.minutes")})</Label>
              <Input
                type="number"
                min="1"
                step="1"
                className="mt-1.5"
                value={create_form.payment_timeout_min}
                onChange={(e) => set_create_form((f) => ({ ...f, payment_timeout_min: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="create-active"
                checked={create_form.is_active}
                onCheckedChange={(v) => set_create_form((f) => ({ ...f, is_active: v }))}
              />
              <Label htmlFor="create-active">{t("otc.config.active")}</Label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => set_create_open(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" onClick={handle_create} disabled={is_creating}>
                {is_creating ? t("common.saving") : t("common.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!edit_target} onOpenChange={(open) => !open && set_edit_target(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {edit_target?.from_currency.code} → {edit_target?.to_currency.code}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("otc.config.minAmount")} ({edit_target?.from_currency.code})</Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                value={edit_form.min_from_amount || ""}
                onChange={(e) => set_edit_form((f) => ({ ...f, min_from_amount: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>{t("otc.config.timeout")} ({t("otc.config.minutes")})</Label>
              <Input
                type="number"
                min="1"
                step="1"
                className="mt-1.5"
                value={edit_form.payment_timeout_min}
                onChange={(e) => set_edit_form((f) => ({ ...f, payment_timeout_min: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="edit-active"
                checked={edit_form.is_active}
                onCheckedChange={(v) => set_edit_form((f) => ({ ...f, is_active: v }))}
              />
              <Label htmlFor="edit-active">{t("otc.config.active")}</Label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => set_edit_target(null)}>
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" onClick={handle_save} disabled={is_saving}>
                {is_saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!delete_target} onOpenChange={(open) => !open && set_delete_target(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {delete_target?.from_currency.code} → {delete_target?.to_currency.code}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handle_delete}
              disabled={is_deleting}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
