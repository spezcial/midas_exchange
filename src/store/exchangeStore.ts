import { create } from "zustand";
import type { Currency, ExchangeRate } from "@/types";

interface ExchangeState {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  rates: ExchangeRate[];
  isRateFixed: boolean;
  rateExpiresAt: Date | null;
  setFromCurrency: (currency: Currency) => void;
  setToCurrency: (currency: Currency) => void;
  setFromAmount: (amount: number) => void;
  setToAmount: (amount: number) => void;
  setRates: (rates: ExchangeRate[]) => void;
  calculateExchange: () => void;
  fixRate: (seconds: number) => void;
  swapCurrencies: () => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  fromCurrency: "USD",
  toCurrency: "BTC",
  fromAmount: 100,
  toAmount: 0,
  rate: 0,
  fee: 0,
  rates: [],
  isRateFixed: false,
  rateExpiresAt: null,
  
  setFromCurrency: (currency) => {
    set({ fromCurrency: currency });
    get().calculateExchange();
  },
  
  setToCurrency: (currency) => {
    set({ toCurrency: currency });
    get().calculateExchange();
  },
  
  setFromAmount: (amount) => {
    set({ fromAmount: amount });
    get().calculateExchange();
  },
  
  setToAmount: (amount) => {
    set({ toAmount: amount });
    // Calculate fromAmount based on toAmount
    const state = get();
    const rateInfo = state.rates.find(
      (r) => r.from === state.fromCurrency && r.to === state.toCurrency
    );
    if (rateInfo) {
      const fromAmount = amount / rateInfo.rate * (1 + rateInfo.fee);
      set({ fromAmount });
    }
  },
  
  setRates: (rates) => {
    set({ rates });
    get().calculateExchange();
  },
  
  calculateExchange: () => {
    const state = get();
    const rateInfo = state.rates.find(
      (r) => r.from === state.fromCurrency && r.to === state.toCurrency
    );
    
    if (rateInfo) {
      const feeAmount = state.fromAmount * rateInfo.fee;
      const toAmount = (state.fromAmount - feeAmount) * rateInfo.rate;
      set({
        toAmount,
        rate: rateInfo.rate,
        fee: rateInfo.fee,
      });
    }
  },
  
  fixRate: (seconds) => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + seconds);
    set({ isRateFixed: true, rateExpiresAt: expiresAt });
    
    setTimeout(() => {
      set({ isRateFixed: false, rateExpiresAt: null });
    }, seconds * 1000);
  },
  
  swapCurrencies: () => {
    const state = get();
    set({
      fromCurrency: state.toCurrency,
      toCurrency: state.fromCurrency,
      fromAmount: state.toAmount,
      toAmount: state.fromAmount,
    });
    get().calculateExchange();
  },
}));