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
  validateEntry(
    userId: string,
    entryData: any,
  ): Promise<{ valid: boolean; error?: string }>;
  processEntry(
    userId: string,
    roundId: string,
    entryData: any,
  ): Promise<string>;
  drawRound(roundId: string): Promise<any>;
  getWinners(
    roundId: string,
  ): Promise<Array<{ userId: string; prizeAmount: number; prizeType: string }>>;
  cancelRound(roundId: string): Promise<void>;

  // State queries
  getRoundStatus(roundId: string): Promise<any>;
  getPlayerEntries(userId: string, roundId: string): Promise<any[]>;
  getRoundStats(roundId: string): Promise<any>;
}

export class GameRegistry {
  private engines: Map<string, GameEngine> = new Map();
  private gameTypeMap: Map<GameType, string> = new Map([
    ["pooled_draw", "../gameEngine/PooledDrawEngine"],
    ["instant_win", "../gameEngine/InstantWinEngine"],
    ["progressive_jackpot", "../gameEngine/ProgressiveJackpotEngine"],
    ["scheduled_draw", "../gameEngine/ScheduledDrawEngine"],
  ]);

  /**
   * Register a game instance
   */
  async registerGame(
    gameId: string,
    gameType: GameType,
    config: GameEngineConfig,
  ): Promise<GameEngine> {
    const enginePath = this.gameTypeMap.get(gameType);
    if (!enginePath) {
      throw new Error(`Unknown game type: ${gameType}`);
    }

    try {
      // Lazy load the engine class
      const module = await import(enginePath);
      const EngineClass = Object.values(module)[0] as new (
        ...args: any[]
      ) => GameEngine;

      if (!EngineClass) {
        throw new Error(`Engine class not found in ${enginePath}`);
      }

      const engine = new EngineClass(gameId, config);
      this.engines.set(gameId, engine);
      return engine;
    } catch (error) {
      throw new Error(
        `Failed to load game engine: ${(error as Error).message}`,
      );
    }
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
