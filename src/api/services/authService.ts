import { apiClient } from "../client";

export type UserRole =
  | "client"
  | "admin"
  | "super_admin"
  | "operator"
  | "support"
  | "aml_specialist"
  | "compliance";

// Backend user structure
export interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  referral_code?: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface BackendAuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: BackendUser;
  };
}

export interface GoogleOAuthUrlResponse {
  success: boolean;
  data: {
    auth_url: string;
    state: string;
  };
}

export interface GoogleCallbackData {
  code: string;
  state: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<BackendAuthResponse["data"]> => {
    const response = await apiClient.post<BackendAuthResponse>("/auth/register", data);
    return response.data.data;
  },

  login: async (data: LoginData): Promise<BackendAuthResponse["data"]> => {
    const response = await apiClient.post<BackendAuthResponse>("/auth/login", data);
    return response.data.data;
  },

  logout: async (refresh_token: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refresh_token });
  },

  get_current_user: async (): Promise<BackendUser> => {
    const response = await apiClient.get<{ success: boolean; data: BackendUser }>("/auth/me");
    return response.data.data;
  },

  refresh_token: async (refresh_token: string): Promise<{ access_token: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { access_token: string } }>(
      "/auth/refresh",
      { refresh_token }
    );
    return response.data.data;
  },

  get_google_oauth_url: async (): Promise<GoogleOAuthUrlResponse["data"]> => {
    const response = await apiClient.get<GoogleOAuthUrlResponse>("/auth/google/url");
    return response.data.data;
  },

  google_callback: async (data: GoogleCallbackData): Promise<BackendAuthResponse["data"]> => {
    const response = await apiClient.post<BackendAuthResponse>("/auth/google/callback", data);
    return response.data.data;
  },
};
