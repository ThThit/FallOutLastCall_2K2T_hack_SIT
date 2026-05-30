import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export interface Signal {
  id: string;
  authorName: string;
  content: string;
  sector: number;
  priority: "STANDARD" | "EMERGENCY";
  trustScore: number;
  verifiedCount: number;
  unverifiedCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  signalId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export const signalApi = {
  getAll: (params?: { sort?: string; q?: string; sector?: number }) =>
    api.get<Signal[]>("/signals", { params }).then((r) => r.data),

  create: (body: {
    authorName: string;
    content: string;
    sector: number;
    priority: string;
  }) => api.post<Signal>("/signals", body).then((r) => r.data),

  update: (id: string, body: Partial<{ content: string; sector: number; priority: string }>) =>
    api.patch<Signal>(`/signals/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/signals/${id}`).then((r) => r.data),

  vote: (id: string, type: "verified" | "unverified") =>
    api.post<Signal>(`/signals/${id}/vote`, { type }).then((r) => r.data),

  getComments: (id: string) =>
    api.get<Comment[]>(`/signals/${id}/comments`).then((r) => r.data),

  addComment: (id: string, body: { authorName: string; content: string }) =>
    api.post<Comment>(`/signals/${id}/comments`, body).then((r) => r.data),
};
