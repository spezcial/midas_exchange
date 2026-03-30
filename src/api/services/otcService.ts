import { apiClient } from "../client";
import type { OTCOrder, OTCOrderDetail, OTCMessage, OTCOrdersListResponse, OTCConfigWithCurrencies } from "@/types";

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

export interface AdminListOTCOrdersParams extends ListOTCOrdersParams {
  email?: string;
}

export const otcService = {
  // Client endpoints
  get_active_configs: async (): Promise<OTCConfigWithCurrencies[]> => {
    const response = await apiClient.get("/otc/config");
    return response.data?.data ?? response.data;
  },

  create_order: async (data: CreateOTCOrderPayload): Promise<OTCOrder> => {
    const response = await apiClient.post("/otc/orders", data);
    return response.data?.data ?? response.data;
  },

  list_orders: async (params?: ListOTCOrdersParams): Promise<OTCOrdersListResponse> => {
    const response = await apiClient.get("/otc/orders", { params });
    return response.data?.data ?? response.data;
  },

  get_order: async (uid: string): Promise<OTCOrderDetail> => {
    const response = await apiClient.get(`/otc/orders/${uid}`);
    return response.data?.data ?? response.data;
  },

  send_message: async (uid: string, content: string): Promise<OTCMessage> => {
    const response = await apiClient.post(`/otc/orders/${uid}/messages`, { content });
    return response.data;
  },

  send_offer: async (uid: string, data: SendOTCOfferPayload): Promise<OTCMessage> => {
    const response = await apiClient.post(`/otc/orders/${uid}/offers`, data);
    return response.data;
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
    return (response.data?.data ?? response.data)?.configs ?? [];
  },

  admin_create_config: async (data: {
    from_currency_id: number;
    to_currency_id: number;
    min_from_amount: number;
    payment_timeout_min: number;
    is_active: boolean;
  }): Promise<OTCConfigWithCurrencies> => {
    const response = await apiClient.post("/admin/otc/config", data);
    return response.data?.data ?? response.data;
  },

  admin_update_config: async (
    id: number,
    data: { min_from_amount: number; payment_timeout_min: number; is_active: boolean }
  ): Promise<OTCConfigWithCurrencies> => {
    const response = await apiClient.put(`/admin/otc/config/${id}`, data);
    return response.data?.data ?? response.data;
  },

  admin_delete_config: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/otc/config/${id}`);
  },

  // Admin / Operator endpoints
  admin_list_orders: async (params?: AdminListOTCOrdersParams): Promise<OTCOrdersListResponse> => {
    const response = await apiClient.get("/admin/otc/orders", { params });
    return response.data?.data ?? response.data;
  },

  admin_get_order: async (uid: string): Promise<OTCOrderDetail> => {
    const response = await apiClient.get(`/admin/otc/orders/${uid}`);
    return response.data?.data ?? response.data;
  },

  admin_take_order: async (uid: string): Promise<void> => {
    await apiClient.put(`/admin/otc/orders/${uid}/take`);
  },

  admin_send_message: async (uid: string, content: string): Promise<OTCMessage> => {
    const response = await apiClient.post(`/admin/otc/orders/${uid}/messages`, { content });
    return response.data;
  },

  admin_send_offer: async (uid: string, data: SendOTCOfferPayload): Promise<OTCMessage> => {
    const response = await apiClient.post(`/admin/otc/orders/${uid}/offers`, data);
    return response.data;
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
};
