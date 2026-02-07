-- Games table: Master list of all game types
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game_type VARCHAR(50) NOT NULL, -- 'pooled_draw', 'instant_win', 'progressive_jackpot', 'scheduled_draw', 'table_game', 'bingo', 'lottery'
  category VARCHAR(50) NOT NULL, -- 'jackpot', 'instant', 'table', 'bingo', 'slots'
  enabled BOOLEAN DEFAULT true,
  thumbnail_url VARCHAR(500),
  rules_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_game_type CHECK (game_type IN ('pooled_draw', 'instant_win', 'progressive_jackpot', 'scheduled_draw', 'table_game', 'bingo', 'lottery'))
);

-- Game Configurations: Per-game settings
CREATE TABLE IF NOT EXISTS game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  entry_cost_gc DECIMAL(10, 2) DEFAULT 0, -- Gold Coins (play only)
  entry_cost_sc DECIMAL(10, 2) DEFAULT 0, -- Sweep Coins (redeemable)
  min_entries_per_user INTEGER DEFAULT 1,
  max_entries_per_user INTEGER DEFAULT 100,
  accepted_currencies VARCHAR(10)[] DEFAULT ARRAY['GC'], -- Which currencies allowed
  rtp_percentage DECIMAL(5, 2) DEFAULT 90, -- Return to Player
  house_edge DECIMAL(5, 2) DEFAULT 10,
  
  -- Pooled draw specific
  pool_draw_interval_minutes INTEGER,
  next_draw_time TIMESTAMP WITH TIME ZONE,
  max_pool_entries INTEGER,
  
  -- Scheduled draw specific
  scheduled_draw_time TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'custom'
  
  -- Progressive jackpot specific
  base_jackpot_gc DECIMAL(12, 2),
  base_jackpot_sc DECIMAL(12, 2),
  contribution_per_entry_percentage DECIMAL(5, 2),
  
  -- Table games specific
  min_bet_gc DECIMAL(10, 2),
  max_bet_gc DECIMAL(10, 2),
  min_bet_sc DECIMAL(10, 2),
  max_bet_sc DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(game_id)
);

-- Game Rounds: Individual game instances/draws
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES game_configs(id) ON DELETE CASCADE,
  round_number BIGINT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'registering', 'live', 'drawing', 'completed', 'cancelled'
  
  -- Timing
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  draw_time TIMESTAMP WITH TIME ZONE,
  drawn_at TIMESTAMP WITH TIME ZONE,
  
  -- Pool management
  total_entries INTEGER DEFAULT 0,
  unique_players INTEGER DEFAULT 0,
  prize_pool_gc DECIMAL(15, 2) DEFAULT 0,
  prize_pool_sc DECIMAL(15, 2) DEFAULT 0,
  progressive_jackpot_gc DECIMAL(15, 2),
  progressive_jackpot_sc DECIMAL(15, 2),
  
  -- RNG
  server_seed VARCHAR(512),
  server_seed_hash VARCHAR(512),
  client_seed_required BOOLEAN DEFAULT true,
  
  -- Results
  winning_entry_ids UUID[],
  winning_player_ids UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'registering', 'live', 'drawing', 'completed', 'cancelled')),
  INDEX idx_game_status (game_id, status),
  INDEX idx_draw_time (draw_time),
  INDEX idx_created (created_at)
);

-- Game Entries: Individual player entries in a round
CREATE TABLE IF NOT EXISTS game_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Entry details
  entry_number INTEGER, -- Sequential entry number for this round
  currency_type VARCHAR(2) NOT NULL CHECK (currency_type IN ('GC', 'SC')),
  entry_cost DECIMAL(10, 2) NOT NULL,
  
  -- Player data for the entry
  client_seed VARCHAR(256),
  client_seed_hash VARCHAR(512),
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'won', 'cancelled', 'refunded'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'won', 'cancelled', 'refunded')),
  INDEX idx_user_round (user_id, round_id),
  INDEX idx_round_created (round_id, created_at)
);

-- Game Results: Outcomes and winner determinations
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- RNG execution
  server_seed_used VARCHAR(512),
  final_seed_hash VARCHAR(512),
  seed_verification_hash VARCHAR(512),
  
  -- Outcome
  drawn_number_or_result JSONB, -- Flexible for different game types
  winning_combination VARCHAR(500),
  house_payout DECIMAL(15, 2) DEFAULT 0,
  
  -- Fairness
  is_provably_fair BOOLEAN DEFAULT true,
  verification_code VARCHAR(512),
  verification_timestamp TIMESTAMP WITH TIME ZONE,
  verified_by_admin UUID REFERENCES auth.users(id),
  
  -- Metadata
  execution_time_ms INTEGER,
  rng_algorithm VARCHAR(50) DEFAULT 'SHA256',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_round_result (round_id),
  INDEX idx_verification (verification_code)
);

-- Game Payouts: Individual winner payouts
CREATE TABLE IF NOT EXISTS game_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES game_results(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES game_entries(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payout details
  win_type VARCHAR(50), -- 'jackpot', 'prize_tier_1', 'prize_tier_2', 'consolation', etc.
  prize_tier INTEGER,
  payout_amount_gc DECIMAL(15, 2) DEFAULT 0,
  payout_amount_sc DECIMAL(15, 2) DEFAULT 0,
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  
  -- Blockchain/transaction
  transaction_id VARCHAR(255),
  transaction_hash VARCHAR(512),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  INDEX idx_user_payout (user_id, status),
  INDEX idx_round_payout (round_id),
  INDEX idx_pending_payouts (status) WHERE status = 'pending'
);

-- RNG Audit Log: Immutable log of all RNG operations
CREATE TABLE IF NOT EXISTS rng_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  result_id UUID REFERENCES game_results(id),
  
  -- RNG Details
  server_seed_used VARCHAR(512),
  server_seed_hash VARCHAR(512),
  client_seeds JSONB, -- Array of client seeds used
  nonce INTEGER,
  final_hash VARCHAR(512),
  
  -- Execution
  rng_algorithm VARCHAR(50),
  execution_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  execution_time_ms INTEGER,
  
  -- Verification
  verification_status VARCHAR(30), -- 'pending', 'verified', 'failed'
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_round_rng (round_id),
  INDEX idx_execution_time (execution_timestamp)
);

-- Admin Game Actions: Audit trail of admin operations
CREATE TABLE IF NOT EXISTS admin_game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  game_id UUID REFERENCES games(id),
  round_id UUID REFERENCES game_rounds(id),
  
  action VARCHAR(100) NOT NULL, -- 'enable_game', 'disable_game', 'pause_round', 'cancel_round', 'modify_config', 'adjust_payout', 'verify_rng'
  details JSONB,
  
  -- Results of action
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_admin_actions (admin_id, created_at),
  INDEX idx_game_actions (game_id, created_at)
);

-- Game Statistics: Aggregate data for analytics
CREATE TABLE IF NOT EXISTS game_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_id UUID REFERENCES game_rounds(id),
  
  -- Period
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  period_type VARCHAR(20), -- 'hourly', 'daily', 'weekly', 'monthly', 'all_time'
  
  -- Aggregates
  total_entries BIGINT DEFAULT 0,
  unique_players BIGINT DEFAULT 0,
  total_wagered_gc DECIMAL(15, 2) DEFAULT 0,
  total_wagered_sc DECIMAL(15, 2) DEFAULT 0,
  total_payouts_gc DECIMAL(15, 2) DEFAULT 0,
  total_payouts_sc DECIMAL(15, 2) DEFAULT 0,
  house_revenue_gc DECIMAL(15, 2) DEFAULT 0,
  house_revenue_sc DECIMAL(15, 2) DEFAULT 0,
  actual_rtp DECIMAL(5, 2),
  
  winner_count BIGINT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_game_period (game_id, period_start, period_type)
);

-- Create indexes for performance
CREATE INDEX idx_games_enabled ON games(enabled);
CREATE INDEX idx_rounds_game_status ON game_rounds(game_id, status, created_at);
CREATE INDEX idx_entries_user ON game_entries(user_id, created_at);
CREATE INDEX idx_payouts_status_user ON game_payouts(status, user_id);
