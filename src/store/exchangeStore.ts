import { create } from "zustand";
import type { Currency, ExchangeRate } from "@/types";
import { exchangeService } from "@/api/services/exchangeService";
import toast from "react-hot-toast";

interface ExchangeState {
  from_currency: Currency;
  to_currency: Currency;
  from_amount: number;
  to_amount: number;
  rate: number;
  fee: number;
  rates: ExchangeRate[];
  is_rate_fixed: boolean;
  rate_expires_at: Date | null;
  is_loading: boolean;
  error: string | null;
  set_from_currency: (currency: Currency) => void;
  set_to_currency: (currency: Currency) => void;
  set_from_amount: (amount: number) => void;
  set_to_amount: (amount: number) => void;
  set_rates: (rates: ExchangeRate[]) => void;
  calculate_exchange: () => void;
  fix_rate: (seconds: number) => void;
  swap_currencies: () => void;
  load_rates: () => Promise<void>;
  execute_exchange: () => Promise<boolean>;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  from_currency: "USD",
  to_currency: "BTC",
  from_amount: 100,
  to_amount: 0,
  rate: 0,
  fee: 0,
  rates: [],
  is_rate_fixed: false,
  rate_expires_at: null,
  is_loading: false,
  error: null,

  set_from_currency: (currency) => {
    set({ from_currency: currency });
    get().calculate_exchange();
  },

  set_to_currency: (currency) => {
    set({ to_currency: currency });
    get().calculate_exchange();
  },

  set_from_amount: (amount) => {
    set({ from_amount: amount });
    get().calculate_exchange();
  },

  set_to_amount: (amount) => {
    set({ to_amount: amount });
    // Calculate from_amount based on to_amount
    const state = get();
    const rate_info = state.rates.find(
      (r) => r.from === state.from_currency && r.to === state.to_currency
    );
    if (rate_info) {
      const from_amount = (amount / rate_info.rate) * (1 + rate_info.fee);
      set({ from_amount });
    }
  },

  set_rates: (rates) => {
    set({ rates });
    get().calculate_exchange();
  },

  calculate_exchange: () => {
    const state = get();
    const rate_info = state.rates.find(
      (r) => r.from === state.from_currency && r.to === state.to_currency
    );

    if (rate_info) {
      const fee_amount = state.from_amount * rate_info.fee;
      const to_amount = (state.from_amount - fee_amount) * rate_info.rate;
      set({
        to_amount,
        rate: rate_info.rate,
        fee: rate_info.fee,
      });
    }
  },

  fix_rate: (seconds) => {
    const expires_at = new Date();
    expires_at.setSeconds(expires_at.getSeconds() + seconds);
    set({ is_rate_fixed: true, rate_expires_at: expires_at });

    setTimeout(() => {
      set({ is_rate_fixed: false, rate_expires_at: null });
    }, seconds * 1000);
  },

  swap_currencies: () => {
    const state = get();
    set({
      from_currency: state.to_currency,
      to_currency: state.from_currency,
      from_amount: state.to_amount,
      to_amount: state.from_amount,
    });
    get().calculate_exchange();
  },

  load_rates: async () => {
    try {
      set({ is_loading: true, error: null });
      const rates = await exchangeService.get_rates();
      set({ rates, is_loading: false });
      get().calculate_exchange();
    } catch (error: any) {
      const error_message = error.response?.data?.error || "Failed to load exchange rates";
      set({ is_loading: false, error: error_message });
      toast.error(error_message);
    }
  },

  execute_exchange: async (): Promise<boolean> => {
    try {
      const state = get();
      set({ is_loading: true, error: null });

      await exchangeService.execute({
        from_currency: state.from_currency,
        to_currency: state.to_currency,
        amount: state.from_amount,
      });

      set({ is_loading: false });
      toast.success(`Successfully exchanged ${state.from_amount} ${state.from_currency} to ${state.to_amount.toFixed(8)} ${state.to_currency}`);

      // Reset form
      set({ from_amount: 0, to_amount: 0 });

      return true;
    } catch (error: any) {
      const error_message = error.response?.data?.error || "Failed to execute exchange";
      set({ is_loading: false, error: error_message });
      toast.error(error_message);
      return false;
    }
  },
}));