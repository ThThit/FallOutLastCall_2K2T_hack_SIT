# LAST CALL

## Post-Apocalypse Survivor Communication Platform

LAST CALL is a survivor communication network for a world where the internet is
unstable and information cannot always be trusted. Survivors broadcast emergency
signals, verify each other's reports, trade scarce resources, and preserve
memories before they decay. The apocalypse affects the app itself — signals and
memories visually corrupt over time, and unreliable reports are auto-removed.

This branch is the **full integrated build** of all four team features:

| Feature | Owner | What it does |
|---|---|---|
| **Survivor Signals** | Peter | Broadcast feed: create / edit / delete signals, comments, corruption decay, auto-expiry |
| **Trust & Verification** | thit | Verify/unverify voting, trust scores, reputation, flagging, moderator removal |
| **Resource Trading & Vault** | vivi | Personal vault inventory + barter marketplace |
| **Memory Archive** | (member 4) | Preserve survivor memories that visually decay with age |

---

## Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS + Framer Motion (Vite)
- **Backend:** Express + TypeScript + Zod + Prisma ORM
- **Database:** SQLite
- **Integration:** Axios

---

## Setup & Running

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

Create the database and seed it:

```bash
npx prisma db push      # creates tables from the schema
npm run seed            # loads demo users, signals, memories
```

Start the backend:

```bash
npm run dev
# running on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# running on http://localhost:5173
```

> **Tip:** Re-run `npm run seed` any time you want to reset the demo data. If you
> see an "authentication" error after reseeding, just log out and log back in
> (the old session token becomes stale).

---

## Seed Accounts

The seed creates 6 survivors. **MEDIC-77 is the moderator.** Password for all
accounts is `password123`.

| Callsign | Password | Role | Sector | Reputation |
|---|---|---|---|---|
| MEDIC-77 | password123 | MODERATOR | 4 | 36 |
| OUTPOST-47 | password123 | USER | 3 | 18 |
| NOMAD-12 | password123 | USER | 6 | -3 |
| SENTINEL-9 | password123 | USER | 1 | 7 |
| PHOENIX-03 | password123 | USER | 5 | 28 |
| GUARDIAN-21 | password123 | USER | 2 | 42 |

The seed also creates **7 signals** aged across the corruption scale and **3 memory
archives** (aged 7 / 15 / 70 days) to showcase decay.

---

## Features & How to Test

### 1. Authentication + Sector

**Register**
1. Open `http://localhost:5173` → click **NEW SURVIVOR? REGISTER**
2. Enter a callsign (format `name#digits`, e.g. `scout#7`), a password, confirm it
3. Pick **YOUR SECTOR** (1–8) from the dropdown
4. Submit → you're logged in, sector saved to your profile

**Login** — enter `MEDIC-77` / `password123` → lands on the Signal Feed.

**Logout** — go to **ABOUT ME** → log out (clears your session).

---

### 2. Signal Feed — Peter (CRUD + corruption)

**Read** — the feed loads on login. EMERGENCY signals are pinned at the top with
an orange banner. Sort with **DATE / TRUST**. Only the signal list scrolls; the
header and controls stay fixed.

**Corruption decay** — older signals visually decay (characters replaced with `_`):
- < 1 day: clean
- 1–2.5 days: light
- 2.5–5 days: medium (+ flicker)
- 5–6.5 days: heavy
- 6.5 days+: severe + `[DATA CORRUPTION DETECTED]`

The seeded signals span all these levels.

**Broadcast (Create)**
1. Click **+ BROADCAST NEW SIGNAL**
2. Enter a message (max 288 chars), pick a sector, toggle **EMERGENCY** if urgent
3. Submit → appears at the top of the feed

**Edit / Delete (own signals)** — click **EDIT** on your own signal to update it,
or use the delete option in the edit modal.

**Comments** — click **COMMENTS** on any card to expand the thread, read comments,
and post a new one. Shows the first 3 with a **LOAD MORE** button.

---

### 3. Verification & Trust — thit

**Vote** — each card has **VERIFIED** / **UNVERIFIED** buttons (Reddit-style):
- Click to vote; click again to remove; click the other to switch
- Trust score recalculates live (verified / total %)

**Auto-delete misinformation** — when a signal's **unverified votes reach 10**, it
is automatically removed from the feed. The seeded **DRIFTER-66** signal sits at 9
unverified — one more UNVERIFIED vote deletes it.

**Reputation** — a survivor's reputation is computed from their signals'
verify/unverify counts and shown on their profile and the leaderboard.

**Leaderboard** — go to **SURVIVORS**; the Reputation Leaderboard lists the top
survivors by reputation.

**Flag** — click **FLAG** on any card → enter a reason → submit. The card shows a
**FLAGGED** state.

**Moderator removal** — log in as **MEDIC-77** (moderator); a **REMOVE** button
appears on cards. Click it → confirm → the signal is soft-deleted and leaves the feed.

---

### 4. Resource Trading & Vault — vivi

**Vault** — go to **VAULT**. Shows your inventory with total items, active trades,
and vault value. **ADD ITEM** to stock resources. Items whose count hits **0 are
removed** automatically.

**Market** — go to **MARKET**:
- Shows **other survivors'** active listings (never your own)
- Filter by **CONDITION**; supply/demand alerts at the top
- **MARKET / MY LISTINGS** toggle — switch to see your own listings
- On your own listings the button is **REMOVE FROM MARKET** (not accept)

**Make a trade**
1. List an item from your vault for trade (reserves it from your vault count)
2. As a **different** survivor with a matching item, click **ACCEPT TRADE**
3. On success the listing is removed from the market and items transfer

> To test a full trade: log in as one user, list an item; then log in as another
> user (different account) holding the requested resource, and accept it.

---

### 5. Memory Archive — (member 4)

Go to **ARCHIVE**:
- Browse preserved memories; older entries are visually corrupted (decay scales
  with age — the seed has memories at 7 / 15 / 70 days)
- **Submit Memory** to add a new entry (title, alias, category, content, emotion)
- Filter by category / date; restore decayed memories

---

### 6. Survivor Profile (sector overview)

Go to **SURVIVORS**:
- Shows **your sector number** and a sector overview: survivors in your sector,
  active signals, and emergencies in that sector
- Lists the survivors registered in your sector
- The Reputation Leaderboard appears below

---

## Notes

- The app stays on the **same section across page reloads**.
- The whole app is locked to the viewport — only the content area scrolls.
- All four features share one unified database (signals use cuid IDs; trust,
  trade/vault, and memory tables attach alongside).
