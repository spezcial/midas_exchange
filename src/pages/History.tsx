import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exchangesService } from "@/api/services/exchangesService";
import type { CurrencyExchange } from "@/types";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

export function History() {
  const { t } = useTranslation();
  const [exchanges, set_exchanges] = useState<CurrencyExchange[]>([]);
  const [is_loading, set_is_loading] = useState(false);
  const [total, set_total] = useState(0);
  const [limit] = useState(20);
  const [offset, set_offset] = useState(0);

  useEffect(() => {
    load_exchanges();
  }, [offset]);

  const load_exchanges = async () => {
    try {
      set_is_loading(true);
      const response = await exchangesService.get_exchanges({ limit, offset });
      set_exchanges(response.exchanges);
      set_total(response.total);
    } catch (error) {
      console.error("Failed to load exchanges:", error);
      toast.error(t('messages.loadExchangesFailed'));
    } finally {
      set_is_loading(false);
    }
  };

  const get_status_badge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            {t('history.statuses.completed')}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            {t('history.statuses.pending')}
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3" />
            {t('history.statuses.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  const format_number = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  };

  const handle_previous = () => {
    if (offset > 0) {
      set_offset(Math.max(0, offset - limit));
    }
  };

  const handle_next = () => {
    if (offset + limit < total) {
      set_offset(offset + limit);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('history.title')}</h1>

      {is_loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('history.noExchanges')}
            </h3>
            <p className="text-gray-500">
              {t('history.noExchangesDescription')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('history.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('history.pair')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('history.rate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('history.received')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('history.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exchanges.map((exchange) => (
                    <tr key={exchange.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(exchange.created_at), "dd.MM.yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {exchange.uid.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {format_number(exchange.from_amount)} {exchange.from_currency.code}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format_number(exchange.exchange_rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {get_status_badge(exchange.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden divide-y divide-gray-200">
              {exchanges.map((exchange) => (
                <div key={exchange.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(exchange.created_at), "dd.MM.yyyy HH:mm")}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        {exchange.uid.substring(0, 12)}...
                      </p>
                    </div>
                    {get_status_badge(exchange.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-900">
                      {format_number(exchange.from_amount)} {exchange.from_currency.code}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-base font-medium text-gray-900">
                      {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('history.rate')}:</span>
                    <span className="font-medium">{format_number(exchange.exchange_rate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('history.received')}:</span>
                    <span className="font-medium text-green-600">
                      {format_number(exchange.to_amount_with_fee)} {exchange.to_currency.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {t('common.showing')} <span className="font-medium">{offset + 1}</span> {t('common.to')}{" "}
                <span className="font-medium">{Math.min(offset + limit, total)}</span> {t('common.of')}{" "}
                <span className="font-medium">{total}</span> {t('common.exchanges')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handle_previous}
                  disabled={offset === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.previous')}
                </button>
                <button
                  onClick={handle_next}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
