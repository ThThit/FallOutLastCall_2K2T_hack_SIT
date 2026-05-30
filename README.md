# LAST CALL

## Post-Apocalypse Survivor Communication Platform

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

Run migrations and seed the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

Start the dev server:
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

---

## Seed Accounts

The seed creates 6 users. **ALICE is the moderator.**

| Username | Password | Role | Sector |
|---|---|---|---|
| ALICE | password123 | MODERATOR | 1 |
| BOB | password456 | USER | 2 |
| CHARLIE | password789 | USER | 3 |
| DIANA | password101 | USER | 4 |
| EVE | password202 | USER | 5 |
| FRANK | password303 | USER | 1 |

---

## Testing Implemented Features

### 1. Authentication

**Register a new account**
1. Open `http://localhost:5173`
2. Click **REGISTER** on the login screen
3. Enter a username and password → submit
4. You are automatically logged in

**Login with a seed account**
1. Enter `ALICE` / `password123` → login
2. You land on the Signal Feed

**Logout**
1. Go to **ABOUT ME** (sidebar or mobile nav)
2. Click **DISCONNECT & LOG OUT**

---

### 2. Signal Feed (CREATE + READ)

**View all signals**
- The Signal Feed loads automatically on login
- Signals show title, author callsign, sector, timestamp, trust score, and author reputation
- Sort by DATE or TRUST SCORE using the controls at the top

**Broadcast a new signal**
1. Click **BROADCAST NEW SIGNAL**
2. Fill in title, content, danger level, category
3. Submit — the new signal appears at the top of the feed

---

### 3. Verification Voting (CREATE)

Each signal card has three vote buttons.

**Vote on a signal**
1. Click **VERIFIED**, **SUSPICIOUS**, or **OUTDATED** on any signal card
2. The trust score and vote counts animate to the new values
3. The verification status updates (VERIFIED / SUSPICIOUS / UNVERIFIED)
4. Your vote is shown: *You voted: VERIFIED*
5. Buttons lock after voting — one vote per user per signal

**Trigger auto-delete**
1. Log in as three different users (BOB, CHARLIE, DIANA in separate browsers / incognito)
2. Each votes **SUSPICIOUS** or **OUTDATED** on the same signal
3. On the 3rd vote, if suspicious votes outnumber verified votes and reach 3+, the signal flashes red and is removed from the feed automatically

---

### 4. Trust Details (READ)

**View per-signal trust statistics**
1. Click **TRUST DETAILS** at the bottom of any signal card
2. The panel expands and fetches live data, showing:
   - Animated trust meter bar (0–100%)
   - Confidence score (Laplace-smoothed)
   - Reliability badge: `TRUSTED / HIGH / MEDIUM / LOW / UNVERIFIED`
   - Community consensus badge
   - Vote breakdown bars (VERIFIED / SUSPICIOUS / OUTDATED)
   - Verifier history: each voter's callsign, vote type, and reputation score

---

### 5. Reputation Leaderboard (READ)

1. Go to the **SURVIVORS** section (sidebar)
2. The **Reputation Leaderboard** loads below the profile card
3. Shows top 10 survivors ranked by reputation score
4. Each entry shows: rank, username, MOD badge if moderator, sector, signals sent, verifications made, animated reputation bar

---

### 6. Flag a Signal

Any logged-in user can flag a signal for moderator review.

1. Find the **FLAG** button in the status bar at the bottom of any signal card
2. Click it — a modal appears asking for a reason
3. Enter a reason and click **SUBMIT FLAG**
4. The card gains a red top border and a **FLAGGED** badge
5. The FLAG button disappears after flagging

---

### 7. Moderator Actions (DELETE)

Log in as **ALICE** (MODERATOR) to access these controls.

**Clear verifications**
1. Find **CLEAR VOTES** in the bottom status bar of any signal card (visible only to mods)
2. Click it — a confirmation dialog appears with a warning
3. Confirm — vote counts reset to 0 and trust score clears

**Delete a signal**
1. Find **DELETE** in the bottom status bar
2. Click it — a red confirmation dialog with a pulsing overlay appears
3. Confirm — the card flashes **SIGNAL REMOVED** in red, then slides out and disappears from the feed

---

### 8. Account Info

1. Go to **ABOUT ME** in the sidebar
2. The account panel shows live data for the logged-in user:
   - Username and role (color-coded)
   - Sector, reputation score, signals sent, verifications made
   - Trusted signal count and accuracy percentage

---