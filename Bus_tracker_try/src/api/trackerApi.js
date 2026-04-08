import { apiRequest } from "./client";

export function getPublicOverview(options = {}) {
  return apiRequest("/api/public/overview", options);
}

export function getAdminOverview(adminToken, options = {}) {
  return apiRequest("/api/admin/overview", {
    ...options,
    headers: {
      ...options.headers,
      "x-admin-token": adminToken,
    },
  });
}

export function acknowledgeAlert(alertId, adminToken) {
  return apiRequest(`/api/admin/alerts/${alertId}/acknowledge`, {
    method: "POST",
    headers: {
      "x-admin-token": adminToken,
    },
  });
}
