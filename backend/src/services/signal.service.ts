import prisma from "../lib/prisma.js";

export class SignalsService {
    async getAllSignal() {
        const signals = await prisma.signal.findMany({
            include: { user: true },
        });

        return signals.map(signal => {
            const trustScore = signal.verifiedCount - signal.unverifiedCount;
            return {
                id: signal.id,
                title: signal.title,
                content: signal.content,
                category: signal.category,
                dangerLevel: signal.dangerLevel,
                author: signal.user.username,
                sector: signal.sector,
                authorReputation: signal.user.reputationScore,
                trustScore,
                verificationStatus: signal.verifiedCount > signal.unverifiedCount
                    ? 'VERIFIED'
                    : signal.unverifiedCount > 0 ? 'SUSPICIOUS' : 'UNVERIFIED',
                verifiedVotes: signal.verifiedCount,
                unverifiedVotes: signal.unverifiedCount,
                flagged: signal.flagged,
                timeStamp: signal.createdAt
            };
        });
    }

    async createSignal(title: string, content: string, userId: string, category: string, dangerLevel: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new Error('User not found');

        const signal = await prisma.signal.create({
            data: {
                title,
                content,
                userId,
                category: category as any,
                dangerLevel: dangerLevel as any,
                sector: user.sector
            },
            include: { user: true }
        });

        return {
            id: signal.id,
            title: signal.title,
            content: signal.content,
            category: signal.category,
            dangerLevel: signal.dangerLevel,
            author: signal.user.username,
            sector: signal.user.sector,
            authorReputation: signal.user.reputationScore,
            trustScore: 0,
            verificationStatus: 'UNVERIFIED',
            verifiedVotes: 0,
            unverifiedVotes: 0,
            flagged: false,
            timeStamp: signal.createdAt
        };
    }

    async verifySignal(signalId: string, userId: string, status: string) {
        const signal = await prisma.signal.findUnique({
            where: { id: parseInt(signalId) },
            include: { user: true, verifications: true }
        });

        if (!signal) throw new Error('Signal not found');

        const existingVerification = await prisma.verification.findUnique({
            where: { signalId_userId: { signalId: parseInt(signalId), userId } }
        });

        if (existingVerification) throw new Error('User has already verified this signal');

        await prisma.verification.create({
            data: { signalId: parseInt(signalId), userId, status: status as any }
        });

        const countUpdate = status === 'VERIFIED'
            ? { verifiedCount: signal.verifiedCount + 1 }
            : { unverifiedCount: signal.unverifiedCount + 1 };

        await prisma.signal.update({
            where: { id: parseInt(signalId) },
            data: countUpdate
        });

        const verifiedCount = status === 'VERIFIED' ? signal.verifiedCount + 1 : signal.verifiedCount;
        const unverifiedCount = status === 'VERIFIED' ? signal.unverifiedCount : signal.unverifiedCount + 1;
        const trustScore = verifiedCount - unverifiedCount;

        // Update voter reputation
        const voterUser = await prisma.user.findUnique({ where: { id: userId } });
        if (voterUser) {
            const isMajority = (status === 'VERIFIED' && verifiedCount > unverifiedCount) ||
                (status !== 'VERIFIED' && unverifiedCount > verifiedCount);
            await prisma.user.update({
                where: { id: userId },
                data: { reputationScore: voterUser.reputationScore + (isMajority ? 1 : -1) }
            });
        }

        // Update signal creator reputation
        const creatorUser = await prisma.user.findUnique({ where: { id: signal.userId } });
        if (creatorUser && creatorUser.id !== userId) {
            await prisma.user.update({
                where: { id: signal.userId },
                data: { reputationScore: creatorUser.reputationScore + (status === 'VERIFIED' ? 2 : -1) }
            });
        }

        // Auto-delete if misinformation threshold exceeded (2x unverified vs verified)
        if (unverifiedCount > verifiedCount && unverifiedCount >= 3) {
            await prisma.verification.deleteMany({ where: { signalId: parseInt(signalId) } });
            await prisma.signal.delete({ where: { id: parseInt(signalId) } });
            return {
                deleted: true,
                message: `Signal auto-removed: ${unverifiedCount} suspicious/outdated vs ${verifiedCount} verified votes`
            };
        }

        const updatedSignal = await prisma.signal.findUnique({
            where: { id: parseInt(signalId) },
            include: { user: true }
        });

        if (!updatedSignal) throw new Error('Failed to fetch updated signal');

        const verificationStatus = verifiedCount > unverifiedCount ? 'VERIFIED' : 'SUSPICIOUS';

        return {
            id: updatedSignal.id,
            title: updatedSignal.title,
            content: updatedSignal.content,
            category: updatedSignal.category,
            dangerLevel: updatedSignal.dangerLevel,
            author: updatedSignal.user.username,
            sector: updatedSignal.user.sector,
            authorReputation: updatedSignal.user.reputationScore,
            trustScore,
            verificationStatus,
            verifiedVotes: verifiedCount,
            unverifiedVotes: unverifiedCount,
            flagged: updatedSignal.flagged,
            timeStamp: updatedSignal.createdAt
        };
    }

    // READ: Detailed trust statistics for a signal
    async getTrustStats(signalId: string) {
        const signal = await prisma.signal.findUnique({
            where: { id: parseInt(signalId) },
            include: {
                user: true,
                verifications: {
                    include: { user: { select: { username: true, reputationScore: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!signal) throw new Error('Signal not found');

        const verifiedVotes = signal.verifications.filter(v => v.status === 'VERIFIED').length;
        const suspiciousVotes = signal.verifications.filter(v => v.status === 'SUSPICIOUS').length;
        const outdatedVotes = signal.verifications.filter(v => v.status === 'OUTDATED').length;
        const totalVotes = signal.verifications.length;

        const trustPercentage = totalVotes > 0 ? (verifiedVotes / totalVotes) * 100 : 0;
        // Laplace-smoothed confidence score
        const signalConfidence = Math.round(((verifiedVotes + 1) / (totalVotes + 2)) * 100) / 100;

        let reliabilityLevel: string;
        if (totalVotes === 0) reliabilityLevel = 'UNVERIFIED';
        else if (trustPercentage >= 75) reliabilityLevel = 'TRUSTED';
        else if (trustPercentage >= 50) reliabilityLevel = 'HIGH';
        else if (trustPercentage >= 25) reliabilityLevel = 'MEDIUM';
        else reliabilityLevel = 'LOW';

        const communityConsensus = totalVotes === 0
            ? 'UNVERIFIED'
            : verifiedVotes > (suspiciousVotes + outdatedVotes) ? 'VERIFIED' : 'SUSPICIOUS';

        return {
            signalId: signal.id,
            title: signal.title,
            trustPercentage: Math.round(trustPercentage * 10) / 10,
            signalConfidence,
            verifiedVotes,
            suspiciousVotes,
            outdatedVotes,
            totalVotes,
            reliabilityLevel,
            communityConsensus,
            flagged: signal.flagged,
            flagReason: signal.flagReason,
            authorReputation: signal.user.reputationScore,
            verificationHistory: signal.verifications.map(v => ({
                username: v.user.username,
                voterReputation: v.user.reputationScore,
                status: v.status,
                timestamp: v.createdAt
            }))
        };
    }

    // DELETE: Moderator removes a harmful signal
    async deleteSignal(signalId: string) {
        const signal = await prisma.signal.findUnique({ where: { id: parseInt(signalId) } });

        if (!signal) throw new Error('Signal not found');

        await prisma.verification.deleteMany({ where: { signalId: parseInt(signalId) } });
        await prisma.signal.delete({ where: { id: parseInt(signalId) } });

        return { deleted: true, signalId: parseInt(signalId), message: 'Signal removed by moderator' };
    }

    // DELETE: Moderator clears harmful verification entries and resets vote counts
    async deleteHarmfulVerifications(signalId: string) {
        const signal = await prisma.signal.findUnique({ where: { id: parseInt(signalId) } });

        if (!signal) throw new Error('Signal not found');

        const { count } = await prisma.verification.deleteMany({ where: { signalId: parseInt(signalId) } });

        await prisma.signal.update({
            where: { id: parseInt(signalId) },
            data: { verifiedCount: 0, unverifiedCount: 0 }
        });

        return {
            signalId: parseInt(signalId),
            deletedCount: count,
            message: `Cleared ${count} verification entries and reset trust scores`
        };
    }

    // UPDATE: Flag a signal as potential misinformation (any authenticated user)
    async flagSignal(signalId: string, reason: string) {
        const signal = await prisma.signal.findUnique({ where: { id: parseInt(signalId) } });

        if (!signal) throw new Error('Signal not found');

        const updated = await prisma.signal.update({
            where: { id: parseInt(signalId) },
            data: { flagged: true, flagReason: reason }
        });

        return {
            signalId: updated.id,
            flagged: updated.flagged,
            flagReason: updated.flagReason,
            message: 'Signal flagged for moderator review'
        };
    }
}
