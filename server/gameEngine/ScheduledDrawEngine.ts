import { GameEngine, GameEngineConfig, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import { getSupabaseAdmin } from "../lib/supabase";
import { EventEmitter } from "events";

export interface ScheduledDrawConfig extends GameEngineConfig {
  scheduleType: "hourly" | "daily" | "weekly";
  drawTimeOfDay?: string; // HH:MM format
  baseJackpot: number;
  maxWinners: number;
}

/**
 * Scheduled Draw Engine: Live countdown draws with fixed times
 * Accepts entries until a scheduled time, then executes draw
 */
export class ScheduledDrawEngine extends EventEmitter implements GameEngine {
  gameId: string;
  gameType: GameType = "scheduled_draw";
  config: ScheduledDrawConfig;
  private supabase: any = null;
  private drawSchedule: NodeJS.Timeout | null = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

  constructor(gameId: string, config: GameEngineConfig) {
    super();
    this.gameId = gameId;
    this.config = config as ScheduledDrawConfig;
    this.scheduleAutomaticDraw();
  }

  /**
   * Schedule automatic draw based on schedule type
   */
  private scheduleAutomaticDraw(): void {
    // In production, use a proper scheduler like node-cron or agenda
    // For now, use a simple interval for demonstration
    const scheduleMs =
      this.config.scheduleType === "hourly"
        ? 60 * 60 * 1000 // 1 hour
        : this.config.scheduleType === "daily"
          ? 24 * 60 * 60 * 1000 // 24 hours
          : 7 * 24 * 60 * 60 * 1000; // 7 days

    this.drawSchedule = setInterval(() => {
      // Auto-execute draw for expired rounds
      this.executeScheduledDraw();
    }, scheduleMs);
  }

  /**
   * Execute scheduled draw for expired rounds
   */
  private async executeScheduledDraw(): Promise<void> {
    const supabase = this.getSupabase();

    // Find expired rounds
    const { data: expiredRounds } = await supabase
      .from("game_rounds")
      .select("id")
      .eq("game_id", this.gameId)
      .eq("status", "registering")
      .lte("draw_time", new Date().toISOString());

    if (expiredRounds && expiredRounds.length > 0) {
      for (const round of expiredRounds) {
        try {
          await this.drawRound(round.id);
        } catch (error) {
          console.error(`Failed to draw round ${round.id}:`, error);
        }
      }
    }
  }

  /**
   * Create a new scheduled draw round
   */
  async createRound(): Promise<string> {
    const supabase = this.getSupabase();
    const now = new Date();

    // Calculate next draw time based on schedule
    let drawTime = new Date(now);
    if (this.config.scheduleType === "hourly") {
      drawTime.setHours(drawTime.getHours() + 1);
    } else if (this.config.scheduleType === "daily") {
      drawTime.setDate(drawTime.getDate() + 1);
    } else {
      drawTime.setDate(drawTime.getDate() + 7);
    }

    const { data, error } = await supabase
      .from("game_rounds")
      .insert({
        game_id: this.gameId,
        status: "registering",
        starts_at: now.toISOString(),
        draw_time: drawTime.toISOString(),
        server_seed: rngService.generateServerSeed(),
        prize_pool_gc: this.config.baseJackpot,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Validate entry for scheduled draw
   */
  async validateEntry(
    userId: string,
    entryData: any,
  ): Promise<{ valid: boolean; error?: string }> {
    const currencyType = entryData.currencyType || "GC";

    const supabase = this.getSupabase();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gold_coins, sweep_coins")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return { valid: false, error: "User not found" };
    }

    const balance =
      currencyType === "GC" ? profile.gold_coins : profile.sweep_coins;
    const entryCost =
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    if (balance < entryCost) {
      return { valid: false, error: "Insufficient balance" };
    }

    return { valid: true };
  }

  /**
   * Process entry for scheduled draw
   */
  async processEntry(
    userId: string,
    roundId: string,
    entryData: any,
  ): Promise<string> {
    const supabase = this.getSupabase();
    const clientSeed = entryData.clientSeed;
    const currencyType = entryData.currencyType || "GC";

    const entryCost =
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    // Get round
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      throw new Error("Round not found");
    }

    if (round.status !== "registering") {
      throw new Error("Round is not accepting entries");
    }

    // Create entry
    const clientSeedHash = rngService.hashSeed(clientSeed);
    const { data: entry, error: entryError } = await supabase
      .from("game_entries")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        user_id: userId,
        currency_type: currencyType,
        entry_cost: entryCost,
        client_seed: clientSeed,
        client_seed_hash: clientSeedHash,
        status: "active",
      })
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create entry: ${entryError.message}`);
    }

    // Broadcast entry submitted
    webSocketService.broadcastEntrySubmitted(this.gameId, roundId, {
      entryId: entry.id,
      userId,
      entryCost,
      timestamp: new Date().toISOString(),
    });

    return entry.id;
  }

  async drawRound(): Promise<any> {
    throw new Error("Not implemented");
  }

  async getWinners(): Promise<Array<{ userId: string; prizeAmount: number; prizeType: string }>> {
    throw new Error("Not implemented");
  }

  async cancelRound(): Promise<void> {
    throw new Error("Not implemented");
  }

  async getRoundStatus(): Promise<any> {
    throw new Error("Not implemented");
  }

  async getPlayerEntries(): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async getRoundStats(): Promise<any> {
    throw new Error("Not implemented");
  }
}
