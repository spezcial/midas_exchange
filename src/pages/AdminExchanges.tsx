import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { exchangesService } from "@/api/services/exchangesService";
import type { AdminCurrencyExchange } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, ArrowRight, Eye } from "lucide-react";
import { ViewExchangeModal } from "@/components/modals";

export function AdminExchanges() {
  const { t } = useTranslation();
  const [exchanges, set_exchanges] = useState<AdminCurrencyExchange[]>([]);
  const [is_loading, set_is_loading] = useState(false);
  const [status_filter, set_status_filter] = useState<string>("all");
  const [email_filter, set_email_filter] = useState<string>("");
  const [total, set_total] = useState<number>(0);
  const [selected_exchange, set_selected_exchange] = useState<AdminCurrencyExchange | null>(null);
  const [is_view_modal_open, set_is_view_modal_open] = useState(false);

  const status_options = [
    { value: "all", label: t("admin.exchanges.allStatuses") },
    { value: "completed", label: t("history.statuses.completed") },
    { value: "pending", label: t("history.statuses.pending") },
    { value: "canceled", label: t("history.statuses.cancelled") },
  ];

  useEffect(() => {
    const fetch_exchanges = async () => {
      try {
        set_is_loading(true);
        const params: any = {};
        if (status_filter !== "all") {
          params.status = status_filter;
        }
        if (email_filter.trim()) {
          params.email = email_filter.trim();
        }

        const response = await exchangesService.get_all_exchanges(params);
        set_exchanges(response.exchanges);
        set_total(response.total);
      } catch (error) {
        console.error("Failed to fetch exchanges:", error);
        toast.error(t("messages.loadExchangesFailed"));
      } finally {
        set_is_loading(false);
      }
    };

    fetch_exchanges();
  }, [email_filter, status_filter]);

  const handle_status_filter_change = (status: string) => {
    set_status_filter(status);
  };

  const handle_email_filter_change = (value: string) => {
    set_email_filter(value);
  };

  const handle_email_filter_submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handle_view = (exchange: AdminCurrencyExchange) => {
    set_selected_exchange(exchange);
    set_is_view_modal_open(true);
  };

  const handle_view_close = () => {
    set_is_view_modal_open(false);
    set_selected_exchange(null);
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  const get_status_badge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            {t("history.statuses.completed")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            {t("history.statuses.pending")}
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3" />
            {t("history.statuses.cancelled")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("admin.exchanges.title")}</h1>
        <p className="text-gray-600 mt-2">{t("admin.exchanges.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status-filter">{t("admin.exchanges.status")}</Label>
            <Select value={status_filter} onValueChange={handle_status_filter_change}>
              <SelectTrigger id="status-filter" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {status_options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email-filter">{t("admin.exchanges.user")}</Label>
            <form onSubmit={handle_email_filter_submit} className="flex gap-2 mt-2">
              <Input
                id="email-filter"
                type="email"
                value={email_filter}
                onChange={(e) => handle_email_filter_change(e.target.value)}
                placeholder="user@example.com"
                className="flex-1"
              />
            </form>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {t("history.title")}: {total}
        </div>
      </div>

      {/* Exchanges Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.id")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.pair")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.received")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.exchanges.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : exchanges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {t("admin.exchanges.noExchanges")}
                  </td>
                </tr>
              ) : (
                exchanges.map((exchange) => (
                  <tr key={exchange.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{exchange.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        {exchange.uid.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {exchange.email || `User #${exchange.user_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {format_number(exchange.from_amount)} {exchange.from_currency.code}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {get_status_badge(exchange.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(exchange.created_at), "dd.MM.yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handle_view(exchange)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        {t("admin.exchanges.viewDetails")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ViewExchangeModal
        is_open={is_view_modal_open}
        exchange={selected_exchange}
        on_close={handle_view_close}
      />
    </div>
  );
}
