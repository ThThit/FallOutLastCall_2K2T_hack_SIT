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
