/**
 * Database type definitions
 */

export interface Game {
  id: string;
  name: string;
  description?: string;
  game_type: string;
  category?: string;
  enabled: boolean;
  min_entry_cost?: number;
  max_entry_cost?: number;
  currency_type: string;
  house_edge?: number;
  created_at: Date;
  updated_at: Date;
}

export interface GameConfig {
  id: string;
  game_id: string;
  config_json?: any;
  min_players?: number;
  max_players?: number;
  draw_frequency?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GameRound {
  id: string;
  game_id: string;
  status:
    | "registering"
    | "live"
    | "drawing"
    | "completed"
    | "cancelled"
    | "paused";
  start_time?: Date;
  draw_time?: Date;
  end_time?: Date;
  server_seed?: string;
  prize_pool_gc: number;
  prize_pool_sc: number;
  created_at: Date;
  updated_at: Date;
}

export interface GameEntry {
  id: string;
  round_id: string;
  user_id: string;
  status: "active" | "won" | "lost" | "cancelled";
  entry_cost?: number;
  currency_type: string;
  client_seed?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GameResult {
  id: string;
  round_id: string;
  user_id: string;
  outcome?: string;
  payout_amount_gc?: number;
  payout_amount_sc?: number;
  verification_code?: string;
  created_at: Date;
}

export interface GamePayout {
  id: string;
  round_id: string;
  user_id: string;
  payout_amount_gc?: number;
  payout_amount_sc?: number;
  win_type?: string;
  status: "pending" | "processed" | "failed";
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  gold_coins_balance: number;
  sweep_coins_balance: number;
  gold_coins: number;
  sweep_coins: number;
  verified: boolean;
  kyc_status: "pending" | "approved" | "rejected";
  created_at: Date;
  updated_at: Date;
}

export interface Package {
  id: string;
  name: string;
  gc?: number;
  bonus_sc?: number;
  price_cents?: number;
  active: boolean;
  description?: string;
  color?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  package_id?: string;
  amount_cents?: number;
  status: "pending" | "completed" | "failed";
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  currency: string;
  description?: string;
  created_at: Date;
}

export interface RngAuditLog {
  id: string;
  game_id?: string;
  round_id?: string;
  server_seed?: string;
  client_seed?: string;
  result_hash?: string;
  created_at: Date;
}

export interface AdminGameAction {
  id: string;
  admin_id: string;
  action: string;
  game_id?: string;
  round_id?: string;
  details?: any;
  created_at: Date;
}

export interface BalanceTransaction {
  id: string;
  user_id: string;
  type: string;
  amount_gc?: number;
  amount_sc?: number;
  reference_id?: string;
  status: string;
  created_at: Date;
}
