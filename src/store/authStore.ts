import { create } from "zustand";
import { persist } from "zustand/middleware";
import {authService, type BackendUser} from "@/api/services/authService";
import toast from "react-hot-toast";

interface AuthState {
  user: BackendUser | null;
  access_token: string | null;
  refresh_token: string | null;
  is_authenticated: boolean;
  is_loading: boolean;
  error: string | null;
  login: (email: string, password: string, remember_me: boolean) => Promise<void>;
  register: (email: string, first_name: string, last_name: string, password: string, referral_code?: string) => Promise<void>;
  logout: () => Promise<void>;
  update_user: (user: Partial<BackendUser>) => void;
  set_loading: (loading: boolean) => void;
  check_auth: () => Promise<void>;
  clear_error: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      is_authenticated: false,
      is_loading: false,
      error: null,

      login: async (email: string, password: string, remember_me: boolean) => {
        try {
          set({ is_loading: true, error: null });
          const { user, access_token, refresh_token } = await authService.login({ email, password, remember_me });
          set({ user, access_token, refresh_token, is_authenticated: true, is_loading: false });
          toast.success("Login successful!");
        } catch (error) {
          const error_message = "Login failed. Please check your credentials.";
          set({ is_loading: false, error: error_message });
          toast.error(error_message);
          throw error;
        }
      },

      register: async (email: string, first_name:string, last_name:string, password: string, referral_code?: string) => {
        try {
          set({ is_loading: true, error: null });
          const { user, access_token, refresh_token } = await authService.register({ email, first_name, last_name, password, referral_code });
          set({ user, access_token, refresh_token, is_authenticated: true, is_loading: false });
          toast.success("Registration successful! Welcome to Midas Exchange!");
        } catch (error) {
          const error_message = "Registration failed.";
          set({ is_loading: false, error: error_message });
          toast.error(error_message);
          throw error;
        }
      },

      logout: async () => {
        const { refresh_token } = get();
        try {
          if (refresh_token) {
            await authService.logout(refresh_token);
          }
          set({ user: null, access_token: null, refresh_token: null, is_authenticated: false });
          toast.success("Logged out successfully");
        } catch (error) {
            console.error(error);
          // Still clear local state even if API call fails
          set({ user: null, access_token: null, refresh_token: null, is_authenticated: false });
        }
      },

      update_user: (updated_user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updated_user } : null,
        })),

      set_loading: (loading) => set({ is_loading: loading }),

      check_auth: async () => {
        const { access_token } = get();
        if (!access_token) return;

        try {
          const user = await authService.get_current_user();
          set({ user, is_authenticated: true });
        } catch (error) {
            console.error(error);
          set({ user: null, access_token: null, refresh_token: null, is_authenticated: false });
        }
      },

      clear_error: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        is_authenticated: state.is_authenticated,
      }),
    }
  )
);