import prisma from "../lib/prisma.js";

export class UserService {
    async getLeaderboard(limit: number = 10) {
        const users = await prisma.user.findMany({
            orderBy: { reputationScore: 'desc' },
            take: limit,
            include: {
                _count: { select: { signals: true, verifications: true } }
            }
        });

        return users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            reputationScore: user.reputationScore,
            sector: user.sector,
            role: user.role,
            totalSignals: user._count.signals,
            totalVerifications: user._count.verifications
        }));
    }

    async getUserStats(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: { select: { signals: true, verifications: true } }
            }
        });

        if (!user) throw new Error('User not found');

        // Count how many of their signals are trusted (more verified than unverified)
        const trustedSignals = await prisma.signal.count({
            where: { userId, verifiedCount: { gt: 0 } }
        });

        return {
            username: user.username,
            reputationScore: user.reputationScore,
            sector: user.sector,
            role: user.role,
            totalSignals: user._count.signals,
            trustedSignals,
            totalVerifications: user._count.verifications
        };
    }
}
