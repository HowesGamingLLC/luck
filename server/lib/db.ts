import { Pool, PoolClient, QueryResult } from "pg";

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Execute a query
 */
export async function query<T = any>(
  text: string,
  values?: any[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values);
}

/**
 * Execute a single row query
 */
export async function queryOne<T = any>(
  text: string,
  values?: any[],
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

/**
 * Execute a query and get all rows
 */
export async function queryAll<T = any>(
  text: string,
  values?: any[],
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  const client = await getClient();
  try {
    // Create all tables
    await client.query(`
      -- Games table
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        game_type VARCHAR(50) NOT NULL,
        category VARCHAR(50),
        enabled BOOLEAN DEFAULT true,
        min_entry_cost DECIMAL(10, 2),
        max_entry_cost DECIMAL(10, 2),
        currency_type VARCHAR(10) DEFAULT 'gc',
        house_edge DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Game configurations
      CREATE TABLE IF NOT EXISTS game_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        config_json JSONB,
        min_players INTEGER,
        max_players INTEGER,
        draw_frequency VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Game rounds
      CREATE TABLE IF NOT EXISTS game_rounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'registering',
        start_time TIMESTAMP,
        draw_time TIMESTAMP,
        end_time TIMESTAMP,
        server_seed VARCHAR(255),
        prize_pool_gc DECIMAL(12, 2) DEFAULT 0,
        prize_pool_sc DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Game entries
      CREATE TABLE IF NOT EXISTS game_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        entry_cost DECIMAL(10, 2),
        currency_type VARCHAR(10) DEFAULT 'gc',
        client_seed VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Game results
      CREATE TABLE IF NOT EXISTS game_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        outcome VARCHAR(50),
        payout_amount_gc DECIMAL(12, 2),
        payout_amount_sc DECIMAL(12, 2),
        verification_code VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Game payouts
      CREATE TABLE IF NOT EXISTS game_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        payout_amount_gc DECIMAL(12, 2),
        payout_amount_sc DECIMAL(12, 2),
        win_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Profiles
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        email VARCHAR(255),
        gold_coins_balance DECIMAL(12, 2) DEFAULT 0,
        sweep_coins_balance DECIMAL(12, 2) DEFAULT 0,
        gold_coins DECIMAL(12, 2) DEFAULT 0,
        sweep_coins DECIMAL(12, 2) DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        kyc_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Packages
      CREATE TABLE IF NOT EXISTS packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        gc INTEGER,
        bonus_sc INTEGER,
        price_cents INTEGER,
        active BOOLEAN DEFAULT true,
        description TEXT,
        color VARCHAR(50),
        icon VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        package_id UUID REFERENCES packages(id),
        amount_cents INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Transactions
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2),
        type VARCHAR(50),
        currency VARCHAR(10),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- RNG audit logs
      CREATE TABLE IF NOT EXISTS rng_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
        server_seed VARCHAR(255),
        client_seed VARCHAR(255),
        result_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Admin game actions (audit trail)
      CREATE TABLE IF NOT EXISTS admin_game_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id VARCHAR(255) NOT NULL,
        action VARCHAR(100),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Balance transactions
      CREATE TABLE IF NOT EXISTS balance_transactions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        amount_gc DECIMAL(12, 2),
        amount_sc DECIMAL(12, 2),
        reference_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indices for common queries
      CREATE INDEX IF NOT EXISTS idx_games_enabled ON games(enabled);
      CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
      CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON game_rounds(game_id);
      CREATE INDEX IF NOT EXISTS idx_rounds_status ON game_rounds(status);
      CREATE INDEX IF NOT EXISTS idx_entries_round_id ON game_entries(round_id);
      CREATE INDEX IF NOT EXISTS idx_entries_user_id ON game_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_entries_status ON game_entries(status);
      CREATE INDEX IF NOT EXISTS idx_results_round_id ON game_results(round_id);
      CREATE INDEX IF NOT EXISTS idx_results_user_id ON game_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_round_id ON game_payouts(round_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON game_payouts(user_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_status ON game_payouts(status);
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);

    console.log("[DB] Schema initialized successfully");
  } catch (error) {
    console.error("[DB] Error initializing schema:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log("[DB] Connection pool closed");
}

// Initialize schema on module load if in development
if (process.env.NODE_ENV !== "production") {
  initializeSchema().catch(console.error);
}
