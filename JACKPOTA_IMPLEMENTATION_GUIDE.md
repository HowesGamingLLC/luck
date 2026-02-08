# Jackpota-Style Sweepstakes Gaming Platform

## MVP Implementation Guide

### 🎯 Project Overview

This is a comprehensive Iowa-compliant sweepstakes gaming platform featuring:

- Multiple game types (Pooled Draws, Instant Wins, Progressive Jackpots, Scheduled Draws)
- Dual currency system (Gold Coins for play-only, Sweep Coins for redeemable prizes)
- Server-side RNG with cryptographic security
- Provably-fair verification
- Admin control panel for game management
- Real-time game updates via WebSockets
- Atomic payout processing

---

## 📁 Project Structure

```
server/
├── gameEngine/
│   ├── GameEngine.ts              # Base game engine class
│   ├── PooledDrawEngine.ts        # Jackpot-style pooled draws ✅
│   ├── InstantWinEngine.ts        # Spin/instant win games
│   ├── ProgressiveJackpotEngine.ts # Linked prize pools
│   ├── ScheduledDrawEngine.ts     # Countdown draws
│   ├── SlotEngine.ts              # Slot machine games
│   ├── PokerEngine.ts             # Poker tournaments
│   ├── BingoEngine.ts             # Bingo games
│   └── TournamentEngine.ts        # Tournament structure
│
├── services/
│   ├── GameRegistry.ts            # Game factory & registration ✅
│   ├── RNGService.ts              # Cryptographic RNG ✅
│   ├── EntryValidationService.ts  # Entry validation ✅
│   └── PayoutService.ts           # Atomic payout processing ✅
│
├── routes/
│   ├── games.ts                   # Game APIs ✅
│   ├── adminGames.ts              # Admin control APIs ✅
│   └── [other routes]
│
├── migrations/
│   └── 001_create_games_tables.sql # Database schema ✅
│
└── lib/
    └── supabase.ts                # Database client

client/
├── pages/
│   ├── Games.tsx                  # Game listing page
│   ├── SlotsPage.tsx              # Slots game UI
│   └── [game pages]
│
├── components/
│   ├── GameLauncher.tsx           # Game entry modal
│   ├── PooledDrawGame.tsx         # Pooled draw UI
│   ├── InstantWinGame.tsx         # Instant win UI
│   └── AdminGamePanel.tsx         # Admin control UI
│
└── contexts/
    └── GameContext.tsx            # Game state management
```

---

## ✅ COMPLETED Components

### 1. Database Schema (`server/migrations/001_create_games_tables.sql`)

- Games table (all game types)
- GameConfigurations (per-game settings)
- GameRounds (individual draws/instances)
- GameEntries (player participation)
- GameResults (draw outcomes)
- GamePayouts (winner distributions)
- RNGAuditLogs (immutable fairness logs)
- AdminGameActions (admin audit trail)
- GameStatistics (analytics)

### 2. Game Registry (`server/services/GameRegistry.ts`)

- Factory pattern for game instantiation
- Type-safe game engine interface
- Game registration and lookup
- Support for 4+ game types

### 3. RNG Service (`server/services/RNGService.ts`)

- SHA256-based cryptographic RNG
- Provably-fair seed management
- Client seed validation
- Immutable audit logging
- Verification link generation
- Batch verification support

### 4. Entry Validation Service (`server/services/EntryValidationService.ts`)

- Balance verification
- Rate limiting (per minute/hour/day)
- Max entries per round enforcement
- Abuse detection (rapid entry patterns)
- User account validation
- Comprehensive error reporting

### 5. Payout Service (`server/services/PayoutService.ts`)

- Atomic transaction processing
- Rollback safety on partial failures
- Balance update tracking
- Transaction ID generation
- Payout statistics & reporting
- Failed payout retry mechanism

### 6. Game APIs (`server/routes/games.ts`)

- `GET /api/games` - List all games with filters
- `GET /api/games/:gameId` - Get game details + current round
- `POST /api/games` - Create new game (admin)
- `POST /api/games/entries/submit` - Submit entry
- `GET /api/games/rounds/:roundId/entries` - Get player entries
- `GET /api/games/rounds/:roundId/status` - Get round status
- `GET /api/games/:roundId/verify/:code` - Verify result (provably-fair)
- `GET /api/games/history` - Get user game history

### 7. Admin APIs (`server/routes/adminGames.ts`)

- `GET /api/admin/games/dashboard` - Dashboard stats
- `PUT /api/admin/games/:gameId/config` - Update game config
- `PUT /api/admin/games/:gameId/toggle` - Enable/disable game
- `POST /api/admin/games/rounds/:roundId/pause` - Pause round
- `POST /api/admin/games/rounds/:roundId/cancel` - Cancel & refund
- `GET /api/admin/games/rounds/:roundId/monitor` - Live monitoring
- `POST /api/admin/games/rounds/:roundId/draw` - Manual draw
- `POST /api/admin/games/payouts/adjust` - Adjust payout
- `GET /api/admin/games/rng/:roundId/verify` - RNG verification
- `GET /api/admin/audit-log` - Admin action history

### 8. Pooled Draw Engine (`server/gameEngine/PooledDrawEngine.ts`)

- Timed jackpot draws
- Server seed generation at round creation
- Entry processing with client seed hashing
- Cryptographic winner selection
- Automatic payout distribution
- Event emission for real-time updates

---

## ⏳ TODO: Next Phases

### Phase 2: Complete Game Engines

```
[ ] InstantWinEngine - Full implementation
[ ] ProgressiveJackpotEngine - Full implementation
[ ] ScheduledDrawEngine - Full implementation
[ ] WebSocket integration for all engines
```

### Phase 3: Frontend Game UIs

```
[ ] GameLauncher component
[ ] PooledDrawGame component
[ ] InstantWinGame component
[ ] ProgressiveJackpotDisplay component
[ ] AdminGameControlPanel
[ ] Real-time countdown timers
[ ] Live entry counters
[ ] Winner notifications
```

### Phase 4: Real-Time Infrastructure

```
[ ] WebSocket server setup
[ ] Redis pub/sub integration
[ ] Live game state broadcasting
[ ] Countdown synchronization
[ ] Entry acknowledgments
[ ] Winner announcements
```

### Phase 5: Deployment & Security

```
[ ] Database migration runner
[ ] JWT authentication integration
[ ] Rate limiting middleware
[ ] HTTPS enforcement
[ ] Environment configuration
[ ] Error monitoring (Sentry)
[ ] Analytics integration
```

---

## 🚀 Getting Started

### 1. Database Setup

First, apply the migration to your Supabase database:

```bash
# Option A: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of server/migrations/001_create_games_tables.sql
# 3. Run query

# Option B: Via CLI (if available)
supabase db push
```

### 2. Environment Setup

Add to `.env`:

```env
# Game Configuration
GAME_RNG_ALGORITHM=sha256
GAME_MAX_ENTRIES_PER_USER=100
GAME_MAX_CONCURRENT_ROUNDS=50
```

### 3. Test Game Creation

```bash
# Start dev server
pnpm dev

# Create a test game
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Jackpot",
    "description": "Win from accumulated prize pool",
    "gameType": "pooled_draw",
    "category": "jackpot",
    "config": {
      "entryFeeGc": 10,
      "entryFeeSc": 0.10,
      "maxEntriesPerUser": 50,
      "drawIntervalMinutes": 60,
      "rtpPercentage": 90
    }
  }'
```

### 4. Submit Entry

```bash
curl -X POST http://localhost:8080/api/games/entries/submit \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "{{GAME_ID}}",
    "roundId": "{{ROUND_ID}}",
    "clientSeed": "my_random_seed_12345",
    "currencyType": "GC"
  }'
```

---

## 🔒 Security Features Implemented

1. **Cryptographic RNG**: SHA256-based with server/client seeds
2. **Immutable Audit Logs**: All RNG operations logged to database
3. **Rate Limiting**: Per-minute, per-hour, per-day entry limits
4. **Abuse Detection**: Rapid entry pattern detection
5. **Balance Verification**: Always verify user has funds
6. **Atomic Transactions**: Payout failures are rolled back
7. **Admin Actions Logged**: All admin operations tracked
8. **Provably Fair**: Players can verify results independently

---

## 📊 Game Type Specifications

### Pooled Draw (Jackpot)

- **Entry Model**: Pay once, wait for draw
- **Draw Model**: Random selection from pool
- **Winner Model**: One or more winners split pool
- **Payout**: Immediate upon draw completion
- **Examples**: Daily Jackpot, Hourly Drawings

### Instant Win

- **Entry Model**: Pay, get immediate result
- **Draw Model**: RNG on entry submission
- **Winner Model**: Win or lose instantly
- **Payout**: Immediate if win
- **Examples**: Scratch cards, Spin wheels

### Progressive Jackpot

- **Entry Model**: Pay entry (contribution to jackpot)
- **Draw Model**: Random selection
- **Winner Model**: Hit jackpot (rare)
- **Payout**: Large prize to single winner
- **Examples**: Mega Millions style games

### Scheduled Draw

- **Entry Model**: Register before deadline
- **Draw Model**: Fixed time draw
- **Winner Model**: Random from entries
- **Payout**: Announced at draw time
- **Examples**: Evening draws, Weekly specials

---

## 🎮 Game Flow Examples

### Pooled Draw Flow

```
1. Round Created (T+0m)
   - Server seed generated
   - Registration opens

2. Entry Submitted (T+5m)
   - Balance checked
   - Client seed validated
   - Entry recorded
   - Prize pool updated

3. Draw Time (T+60m)
   - RNG executed with server + client seeds
   - Winners selected
   - Payouts created
   - Results logged

4. Winner Notification
   - Player sees win in history
   - Payout processed
   - Verification code available
```

### Instant Win Flow

```
1. Player clicks "Play"
   - Balance checked
   - Client seed requested

2. Spin/Click
   - Entry submitted with client seed
   - Server generates result immediately
   - Payout created if win
   - UI updates in real-time

3. Result Verification
   - Player can verify result was fair
   - Show server seed, client seed, final hash
```

---

## 📈 Metrics & Analytics

Track per-game:

- Total entries
- Unique players
- Prize pool size
- Actual RTP %
- Revenue (house edge)
- Winner distribution
- Average payout
- Player retention

---

## 🔄 Implementation Checklist

### Phase 1 (✅ DONE)

- [x] Database schema
- [x] Game registry
- [x] RNG service
- [x] Entry validation
- [x] Payout service
- [x] Game APIs
- [x] Admin APIs
- [x] Pooled draw engine

### Phase 2 (IN PROGRESS)

- [ ] Complete InstantWinEngine
- [ ] Complete ProgressiveJackpotEngine
- [ ] Complete ScheduledDrawEngine
- [ ] WebSocket server
- [ ] Redis integration
- [ ] Admin control panel UI
- [ ] Game launcher UI
- [ ] Real-time updates

### Phase 3 (PENDING)

- [ ] Frontend game components
- [ ] Provably-fair verification page
- [ ] Player history/stats
- [ ] Admin reporting
- [ ] Test coverage
- [ ] Performance testing
- [ ] Security audit
- [ ] Deployment scripts

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Create game
curl -X POST http://localhost:8080/api/games ...

# 2. Check game details
curl http://localhost:8080/api/games/{gameId}

# 3. Submit entry
curl -X POST http://localhost:8080/api/games/entries/submit ...

# 4. Check round status
curl http://localhost:8080/api/games/rounds/{roundId}/status

# 5. Verify result
curl http://localhost:8080/api/games/{roundId}/verify/{code}
```

### Unit Testing

```bash
pnpm test
```

---

## 📚 Additional Resources

- [Provably Fair Gaming](https://www.gaminginnovationgroup.com/blog/provably-fair-gaming-explained/)
- [Iowa Sweepstakes Regulations](https://icc.iowa.gov/)
- [SHA256 Hashing](https://en.wikipedia.org/wiki/SHA-2)
- [HMAC Security](https://en.wikipedia.org/wiki/HMAC)

---

## 🤝 Contributing

When adding new game types:

1. Create new engine file extending GameEngine interface
2. Register in GameRegistry
3. Create associated API routes
4. Add database config table entries
5. Test entry → draw → payout flow
6. Document game-specific rules

---

## 📞 Support

For implementation questions:

- Check existing game engines for patterns
- Review service implementations
- Test with curl before frontend integration
- Check database migration for schema details

---

**Last Updated**: February 2025
**Status**: MVP Phase 1 Complete - Ready for Phase 2 Implementation
