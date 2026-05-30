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
