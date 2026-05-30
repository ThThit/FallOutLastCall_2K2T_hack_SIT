// Unified seed — Peter's corruption-level signal showcase, linked to thit's users
// so reputation/profile/leaderboard have real data.
import prisma from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  // Clear existing data (respect FK order — children before parents)
  await prisma.verification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.trade.deleteMany();      // vivi: references User + VaultItem
  await prisma.vaultItem.deleteMany();  // vivi: references User
  await prisma.signal.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("password123", 10);

  // Users (callsigns become real users so reputation shows on profiles)
  const mkUser = (username: string, sector: number, reputationScore: number, role: "USER" | "MODERATOR" | "ADMIN" = "USER") =>
    prisma.user.create({ data: { username, password: pw, sector, reputationScore, role } });

  const medic = await mkUser("MEDIC-77", 4, 36, "MODERATOR");
  const outpost = await mkUser("OUTPOST-47", 3, 18);
  const nomad = await mkUser("NOMAD-12", 6, -3);
  const sentinel = await mkUser("SENTINEL-9", 1, 7);
  const phoenix = await mkUser("PHOENIX-03", 5, 28);
  const guardian = await mkUser("GUARDIAN-21", 2, 42);

  // Signals — Peter's corruption showcase, each linked to its author user
  const s1 = await prisma.signal.create({
    data: {
      authorName: "MEDIC-77", userId: medic.id,
      content: "Medical emergency at sector 4 checkpoint. Multiple wounded. Need supplies urgently.",
      sector: 4, priority: "EMERGENCY", trustScore: 92, verifiedCount: 38, unverifiedCount: 2,
      createdAt: daysAgo(0.05),
    },
  });
  const s2 = await prisma.signal.create({
    data: {
      authorName: "OUTPOST-47", userId: outpost.id,
      content: "Safe shelter confirmed under metro station. Clean water source. Room for 8 more survivors.",
      sector: 3, priority: "STANDARD", trustScore: 78, verifiedCount: 23, unverifiedCount: 5,
      createdAt: daysAgo(0.1),
    },
  });
  const s3 = await prisma.signal.create({
    data: {
      authorName: "NOMAD-12", userId: nomad.id,
      content: "Water supply contaminated in River District. Multiple casualties reported. Do not drink.",
      sector: 6, priority: "STANDARD", trustScore: 60, verifiedCount: 12, unverifiedCount: 9,
      createdAt: daysAgo(1.5),
    },
  });
  const s4 = await prisma.signal.create({
    data: {
      authorName: "SENTINEL-9", userId: sentinel.id,
      content: "Supply cache located at old factory in north sector. Medication, fuel canisters, radio parts inside.",
      sector: 1, priority: "STANDARD", trustScore: 69, verifiedCount: 18, unverifiedCount: 8,
      createdAt: daysAgo(3.5),
    },
  });
  const s5 = await prisma.signal.create({
    data: {
      authorName: "PHOENIX-03", userId: phoenix.id,
      content: "Evacuation route through tunnel C is clear. Checkpoint at south gate. Bring identification documents.",
      sector: 5, priority: "STANDARD", trustScore: 85, verifiedCount: 34, unverifiedCount: 6,
      createdAt: daysAgo(5.5),
    },
  });
  await prisma.signal.create({
    data: {
      authorName: "GUARDIAN-21", userId: guardian.id,
      content: "Final message. Coordinates to safe zone transmitted. Follow the beacon signal. Do not stop moving.",
      sector: 2, priority: "STANDARD", trustScore: 91, verifiedCount: 45, unverifiedCount: 3,
      createdAt: daysAgo(6.8),
    },
  });

  // Test signal at 9 unverified — one more UNVERIFIED vote tips it over 10 → auto-delete
  await prisma.signal.create({
    data: {
      authorName: "DRIFTER-66", userId: medic.id,
      content: "Trade post open at the docks. Fair prices, no questions asked. Come unarmed.",
      sector: 5, priority: "STANDARD", trustScore: 30, verifiedCount: 4, unverifiedCount: 9,
      createdAt: daysAgo(0.2),
    },
  });

  // Comments
  await prisma.comment.createMany({
    data: [
      { signalId: s1.id, authorName: "RAVEN-47", content: "En route. ETA 20 minutes. Hold on.", createdAt: daysAgo(0.03) },
      { signalId: s2.id, authorName: "GUARDIAN-21", content: "Confirmed. Water tested clean. Good location.", createdAt: daysAgo(0.08) },
      { signalId: s2.id, authorName: "NOMAD-45", content: "How is the security situation there?", createdAt: daysAgo(0.05) },
      { signalId: s3.id, authorName: "MEDIC-77", content: "Can confirm casualties. Do NOT drink from that source.", createdAt: daysAgo(1.3) },
      { signalId: s5.id, authorName: "RAVEN-47", content: "What is your exact location? I have medical supplies.", createdAt: daysAgo(5.3) },
      { signalId: s5.id, authorName: "PHOENIX-03", content: "Abandoned warehouse, north side. Hurry.", createdAt: daysAgo(5.2) },
    ],
  });

  // Memory Archive showcase — entries aged to show decay progression
  await prisma.memoryArchive.deleteMany();
  await prisma.memoryArchive.create({
    data: {
      title: "Found Shelter Near the Eastern Bridge",
      survivorAlias: "OUTPOST-12",
      category: "Survival Story",
      emotionalTag: "Hope",
      content: "Three of us made it to the underpass. It's cold but the concrete blocks most of the wind. We have water from the overflow pipe and enough rations for maybe a week. If you're reading this: the eastern bridge is safe.",
      date: daysAgo(7),
    },
  });
  await prisma.memoryArchive.create({
    data: {
      title: "Water Source Map — Sector 3 to 6",
      survivorAlias: "SCOUT-VERA",
      category: "Historical Knowledge",
      emotionalTag: "Survival",
      content: "Confirmed clean water locations as of last week: Underpass C7 overflow pipe, hospital basement filtration, rooftop tank on Meridian St. Avoid the river district entirely.",
      date: daysAgo(15),
    },
  });
  await prisma.memoryArchive.create({
    data: {
      title: "To My Daughter, If You Ever Find This",
      survivorAlias: "GUARDIAN-55",
      category: "Final Message",
      emotionalTag: "Loss",
      content: "Maya. If someone finds this and you're still out there — I made it to sector 4. I left the blue backpack at the old school. I never stopped looking. Come find me at the water tower. I'll be there every morning at dawn.",
      date: daysAgo(70),
    },
  });

  console.log("Seed complete — 6 users + 7 signals + comments + 3 memory archives.");
  console.log("  DRIFTER-66 has 9 unverified — one more UNVERIFIED vote auto-deletes it.");
  console.log("  Memories aged 7d / 15d / 70d to show decay progression.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
