// mock seeds

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaLibSql({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Delete existing data
    await prisma.verification.deleteMany({});
    await prisma.signal.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users
    const alice = await prisma.user.create({
        data: {
            username: "ALICE",
            password: await bcrypt.hash("password123", 10),
            reputationScore: 80,
            sector: 1,
            role: "MODERATOR",
        },
    });

    const bob = await prisma.user.create({
        data: {
            username: "BOB",
            password: await bcrypt.hash("password456", 10),
            reputationScore: 65,
            sector: 2,
        },
    });

    const charlie = await prisma.user.create({
        data: {
            username: "CHARLIE",
            password: await bcrypt.hash("password789", 10),
            reputationScore: 45,
            sector: 3,
        },
    });

    const diana = await prisma.user.create({
        data: {
            username: "DIANA",
            password: await bcrypt.hash("password101", 10),
            reputationScore: 90,
            sector: 4,
        },
    });

    const eve = await prisma.user.create({
        data: {
            username: "EVE",
            password: await bcrypt.hash("password202", 10),
            reputationScore: 55,
            sector: 5,
        },
    });

    const frank = await prisma.user.create({
        data: {
            username: "FRANK",
            password: await bcrypt.hash("password303", 10),
            reputationScore: 70,
            sector: 1,
        },
    });

    // Create signals
    const signal1 = await prisma.signal.create({
        data: {
            title: "Safe Shelter",
            content: "Underground station is secure. Supplies available.",
            category: "SHELTER",
            dangerLevel: "LOW",
            sector: 1,
            userId: alice.id,
            verifiedCount: 1, // bob only (alice is mod, no pre-vote)
            unverifiedCount: 0,
        },
    });

    const signal2 = await prisma.signal.create({
        data: {
            title: "Radiation Warning",
            content: "Sector 7 showing elevated radiation levels. Avoid until further notice.",
            category: "DANGER",
            dangerLevel: "HIGH",
            sector: 7,
            userId: bob.id,
            verifiedCount: 0, // alice removed as mod
            unverifiedCount: 0,
        },
    });

    const signal3 = await prisma.signal.create({
        data: {
            title: "Water Source Found",
            content: "Fresh water discovered near old market. Purified and safe.",
            category: "SUPPLIES",
            dangerLevel: "LOW",
            sector: 2,
            userId: charlie.id,
            verifiedCount: 1,
            unverifiedCount: 0,
        },
    });

    const signal4 = await prisma.signal.create({
        data: {
            title: "Trading Post Active",
            content: "Setting up market in district 3. Medical supplies needed.",
            category: "SUPPLIES",
            dangerLevel: "MEDIUM",
            sector: 3,
            userId: alice.id,
            verifiedCount: 0,
            unverifiedCount: 1,
        },
    });

    const signal5 = await prisma.signal.create({
        data: {
            title: "Medical Team Available",
            content: "Dr. Harris and team available for emergency treatment. Basic supplies in stock.",
            category: "MEDICAL",
            dangerLevel: "LOW",
            sector: 4,
            userId: diana.id,
            verifiedCount: 2,
            unverifiedCount: 0,
        },
    });

    const signal6 = await prisma.signal.create({
        data: {
            title: "Creature Sighting",
            content: "Mutant creatures spotted near sector boundary. Multiple reports. Extreme caution advised.",
            category: "DANGER",
            dangerLevel: "CRITICAL",
            sector: 6,
            userId: eve.id,
            verifiedCount: 2,
            unverifiedCount: 0,
        },
    });

    const signal7 = await prisma.signal.create({
        data: {
            title: "Evacuation Route Blocked",
            content: "Main tunnel to sector 9 collapsed. Alternative routes needed.",
            category: "EVACUATION",
            dangerLevel: "HIGH",
            sector: 8,
            userId: frank.id,
            verifiedCount: 1, // frank only (alice removed as mod)
            unverifiedCount: 0,
        },
    });

    const signal8 = await prisma.signal.create({
        data: {
            title: "Food Cache Located",
            content: "Pre-war supplies found in bunker. Estimated 2 months supply for small group.",
            category: "SUPPLIES",
            dangerLevel: "LOW",
            sector: 2,
            userId: diana.id,
            verifiedCount: 2,
            unverifiedCount: 0,
        },
    });

    const signal9 = await prisma.signal.create({
        data: {
            title: "Power Generator Working",
            content: "Old power plant operational. Limited energy but enough for basic needs.",
            category: "SUPPLIES",
            dangerLevel: "MEDIUM",
            sector: 5,
            userId: bob.id,
            verifiedCount: 1,
            unverifiedCount: 1,
        },
    });

    const signal10 = await prisma.signal.create({
        data: {
            title: "Gas Leak Detected",
            content: "Toxic gas seeping from old industrial site. Area marked hazardous.",
            category: "DANGER",
            dangerLevel: "HIGH",
            sector: 4,
            userId: eve.id,
            verifiedCount: 2,
            unverifiedCount: 0,
        },
    });

    const signal11 = await prisma.signal.create({
        data: {
            title: "Radio Tower Restored",
            content: "Communication system back online. Can receive broadcasts from other settlements.",
            category: "SUPPLIES",
            dangerLevel: "LOW",
            sector: 3,
            userId: charlie.id,
            verifiedCount: 1, // charlie only (alice removed as mod)
            unverifiedCount: 0,
        },
    });

    const signal12 = await prisma.signal.create({
        data: {
            title: "Group Moving to Sector 1",
            content: "Refugee group of 15 people heading to sector 1. Need assistance with supplies.",
            category: "EVACUATION",
            dangerLevel: "MEDIUM",
            sector: 1,
            userId: frank.id,
            verifiedCount: 2,
            unverifiedCount: 0,
        },
    });

    // Create verifications
    await prisma.verification.createMany({
        data: [
            // signal1: bob only (alice is mod, kept clean for testing)
            { signalId: signal1.id, userId: bob.id, status: "VERIFIED" },

            // signal2: no pre-votes (alice removed)

            { signalId: signal3.id, userId: charlie.id, status: "VERIFIED" },

            { signalId: signal4.id, userId: bob.id, status: "SUSPICIOUS" },

            { signalId: signal5.id, userId: diana.id, status: "VERIFIED" },
            { signalId: signal5.id, userId: frank.id, status: "VERIFIED" },

            { signalId: signal6.id, userId: eve.id, status: "VERIFIED" },
            { signalId: signal6.id, userId: bob.id, status: "VERIFIED" },

            // signal7: frank only (alice removed)
            { signalId: signal7.id, userId: frank.id, status: "VERIFIED" },

            { signalId: signal8.id, userId: diana.id, status: "VERIFIED" },
            { signalId: signal8.id, userId: charlie.id, status: "VERIFIED" },

            { signalId: signal9.id, userId: bob.id, status: "VERIFIED" },
            { signalId: signal9.id, userId: eve.id, status: "SUSPICIOUS" },

            { signalId: signal10.id, userId: eve.id, status: "VERIFIED" },
            { signalId: signal10.id, userId: diana.id, status: "VERIFIED" },

            // signal11: charlie only (alice removed)
            { signalId: signal11.id, userId: charlie.id, status: "VERIFIED" },

            { signalId: signal12.id, userId: frank.id, status: "VERIFIED" },
            { signalId: signal12.id, userId: bob.id, status: "VERIFIED" },
        ],
    });

    console.log("✅ Seed data created successfully!");
    console.log("Created 6 users and 12 signals with verifications");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());