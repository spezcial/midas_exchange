import { apiClient } from "../client";
import type { ExchangeRate, Currency, Transaction, Wallet, CurrencyPair } from "@/types";
import { normalizeExchangeRate, normalizeCurrencyPair, normalizeWallet, normalizeTransaction, parseNum } from "@/lib/numeric";
import axios from "axios";

export interface CalculateExchangeData {
  from_currency: Currency;
  to_currency: Currency;
  amount: number;
}

export interface ExchangeResult {
  from_currency: Currency;
  to_currency: Currency;
  from_amount: number;
  to_amount: number;
  rate: number;
  fee: number;
  fee_amount: number;
}

export interface ExecuteExchangeResponse {
  success: boolean;
  transaction: Transaction;
  from_wallet: Wallet;
  to_wallet: Wallet;
}

export interface CurrencyPairsResponse {
  success: boolean;
  data: CurrencyPair[];
}

// Public API client for endpoints that don't require authentication
const public_api_client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const exchangeService = {
  /**
   * Get all exchange pairs (public endpoint, no auth required)
   */
  get_exchange_pairs: async (): Promise<CurrencyPairsResponse> => {
    const response = await public_api_client.get<CurrencyPairsResponse>("/exchange-rates");
    const r = response.data;
    return { ...r, data: r.data.map(normalizeCurrencyPair) };
  },

  /**
   * Get all exchange rates
   */
  get_rates: async (): Promise<ExchangeRate[]> => {
    const response = await apiClient.get<ExchangeRate[]>("/exchange/rates");
    return response.data.map(normalizeExchangeRate);
  },

  /**
   * Calculate exchange result
   */
  calculate: async (data: CalculateExchangeData): Promise<ExchangeResult> => {
    const response = await apiClient.post<ExchangeResult>("/exchange/calculate", data);
    const r = response.data;
    return {
      ...r,
      from_amount: parseNum(r.from_amount),
      to_amount: parseNum(r.to_amount),
      rate: parseNum(r.rate),
      fee: parseNum(r.fee),
      fee_amount: parseNum(r.fee_amount),
    };
  },

  /**
   * Execute exchange transaction
   */
  execute: async (data: CalculateExchangeData): Promise<ExecuteExchangeResponse> => {
    const response = await apiClient.post<ExecuteExchangeResponse>("/exchange/execute", data);
    const r = response.data;
    return {
      ...r,
      transaction: normalizeTransaction(r.transaction),
      from_wallet: normalizeWallet(r.from_wallet),
      to_wallet: normalizeWallet(r.to_wallet),
    };
  },
};
