import { apiClient } from "../client";
import type { Wallet, Currency, Transaction, CurrencyInfo } from "@/types";

export interface DepositData {
  currency: Currency;
  amount: number;
}

export interface WithdrawData {
  currency: Currency;
  amount: number;
  address: string;
}

export interface WalletOperationResponse {
  success: boolean;
  transaction: Transaction;
  wallets: Wallet[];
}

export const walletService = {
  /**
   * Get available currencies
   */
  get_currencies: async (): Promise<CurrencyInfo[]> => {
    const response = await apiClient.get<{ success: boolean; data: CurrencyInfo[] }>("/wallet/currencies");
    return response.data.data;
  },

  /**
   * Get user wallets
   */
  get_wallets: async (): Promise<Wallet[]> => {
    const response = await apiClient.get<{ success: boolean; data: Wallet[] }>("/wallets");
    return response.data.data;
  },

  /**
   * Deposit funds (mock)
   */
  deposit: async (data: DepositData): Promise<WalletOperationResponse> => {
    const response = await apiClient.post<WalletOperationResponse>("/wallets/deposit", data);
    return response.data;
  },

  /**
   * Withdraw funds (mock)
   */
  withdraw: async (data: WithdrawData): Promise<WalletOperationResponse> => {
    const response = await apiClient.post<WalletOperationResponse>("/wallets/withdraw", data);
    return response.data;
  },
};
