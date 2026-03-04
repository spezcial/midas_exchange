import { apiClient } from "../client";
import type { UserRole } from "./authService";

export interface StaffUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface StaffListResponse {
  staff: StaffUser[];
  total: number;
}

export interface CreateStaffPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface CreateStaffResponse {
  staff: StaffUser;
  temp_password: string;
}

export interface UpdateStaffPayload {
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export const STAFF_ROLE_OPTIONS: UserRole[] = [
  "admin",
  "super_admin",
  "operator",
  "support",
  "aml_specialist",
  "compliance",
];

// Unwrap either { success, data: payload } or the payload directly
function unwrap<T>(raw: unknown): T {
  const r = raw as Record<string, unknown>;
  if (r && typeof r === "object" && "data" in r && r.success !== undefined) {
    return r.data as T;
  }
  return raw as T;
}

export const staffService = {
  list: async (params?: { limit?: number; offset?: number; email?: string }): Promise<StaffListResponse> => {
    const response = await apiClient.get("/admin/super/staff", { params });
    const payload = unwrap<StaffListResponse>(response.data);
    return {
      staff: payload.staff ?? [],
      total: payload.total ?? 0,
    };
  },

  create: async (data: CreateStaffPayload): Promise<CreateStaffResponse> => {
    const response = await apiClient.post("/admin/super/staff", data);
    const payload = unwrap<CreateStaffResponse>(response.data);
    return payload;
  },

  update: async (id: number, data: UpdateStaffPayload): Promise<StaffUser> => {
    const response = await apiClient.put(`/admin/super/staff/${id}`, data);
    return unwrap<StaffUser>(response.data);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/super/staff/${id}`);
  },
};
