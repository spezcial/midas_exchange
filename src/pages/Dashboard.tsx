import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { exchangesService } from "@/api/services/exchangesService";
import type { CurrencyExchange } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export function Dashboard() {
  const { t } = useTranslation();
  const [exchanges, set_exchanges] = useState<CurrencyExchange[]>([]);
  const [total, set_total] = useState(0);
  const [is_loading, set_is_loading] = useState(true);
  const [current_page, set_current_page] = useState(1);
  const limit = 10;

  const load_exchanges = async (page: number) => {
    try {
      set_is_loading(true);
      const offset = (page - 1) * limit;
      const data = await exchangesService.get_exchanges({ limit, offset });
      if (data) {
        set_exchanges(data.exchanges);
        set_total(data.total);
      }
    } catch (error) {
      console.error("Failed to load exchanges:", error);
      toast.error(t('messages.loadExchangesFailed'));
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    load_exchanges(current_page);
  }, [current_page]);

  const total_pages = Math.ceil(total / limit);
  const has_previous = current_page > 1;
  const has_next = current_page < total_pages;

  const get_status_color = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "canceled":
      case "cancelled":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.recentExchanges')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentExchanges')}</CardTitle>
        </CardHeader>
        <CardContent>
          {is_loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exchanges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('dashboard.noExchanges')}</p>
              <p className="text-sm text-gray-400 mt-2">{t('dashboard.noExchangesDescription')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('history.pair')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('history.rate')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('exchange.fee')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('history.received')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('history.status')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('history.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchanges.map((exchange) => (
                      <tr key={exchange.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">#{exchange.id}</td>

                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{format_number(exchange.from_amount)}</span>
                            <span className="text-gray-500">{exchange.from_currency.code}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{format_number(exchange.to_amount_with_fee)}</span>
                            <span className="text-gray-500">{exchange.to_currency.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{format_number(exchange.exchange_rate, 6)}</td>
                        <td className="py-3 px-4 text-sm">{exchange.fee}%</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">{format_number(exchange.to_amount_with_fee)}</span>
                            <span className="text-gray-500">{exchange.to_currency.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${get_status_color(
                              exchange.status
                            )}`}
                          >
                            {t(`history.statuses.${exchange.status.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {format(new Date(exchange.created_at), "MMM dd, yyyy HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {t('common.showing')} {(current_page - 1) * limit + 1} {t('common.to')}{" "}
                  {Math.min(current_page * limit, total)} {t('common.of')} {total} {t('common.exchanges')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => set_current_page((p) => p - 1)}
                    disabled={!has_previous || is_loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('common.previous')}
                  </Button>
                  <div className="text-sm text-gray-600">
                    {t('common.page')} {current_page} {t('common.of')} {total_pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => set_current_page((p) => p + 1)}
                    disabled={!has_next || is_loading}
                  >
                    {t('common.next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
