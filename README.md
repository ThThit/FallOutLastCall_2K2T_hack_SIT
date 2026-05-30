# LAST CALL
**Post-Apocalypse Survivor Resource Trading Network**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Tailwind + Framer Motion |
| Backend | Express + Prisma + SQLite |
| Auth | JWT (stored in localStorage) |

---

## Quick Start

```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npm run seed        # seeds 3 users + vault items + active trades
npm run dev         # http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

---

## Seed Accounts

| Username | Password | Vault | Active Trades |
|---|---|---|---|
| `GHOST#001` | `password123` | Antibiotics, Canned Beans, Diesel, Ammo | 2 |
| `NOVA#002` | `password123` | AA Batteries, Wrench Set, Engine Parts, MREs, Morphine | 2 |
| `VIPER#003` | `password123` | Shotgun Shells, Gasoline, Bandages, Flashlight, Batteries | 2 |

---

## Features & Test Guide

### Auth
- Register with format `NAME#123` (letters + `#` + digits)
- Login stores JWT + userId in localStorage
- Logout clears session

### Vault
1. Login → navigate to **PERSONAL VAULT**
2. Click **ADD ITEM** to add resources (name, qty, category, condition)
3. Click **LIST FOR TRADE** on any item to post it to the marketplace

### Marketplace — Create Trade
1. Navigate to **RESOURCE MARKET**
2. Click **POST TRADE OFFER**
3. Choose **FROM VAULT** (picks a vault item, deducts inventory on post) or **NEW OFFER** (free-form entry, no inventory deduction)
4. Fill in requested item, quantity, optional location, urgency level
5. Listing appears instantly in the grid

### Marketplace — Read
- Grid sorted by **urgency** (CRITICAL first) by default
- Filter by category pills, urgency/condition, free-text search
- **Scarcity banner** pulses when 2+ traders are requesting the same category
- **HOT** badge animates on high-demand listings
- **YOUR LISTING** badge on your own trades (amber border)

### Marketplace — Trade Between Users
1. Log in as `GHOST#001` — post a trade (or use the seeded ones)
2. Log out → log in as `NOVA#002`
3. Click **ACCEPT TRADE** on one of Ghost's listings
4. **SELECT** phase: vault items are listed; matching items show a **MATCH** badge; items with insufficient stock are greyed out
5. **CONFIRM** phase: shows exact breakdown — what you give vs. what you receive
6. **SUCCESS** screen confirms the exchange; both vaults update automatically

### Marketplace — Cancel & History
1. Login as any user who has active listings
2. Click **CANCEL LISTING** on your own trade card
3. **Confirmation popup** shows what will be cancelled and confirms vault items are restored
4. Click **CONFIRM CANCEL** — card animates out, inventory is restored
5. Scroll to bottom of marketplace — **TRADE HISTORY** accordion shows all completed/cancelled trades with status labels

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/vault              # user's vault items
POST   /api/vault              # add item
DELETE /api/vault/:id          # remove item

GET    /api/trade              # active listings (?sort=urgency|rarity|newest|quantity)
POST   /api/trade              # create listing (vault-linked or direct)
DELETE /api/trade/:id          # cancel listing (restores vault inventory)
POST   /api/trade/:id/accept   # accept trade (atomic vault swap)
GET    /api/trade/history      # completed + cancelled trades for current user
```

---

## Trade Flow (atomic)

```
Creator lists item  →  vault qty decremented
Acceptor accepts    →  acceptor gives requestedQty of their item
                    →  acceptor receives trade qty of creator's item
                    →  creator receives requestedQty of acceptor's item
                    →  trade marked COMPLETED
Creator cancels     →  vault qty restored, trade marked CANCELLED
```
