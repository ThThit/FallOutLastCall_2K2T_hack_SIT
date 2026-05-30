export interface CreateSignalInput {
    authorName: string;
    content: string;
    sector: number;
    priority: "STANDARD" | "EMERGENCY";
}

export interface UpdateSignalInput {
    content?: string;
    sector?: number;
    priority?: "STANDARD" | "EMERGENCY";
}

export interface GetSignalsQuery {
    sort?: string;
    q?: string;
    sector?: string;
}

export interface CommentInput {
    authorName: string;
    content: string;
}
