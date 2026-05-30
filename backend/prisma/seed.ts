import prisma from "../src/lib/prisma.js";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  await prisma.comment.deleteMany();
  await prisma.signal.deleteMany();

  // EMERGENCY — fresh, always pinned at top
  const s1 = await prisma.signal.create({
    data: {
      authorName: "MEDIC-77",
      content: "Medical emergency at sector 4 checkpoint. Multiple wounded. Need supplies urgently.",
      sector: 4,
      priority: "EMERGENCY",
      trustScore: 92,
      verifiedCount: 38,
      unverifiedCount: 2,
      createdAt: daysAgo(0.05),
    },
  });

  // 0.1 DAYS OLD — no corruption, clean
  const s2 = await prisma.signal.create({
    data: {
      authorName: "OUTPOST-47",
      content: "Safe shelter confirmed under metro station. Clean water source. Room for 8 more survivors.",
      sector: 3,
      priority: "STANDARD",
      trustScore: 78,
      verifiedCount: 23,
      unverifiedCount: 5,
      createdAt: daysAgo(0.1),
    },
  });

  // 1.5 DAYS OLD — light corruption (15%)
  const s3 = await prisma.signal.create({
    data: {
      authorName: "NOMAD-12",
      content: "Water supply contaminated in River District. Multiple casualties reported. Do not drink.",
      sector: 6,
      priority: "STANDARD",
      trustScore: 45,
      verifiedCount: 12,
      unverifiedCount: 15,
      createdAt: daysAgo(1.5),
    },
  });

  // 3.5 DAYS OLD — medium corruption (30%) + flicker
  const s4 = await prisma.signal.create({
    data: {
      authorName: "SENTINEL-9",
      content: "Supply cache located at old factory in north sector. Medication, fuel canisters, radio parts inside.",
      sector: 1,
      priority: "STANDARD",
      trustScore: 62,
      verifiedCount: 18,
      unverifiedCount: 11,
      createdAt: daysAgo(3.5),
    },
  });

  // 5.5 DAYS OLD — heavy corruption (50%) + flicker
  const s5 = await prisma.signal.create({
    data: {
      authorName: "PHOENIX-03",
      content: "Evacuation route through tunnel C is clear. Checkpoint at south gate. Bring identification documents.",
      sector: 5,
      priority: "STANDARD",
      trustScore: 85,
      verifiedCount: 34,
      unverifiedCount: 6,
      createdAt: daysAgo(5.5),
    },
  });

  // 6.8 DAYS OLD — severe corruption (70%) + DATA CORRUPTION DETECTED
  const s6 = await prisma.signal.create({
    data: {
      authorName: "GUARDIAN-21",
      content: "Final message. Coordinates to safe zone transmitted. Follow the beacon signal. Do not stop moving.",
      sector: 2,
      priority: "STANDARD",
      trustScore: 91,
      verifiedCount: 45,
      unverifiedCount: 3,
      createdAt: daysAgo(6.8),
    },
  });

  // Add comments
  await prisma.comment.createMany({
    data: [
      {
        signalId: s1.id,
        authorName: "RAVEN-47",
        content: "En route. ETA 20 minutes. Hold on.",
        createdAt: daysAgo(0.03),
      },
      {
        signalId: s2.id,
        authorName: "GUARDIAN-21",
        content: "Confirmed. Water tested clean. Good location.",
        createdAt: daysAgo(0.08),
      },
      {
        signalId: s2.id,
        authorName: "NOMAD-45",
        content: "How is the security situation there?",
        createdAt: daysAgo(0.05),
      },
      {
        signalId: s3.id,
        authorName: "MEDIC-77",
        content: "Can confirm casualties. Do NOT drink from that source.",
        createdAt: daysAgo(1.3),
      },
      {
        signalId: s5.id,
        authorName: "RAVEN-47",
        content: "What is your exact location? I have medical supplies.",
        createdAt: daysAgo(5.3),
      },
      {
        signalId: s5.id,
        authorName: "PHOENIX-03",
        content: "Abandoned warehouse, north side. Hurry.",
        createdAt: daysAgo(5.2),
      },
    ],
  });

  console.log("Seed complete — 6 signals across all corruption levels.");
  console.log("  EMERGENCY  — fresh, pinned at top");
  console.log("  0.1d old   — no corruption");
  console.log("  1.5d old   — light corruption (15%)");
  console.log("  3.5d old   — medium corruption (30%) + flicker");
  console.log("  5.5d old   — heavy corruption (50%) + flicker");
  console.log("  6.8d old   — severe corruption (70%) + DATA CORRUPTION DETECTED");
}

main().catch(console.error).finally(() => prisma.$disconnect());
