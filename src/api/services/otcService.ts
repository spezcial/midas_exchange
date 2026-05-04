import { apiClient } from "../client";
import type {
  OTCOrder,
  OTCOrderDetail,
  OTCMessage,
  OTCOrdersListResponse,
  OTCConfigWithCurrencies,
  OTCAuditLog,
  OTCAnalytics,
  AdminListOTCOrdersParams,
} from "@/types";
import { normalizeOTCOrder, normalizeOTCOrderDetail, normalizeOTCMessage, normalizeOTCConfig, normalizeOTCAnalytics } from "@/lib/numeric";

export interface CreateOTCOrderPayload {
  from_currency_id: number;
  to_currency_id: number;
  from_amount: number;
  proposed_rate: number;
  comment?: string;
}

export interface SendOTCOfferPayload {
  offer_rate: number;
  offer_from_amount: number;
}

export interface ListOTCOrdersParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export const otcService = {
  // Client endpoints
  get_active_configs: async (): Promise<OTCConfigWithCurrencies[]> => {
    const response = await apiClient.get("/otc/config");
    const data: OTCConfigWithCurrencies[] = response.data?.data ?? response.data;
    return data.map(normalizeOTCConfig);
  },

  create_order: async (data: CreateOTCOrderPayload): Promise<OTCOrder> => {
    const response = await apiClient.post("/otc/orders", data);
    return normalizeOTCOrder(response.data?.data ?? response.data);
  },

  list_orders: async (params?: ListOTCOrdersParams): Promise<OTCOrdersListResponse> => {
    const response = await apiClient.get("/otc/orders", { params });
    const r: OTCOrdersListResponse = response.data?.data ?? response.data;
    return { ...r, orders: (r.orders ?? []).map(normalizeOTCOrder) };
  },

  get_order: async (uid: string): Promise<OTCOrderDetail> => {
    const response = await apiClient.get(`/otc/orders/${uid}`);
    return normalizeOTCOrderDetail(response.data?.data ?? response.data);
  },

  send_message: async (uid: string, content: string): Promise<OTCMessage> => {
    const response = await apiClient.post(`/otc/orders/${uid}/messages`, { content });
    return normalizeOTCMessage(response.data);
  },

  send_offer: async (uid: string, data: SendOTCOfferPayload): Promise<OTCMessage> => {
    const response = await apiClient.post(`/otc/orders/${uid}/offers`, data);
    return normalizeOTCMessage(response.data);
  },

  accept_offer: async (uid: string, message_id: number): Promise<void> => {
    await apiClient.put(`/otc/orders/${uid}/offers/${message_id}/accept`);
  },

  reject_offer: async (uid: string, message_id: number): Promise<void> => {
    await apiClient.put(`/otc/orders/${uid}/offers/${message_id}/reject`);
  },

  cancel_order: async (uid: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/otc/orders/${uid}`, { data: { reason: reason ?? "" } });
  },

  // Admin config CRUD (super_admin only)
  admin_get_configs: async (): Promise<OTCConfigWithCurrencies[]> => {
    const response = await apiClient.get("/admin/otc/config");
    const configs: OTCConfigWithCurrencies[] = (response.data?.data ?? response.data)?.configs ?? [];
    return configs.map(normalizeOTCConfig);
  },

  admin_create_config: async (data: {
    from_currency_id: number;
    to_currency_id: number;
    min_from_amount: number;
    payment_timeout_min: number;
    is_active: boolean;
  }): Promise<OTCConfigWithCurrencies> => {
    const response = await apiClient.post("/admin/otc/config", data);
    return normalizeOTCConfig(response.data?.data ?? response.data);
  },

  admin_update_config: async (
    id: number,
    data: { min_from_amount: number; payment_timeout_min: number; is_active: boolean }
  ): Promise<OTCConfigWithCurrencies> => {
    const response = await apiClient.put(`/admin/otc/config/${id}`, data);
    return normalizeOTCConfig(response.data?.data ?? response.data);
  },

  admin_delete_config: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/otc/config/${id}`);
  },

  // Admin / Operator endpoints
  admin_list_orders: async (params?: AdminListOTCOrdersParams): Promise<OTCOrdersListResponse> => {
    const response = await apiClient.get("/admin/otc/orders", { params });
    const r: OTCOrdersListResponse = response.data?.data ?? response.data;
    return { ...r, orders: (r.orders ?? []).map(normalizeOTCOrder) };
  },

  admin_get_order: async (uid: string): Promise<OTCOrderDetail> => {
    const response = await apiClient.get(`/admin/otc/orders/${uid}`);
    return normalizeOTCOrderDetail(response.data?.data ?? response.data);
  },

  admin_take_order: async (uid: string): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/take`);
  },

  admin_accept_as_proposed: async (uid: string): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/accept-proposed`);
  },

  admin_send_message: async (uid: string, content: string): Promise<OTCMessage> => {
    const response = await apiClient.post(`/admin/otc/orders/${uid}/messages`, { content });
    return normalizeOTCMessage(response.data);
  },

  admin_send_offer: async (uid: string, data: SendOTCOfferPayload): Promise<OTCMessage> => {
    const response = await apiClient.post(`/admin/otc/orders/${uid}/offers`, data);
    return normalizeOTCMessage(response.data);
  },

  admin_accept_offer: async (uid: string, message_id: number): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/offers/${message_id}/accept`);
  },

  admin_reject_offer: async (uid: string, message_id: number): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/offers/${message_id}/reject`);
  },

  admin_confirm_payment: async (uid: string): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/payment-received`);
  },

  admin_complete_order: async (uid: string): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/complete`);
  },

  admin_cancel_order: async (uid: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/admin/otc/orders/${uid}`, { data: { reason: reason ?? "" } });
  },

  // Audit log
  admin_get_audit_log: async (uid: string): Promise<OTCAuditLog[]> => {
    const response = await apiClient.get(`/admin/otc/orders/${uid}/audit-log`);
    const data = response.data?.data ?? response.data;
    return data?.audit_log ?? [];
  },

  // Analytics
  admin_get_analytics: async (params: {
    from?: string;
    to?: string;
    granularity?: "day" | "week" | "month";
  }): Promise<OTCAnalytics> => {
    const response = await apiClient.get("/admin/otc/analytics", { params });
    return normalizeOTCAnalytics(response.data?.data ?? response.data);
  },

  // CSV export — returns a Blob for download
  admin_export_orders: async (params: AdminListOTCOrdersParams): Promise<Blob> => {
    const response = await apiClient.get("/admin/otc/orders/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
