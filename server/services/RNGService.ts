import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "../lib/supabase";

export interface RNGSeed {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed?: string;
  clientSeedHash?: string;
  nonce: number;
}

export interface RNGResult {
  value: number;
  range: number;
  finalHash: string;
  seeds: RNGSeed;
  verificationCode: string;
}

/**
 * RNG Service: Cryptographically secure random number generation
 * with immutable audit logging for provably-fair gaming
 */
export class RNGService {
  private readonly ALGORITHM = "sha256";
  private supabase = getSupabaseAdmin();

  /**
   * Generate a server seed
   * @returns Hex-encoded 64-byte random seed
   */
  generateServerSeed(): string {
    return randomBytes(64).toString("hex");
  }

  /**
   * Generate SHA256 hash of a seed
   */
  hashSeed(seed: string): string {
    return createHash(this.ALGORITHM).update(seed).digest("hex");
  }

  /**
   * Validate client-provided seed format and length
   */
  validateClientSeed(clientSeed: string): boolean {
    return (
      typeof clientSeed === "string" &&
      clientSeed.length >= 1 &&
      clientSeed.length <= 256
    );
  }

  /**
   * Generate a provably-fair random number
   * Uses HMAC-SHA256 combining server and client seeds
   */
  generateNumber(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    range: number = 100,
  ): { value: number; hash: string } {
    // Combine seeds in deterministic order
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = createHash(this.ALGORITHM).update(combined).digest("hex");

    // Convert hash to number in range
    const hexValue = hash.substring(0, 8);
    const intValue = parseInt(hexValue, 16);
    const value = intValue % range;

    return { value, hash };
  }

  /**
   * Generate multiple numbers (e.g., for drawing multiple winners)
   */
  generateNumbers(
    serverSeed: string,
    clientSeed: string,
    count: number,
    range: number = 100,
  ): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      const { value } = this.generateNumber(serverSeed, clientSeed, i, range);
      results.push(value);
    }
    return results;
  }

  /**
   * Execute RNG with complete seed management and verification
   */
  async executeRNG(
    gameId: string,
    roundId: string,
    clientSeed: string,
    range: number = 100,
    autoLog: boolean = true,
  ): Promise<RNGResult> {
    const startTime = Date.now();

    // Generate server seed
    const serverSeed = this.generateServerSeed();
    const serverSeedHash = this.hashSeed(serverSeed);
    const clientSeedHash = this.hashSeed(clientSeed);

    // Generate result
    const { value, hash: finalHash } = this.generateNumber(
      serverSeed,
      clientSeed,
      0,
      range,
    );

    // Create verification code (hash of everything)
    const verificationData = `${serverSeedHash}:${clientSeedHash}:${finalHash}`;
    const verificationCode = createHash(this.ALGORITHM)
      .update(verificationData)
      .digest("hex");

    const result: RNGResult = {
      value,
      range,
      finalHash,
      seeds: {
        serverSeed,
        serverSeedHash,
        clientSeed,
        clientSeedHash,
        nonce: 0,
      },
      verificationCode,
    };

    // Log to audit trail
    if (autoLog) {
      await this.logRNGExecution(gameId, roundId, result, startTime);
    }

    return result;
  }

  /**
   * Log RNG execution for audit trail
   */
  private async logRNGExecution(
    gameId: string,
    roundId: string,
    result: RNGResult,
    startTime: number,
  ): Promise<void> {
    const executionTime = Date.now() - startTime;

    try {
      const supabase = this.getSupabase();
      await supabase.from("rng_audit_logs").insert({
        game_id: gameId,
        round_id: roundId,
        server_seed_used: result.seeds.serverSeed,
        server_seed_hash: result.seeds.serverSeedHash,
        client_seeds: [result.seeds.clientSeed],
        nonce: result.seeds.nonce,
        final_hash: result.finalHash,
        rng_algorithm: this.ALGORITHM,
        execution_timestamp: new Date().toISOString(),
        execution_time_ms: executionTime,
        verification_status: "pending",
      });
    } catch (error) {
      console.error("Failed to log RNG execution:", error);
      // Don't throw - RNG should still work even if logging fails
    }
  }

  /**
   * Verify provably-fair RNG result
   * Players can independently verify the outcome was fair
   */
  verifyResult(
    serverSeed: string,
    clientSeed: string,
    expectedValue: number,
    range: number,
  ): boolean {
    const { value } = this.generateNumber(serverSeed, clientSeed, 0, range);
    return value === expectedValue;
  }

  /**
   * Generate a public verification link for player to verify their result
   */
  generateVerificationLink(
    gameId: string,
    roundId: string,
    verificationCode: string,
  ): string {
    const baseUrl = process.env.PUBLIC_URL || "http://localhost:8080";
    const params = new URLSearchParams({
      game: gameId,
      round: roundId,
      code: verificationCode,
    });
    return `${baseUrl}/verify-game?${params.toString()}`;
  }

  /**
   * Batch verify multiple RNG results
   */
  batchVerify(
    results: Array<{
      serverSeed: string;
      clientSeed: string;
      expectedValue: number;
      range: number;
    }>,
  ): boolean[] {
    return results.map((result) =>
      this.verifyResult(
        result.serverSeed,
        result.clientSeed,
        result.expectedValue,
        result.range,
      ),
    );
  }
}

// Export singleton that's created on first use
export const rngService = new RNGService();
