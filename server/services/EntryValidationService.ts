import { getSupabaseAdmin } from "../lib/supabase";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  reason?: string;
  details?: Record<string, any>;
}

export interface UserBalance {
  goldCoins: number;
  sweepCoins: number;
}

/**
 * Entry Validation Service: Validates all game entries
 * - Balance checking
 * - Rate limiting
 * - Anti-abuse detection
 * - Max entries enforcement
 */
export class EntryValidationService {
  private supabase: any = null;
  private readonly MAX_ENTRIES_PER_MINUTE = 10;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }
  private readonly MAX_ENTRIES_PER_HOUR = 100;
  private readonly MAX_ENTRIES_PER_DAY = 500;

  /**
   * Validate an entry request
   */
  async validateEntry(
    userId: string,
    gameId: string,
    roundId: string,
    entryAmount: number,
    currency: "GC" | "SC",
    userBalance: UserBalance,
    configMaxEntriesPerUser: number,
  ): Promise<ValidationResult> {
    // Check if user account is active
    const userCheck = await this.validateUser(userId);
    if (!userCheck.valid) return userCheck;

    // Check balance
    const balanceCheck = await this.validateBalance(
      userId,
      currency,
      entryAmount,
      userBalance,
    );
    if (!balanceCheck.valid) return balanceCheck;

    // Check rate limits
    const rateLimitCheck = await this.validateRateLimit(userId);
    if (!rateLimitCheck.valid) return rateLimitCheck;

    // Check max entries per user
    const maxEntriesCheck = await this.validateMaxEntries(
      userId,
      roundId,
      configMaxEntriesPerUser,
    );
    if (!maxEntriesCheck.valid) return maxEntriesCheck;

    // Check for suspicious patterns
    const abuseCheck = await this.detectAbuse(userId, gameId);
    if (!abuseCheck.valid) return abuseCheck;

    return { valid: true };
  }

  /**
   * Validate user account status
   */
  private async validateUser(userId: string): Promise<ValidationResult> {
    try {
      const supabase = this.getSupabase();
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, verified, kyc_status")
        .eq("id", userId)
        .single();

      if (error || !user) {
        return {
          valid: false,
          error: "User not found",
          reason: "user_not_found",
        };
      }

      // Check if account is verified (for Sweep Coins)
      if (!user.verified) {
        return {
          valid: false,
          error: "Account not verified",
          reason: "account_not_verified",
        };
      }

      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: "Failed to validate user",
        reason: "validation_error",
      };
    }
  }

  /**
   * Validate sufficient balance
   */
  private async validateBalance(
    userId: string,
    currency: "GC" | "SC",
    amount: number,
    userBalance: UserBalance,
  ): Promise<ValidationResult> {
    const balance =
      currency === "GC" ? userBalance.goldCoins : userBalance.sweepCoins;

    if (balance < amount) {
      return {
        valid: false,
        error: `Insufficient ${currency} balance`,
        reason: "insufficient_balance",
        details: {
          required: amount,
          available: balance,
          currency,
          shortfall: amount - balance,
        },
      };
    }

    return { valid: true };
  }

  /**
   * Check rate limits to prevent entry flooding
   */
  private async validateRateLimit(userId: string): Promise<ValidationResult> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check minute limit
      const supabase = this.getSupabase();
      const { count: minuteCount, error: minError } = await supabase
        .from("game_entries")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gt("created_at", oneMinuteAgo.toISOString());

      if (minuteCount && minuteCount >= this.MAX_ENTRIES_PER_MINUTE) {
        return {
          valid: false,
          error: "Too many entries per minute",
          reason: "rate_limit_minute",
          details: { limit: this.MAX_ENTRIES_PER_MINUTE, current: minuteCount },
        };
      }

      // Check hour limit
      const { count: hourCount, error: hourError } = await supabase
        .from("game_entries")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gt("created_at", oneHourAgo.toISOString());

      if (hourCount && hourCount >= this.MAX_ENTRIES_PER_HOUR) {
        return {
          valid: false,
          error: "Too many entries per hour",
          reason: "rate_limit_hour",
          details: { limit: this.MAX_ENTRIES_PER_HOUR, current: hourCount },
        };
      }

      // Check daily limit
      const { count: dayCount, error: dayError } = await supabase
        .from("game_entries")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gt("created_at", oneDayAgo.toISOString());

      if (dayCount && dayCount >= this.MAX_ENTRIES_PER_DAY) {
        return {
          valid: false,
          error: "Daily entry limit exceeded",
          reason: "rate_limit_day",
          details: { limit: this.MAX_ENTRIES_PER_DAY, current: dayCount },
        };
      }

      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: "Failed to check rate limits",
        reason: "rate_check_error",
      };
    }
  }

  /**
   * Check max entries per user per round
   */
  private async validateMaxEntries(
    userId: string,
    roundId: string,
    maxAllowed: number,
  ): Promise<ValidationResult> {
    try {
      const supabase = this.getSupabase();
      const { count, error } = await supabase
        .from("game_entries")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("round_id", roundId)
        .eq("status", "active");

      if (count && count >= maxAllowed) {
        return {
          valid: false,
          error: `Maximum entries per round reached (${maxAllowed})`,
          reason: "max_entries_exceeded",
          details: { max: maxAllowed, current: count },
        };
      }

      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: "Failed to check max entries",
        reason: "max_entries_check_error",
      };
    }
  }

  /**
   * Detect potential abuse patterns
   */
  private async detectAbuse(userId: string, gameId: string): Promise<ValidationResult> {
    try {
      // Check for rapid same-game entries
      const supabase = this.getSupabase();
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const { data: recentEntries } = await supabase
        .from("game_entries")
        .select("created_at")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .gt("created_at", fiveMinutesAgo.toISOString())
        .limit(20);

      if (recentEntries && recentEntries.length >= 15) {
        // Check time intervals
        const intervals = [];
        for (let i = 1; i < recentEntries.length; i++) {
          const time1 = new Date(recentEntries[i - 1].created_at);
          const time2 = new Date(recentEntries[i].created_at);
          intervals.push(time2.getTime() - time1.getTime());
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // If average interval < 100ms, likely bot activity
        if (avgInterval < 100) {
          return {
            valid: false,
            error: "Suspicious entry pattern detected",
            reason: "abuse_detected_rapid_entries",
            details: { avgInterval },
          };
        }
      }

      // Check for entries from multiple accounts in same IP
      // (This would require IP logging - implement separately)

      return { valid: true };
    } catch (e) {
      return { valid: true }; // Don't block on abuse check failure
    }
  }

  /**
   * Get user's current balance from database
   */
  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const supabase = this.getSupabase();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("gold_coins_balance, sweep_coins_balance")
        .eq("id", userId)
        .single();

      return {
        goldCoins: profile?.gold_coins_balance || 0,
        sweepCoins: profile?.sweep_coins_balance || 0,
      };
    } catch (e) {
      return { goldCoins: 0, sweepCoins: 0 };
    }
  }

  /**
   * Simulate entry validation without recording anything
   */
  async validateEntryDry(
    userId: string,
    gameId: string,
    roundId: string,
    entryAmount: number,
    currency: "GC" | "SC",
    configMaxEntriesPerUser: number,
  ): Promise<ValidationResult> {
    const balance = await this.getUserBalance(userId);
    return this.validateEntry(
      userId,
      gameId,
      roundId,
      entryAmount,
      currency,
      balance,
      configMaxEntriesPerUser,
    );
  }
}

// Singleton instance - created lazily
let _entryValidationService: EntryValidationService | null = null;

export function getEntryValidationService(): EntryValidationService {
  if (!_entryValidationService) {
    _entryValidationService = new EntryValidationService();
  }
  return _entryValidationService;
}

export const entryValidationService = getEntryValidationService();
