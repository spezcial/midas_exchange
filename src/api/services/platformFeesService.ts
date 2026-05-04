import { apiClient } from "../client";
import type { PlatformFeesListResponse, FeeOperation } from "@/types";
import { normalizePlatformFeesListResponse } from "@/lib/numeric";

export interface GetPlatformFeesParams {
  limit?: number;
  offset?: number;
  operation?: FeeOperation;
}

export const platformFeesService = {
  list: async (params?: GetPlatformFeesParams): Promise<PlatformFeesListResponse> => {
    const response = await apiClient.get<{ success: boolean; data: PlatformFeesListResponse }>(
      "/admin/platform-fees",
      {
        params: {
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
          ...(params?.operation ? { operation: params.operation } : {}),
        },
      }
    );
    return normalizePlatformFeesListResponse(response.data.data);
  },
};
