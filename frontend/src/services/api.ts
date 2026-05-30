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
  const res = await fetch(BASE_URL, { credentials: "include" });
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
  const response = await fetch(`http://localhost:3000/api/archive/${id}`, {
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
