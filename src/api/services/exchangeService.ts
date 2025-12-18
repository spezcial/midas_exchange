import { apiClient } from "../client";
import type { ExchangeRate, Currency, Transaction, Wallet, CurrencyPair } from "@/types";
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
    return response.data;
  },

  /**
   * Get all exchange rates
   */
  get_rates: async (): Promise<ExchangeRate[]> => {
    const response = await apiClient.get<ExchangeRate[]>("/exchange/rates");
    return response.data;
  },

  /**
   * Calculate exchange result
   */
  calculate: async (data: CalculateExchangeData): Promise<ExchangeResult> => {
    const response = await apiClient.post<ExchangeResult>("/exchange/calculate", data);
    return response.data;
  },

  /**
   * Execute exchange transaction
   */
  execute: async (data: CalculateExchangeData): Promise<ExecuteExchangeResponse> => {
    const response = await apiClient.post<ExecuteExchangeResponse>("/exchange/execute", data);
    return response.data;
  },
};
