import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowRight, Eye, PlayCircle, MessageCircle, Download, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { otcService } from "@/api/services/otcService";
import type { OTCOrder, OTCOrderStatus } from "@/types";

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

export function AdminOTCOrders() {
  const { t } = useTranslation();
  const [orders, set_orders] = useState<OTCOrder[]>([]);
  const [total, set_total] = useState(0);
  const [is_loading, set_is_loading] = useState(false);
  const [is_exporting, set_is_exporting] = useState(false);
  const [taking, set_taking] = useState<string | null>(null);

  // Filters
  const [status_filter, set_status_filter] = useState("all");
  const [email_filter, set_email_filter] = useState("");
  const [from_date, set_from_date] = useState("");
  const [to_date, set_to_date] = useState("");

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

  const build_params = () => {
    const params: Record<string, string> = {};
    if (status_filter !== "all") params.status = status_filter;
    if (email_filter.trim()) params.email = email_filter.trim();
    if (from_date) params.from_date = from_date;
    if (to_date) params.to_date = to_date;
    return params;
  };

  const load_orders = async () => {
    try {
      set_is_loading(true);
      const res = await otcService.admin_list_orders(build_params());
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
  }, [status_filter, email_filter, from_date, to_date]);

  const take_order = async (uid: string) => {
    try {
      set_taking(uid);
      await otcService.admin_take_order(uid);
      toast.success(t("otc.messages.orderTaken"));
      load_orders();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_taking(null);
    }
  };

  const export_csv = async () => {
    try {
      set_is_exporting(true);
      const blob = await otcService.admin_export_orders(build_params());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `otc_orders_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("messages.loadFailed"));
    } finally {
      set_is_exporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("otc.admin.title")}</h1>
          <p className="text-gray-600 mt-2">{t("otc.admin.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/otc/analytics">
            <Button variant="outline" size="sm">
              <BarChart2 className="h-4 w-4 mr-1.5" />
              {t("otc.admin.analytics.title")}
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={export_csv} disabled={is_exporting}>
            <Download className="h-4 w-4 mr-1.5" />
            {is_exporting ? t("common.loading") : t("otc.admin.export")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div>
            <Label>{t("otc.admin.columns.user")}</Label>
            <Input
              type="email"
              className="mt-2"
              value={email_filter}
              onChange={(e) => set_email_filter(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label>{t("otc.admin.filters.fromDate")}</Label>
            <Input
              type="date"
              className="mt-2"
              value={from_date}
              onChange={(e) => set_from_date(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("otc.admin.filters.toDate")}</Label>
            <Input
              type="date"
              className="mt-2"
              value={to_date}
              onChange={(e) => set_to_date(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {t("common.total")}: {total}
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
                  {t("otc.admin.columns.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.pair")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("otc.admin.columns.amount")}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t("otc.admin.noOrders")}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      User #{order.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <span>#{order.from_currency_id}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span>#{order.to_currency_id}</span>
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
                      <div className="flex items-center gap-2">
                        {order.status === "awaiting_review" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => take_order(order.uid)}
                            disabled={taking === order.uid}
                          >
                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                            {t("otc.actions.take")}
                          </Button>
                        )}
                        <Link
                          to={`/admin/otc/${order.uid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          {t("common.view")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
