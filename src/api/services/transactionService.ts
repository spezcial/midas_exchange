import { apiClient } from "../client";
import type { Transaction, TransactionType, TransactionStatus } from "@/types";

export interface GetHistoryParams {
  type?: TransactionType;
  status?: TransactionStatus;
  limit?: number;
}

export const transactionService = {
  /**
   * Get transaction history
   */
  get_history: async (params?: GetHistoryParams): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>("/transactions/history", { params });
    return response.data;
  },
};
