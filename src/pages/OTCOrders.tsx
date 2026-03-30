import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus, ArrowRight, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { otcService, type CreateOTCOrderPayload } from "@/api/services/otcService";
import type { OTCOrder, OTCOrderStatus, OTCConfigWithCurrencies } from "@/types";

function StatusBadge({ status }: { status: OTCOrderStatus }) {
  const { t } = useTranslation();
  const cfg: Record<OTCOrderStatus, string> = {
    awaiting_review: "bg-yellow-100 text-yellow-800",
    negotiating: "bg-blue-100 text-blue-800",
    awaiting_payment: "bg-purple-100 text-purple-800",
    payment_received: "bg-cyan-100 text-cyan-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    expired: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg[status]}`}>
      {t(`otc.statuses.${status}`)}
    </span>
  );
}

export function OTCOrders() {
  const { t } = useTranslation();
  const [orders, set_orders] = useState<OTCOrder[]>([]);
  const [total, set_total] = useState(0);
  const [is_loading, set_is_loading] = useState(false);
  const [status_filter, set_status_filter] = useState("all");

  // Create order dialog
  const [is_create_open, set_is_create_open] = useState(false);
  const [configs, set_configs] = useState<OTCConfigWithCurrencies[]>([]);
  const [selected_config, set_selected_config] = useState<OTCConfigWithCurrencies | null>(null);
  const [form, set_form] = useState<CreateOTCOrderPayload>({
    from_currency_id: 0,
    to_currency_id: 0,
    from_amount: 0,
    proposed_rate: 0,
    comment: "",
  });
  const [is_submitting, set_is_submitting] = useState(false);

  const status_options = [
    { value: "all", label: t("otc.admin.allStatuses") },
    { value: "awaiting_review", label: t("otc.statuses.awaiting_review") },
    { value: "negotiating", label: t("otc.statuses.negotiating") },
    { value: "awaiting_payment", label: t("otc.statuses.awaiting_payment") },
    { value: "payment_received", label: t("otc.statuses.payment_received") },
    { value: "completed", label: t("otc.statuses.completed") },
    { value: "cancelled", label: t("otc.statuses.cancelled") },
    { value: "expired", label: t("otc.statuses.expired") },
  ];

  const load_orders = async () => {
    try {
      set_is_loading(true);
      const params: { status?: string } = {};
      if (status_filter !== "all") params.status = status_filter;
      const res = await otcService.list_orders(params);
      set_orders(res.orders ?? []);
      set_total(res.total ?? 0);
    } catch {
      toast.error(t("messages.loadFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    load_orders();
  }, [status_filter]);

  const open_create = async () => {
    if (configs.length === 0) {
      try {
        const list = await otcService.get_active_configs();
        set_configs(list);
        if (list.length === 0) {
          toast.error(t("otc.create.noPairsAvailable"));
          return;
        }
      } catch {
        toast.error(t("messages.loadFailed"));
        return;
      }
    }
    set_selected_config(null);
    set_form({ from_currency_id: 0, to_currency_id: 0, from_amount: 0, proposed_rate: 0, comment: "" });
    set_is_create_open(true);
  };

  const select_pair = (config_id: string) => {
    const cfg = configs.find((c) => String(c.id) === config_id) ?? null;
    set_selected_config(cfg);
    if (cfg) {
      set_form((f) => ({
        ...f,
        from_currency_id: cfg.from_currency_id,
        to_currency_id: cfg.to_currency_id,
        from_amount: 0,
      }));
    }
  };

  const handle_submit = async () => {
    if (!selected_config) {
      toast.error(t("errors.required"));
      return;
    }
    if (form.from_amount <= 0 || form.proposed_rate <= 0) {
      toast.error(t("errors.invalidAmount"));
      return;
    }
    if (form.from_amount < selected_config.min_from_amount) {
      toast.error(`${t("otc.create.minAmount")}: ${selected_config.min_from_amount.toLocaleString()} ${selected_config.from_currency.code}`);
      return;
    }
    try {
      set_is_submitting(true);
      await otcService.create_order(form);
      toast.success(t("otc.messages.orderCreated"));
      set_is_create_open(false);
      load_orders();
    } catch (err: any) {
      const raw = err?.response?.data?.error ?? "";
      const msg = raw.toLowerCase().includes("kyc level 2")
        ? t("otc.create.kycRequired")
        : raw || t("messages.loadFailed");
      toast.error(msg);
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("otc.title")}</h1>
          <p className="text-gray-600 mt-2">{t("otc.subtitle")}</p>
        </div>
        <Button onClick={open_create} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("otc.createOrder")}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("otc.admin.columns.status")}</Label>
            <Select value={status_filter} onValueChange={set_status_filter}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {status_options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {t("otc.admin.columns.id")}: {total}
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.id")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.pair")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.fields.fromAmount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t("otc.noOrders")}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <span>ID {order.from_currency_id}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span>ID {order.to_currency_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.from_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        {order.unread_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                            <MessageCircle className="h-3 w-3" />
                            {order.unread_count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(order.created_at), "dd.MM.yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/otc/${order.uid}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        {t("common.view")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Dialog */}
      <Dialog open={is_create_open} onOpenChange={set_is_create_open}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("otc.create.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">{t("otc.create.description")}</p>

          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("otc.create.pair")}</Label>
              <Select
                value={selected_config ? String(selected_config.id) : ""}
                onValueChange={select_pair}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {configs.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.from_currency.code} → {c.to_currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selected_config && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                {t("otc.create.minAmount")}: {selected_config.min_from_amount.toLocaleString()} {selected_config.from_currency.code}
              </div>
            )}

            <div>
              <Label>
                {t("otc.create.amount")}
                {selected_config && (
                  <span className="ml-2 text-xs text-gray-500">({selected_config.from_currency.code})</span>
                )}
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                disabled={!selected_config}
                value={form.from_amount || ""}
                onChange={(e) => set_form((f) => ({ ...f, from_amount: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>
                {t("otc.create.proposedRate")}
                {selected_config && (
                  <span className="ml-2 text-xs text-gray-500">
                    1 {selected_config.from_currency.code} = ? {selected_config.to_currency.code}
                  </span>
                )}
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                disabled={!selected_config}
                value={form.proposed_rate || ""}
                onChange={(e) => set_form((f) => ({ ...f, proposed_rate: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>{t("otc.create.comment")}</Label>
              <Input
                type="text"
                className="mt-1.5"
                placeholder={t("otc.create.commentPlaceholder")}
                value={form.comment ?? ""}
                onChange={(e) => set_form((f) => ({ ...f, comment: e.target.value }))}
              />
            </div>

            {selected_config && form.from_amount > 0 && form.proposed_rate > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("otc.fields.toAmount")}:</span>
                  <span className="font-medium">
                    {(form.from_amount * form.proposed_rate).toLocaleString()} {selected_config.to_currency.code}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => set_is_create_open(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" onClick={handle_submit} disabled={is_submitting}>
                {is_submitting ? t("common.saving") : t("otc.create.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
