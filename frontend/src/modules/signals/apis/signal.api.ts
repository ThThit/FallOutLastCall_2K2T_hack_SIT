import type { Signal, Comment } from "../types/signal.types";
import { client as api } from "../../../api/client";

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

  vote: (id: string, type: "verified" | "unverified", action: "add" | "remove" = "add") =>
    api.post<Signal>(`/signals/${id}/vote`, { type, action }).then((r) => r.data),

  getComments: (id: string) =>
    api.get<Comment[]>(`/signals/${id}/comments`).then((r) => r.data),

  addComment: (id: string, body: { authorName: string; content: string }) =>
    api.post<Comment>(`/signals/${id}/comments`, body).then((r) => r.data),
};

export type { Signal, Comment };
