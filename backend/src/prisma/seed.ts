import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing");

const adapter = new PrismaLibSql({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.trade.deleteMany();
  await prisma.vaultItem.deleteMany();
  await prisma.signalVerification.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash("password123", 10);

  const ghost = await prisma.user.create({
    data: { username: "GHOST#001", password, reputationScore: 42 },
  });
  const nova = await prisma.user.create({
    data: { username: "NOVA#002", password, reputationScore: 27 },
  });
  const viper = await prisma.user.create({
    data: { username: "VIPER#003", password, reputationScore: 15 },
  });

  console.log("✅ Users created");

  // Vault items for ghost#001
  const ghostItems = await Promise.all([
    prisma.vaultItem.create({
      data: {
        resourceName: "Antibiotics",
        quantity: 12,
        condition: "PRISTINE",
        category: "MEDICINE",
        acquiredDate: new Date("2026-05-01"),
        userId: ghost.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Canned Beans",
        quantity: 30,
        condition: "GOOD",
        category: "FOOD",
        acquiredDate: new Date("2026-05-10"),
        userId: ghost.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Diesel Fuel",
        quantity: 5,
        condition: "GOOD",
        category: "FUEL",
        acquiredDate: new Date("2026-05-15"),
        userId: ghost.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "9mm Ammo",
        quantity: 80,
        condition: "PRISTINE",
        category: "AMMO",
        acquiredDate: new Date("2026-05-20"),
        userId: ghost.id,
      },
    }),
  ]);

  // Vault items for nova#002
  const novaItems = await Promise.all([
    prisma.vaultItem.create({
      data: {
        resourceName: "AA Batteries",
        quantity: 24,
        condition: "PRISTINE",
        category: "BATTERIES",
        acquiredDate: new Date("2026-05-05"),
        userId: nova.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Wrench Set",
        quantity: 2,
        condition: "WORN",
        category: "TOOLS",
        acquiredDate: new Date("2026-05-12"),
        userId: nova.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Engine Parts",
        quantity: 3,
        condition: "DAMAGED",
        category: "PARTS",
        acquiredDate: new Date("2026-05-18"),
        userId: nova.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "MRE Rations",
        quantity: 15,
        condition: "GOOD",
        category: "FOOD",
        acquiredDate: new Date("2026-05-22"),
        userId: nova.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Morphine",
        quantity: 4,
        condition: "PRISTINE",
        category: "MEDICINE",
        acquiredDate: new Date("2026-05-25"),
        userId: nova.id,
      },
    }),
  ]);

  // Vault items for viper#003
  const viperItems = await Promise.all([
    prisma.vaultItem.create({
      data: {
        resourceName: "Shotgun Shells",
        quantity: 40,
        condition: "GOOD",
        category: "AMMO",
        acquiredDate: new Date("2026-05-08"),
        userId: viper.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Gasoline",
        quantity: 10,
        condition: "GOOD",
        category: "FUEL",
        acquiredDate: new Date("2026-05-14"),
        userId: viper.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Bandages",
        quantity: 20,
        condition: "PRISTINE",
        category: "MEDICINE",
        acquiredDate: new Date("2026-05-19"),
        userId: viper.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "Tactical Flashlight",
        quantity: 1,
        condition: "WORN",
        category: "TOOLS",
        acquiredDate: new Date("2026-05-23"),
        userId: viper.id,
      },
    }),
    prisma.vaultItem.create({
      data: {
        resourceName: "C Cell Batteries",
        quantity: 16,
        condition: "GOOD",
        category: "BATTERIES",
        acquiredDate: new Date("2026-05-27"),
        userId: viper.id,
      },
    }),
  ]);

  console.log("✅ Vault items created");

  // Decrement vault quantities that we'll use for trades
  // ghost offers 4 antibiotics → update vault to reflect trade locked qty
  await prisma.vaultItem.update({
    where: { id: ghostItems[0].id },
    data: { quantity: { decrement: 4 } },
  });
  await prisma.vaultItem.update({
    where: { id: ghostItems[1].id },
    data: { quantity: { decrement: 10 } },
  });
  await prisma.vaultItem.update({
    where: { id: novaItems[0].id },
    data: { quantity: { decrement: 8 } },
  });
  await prisma.vaultItem.update({
    where: { id: novaItems[4].id },
    data: { quantity: { decrement: 2 } },
  });
  await prisma.vaultItem.update({
    where: { id: viperItems[0].id },
    data: { quantity: { decrement: 20 } },
  });
  await prisma.vaultItem.update({
    where: { id: viperItems[1].id },
    data: { quantity: { decrement: 3 } },
  });

  // Active trades
  await Promise.all([
    prisma.trade.create({
      data: {
        resourceName: "Antibiotics",
        quantity: 4,
        condition: "PRISTINE",
        category: "MEDICINE",
        requestedItem: "BATTERIES",
        requestedQuantity: 8,
        traderName: "GHOST#001",
        status: "ACTIVE",
        creatorId: ghost.id,
        vaultItemId: ghostItems[0].id,
      },
    }),
    prisma.trade.create({
      data: {
        resourceName: "Canned Beans",
        quantity: 10,
        condition: "GOOD",
        category: "FOOD",
        requestedItem: "AMMO",
        requestedQuantity: 20,
        traderName: "GHOST#001",
        location: "Sector 7, Gate B",
        status: "ACTIVE",
        creatorId: ghost.id,
        vaultItemId: ghostItems[1].id,
      },
    }),
    prisma.trade.create({
      data: {
        resourceName: "AA Batteries",
        quantity: 8,
        condition: "PRISTINE",
        category: "BATTERIES",
        requestedItem: "MEDICINE",
        requestedQuantity: 3,
        traderName: "NOVA#002",
        location: "Central Hub",
        status: "ACTIVE",
        creatorId: nova.id,
        vaultItemId: novaItems[0].id,
      },
    }),
    prisma.trade.create({
      data: {
        resourceName: "Morphine",
        quantity: 2,
        condition: "PRISTINE",
        category: "MEDICINE",
        requestedItem: "FUEL",
        requestedQuantity: 3,
        traderName: "NOVA#002",
        status: "ACTIVE",
        creatorId: nova.id,
        vaultItemId: novaItems[4].id,
      },
    }),
    prisma.trade.create({
      data: {
        resourceName: "Shotgun Shells",
        quantity: 20,
        condition: "GOOD",
        category: "AMMO",
        requestedItem: "FOOD",
        requestedQuantity: 10,
        traderName: "VIPER#003",
        location: "Outpost Delta",
        status: "ACTIVE",
        creatorId: viper.id,
        vaultItemId: viperItems[0].id,
      },
    }),
    prisma.trade.create({
      data: {
        resourceName: "Gasoline",
        quantity: 3,
        condition: "GOOD",
        category: "FUEL",
        requestedItem: "TOOLS",
        requestedQuantity: 1,
        traderName: "VIPER#003",
        status: "ACTIVE",
        creatorId: viper.id,
        vaultItemId: viperItems[1].id,
      },
    }),
  ]);

  console.log("✅ Trades created");
  console.log("\n🎉 Seed complete!");
  console.log("\nTest accounts (password: password123):");
  console.log("  GHOST#001 — 4 vault items, 2 active trades");
  console.log("  NOVA#002  — 5 vault items, 2 active trades");
  console.log("  VIPER#003 — 5 vault items, 2 active trades");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
