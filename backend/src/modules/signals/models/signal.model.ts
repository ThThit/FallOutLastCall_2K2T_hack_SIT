import prisma from "../../../lib/prisma.js";
import type {
    CreateSignalInput,
    UpdateSignalInput,
    GetSignalsQuery,
    CommentInput,
} from "../types/signal.types.js";

const STANDARD_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const EMERGENCY_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

// Error the controller maps to a 404 response
export class NotFoundError extends Error {
    status = 404;
    constructor(message = "Signal not found") {
        super(message);
    }
}

export class SignalModel {
    /**
     * Only return signals that have not expired based on their priority.
     * STANDARD lasts 7 days, EMERGENCY lasts 3 days.
     */
    private expiryFilter() {
        const now = Date.now();
        return {
            OR: [
                {
                    priority: "STANDARD",
                    createdAt: { gt: new Date(now - STANDARD_EXPIRY_MS) },
                },
                {
                    priority: "EMERGENCY",
                    createdAt: { gt: new Date(now - EMERGENCY_EXPIRY_MS) },
                },
            ],
        };
    }

    /**
     * Recalculate the trust score from the vote counts.
     * Defaults to 50 when there are no votes.
     */
    private calculateTrustScore(verified: number, unverified: number) {
        const total = verified + unverified;
        if (total === 0) return 50;
        return Math.round((verified / total) * 1000) / 10;
    }

    /**
     * Create a new signal
     */
    async create(data: CreateSignalInput) {
        return prisma.signal.create({ data });
    }

    /**
     * Get all non-deleted, non-expired signals.
     * EMERGENCY signals are always pinned to the top.
     */
    async getAll({ sort, q, sector }: GetSignalsQuery) {
        const where: any = {
            deletedAt: null,
            AND: [this.expiryFilter()],
        };

        if (q) {
            where.AND.push({
                OR: [
                    { content: { contains: q } },
                    { authorName: { contains: q } },
                ],
            });
        }

        if (sector) {
            const num = parseInt(sector);
            if (!isNaN(num)) where.sector = num;
        }

        const orderBy =
            sort === "trust"
                ? { trustScore: "desc" as const }
                : { createdAt: "desc" as const };

        const signals = await prisma.signal.findMany({
            where,
            include: { _count: { select: { comments: true } } },
            orderBy,
        });

        // EMERGENCY signals always first, sort order preserved within each group
        signals.sort((a, b) => {
            if (a.priority === "EMERGENCY" && b.priority !== "EMERGENCY") return -1;
            if (b.priority === "EMERGENCY" && a.priority !== "EMERGENCY") return 1;
            return 0;
        });

        return signals;
    }

    /**
     * Update a signal. Throws if it is missing or already deleted.
     */
    async update(id: string, data: UpdateSignalInput) {
        const existing = await prisma.signal.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) throw new NotFoundError();

        return prisma.signal.update({ where: { id }, data });
    }

    /**
     * Soft delete a signal by setting deletedAt.
     */
    async softDelete(id: string) {
        const existing = await prisma.signal.findFirst({ where: { id } });
        if (!existing) throw new NotFoundError();

        await prisma.signal.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { message: "Signal deleted" };
    }

    /**
     * Add or remove a verified/unverified vote and recalculate the trust score.
     */
    async vote(
        id: string,
        type: "verified" | "unverified",
        action: "add" | "remove",
    ) {
        const existing = await prisma.signal.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) throw new NotFoundError();

        const delta = action === "remove" ? -1 : 1;

        const newVerified =
            type === "verified"
                ? Math.max(0, existing.verifiedCount + delta)
                : existing.verifiedCount;
        const newUnverified =
            type === "unverified"
                ? Math.max(0, existing.unverifiedCount + delta)
                : existing.unverifiedCount;

        return prisma.signal.update({
            where: { id },
            data: {
                verifiedCount: newVerified,
                unverifiedCount: newUnverified,
                trustScore: this.calculateTrustScore(newVerified, newUnverified),
            },
        });
    }

    /**
     * Add a comment to a signal. Throws if the signal is missing or deleted.
     */
    async addComment(signalId: string, data: CommentInput) {
        const signal = await prisma.signal.findFirst({
            where: { id: signalId, deletedAt: null },
        });
        if (!signal) throw new NotFoundError();

        return prisma.comment.create({ data: { signalId, ...data } });
    }

    /**
     * Get all comments for a signal, oldest first.
     */
    async getComments(signalId: string) {
        const signal = await prisma.signal.findFirst({ where: { id: signalId } });
        if (!signal) throw new NotFoundError();

        return prisma.comment.findMany({
            where: { signalId },
            orderBy: { createdAt: "asc" },
        });
    }
}

export default new SignalModel();
