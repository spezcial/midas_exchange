import { apiClient } from "../client";
import type { TwoFAMethod } from "@/types";

export type UserRole =
  | "client"
  | "admin"
  | "super_admin"
  | "operator"
  | "support"
  | "aml_specialist"
  | "compliance";

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
  phone?: string;
  phone_verified?: boolean;
  two_factor_enabled?: boolean;
  passkey_enabled?: boolean;
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

export type LoginResponse =
  | { status: "ok"; access_token: string; refresh_token: string; user: BackendUser; two_factor_enabled: boolean; passkey_enabled: boolean }
  | { status: "pending_2fa"; temp_token: string; methods: TwoFAMethod[]; two_factor_enabled: boolean; passkey_enabled: boolean };

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

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data);
    const raw = response.data;
    // Old envelope: { success: true, data: { access_token, refresh_token, user } }
    if (raw.data && !raw.status) {
      return {
        status: "ok",
        two_factor_enabled: raw.two_factor_enabled ?? false,
        passkey_enabled: raw.passkey_enabled ?? false,
        ...raw.data,
      } as LoginResponse;
    }
    return raw as LoginResponse;
  },

  logout: async (refresh_token: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refresh_token });
  },

  get_current_user: async (): Promise<BackendUser> => {
    const response = await apiClient.get("/auth/me");
    const data = response.data.data;
    return {
      ...data.user,
      two_factor_enabled: data.two_factor_enabled,
      passkey_enabled: data.passkey_enabled,
    } as BackendUser;
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

  forgot_password_send: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password/send", { email });
  },

  forgot_password_verify: async (phone: string, code: string): Promise<{ reset_token: string }> => {
    const response = await apiClient.post<{ reset_token: string }>("/auth/forgot-password/verify", { phone, code });
    return response.data;
  },

  forgot_password_reset: async (reset_token: string, new_password: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password/reset", { reset_token, new_password });
  },
};
