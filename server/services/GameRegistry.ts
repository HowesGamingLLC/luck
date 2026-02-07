import { PooledDrawEngine } from "../gameEngine/PooledDrawEngine";
import { InstantWinEngine } from "../gameEngine/InstantWinEngine";
import { ProgressiveJackpotEngine } from "../gameEngine/ProgressiveJackpotEngine";
import { ScheduledDrawEngine } from "../gameEngine/ScheduledDrawEngine";

export type GameType =
  | "pooled_draw"
  | "instant_win"
  | "progressive_jackpot"
  | "scheduled_draw"
  | "table_game"
  | "bingo"
  | "lottery";

export interface GameEngineConfig {
  gameId: string;
  entryFeeGc: number;
  entryFeeSc: number;
  maxEntriesPerUser: number;
  rtpPercentage: number;
  acceptedCurrencies: ("GC" | "SC")[];
}

export interface GameEngine {
  gameId: string;
  gameType: GameType;
  config: GameEngineConfig;
  
  // Core operations
  createRound(): Promise<string>;
  validateEntry(userId: string, entryData: any): Promise<{ valid: boolean; error?: string }>;
  processEntry(userId: string, roundId: string, entryData: any): Promise<string>;
  drawRound(roundId: string): Promise<any>;
  getWinners(roundId: string): Promise<Array<{ userId: string; prizeAmount: number; prizeType: string }>>;
  cancelRound(roundId: string): Promise<void>;
  
  // State queries
  getRoundStatus(roundId: string): Promise<any>;
  getPlayerEntries(userId: string, roundId: string): Promise<any[]>;
  getRoundStats(roundId: string): Promise<any>;
}

export class GameRegistry {
  private engines: Map<string, GameEngine> = new Map();
  private gameTypeMap: Map<GameType, new (...args: any[]) => GameEngine> = new Map([
    ["pooled_draw", PooledDrawEngine],
    ["instant_win", InstantWinEngine],
    ["progressive_jackpot", ProgressiveJackpotEngine],
    ["scheduled_draw", ScheduledDrawEngine],
  ]);

  /**
   * Register a game instance
   */
  registerGame(gameId: string, gameType: GameType, config: GameEngineConfig): GameEngine {
    const EngineClass = this.gameTypeMap.get(gameType);
    if (!EngineClass) {
      throw new Error(`Unknown game type: ${gameType}`);
    }

    const engine = new EngineClass(gameId, config);
    this.engines.set(gameId, engine);
    return engine;
  }

  /**
   * Get a registered game engine
   */
  getGame(gameId: string): GameEngine | undefined {
    return this.engines.get(gameId);
  }

  /**
   * Check if game is registered
   */
  hasGame(gameId: string): boolean {
    return this.engines.has(gameId);
  }

  /**
   * List all registered games
   */
  listGames(): GameEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Unregister a game
   */
  unregisterGame(gameId: string): boolean {
    return this.engines.delete(gameId);
  }

  /**
   * Get supported game types
   */
  getSupportedGameTypes(): GameType[] {
    return Array.from(this.gameTypeMap.keys());
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();
