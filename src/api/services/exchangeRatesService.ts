import { apiClient } from "../client";
import type { CurrencyPair } from "@/types";

export interface CreateRateRequest {
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  fee: number;
}

export interface UpdateRateRequest {
  fee: number;
}

export interface ExchangeRatesResponse {
  success: boolean;
  data: CurrencyPair[];
}

export interface ExchangeRateResponse {
  success: boolean;
  data: CurrencyPair;
}

export const exchangeRatesService = {
  /**
   * Get all exchange rates (admin)
   */
  get_all_rates: async (): Promise<CurrencyPair[]> => {
    const response = await apiClient.get<ExchangeRatesResponse>("/admin/exchange-rates");
    return response.data.data;
  },

  /**
   * Get single exchange rate by ID (admin)
   */
  get_rate: async (id: number): Promise<CurrencyPair> => {
    const response = await apiClient.get<ExchangeRateResponse>(`/admin/exchange-rates/${id}`);
    return response.data.data;
  },

  /**
   * Create new exchange rate (admin)
   */
  create_rate: async (data: CreateRateRequest): Promise<CurrencyPair> => {
    const response = await apiClient.post<ExchangeRateResponse>("/admin/exchange-rates", data);
    return response.data.data;
  },

  /**
   * Update exchange rate (admin)
   */
  update_rate: async (id: number, data: UpdateRateRequest): Promise<CurrencyPair> => {
    const response = await apiClient.put<ExchangeRateResponse>(`/admin/exchange-rates/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete exchange rate (admin)
   */
  delete_rate: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/exchange-rates/${id}`);
  },
};
