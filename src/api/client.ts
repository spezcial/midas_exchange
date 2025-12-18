import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { authService } from "./services/authService";

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Flag to track if we're currently refreshing the token
let is_refreshing = false;
// Queue of failed requests waiting for token refresh
let failed_requests_queue: Array<(token: string) => void> = [];

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from auth store
    const access_token = useAuthStore.getState().access_token;

    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const original_request = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !original_request._retry) {
      const auth_store = useAuthStore.getState();
      const { refresh_token, access_token } = auth_store;

      // If we don't have tokens, clear auth state and redirect to login
      if (!access_token || !refresh_token) {
        // Clear any stale authentication state
        useAuthStore.setState({
          is_authenticated: false,
          access_token: null,
          refresh_token: null,
          user: null
        });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // If this was the refresh endpoint itself that failed, logout
      if (original_request.url?.includes("/auth/refresh")) {
        await auth_store.logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Mark this request as retried to prevent infinite loops
      original_request._retry = true;

      if (!is_refreshing) {
        is_refreshing = true;

        try {
          // Try to refresh the access token
          const { access_token: new_access_token } = await authService.refresh_token(refresh_token);

          // Update the store with the new access token
          useAuthStore.setState({ access_token: new_access_token });

          // Process all queued requests with the new token
          failed_requests_queue.forEach((callback) => callback(new_access_token));
          failed_requests_queue = [];

          // Retry the original request with the new token
          if (original_request.headers) {
            original_request.headers.Authorization = `Bearer ${new_access_token}`;
          }

          return apiClient(original_request);
        } catch (refresh_error) {
          // Refresh failed, logout and redirect
          failed_requests_queue = [];
          await auth_store.logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refresh_error);
        } finally {
          is_refreshing = false;
        }
      } else {
        // Token is being refreshed, queue this request
        return new Promise((resolve) => {
          failed_requests_queue.push((new_token: string) => {
            if (original_request.headers) {
              original_request.headers.Authorization = `Bearer ${new_token}`;
            }
            resolve(apiClient(original_request));
          });
        });
      }
    }

    // Handle 403 Forbidden - user blocked
    if (error.response?.status === 403) {
      const message = error.response.data?.error || "Access forbidden";
      console.error("Access forbidden:", message);
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);
