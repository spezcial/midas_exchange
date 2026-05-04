import { apiClient } from "../client";
import type {
  CurrencyExchange,
  AdminCurrencyExchange,
  CreateExchangeRequest,
  CreateExchangeResponse,
  ExchangesListResponse,
  AdminExchangesListResponse,
} from "@/types";
import { normalizeCurrencyExchange } from "@/lib/numeric";

export interface GetExchangesParams {
  limit?: number;
  offset?: number;
  status?: string;
  email?: string;
}

export const exchangesService = {
  /**
   * Create a new exchange (instant swap)
   */
  create_exchange: async (params: CreateExchangeRequest): Promise<CreateExchangeResponse> => {
    const response = await apiClient.post<{ success: boolean; data: CreateExchangeResponse }>(
      "/exchanges",
      params
    );
    return normalizeCurrencyExchange(response.data.data) as CreateExchangeResponse;
  },

  /**
   * Get user's exchanges with pagination
   */
  get_exchanges: async (params?: GetExchangesParams): Promise<ExchangesListResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ExchangesListResponse }>(
      "/exchanges",
      {
        params: {
          limit: params?.limit || 10,
          offset: params?.offset || 0,
        },
      }
    );
    const r = response.data.data;
    return { ...r, exchanges: r.exchanges.map(normalizeCurrencyExchange) };
  },

  /**
   * Get a single exchange by ID
   */
  get_exchange_by_id: async (exchange_id: number): Promise<CurrencyExchange> => {
    const response = await apiClient.get<{ success: boolean; data: CurrencyExchange }>(
      `/exchanges/${exchange_id}`
    );
    return normalizeCurrencyExchange(response.data.data);
  },

  /**
   * Delete/cancel an exchange (only if status is pending)
   */
  delete_exchange: async (exchange_id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(
      `/exchanges/${exchange_id}`
    );
    return response.data;
  },

  /**
   * Get all exchanges (admin only)
   */
  get_all_exchanges: async (params?: GetExchangesParams): Promise<AdminExchangesListResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AdminExchangesListResponse }>(
      "/admin/exchanges",
      {
        params: {
          limit: params?.limit || 50,
          offset: params?.offset || 0,
          status: params?.status,
          email: params?.email,
        },
      }
    );
    const r = response.data.data;
    return { ...r, exchanges: r.exchanges.map(normalizeCurrencyExchange) as AdminCurrencyExchange[] };
  },

  /**
   * Get a single exchange by ID (admin only)
   */
  get_admin_exchange_by_id: async (exchange_id: number): Promise<AdminCurrencyExchange> => {
    const response = await apiClient.get<{ success: boolean; data: AdminCurrencyExchange }>(
      `/admin/exchanges/${exchange_id}`
    );
    return normalizeCurrencyExchange(response.data.data) as AdminCurrencyExchange;
  },
};
