<<<<<<< HEAD
// Unified seed — Peter's corruption-level signal showcase, linked to thit's users
// so reputation/profile/leaderboard have real data.
import prisma from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  // Clear existing data (respect FK order)
  await prisma.verification.deleteMany();
  await prisma.comment.deleteMany();
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

  console.log("Seed complete — 6 users + 7 signals + comments.");
  console.log("  DRIFTER-66 has 9 unverified — one more UNVERIFIED vote auto-deletes it.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
=======
import prisma from "../src/lib/prisma.ts";
async function main() {
  // Skip if there's already data
  const existing = await prisma.memoryArchive.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} memories. Skipping seed.`);
    return;
  }

  console.log("Seeding memory archive...");

  const memories = [
    {
      title: "Day One After The Signal Dropped",
      survivorAlias: "NOMAD-7",
      category: "Diary",
      emotionalTag: "Fear",
      content:
        "We lost contact with the central tower at 0300. Nobody said a word for the first hour. Then someone started crying and we all understood it was real. I don't know how many of us are left out there. I'm writing this down so at least the words survive, even if we don't.",
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    },
    {
      title: "Found Shelter Near the Eastern Bridge",
      survivorAlias: "OUTPOST-12",
      category: "Survival Story",
      emotionalTag: "Hope",
      content:
        "Three of us made it to the underpass. It's cold but the concrete blocks most of the wind. We have water from the overflow pipe and enough rations for maybe a week. If you're reading this: the eastern bridge is safe. The graffiti on the south pillar marks where we left supplies.",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago — low decay
    },
    {
      title: "To My Daughter, If You Ever Find This",
      survivorAlias: "GUARDIAN-55",
      category: "Final Message",
      emotionalTag: "Loss",
      content:
        "Maya. If someone finds this and you're still out there — I made it to sector 4. I left the blue backpack at the old school. Your birthday gift is inside. I never stopped looking. I love you more than the last broadcast in the sky. Come find me at the water tower. I'll be there every morning at dawn.",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago — high decay
    },
    {
      title: "Water Source Map — Sector 3 to 6",
      survivorAlias: "SCOUT-VERA",
      category: "Historical Knowledge",
      emotionalTag: "Survival",
      content:
        "Confirmed clean water locations as of last week:\n- Underpass C7: overflow pipe, test negative\n- Hospital basement: filtration still running on backup power\n- Rooftop tank on Meridian St: 14th floor, access via fire escape\n\nAvoid the river district entirely. Contamination confirmed upstream.",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
    {
      title: "Static Log 003 — Recording From the Dark",
      survivorAlias: "RAVEN-9",
      category: "Audio Log",
      emotionalTag: "Fear",
      content:
        "[Recording begins mid-sentence] — can hear them moving outside. Three, maybe four. We've killed the lights. Don't know if they're scavengers or worse. Radio is too risky to broadcast now. If this log transmits automatically, we are in the basement of the old library on 5th. Do NOT approach with lights on. Signal with two short knocks, pause, one long. That's the code.",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      title: "We Built Something Real",
      survivorAlias: "PHOENIX-03",
      category: "Survival Story",
      emotionalTag: "Hope",
      content:
        "Forty-three survivors. That's how many we are now. We took over the old factory on the north edge of sector 2. Solar panels from the hardware store, rainwater collection on the roof, a rotating watch schedule. It's not much — but it's ours. We have a fire every night. People are starting to laugh again. If you're alone out there, find us. The door is open.",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      title: "What The City Looked Like Before",
      survivorAlias: "ELDER-MARCUS",
      category: "Historical Knowledge",
      emotionalTag: "Loss",
      content:
        "I'm old enough to remember the lights. Every night the skyline would glow orange and white from a thousand windows. Buses ran every 12 minutes. You could walk into any store and buy a coffee with a card. My grandchildren will never know that world. But I will write it down for them. Every detail I can remember. So they know what we're trying to rebuild.",
      date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 days ago — very high decay
    },
    {
      title: "Medicine Drop — Coordinates Attached",
      survivorAlias: "MEDIC-LENA",
      category: "Survival Story",
      emotionalTag: "Hope",
      content:
        "I've left a medical cache at the following location: two blocks north of the red water tower, inside the drainage culvert on the left side of the road. Sealed in a black bag. Contents: antibiotics, wound dressings, antiseptic wipes, and a manual for field surgery. Take what you need. Leave a note of what you took so the next person knows what's left. We take care of each other.",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago — minimal decay
    },
  ];

  for (const memory of memories) {
    await prisma.memoryArchive.create({ data: memory });
    console.log(`  ✓ "${memory.title}"`);
  }

  console.log(`\nSeeded ${memories.length} memories successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
>>>>>>> origin/MemoryArchive
