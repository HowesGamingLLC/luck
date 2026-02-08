import { query, queryOne, queryAll, transaction, getClient } from "./db";
import type {
  Game,
  GameConfig,
  GameRound,
  GameEntry,
  GameResult,
  GamePayout,
  Profile,
  Package,
  Order,
  Transaction,
  RngAuditLog,
  AdminGameAction,
  BalanceTransaction,
} from "./db-types";

/**
 * Games queries
 */
export const gamesQueries = {
  async getAll(
    enabled?: boolean,
    category?: string,
    offset = 0,
    limit = 20,
  ): Promise<{ data: Game[]; count: number }> {
    let sql = "SELECT * FROM games WHERE 1=1";
    const params: any[] = [];

    if (enabled !== undefined) {
      sql += ` AND enabled = $${params.length + 1}`;
      params.push(enabled);
    }

    if (category) {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const data = await queryAll<Game>(sql, params);
    return { data, count: data.length };
  },

  async getById(id: string): Promise<Game | null> {
    return queryOne<Game>("SELECT * FROM games WHERE id = $1", [id]);
  },

  async create(game: Partial<Game>): Promise<Game> {
    const sql = `
      INSERT INTO games (name, description, game_type, category, enabled, min_entry_cost, 
        max_entry_cost, currency_type, house_edge)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    return queryOne<Game>(sql, [
      game.name,
      game.description,
      game.game_type,
      game.category,
      game.enabled !== false,
      game.min_entry_cost,
      game.max_entry_cost,
      game.currency_type || "gc",
      game.house_edge,
    ]) as Promise<Game>;
  },

  async update(id: string, updates: Partial<Game>): Promise<Game | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE games SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<Game>(sql, [id, ...values]);
  },
};

/**
 * Game rounds queries
 */
export const roundsQueries = {
  async getByGameId(gameId: string, status?: string[]): Promise<GameRound[]> {
    let sql = "SELECT * FROM game_rounds WHERE game_id = $1";
    const params: any[] = [gameId];

    if (status && status.length > 0) {
      const placeholders = status.map((_, i) => `$${i + 2}`).join(",");
      sql += ` AND status IN (${placeholders})`;
      params.push(...status);
    }

    sql += " ORDER BY created_at DESC";
    return queryAll<GameRound>(sql, params);
  },

  async getById(id: string): Promise<GameRound | null> {
    return queryOne<GameRound>("SELECT * FROM game_rounds WHERE id = $1", [id]);
  },

  async create(round: Partial<GameRound>): Promise<GameRound> {
    const sql = `
      INSERT INTO game_rounds (game_id, status, start_time, draw_time, end_time, 
        server_seed, prize_pool_gc, prize_pool_sc)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    return queryOne<GameRound>(sql, [
      round.game_id,
      round.status || "registering",
      round.start_time,
      round.draw_time,
      round.end_time,
      round.server_seed,
      round.prize_pool_gc || 0,
      round.prize_pool_sc || 0,
    ]) as Promise<GameRound>;
  },

  async update(
    id: string,
    updates: Partial<GameRound>,
  ): Promise<GameRound | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE game_rounds SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<GameRound>(sql, [id, ...values]);
  },

  async getActiveRound(gameId: string): Promise<GameRound | null> {
    const sql = `
      SELECT * FROM game_rounds 
      WHERE game_id = $1 AND status IN ('registering', 'live')
      ORDER BY created_at DESC LIMIT 1
    `;
    return queryOne<GameRound>(sql, [gameId]);
  },
};

/**
 * Game entries queries
 */
export const entriesQueries = {
  async getByRoundId(roundId: string, status?: string): Promise<GameEntry[]> {
    let sql = "SELECT * FROM game_entries WHERE round_id = $1";
    const params: any[] = [roundId];

    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }

    return queryAll<GameEntry>(sql, params);
  },

  async countByRoundId(roundId: string, status?: string): Promise<number> {
    let sql = "SELECT COUNT(*) as count FROM game_entries WHERE round_id = $1";
    const params: any[] = [roundId];

    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }

    const result = await queryOne<{ count: string }>(sql, params);
    return parseInt(result?.count || "0", 10);
  },

  async getByUserId(userId: string): Promise<GameEntry[]> {
    return queryAll<GameEntry>(
      `SELECT * FROM game_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
  },

  async create(entry: Partial<GameEntry>): Promise<GameEntry> {
    const sql = `
      INSERT INTO game_entries (round_id, user_id, status, entry_cost, currency_type, client_seed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    return queryOne<GameEntry>(sql, [
      entry.round_id,
      entry.user_id,
      entry.status || "active",
      entry.entry_cost,
      entry.currency_type || "gc",
      entry.client_seed,
    ]) as Promise<GameEntry>;
  },

  async update(
    id: string,
    updates: Partial<GameEntry>,
  ): Promise<GameEntry | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE game_entries SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<GameEntry>(sql, [id, ...values]);
  },

  async countRecentByUser(userId: string, minutes: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM game_entries 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute' * $2
    `;
    const result = await queryOne<{ count: string }>(sql, [userId, minutes]);
    return parseInt(result?.count || "0", 10);
  },
};

/**
 * Game payouts queries
 */
export const payoutsQueries = {
  async getByRoundId(roundId: string): Promise<GamePayout[]> {
    return queryAll<GamePayout>(
      "SELECT * FROM game_payouts WHERE round_id = $1",
      [roundId],
    );
  },

  async getByRoundAndUser(
    roundId: string,
    userId: string,
  ): Promise<GamePayout | null> {
    return queryOne<GamePayout>(
      "SELECT * FROM game_payouts WHERE round_id = $1 AND user_id = $2",
      [roundId, userId],
    );
  },

  async create(payout: Partial<GamePayout>): Promise<GamePayout> {
    const sql = `
      INSERT INTO game_payouts (round_id, user_id, payout_amount_gc, payout_amount_sc, win_type, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    return queryOne<GamePayout>(sql, [
      payout.round_id,
      payout.user_id,
      payout.payout_amount_gc,
      payout.payout_amount_sc,
      payout.win_type,
      payout.status || "pending",
    ]) as Promise<GamePayout>;
  },

  async update(
    id: string,
    updates: Partial<GamePayout>,
  ): Promise<GamePayout | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE game_payouts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<GamePayout>(sql, [id, ...values]);
  },
};

/**
 * Profiles queries
 */
export const profilesQueries = {
  async getByUserId(userId: string): Promise<Profile | null> {
    return queryOne<Profile>("SELECT * FROM profiles WHERE user_id = $1", [
      userId,
    ]);
  },

  async getOrCreate(userId: string): Promise<Profile> {
    const existing = await profilesQueries.getByUserId(userId);
    if (existing) return existing;

    const sql = `
      INSERT INTO profiles (user_id, gold_coins_balance, sweep_coins_balance, gold_coins, sweep_coins)
      VALUES ($1, 0, 0, 0, 0)
      RETURNING *
    `;
    return queryOne<Profile>(sql, [userId]) as Promise<Profile>;
  },

  async update(
    userId: string,
    updates: Partial<Profile>,
  ): Promise<Profile | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`;
    return queryOne<Profile>(sql, [userId, ...values]);
  },
};

/**
 * Game results queries
 */
export const resultsQueries = {
  async getByRoundId(roundId: string): Promise<GameResult[]> {
    return queryAll<GameResult>(
      "SELECT * FROM game_results WHERE round_id = $1",
      [roundId],
    );
  },

  async create(result: Partial<GameResult>): Promise<GameResult> {
    const sql = `
      INSERT INTO game_results (round_id, user_id, outcome, payout_amount_gc, 
        payout_amount_sc, verification_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    return queryOne<GameResult>(sql, [
      result.round_id,
      result.user_id,
      result.outcome,
      result.payout_amount_gc,
      result.payout_amount_sc,
      result.verification_code,
    ]) as Promise<GameResult>;
  },
};

/**
 * Packages queries
 */
export const packagesQueries = {
  async getAll(): Promise<Package[]> {
    return queryAll<Package>(
      "SELECT * FROM packages WHERE active = true ORDER BY price_cents ASC",
    );
  },

  async getById(id: string): Promise<Package | null> {
    return queryOne<Package>("SELECT * FROM packages WHERE id = $1", [id]);
  },

  async create(pkg: Partial<Package>): Promise<Package> {
    const sql = `
      INSERT INTO packages (name, gc, bonus_sc, price_cents, active, description, color, icon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    return queryOne<Package>(sql, [
      pkg.name,
      pkg.gc,
      pkg.bonus_sc,
      pkg.price_cents,
      pkg.active !== false,
      pkg.description,
      pkg.color,
      pkg.icon,
    ]) as Promise<Package>;
  },

  async update(id: string, updates: Partial<Package>): Promise<Package | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE packages SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<Package>(sql, [id, ...values]);
  },
};

/**
 * RNG audit logs queries
 */
export const rngQueries = {
  async create(log: Partial<RngAuditLog>): Promise<RngAuditLog> {
    const sql = `
      INSERT INTO rng_audit_logs (game_id, round_id, server_seed, client_seed, result_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return queryOne<RngAuditLog>(sql, [
      log.game_id,
      log.round_id,
      log.server_seed,
      log.client_seed,
      log.result_hash,
    ]) as Promise<RngAuditLog>;
  },
};

/**
 * Admin actions queries
 */
export const adminActionsQueries = {
  async getAll(offset = 0, limit = 20): Promise<AdminGameAction[]> {
    const sql = `
      SELECT * FROM admin_game_actions 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    return queryAll<AdminGameAction>(sql, [limit, offset]);
  },

  async create(action: Partial<AdminGameAction>): Promise<AdminGameAction> {
    const sql = `
      INSERT INTO admin_game_actions (admin_id, action, game_id, round_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return queryOne<AdminGameAction>(sql, [
      action.admin_id,
      action.action,
      action.game_id,
      action.round_id,
      action.details,
    ]) as Promise<AdminGameAction>;
  },
};

/**
 * Transactions queries
 */
export const transactionsQueries = {
  async getByUser(userId: string): Promise<Transaction[]> {
    return queryAll<Transaction>(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
  },

  async create(tx: Partial<Transaction>): Promise<Transaction> {
    const sql = `
      INSERT INTO transactions (user_id, amount, type, currency, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return queryOne<Transaction>(sql, [
      tx.user_id,
      tx.amount,
      tx.type,
      tx.currency,
      tx.description,
    ]) as Promise<Transaction>;
  },
};

/**
 * Orders queries
 */
export const ordersQueries = {
  async getByUser(userId: string): Promise<Order[]> {
    return queryAll<Order>(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
  },

  async create(order: Partial<Order>): Promise<Order> {
    const sql = `
      INSERT INTO orders (user_id, package_id, amount_cents, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return queryOne<Order>(sql, [
      order.user_id,
      order.package_id,
      order.amount_cents,
      order.status || "pending",
    ]) as Promise<Order>;
  },

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE orders SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return queryOne<Order>(sql, [id, ...values]);
  },
};

/**
 * Balance transactions queries
 */
export const balanceQueries = {
  async create(tx: Partial<BalanceTransaction>): Promise<BalanceTransaction> {
    const sql = `
      INSERT INTO balance_transactions (id, user_id, type, amount_gc, amount_sc, reference_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    return queryOne<BalanceTransaction>(sql, [
      tx.id,
      tx.user_id,
      tx.type,
      tx.amount_gc,
      tx.amount_sc,
      tx.reference_id,
      tx.status || "completed",
    ]) as Promise<BalanceTransaction>;
  },
};
