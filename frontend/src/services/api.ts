<<<<<<< HEAD
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
=======
const BASE_URL = "http://localhost:3000/api/archive";

export type CreateMemoryInput = {
  title: string;
  survivorAlias?: string;
  category: string;
  content: string;
  emotionalTag: string;
};

export type UpdateMemoryInput = Partial<CreateMemoryInput> & {
  decayLevel?: number;
  isRestored?: boolean;
};

export type MemoryArchive = {
  id: string;
  title: string;
  survivorAlias: string;
  category: string;
  content: string;
  emotionalTag: string;
  date: string;
  decayLevel: number;
  isRestored: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MemoryArchiveRevision = {
  id: string;
  memoryId: string;
  action: string;
  note: string | null;
  titleBefore: string;
  titleAfter: string;
  survivorAliasBefore: string;
  survivorAliasAfter: string;
  categoryBefore: string;
  categoryAfter: string;
  contentBefore: string;
  contentAfter: string;
  emotionalTagBefore: string;
  emotionalTagAfter: string;
  decayLevelBefore: number | null;
  decayLevelAfter: number | null;
  isRestoredBefore: boolean | null;
  isRestoredAfter: boolean | null;
  createdAt: string;
};

async function handleResponse(res: Response) {
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      // Prefer structured errorMessages from the backend when available
      if (json && Array.isArray(json.errorMessages)) {
        throw new Error(json.errorMessages.join(" "));
      }
      if (json && json.error) {
        // legacy: throw the error payload
        throw new Error(
          typeof json.error === "string"
            ? json.error
            : JSON.stringify(json.error),
        );
      }
      throw new Error(res.statusText || "Request failed");
    }
    return json;
  } catch (err) {
    // If JSON.parse fails, propagate a generic error
    if (!res.ok) throw { message: res.statusText };
    return null;
  }
}

export const fetchMemories = async (): Promise<MemoryArchive[]> => {
  const res = await fetch(`${BASE_URL}?t=${Date.now()}`, { credentials: "include" });
  return handleResponse(res) as Promise<MemoryArchive[]>;
};

export const createMemory = async (
  memoryData: CreateMemoryInput,
): Promise<MemoryArchive> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(memoryData),
  });

  return handleResponse(res) as Promise<MemoryArchive>;
};

export const deleteMemory = async (id: string): Promise<MemoryArchive> => {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res) as Promise<MemoryArchive>;
};

export const deleteMemoryData = deleteMemory;

export const updateMemoryData = async (
  id: string,
  memoryData: UpdateMemoryInput,
): Promise<MemoryArchive> => {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(memoryData),
  });

  return handleResponse(res) as Promise<MemoryArchive>;
};

export const patchMemoryData = updateMemoryData;
// Add this to api.ts
export const restoreMemoryData = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    // We send a payload to reset the decay and mark it as restored
    body: JSON.stringify({ decayLevel: 0, isRestored: true }),
  });

  if (!response.ok) {
    throw new Error("Failed to restore memory");
  }
  return response.json();
};

export const fetchMemoryHistory = async (
  id: string,
): Promise<MemoryArchiveRevision[]> => {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/history`, {
    credentials: "include",
  });

  return handleResponse(res) as Promise<MemoryArchiveRevision[]>;
>>>>>>> origin/MemoryArchive
};
