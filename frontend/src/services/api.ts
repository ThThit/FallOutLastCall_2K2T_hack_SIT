const API_BASE_URL = "http://localhost:3000/api";

// Get auth token from localStorage - only returns token if it exists
const getAuthToken = () => localStorage.getItem("authToken");

// Vault API calls
export const vaultAPI = {
  // Get all vault items
  getItems: async (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/vault?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to fetch vault items");
    return response.json();
  },

  // Add item to vault
  addItem: async (vaultData: any) => {
    const response = await fetch(`${API_BASE_URL}/vault`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vaultData),
    });
    if (!response.ok) throw new Error("Failed to add item");
    return response.json();
  },

  // Get vault stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/vault/stats`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  // Delete/remove item
  removeItem: async (itemId: string, quantity?: number) => {
    let url = `${API_BASE_URL}/vault/${itemId}`;
    if (quantity) url += `?quantity=${quantity}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to remove item");
    return response.json();
  },
};

// Marketplace API calls
export const marketplaceAPI = {
  // Get all trades
  getTrades: async (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/trade?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to fetch trades");
    return response.json();
  },

  // Get user's available items to trade
  getAvailableItems: async () => {
    const response = await fetch(`${API_BASE_URL}/trade/available/items`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to fetch available items");
    return response.json();
  },

  // Create a trade listing
  createTrade: async (tradeData: any) => {
    const response = await fetch(`${API_BASE_URL}/trade`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tradeData),
    });
    if (!response.ok) throw new Error("Failed to create trade");
    return response.json();
  },

  // Update trade
  updateTrade: async (tradeId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trade/${tradeId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update trade");
    return response.json();
  },

  // Cancel trade
  cancelTrade: async (tradeId: string) => {
    const response = await fetch(`${API_BASE_URL}/trade/${tradeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to cancel trade");
    return response.json();
  },

  // Get user trade history (completed + cancelled)
  getTradeHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/trade/history`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Failed to fetch trade history");
    return response.json();
  },

  // Accept trade
  acceptTrade: async (tradeId: string, acceptorVaultItemId: string) => {
    const response = await fetch(`${API_BASE_URL}/trade/${tradeId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tradeId, acceptorVaultItemId }),
    });
    if (!response.ok) throw new Error("Failed to accept trade");
    return response.json();
  },
};
