import { apiClient } from "../client";
import type { User } from "@/types";

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  action_token?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const userService = {
  /**
   * Get user profile
   */
  get_profile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/profile");
    return response.data.data;
  },

  /**
   * Update user profile
   */
  update_profile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>("/profile", data);
    return response.data.data;
  },

  /**
   * Change password
   */
  change_password: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>("/auth/password", data);
    return response.data.data;
  },
};
