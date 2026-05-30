import prisma from "../lib/prisma.js";

// Peter's percentage trust formula (consistent with the signal card display)
function calcTrustScore(verified: number, unverified: number) {
    const total = verified + unverified;
    if (total === 0) return 50;
    return Math.round((verified / total) * 1000) / 10;
}

// Reputation = aggregate of a user's signals' (verified - unverified) counts.
// Driven entirely by Peter's verify/unverify counts; stored on the User for profile display.
async function recomputeReputation(userId: string) {
    const signals = await prisma.signal.findMany({
        where: { userId, deletedAt: null },
        select: { verifiedCount: true, unverifiedCount: true },
    });
    const score = signals.reduce(
        (sum, s) => sum + (s.verifiedCount - s.unverifiedCount),
        0,
    );
    await prisma.user.update({ where: { id: userId }, data: { reputationScore: score } });
    return score;
}

export class SignalsService {
    // READ: all signals with trust/verification metadata (thit's enriched view)
    async getAllSignal() {
        const signals = await prisma.signal.findMany({
            where: { deletedAt: null },
            include: { user: true },
        });

        return signals.map((signal) => ({
            id: signal.id,
            title: signal.title,
            content: signal.content,
            category: signal.category,
            dangerLevel: signal.dangerLevel,
            author: signal.user?.username ?? signal.authorName,
            sector: signal.sector,
            authorReputation: signal.user?.reputationScore ?? 0,
            trustScore: signal.trustScore,
            verificationStatus:
                signal.verifiedCount > signal.unverifiedCount
                    ? "VERIFIED"
                    : signal.unverifiedCount > 0
                      ? "SUSPICIOUS"
                      : "UNVERIFIED",
            verifiedVotes: signal.verifiedCount,
            unverifiedVotes: signal.unverifiedCount,
            flagged: signal.flagged,
            timeStamp: signal.createdAt,
        }));
    }

    // CREATE: submit a verification vote on a signal
    async verifySignal(signalId: string, userId: string, status: string) {
        const signal = await prisma.signal.findUnique({
            where: { id: signalId },
            include: { user: true },
        });
        if (!signal) throw new Error("Signal not found");

        const existing = await prisma.verification.findUnique({
            where: { signalId_userId: { signalId, userId } },
        });
        if (existing) throw new Error("User has already verified this signal");

        await prisma.verification.create({
            data: { signalId, userId, status: status as any },
        });

        // VERIFIED increases verified; SUSPICIOUS/OUTDATED increase unverified
        const verifiedCount =
            status === "VERIFIED" ? signal.verifiedCount + 1 : signal.verifiedCount;
        const unverifiedCount =
            status === "VERIFIED" ? signal.unverifiedCount : signal.unverifiedCount + 1;
        const trustScore = calcTrustScore(verifiedCount, unverifiedCount);

        await prisma.signal.update({
            where: { id: signalId },
            data: { verifiedCount, unverifiedCount, trustScore },
        });

        // Recompute the signal author's reputation from their verify/unverify counts
        if (signal.userId) await recomputeReputation(signal.userId);

        // Auto-delete: if suspicious/unverified votes exceed verified, the signal is
        // removed as community-confirmed misinformation (thit's mechanic, soft delete).
        if (unverifiedCount > verifiedCount && unverifiedCount >= 3) {
            await prisma.signal.update({
                where: { id: signalId },
                data: { deletedAt: new Date(), flagged: true, flagReason: "Auto-removed: community flagged as misinformation" },
            });
            return {
                id: signalId,
                deleted: true,
                trustScore,
                verifiedVotes: verifiedCount,
                unverifiedVotes: unverifiedCount,
                message: `Signal auto-removed: ${unverifiedCount} suspicious vs ${verifiedCount} verified votes`,
            };
        }

        return {
            id: signalId,
            deleted: false,
            trustScore,
            verifiedVotes: verifiedCount,
            unverifiedVotes: unverifiedCount,
            verificationStatus: verifiedCount > unverifiedCount ? "VERIFIED" : "SUSPICIOUS",
            flagged: signal.flagged,
        };
    }

    // READ: detailed trust statistics for a signal
    async getTrustStats(signalId: string) {
        const signal = await prisma.signal.findUnique({
            where: { id: signalId },
            include: {
                user: true,
                verifications: {
                    include: { user: { select: { username: true, reputationScore: true } } },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!signal) throw new Error("Signal not found");

        const verifiedVotes = signal.verifications.filter((v) => v.status === "VERIFIED").length;
        const suspiciousVotes = signal.verifications.filter((v) => v.status === "SUSPICIOUS").length;
        const outdatedVotes = signal.verifications.filter((v) => v.status === "OUTDATED").length;
        const totalVotes = signal.verifications.length;

        const trustPercentage = totalVotes > 0 ? (verifiedVotes / totalVotes) * 100 : 0;
        const signalConfidence = Math.round(((verifiedVotes + 1) / (totalVotes + 2)) * 100) / 100;

        let reliabilityLevel: string;
        if (totalVotes === 0) reliabilityLevel = "UNVERIFIED";
        else if (trustPercentage >= 75) reliabilityLevel = "TRUSTED";
        else if (trustPercentage >= 50) reliabilityLevel = "HIGH";
        else if (trustPercentage >= 25) reliabilityLevel = "MEDIUM";
        else reliabilityLevel = "LOW";

        const communityConsensus =
            totalVotes === 0
                ? "UNVERIFIED"
                : verifiedVotes > suspiciousVotes + outdatedVotes
                  ? "VERIFIED"
                  : "SUSPICIOUS";

        return {
            signalId: signal.id,
            title: signal.title,
            trustScore: signal.trustScore,
            trustPercentage: Math.round(trustPercentage * 10) / 10,
            signalConfidence,
            verifiedVotes: signal.verifiedCount,
            unverifiedVotes: signal.unverifiedCount,
            suspiciousVotes,
            outdatedVotes,
            totalVotes,
            reliabilityLevel,
            communityConsensus,
            flagged: signal.flagged,
            flagReason: signal.flagReason,
            authorReputation: signal.user?.reputationScore ?? 0,
            verificationHistory: signal.verifications.map((v) => ({
                username: v.user.username,
                voterReputation: v.user.reputationScore,
                status: v.status,
                timestamp: v.createdAt,
            })),
        };
    }

    // DELETE: moderator removes a harmful signal (soft delete to keep Peter's feed semantics)
    async deleteSignal(signalId: string) {
        const signal = await prisma.signal.findUnique({ where: { id: signalId } });
        if (!signal) throw new Error("Signal not found");

        await prisma.signal.update({
            where: { id: signalId },
            data: { deletedAt: new Date() },
        });

        return { deleted: true, signalId, message: "Signal removed by moderator" };
    }

    // DELETE: moderator clears verification entries and resets trust
    async deleteHarmfulVerifications(signalId: string) {
        const signal = await prisma.signal.findUnique({ where: { id: signalId } });
        if (!signal) throw new Error("Signal not found");

        const { count } = await prisma.verification.deleteMany({ where: { signalId } });

        await prisma.signal.update({
            where: { id: signalId },
            data: { verifiedCount: 0, unverifiedCount: 0, trustScore: 50, flagged: false, flagReason: null },
        });

        if (signal.userId) await recomputeReputation(signal.userId);

        return {
            signalId,
            deletedCount: count,
            message: `Cleared ${count} verification entries and reset trust scores`,
        };
    }

    // UPDATE: flag a signal as potential misinformation
    async flagSignal(signalId: string, reason: string) {
        const signal = await prisma.signal.findUnique({ where: { id: signalId } });
        if (!signal) throw new Error("Signal not found");

        const updated = await prisma.signal.update({
            where: { id: signalId },
            data: { flagged: true, flagReason: reason },
        });

        return {
            signalId: updated.id,
            flagged: updated.flagged,
            flagReason: updated.flagReason,
            message: "Signal flagged for moderator review",
        };
    }
}
