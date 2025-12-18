import { apiClient } from "../client";
import type { User } from "@/types";

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const userService = {
  /**
   * Get user profile
   */
  get_profile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/user/profile");
    return response.data;
  },

  /**
   * Update user profile
   */
  update_profile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<User>("/user/profile", data);
    return response.data;
  },

  /**
   * Change password
   */
  change_password: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>("/user/password", data);
    return response.data;
  },
};
