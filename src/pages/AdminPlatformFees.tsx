import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { platformFeesService } from "@/api/services/platformFeesService";
import type { PlatformFee, FeeOperation } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ArrowLeftRight, ArrowDownToLine, TrendingUp, Coins, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 50;

export function AdminPlatformFees() {
  const { t } = useTranslation();
  const [fees, set_fees] = useState<PlatformFee[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [total, set_total] = useState(0);
  const [totals, set_totals] = useState({ exchange: 0, withdrawal: 0 });
  const [operation_filter, set_operation_filter] = useState<FeeOperation | "all">("all");
  const [page, set_page] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        set_is_loading(true);
        const res = await platformFeesService.list({
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          operation: operation_filter === "all" ? undefined : operation_filter,
        });
        set_fees(res.fees ?? []);
        set_total(res.total ?? 0);
        set_totals(res.totals ?? { exchange: 0, withdrawal: 0 });
      } catch {
        toast.error(t("common.error"));
      } finally {
        set_is_loading(false);
      }
    };
    load();
  }, [operation_filter, page]);

  const handle_filter_change = (value: string) => {
    set_operation_filter(value as FeeOperation | "all");
    set_page(0);
  };

  const total_pages = Math.ceil(total / PAGE_SIZE);

  const format_amount = (amount: number) =>
    amount.toFixed(8).replace(/\.?0+$/, "");

  const get_operation_badge = (op: FeeOperation) => {
    if (op === "exchange") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ArrowLeftRight className="h-3 w-3" />
          {t("admin.platformFees.operations.exchange")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <ArrowDownToLine className="h-3 w-3" />
        {t("admin.platformFees.operations.withdrawal")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("admin.platformFees.title")}</h1>
        <p className="text-gray-600 mt-2">{t("admin.platformFees.subtitle")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Coins className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.platformFees.totalRecords")}</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.platformFees.totalExchangeFees")}</p>
            <p className="text-2xl font-bold text-blue-600">{format_amount(totals.exchange)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("admin.platformFees.totalWithdrawalFees")}</p>
            <p className="text-2xl font-bold text-purple-600">{format_amount(totals.withdrawal)}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="operation-filter">{t("admin.platformFees.operation")}</Label>
            <Select value={operation_filter} onValueChange={handle_filter_change}>
              <SelectTrigger id="operation-filter" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.platformFees.allOperations")}</SelectItem>
                <SelectItem value="exchange">{t("admin.platformFees.operations.exchange")}</SelectItem>
                <SelectItem value="withdrawal">{t("admin.platformFees.operations.withdrawal")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {t("common.total")}: {total}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.operation")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.currency")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.grossAmount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.fee")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.platformFees.date")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t("admin.platformFees.noFees")}
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {get_operation_badge(fee.operation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {fee.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{fee.currency_code}</span>
                      <span className="text-xs text-gray-400 ml-1">{fee.currency_symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format_amount(fee.gross_amount)} {fee.currency_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      +{format_amount(fee.fee)} {fee.currency_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(fee.created_at), "dd.MM.yyyy HH:mm")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total_pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t("admin.platformFees.page")} {page + 1} / {total_pages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => set_page((p) => p - 1)}
                disabled={page === 0 || is_loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => set_page((p) => p + 1)}
                disabled={page >= total_pages - 1 || is_loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
