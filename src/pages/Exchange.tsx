import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exchangeService } from "@/api/services/exchangeService";
import { exchangesService } from "@/api/services/exchangesService";
import { walletService } from "@/api/services/walletService";
import type { CurrencyInfo, CurrencyPair, CreateExchangeResponse, Wallet } from "@/types";
import toast from "react-hot-toast";
import { ExchangeSuccessModal } from "@/components/modals";

export function Exchange() {
  const { t } = useTranslation();
  const [exchange_pairs, set_exchange_pairs] = useState<CurrencyPair[]>([]);
  const [available_base_currencies, set_available_base_currencies] = useState<CurrencyInfo[]>([]);
  const [available_quote_currencies, set_available_quote_currencies] = useState<CurrencyInfo[]>([]);
  const [wallets, set_wallets] = useState<Wallet[]>([]);

  const [from_currency_code, set_from_currency_code] = useState<string>("");
  const [to_currency_code, set_to_currency_code] = useState<string>("");
  const [from_amount, set_from_amount] = useState<number>(0);
  const [selected_pair, set_selected_pair] = useState<CurrencyPair | null>(null);
  const [is_exchanging, set_is_exchanging] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [exchange_result, set_exchange_result] = useState<CreateExchangeResponse | null>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);

  // Calculate derived values
  const rate = selected_pair?.rate || 0;
  const fee = selected_pair?.fee || 0;
  const to_amount = from_amount > 0 && rate > 0
    ? (from_amount * (1 - fee / 100)) * rate
    : 0;

  // Fetch exchange pairs and wallets on mount
  useEffect(() => {
    const fetch_data = async () => {
      try {
        set_is_loading(true);
        const [pairs_response, wallets_data] = await Promise.all([
          exchangeService.get_exchange_pairs(),
          walletService.get_wallets(),
        ]);

        const pairs = pairs_response.data;
        set_exchange_pairs(pairs);
        set_wallets(wallets_data);

        // Extract unique currencies from pairs
        const currency_map = new Map<string, CurrencyInfo>();
        pairs.forEach(pair => {
          currency_map.set(pair.from_currency.code, pair.from_currency);
          currency_map.set(pair.to_currency.code, pair.to_currency);
        });
        set_available_base_currencies(Array.from(currency_map.values()));
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(t('messages.loadFailed'));
      } finally {
        set_is_loading(false);
      }
    };

    fetch_data();
  }, []);

  useEffect(() => {
    // Set default pair
    if (exchange_pairs.length > 0) {
      const default_pair = exchange_pairs[0];
      set_from_currency_code(default_pair.from_currency.code);
      set_to_currency_code(default_pair.to_currency.code);
      set_selected_pair(default_pair);

      const quote_currencies = exchange_pairs
        .filter(p => p.from_currency.code === default_pair.from_currency.code)
        .map(p => p.to_currency);

      set_available_quote_currencies(quote_currencies);
    }
  }, [exchange_pairs]);

  const handle_from_currency_change = (currency_code: string) => {
    const quote_currencies = exchange_pairs
      .filter(p => p.from_currency.code === currency_code)
      .map(p => p.to_currency);

    const quote_remains = quote_currencies.find(c => c.code === to_currency_code);
    if (!quote_remains && quote_currencies.length > 0) {
      set_to_currency_code(quote_currencies[0].code);
    }

    const pair = exchange_pairs.find(
      p => p.from_currency.code === currency_code && p.to_currency.code === to_currency_code
    );

    set_from_currency_code(currency_code);
    set_available_quote_currencies(quote_currencies);
    set_selected_pair(pair || null);
  };

  const handle_to_currency_change = (currency_code: string) => {
    const pair = exchange_pairs.find(
      p => p.to_currency.code === currency_code && p.from_currency.code === from_currency_code
    );

    set_to_currency_code(currency_code);
    set_selected_pair(pair || null);
  };

  const handle_swap = () => {
    // Check if reverse pair exists
    const reverse_pair = exchange_pairs.find(
      p => p.from_currency.code === to_currency_code && p.to_currency.code === from_currency_code
    );

    const quote_currencies = exchange_pairs
      .filter(p => p.from_currency.code === to_currency_code)
      .map(p => p.to_currency);

    if (reverse_pair) {
      set_available_quote_currencies(quote_currencies);
      set_from_currency_code(to_currency_code);
      set_to_currency_code(from_currency_code);
      set_selected_pair(reverse_pair);
    } else {
      toast.error(t('exchange.reverseNotAvailable'));
    }
  };

  // Get available balance for a currency
  const get_available_balance = (currency_code: string): number => {
    const wallet = wallets.find((w) => w.currency.code === currency_code);
    return wallet ? wallet.balance : 0;
  };

  // Set max amount to available balance
  const handle_set_max = () => {
    const available = get_available_balance(from_currency_code);
    set_from_amount(available);
  };

  const handle_exchange = async () => {
    if (!selected_pair || from_amount <= 0) return;

    // Validate balance
    const available_balance = get_available_balance(from_currency_code);
    if (from_amount > available_balance) {
      toast.error(t('exchange.insufficientFundsDetail', {
        available: trim_trailing_zeroes(available_balance.toFixed(8)),
        currency: from_currency_code
      }));
      return;
    }

    set_is_exchanging(true);
    try {
      const result = await exchangesService.create_exchange({
        from_currency_code: from_currency_code,
        to_currency_code: to_currency_code,
        from_amount: from_amount,
      });

      set_exchange_result(result);
      set_is_modal_open(true);
      set_from_amount(0);
      toast.success(t('exchange.successDetail', {
        amount: trim_trailing_zeroes(result.to_amount_with_fee.toFixed(8)),
        currency: to_currency_code
      }));

      // Refresh wallets after successful exchange
      const updated_wallets = await walletService.get_wallets();
      set_wallets(updated_wallets);
    } catch (error) {
      console.error("Exchange failed:", error);
      toast.error(t('messages.exchangeFailed'));
    } finally {
      set_is_exchanging(false);
    }
  };

  function trim_trailing_zeroes(value: string) {
    if (value === null || value === undefined) return value;

    let str = String(value);
    if (!str.includes('.')) return str;

    str = str.replace(/\.?0+$/, '');

    return str;
  }

  const get_currency_display = (currency: CurrencyInfo) => {
    return currency.code;
  };

  const from_currency_info = selected_pair?.from_currency || null;
  const to_currency_info = selected_pair?.to_currency || null;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('exchange.title')}</h1>

        <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('exchange.from')}</label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={from_amount}
                  onChange={(e) => set_from_amount(parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-semibold border border-gray-300 rounded-lg px-4 py-4 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  disabled={is_loading || is_exchanging}
                />
                <button
                  type="button"
                  onClick={handle_set_max}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  disabled={is_loading || is_exchanging}
                >
                  MAX
                </button>
              </div>
              <select
                value={from_currency_code}
                onChange={(e) => handle_from_currency_change(e.target.value)}
                className="px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                disabled={is_loading || is_exchanging}
              >
                {available_base_currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {get_currency_display(currency)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {t('wallets.available')}: {trim_trailing_zeroes(get_available_balance(from_currency_code).toFixed(8))} {from_currency_code}
              </p>
              {from_amount > get_available_balance(from_currency_code) && (
                <p className="text-sm text-red-600 font-medium">
                  {t('exchange.insufficientFunds')}
                </p>
              )}
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handle_swap}
              className="p-3 border-2 border-gray-200 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
              disabled={is_loading || is_exchanging}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('exchange.to')}</label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={trim_trailing_zeroes(to_amount.toFixed(8))}
                  readOnly
                  className="w-full text-2xl font-semibold border border-gray-300 rounded-lg px-4 py-4 bg-gray-50"
                />
              </div>
              <select
                value={to_currency_code}
                onChange={(e) => handle_to_currency_change(e.target.value)}
                className="px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring bg-white font-medium"
                disabled={is_loading || is_exchanging || available_quote_currencies.length === 0}
              >
                {available_quote_currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {get_currency_display(currency)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exchange info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('exchange.rate')}</span>
              <span className="font-medium">
                1 {from_currency_code} = {trim_trailing_zeroes(rate.toFixed(8))} {to_currency_code}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('exchange.fee')}</span>
              <span className="font-medium">{fee.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
              <span>{t('exchange.total')}</span>
              <span>{trim_trailing_zeroes(to_amount.toFixed(8))} {to_currency_code}</span>
            </div>
          </div>

          {/* Exchange button */}
          <button
            onClick={handle_exchange}
            disabled={
              is_exchanging ||
              is_loading ||
              from_amount <= 0 ||
              !selected_pair ||
              from_amount > get_available_balance(from_currency_code)
            }
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {is_exchanging ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('exchange.exchanging')}</span>
              </span>
            ) : (
              t('exchange.exchange')
            )}
          </button>
        </div>
        </div>
      </div>

      <ExchangeSuccessModal
        open={is_modal_open}
        onOpenChange={set_is_modal_open}
        exchange={exchange_result}
        from_currency={from_currency_info}
        to_currency={to_currency_info}
      />
    </>
  );
}
