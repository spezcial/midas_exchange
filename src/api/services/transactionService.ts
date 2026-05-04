import { apiClient } from "../client";
import type { Transaction, TransactionType, TransactionStatus } from "@/types";
import { normalizeTransaction } from "@/lib/numeric";

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
    const response = await apiClient.get<{ success: boolean; data: Transaction[] }>(
      "/transactions",
      { params }
    );
    return response.data.data.map(normalizeTransaction);
  },
};
