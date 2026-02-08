import { GameEngine, GameEngineConfig, GameType } from "../services/GameRegistry";

/**
 * Instant Win Engine: Spin-based games with immediate results
 */
export class InstantWinEngine implements GameEngine {
  gameId: string;
  gameType: GameType = "instant_win";
  config: GameEngineConfig;

  constructor(gameId: string, config: GameEngineConfig) {
    this.gameId = gameId;
    this.config = config;
  }

  async createRound(): Promise<string> {
    throw new Error("Not implemented");
  }

  async validateEntry(userId: string, entryData: any): Promise<{ valid: boolean; error?: string }> {
    throw new Error("Not implemented");
  }

  async processEntry(userId: string, roundId: string, entryData: any): Promise<string> {
    throw new Error("Not implemented");
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
