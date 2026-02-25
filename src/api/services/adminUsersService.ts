import { apiClient } from "../client";
import type { User, Wallet, UserProfile, UserProfilePayload } from "@/types";

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
  }
}

export interface UserDetailResponse {
  success: boolean;
  data: {
    user: User;
    wallets: Wallet[];
  }
}

export interface ManualDepositData {
  user_id: number;
  currency_code: string;
  amount: number;
  tx_hash?: string;
  description?: string;
}

export interface ManualDepositResponse {
  success: boolean;
  message: string;
  wallet: Wallet;
}

export const adminUsersService = {
  /**
   * Get all users (admin only)
   */
  get_all_users: async (params?: { email?: string; is_blocked?: boolean }): Promise<UsersListResponse> => {
    const response = await apiClient.get<UsersListResponse>("/admin/users", { params });
    return response.data;
  },

  /**
   * Get user by ID with wallets (admin only)
   */
  get_user_by_id: async (user_id: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>(`/admin/users/${user_id}`);
    return response.data;
  },

  /**
   * Manually deposit funds into user's wallet (admin only)
   */
  manual_deposit: async (data: ManualDepositData): Promise<ManualDepositResponse> => {
    const response = await apiClient.post<ManualDepositResponse>("/admin/wallets/deposit", data);
    return response.data;
  },

  /**
   * Get user profile (admin only)
   */
  get_user_profile: async (user_id: number): Promise<UserProfile> => {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(`/admin/users/${user_id}/profile`);
    return response.data.data;
  },

  /**
   * Create user profile - initial fill (admin only)
   */
  create_user_profile: async (user_id: number, data: UserProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.post<{ success: boolean; data: UserProfile }>(`/admin/users/${user_id}/profile`, data);
    return response.data.data;
  },

  /**
   * Update user profile (admin only)
   */
  update_user_profile: async (user_id: number, data: UserProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.put<{ success: boolean; data: UserProfile }>(`/admin/users/${user_id}/profile`, data);
    return response.data.data;
  },
};
