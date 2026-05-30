import { time, timeStamp } from "node:console";
import prisma from "../lib/prisma.js";
import { title } from "node:process";

export class SignalsService {
    async getAllSignal() {
        // logic 
        const signals = await prisma.signal.findMany({
            include: { user: true, verifications: true },
        });

        // data transformation
        return signals.map(signal => ({
            id: signal.id,
            title: signal.title,
            content: signal.content,
            category: signal.category,
            dangerLevel: signal.dangerLevel,
            author: signal.user.username,
            sector: signal.user.sector,
            trustScore: signal.user.reputationScore,
            verificationStatus: signal.verifications[0]?.status || 'UNVERIFIED',
            timeStamp: signal.createdAt
        }));
    }

    async createSignal(title: string, content: string, userId: string, category: string, dangerLevel: string) {
        // Get user to fetch their sector
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

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
            trustScore: signal.user.reputationScore,
            verificationStatus: 'UNVERIFIED',
            timeStamp: signal.createdAt
        };
    }
}