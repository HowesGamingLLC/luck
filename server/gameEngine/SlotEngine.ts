import { GameEngine, Player, GameResult } from "./GameEngine";

export interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  rarity: number; // Higher = rarer
  isWild?: boolean;
  isScatter?: boolean;
  multiplier?: number;
}

export interface SlotTheme {
  id: string;
  name: string;
  symbols: SlotSymbol[];
  paylines: number[][];
  rtpPercentage: number;
  bonusFeatures: BonusFeature[];
  jackpots: JackpotConfig[];
}

export interface BonusFeature {
  id: string;
  name: string;
  triggerSymbol: string;
  triggerCount: number;
  type: "freespins" | "bonus_game" | "multiplier" | "expanding_wilds";
  config: any;
}

export interface JackpotConfig {
  name: string;
  type: "fixed" | "progressive";
  baseAmount: number;
  triggerCombo: string[];
  currency: "GC" | "SC";
}

export interface SpinResult {
  reels: string[][]; // Symbol IDs on each reel
  winningLines: WinningLine[];
  totalWin: number;
  currency: "GC" | "SC";
  bonusTriggered?: BonusResult;
  jackpotWon?: JackpotWin;
  multiplier: number;
  freeSpinsRemaining?: number;
}

export interface WinningLine {
  lineNumber: number;
  symbols: string[];
  payout: number;
  multiplier: number;
}

export interface BonusResult {
  feature: string;
  spinsAwarded?: number;
  multiplier?: number;
  picks?: BonusPick[];
  totalWin: number;
}

export interface BonusPick {
  position: number;
  symbol: string;
  value: number;
}

export interface JackpotWin {
  name: string;
  amount: number;
  currency: "GC" | "SC";
}

export interface SlotGameState {
  currentTheme: string;
  currentBet: number;
  currency: "GC" | "SC";
  freeSpinsRemaining: number;
  bonusGameActive: boolean;
  totalWinThisSession: number;
  spinCount: number;
  jackpotAmounts: { [key: string]: number };
}

export class SlotEngine extends GameEngine {
  private themes: Map<string, SlotTheme> = new Map();
  private progressiveJackpots: Map<string, number> = new Map();
  private gameStates: Map<string, SlotGameState> = new Map();
  private readonly REEL_COUNT = 5;
  private readonly SYMBOLS_PER_REEL = 3;

  constructor() {
    super("slot-engine", 1, 1000);
    this.initializeThemes();
    this.initializeJackpots();
  }

  private initializeThemes(): void {
    // Classic Fruits Theme
    const classicSymbols: SlotSymbol[] = [
      { id: "cherry", name: "Cherry", value: 2, rarity: 30 },
      { id: "lemon", name: "Lemon", value: 3, rarity: 25 },
      { id: "orange", name: "Orange", value: 5, rarity: 20 },
      { id: "plum", name: "Plum", value: 8, rarity: 15 },
      { id: "bell", name: "Bell", value: 12, rarity: 12 },
      { id: "bar", name: "Bar", value: 20, rarity: 8 },
      { id: "seven", name: "Seven", value: 50, rarity: 3 },
      {
        id: "wild",
        name: "Wild",
        value: 0,
        rarity: 2,
        isWild: true,
        multiplier: 2,
      },
      { id: "scatter", name: "Scatter", value: 0, rarity: 5, isScatter: true },
    ];

    const classicPaylines = this.generateStandardPaylines();

    const classicTheme: SlotTheme = {
      id: "classic",
      name: "Classic Fruits",
      symbols: classicSymbols,
      paylines: classicPaylines,
      rtpPercentage: 96.5,
      bonusFeatures: [
        {
          id: "free_spins",
          name: "Free Spins",
          triggerSymbol: "scatter",
          triggerCount: 3,
          type: "freespins",
          config: { spins: 10, multiplier: 2 },
        },
      ],
      jackpots: [
        {
          name: "Mini Jackpot",
          type: "progressive",
          baseAmount: 100,
          triggerCombo: ["seven", "seven", "seven"],
          currency: "GC",
        },
        {
          name: "Major Jackpot",
          type: "progressive",
          baseAmount: 1000,
          triggerCombo: ["seven", "seven", "seven", "seven", "seven"],
          currency: "SC",
        },
      ],
    };

    // Diamond Deluxe Theme
    const diamondSymbols: SlotSymbol[] = [
      { id: "diamond_small", name: "Small Diamond", value: 3, rarity: 25 },
      { id: "diamond_medium", name: "Medium Diamond", value: 8, rarity: 18 },
      { id: "diamond_large", name: "Large Diamond", value: 15, rarity: 12 },
      { id: "ruby", name: "Ruby", value: 12, rarity: 15 },
      { id: "emerald", name: "Emerald", value: 18, rarity: 10 },
      { id: "sapphire", name: "Sapphire", value: 25, rarity: 8 },
      { id: "crown", name: "Crown", value: 50, rarity: 5 },
      {
        id: "diamond_wild",
        name: "Diamond Wild",
        value: 0,
        rarity: 3,
        isWild: true,
        multiplier: 3,
      },
      {
        id: "star_scatter",
        name: "Star Scatter",
        value: 0,
        rarity: 4,
        isScatter: true,
      },
    ];

    const diamondTheme: SlotTheme = {
      id: "diamond",
      name: "Diamond Deluxe",
      symbols: diamondSymbols,
      paylines: classicPaylines,
      rtpPercentage: 97.2,
      bonusFeatures: [
        {
          id: "diamond_spins",
          name: "Diamond Free Spins",
          triggerSymbol: "star_scatter",
          triggerCount: 3,
          type: "freespins",
          config: { spins: 15, multiplier: 3 },
        },
        {
          id: "bonus_game",
          name: "Treasure Hunt",
          triggerSymbol: "crown",
          triggerCount: 3,
          type: "bonus_game",
          config: { picks: 3, maxMultiplier: 10 },
        },
      ],
      jackpots: [
        {
          name: "Diamond Jackpot",
          type: "progressive",
          baseAmount: 2500,
          triggerCombo: ["crown", "crown", "crown", "crown", "crown"],
          currency: "GC",
        },
      ],
    };

    this.themes.set(classicTheme.id, classicTheme);
    this.themes.set(diamondTheme.id, diamondTheme);
  }

  private generateStandardPaylines(): number[][] {
    return [
      [1, 1, 1, 1, 1], // Top row
      [2, 2, 2, 2, 2], // Middle row
      [3, 3, 3, 3, 3], // Bottom row
      [1, 2, 3, 2, 1], // V shape
      [3, 2, 1, 2, 3], // Inverted V
      [1, 1, 2, 3, 3], // Diagonal down
      [3, 3, 2, 1, 1], // Diagonal up
      [2, 1, 1, 1, 2], // W shape
      [2, 3, 3, 3, 2], // Inverted W
      [1, 2, 1, 2, 1], // Zigzag
      [3, 2, 3, 2, 3], // Inverted zigzag
      [2, 1, 2, 3, 2], // Mountain
      [2, 3, 2, 1, 2], // Valley
      [1, 3, 1, 3, 1], // Skip pattern
      [3, 1, 3, 1, 3], // Inverted skip
      [1, 1, 3, 1, 1], // Arrow down
      [3, 3, 1, 3, 3], // Arrow up
      [2, 1, 3, 1, 2], // Diamond
      [2, 3, 1, 3, 2], // Inverted diamond
      [1, 2, 2, 2, 1], // House
    ];
  }

  private initializeJackpots(): void {
    this.progressiveJackpots.set("classic-mini", 100);
    this.progressiveJackpots.set("classic-major", 1000);
    this.progressiveJackpots.set("diamond-jackpot", 2500);
  }

  private generateReels(
    theme: SlotTheme,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): string[][] {
    const reels: string[][] = [];

    for (let reel = 0; reel < this.REEL_COUNT; reel++) {
      const reelSymbols: string[] = [];

      for (let position = 0; position < this.SYMBOLS_PER_REEL; position++) {
        const symbolIndex = this.generateProvablyFairNumber(
          serverSeed,
          clientSeed,
          nonce + reel * 10 + position,
          this.getTotalRarity(theme.symbols),
        );

        const symbol = this.getSymbolByRarity(theme.symbols, symbolIndex);
        reelSymbols.push(symbol.id);
      }

      reels.push(reelSymbols);
    }

    return reels;
  }

  private getTotalRarity(symbols: SlotSymbol[]): number {
    return symbols.reduce((total, symbol) => total + symbol.rarity, 0);
  }

  private getSymbolByRarity(
    symbols: SlotSymbol[],
    targetRarity: number,
  ): SlotSymbol {
    let currentRarity = 0;

    for (const symbol of symbols) {
      currentRarity += symbol.rarity;
      if (targetRarity < currentRarity) {
        return symbol;
      }
    }

    return symbols[symbols.length - 1]; // Fallback
  }

  private checkWinningLines(
    reels: string[][],
    theme: SlotTheme,
    bet: number,
  ): WinningLine[] {
    const winningLines: WinningLine[] = [];

    for (let lineIndex = 0; lineIndex < theme.paylines.length; lineIndex++) {
      const payline = theme.paylines[lineIndex];
      const lineSymbols: string[] = [];

      // Get symbols on this payline
      for (let reel = 0; reel < this.REEL_COUNT; reel++) {
        const position = payline[reel] - 1; // Convert to 0-based index
        lineSymbols.push(reels[reel][position]);
      }

      const win = this.calculateLineWin(lineSymbols, theme, bet);
      if (win.payout > 0) {
        winningLines.push({
          lineNumber: lineIndex + 1,
          symbols: lineSymbols,
          payout: win.payout,
          multiplier: win.multiplier,
        });
      }
    }

    return winningLines;
  }

  private calculateLineWin(
    lineSymbols: string[],
    theme: SlotTheme,
    bet: number,
  ): { payout: number; multiplier: number } {
    let consecutiveCount = 0;
    let baseSymbol = "";
    let multiplier = 1;
    let wildCount = 0;

    // Count consecutive matching symbols from left to right
    for (let i = 0; i < lineSymbols.length; i++) {
      const symbol = this.getSymbol(lineSymbols[i], theme);
      if (!symbol) break;

      if (symbol.isWild) {
        wildCount++;
        multiplier *= symbol.multiplier || 1;
        consecutiveCount++;
        continue;
      }

      if (i === 0 || baseSymbol === "" || baseSymbol === lineSymbols[i]) {
        baseSymbol = lineSymbols[i];
        consecutiveCount++;
      } else {
        break;
      }
    }

    // Need at least 3 consecutive symbols for a win
    if (consecutiveCount < 3) {
      return { payout: 0, multiplier: 1 };
    }

    const baseSymbolObj = this.getSymbol(baseSymbol, theme);
    if (!baseSymbolObj) {
      return { payout: 0, multiplier: 1 };
    }

    // Calculate base payout
    let payout = baseSymbolObj.value * bet;

    // Apply consecutive multipliers
    if (consecutiveCount === 4) payout *= 5;
    if (consecutiveCount === 5) payout *= 20;

    // Apply wild multipliers
    payout *= multiplier;

    return { payout: Math.floor(payout), multiplier };
  }

  private getSymbol(
    symbolId: string,
    theme: SlotTheme,
  ): SlotSymbol | undefined {
    return theme.symbols.find((s) => s.id === symbolId);
  }

  private checkBonusFeatures(
    reels: string[][],
    theme: SlotTheme,
  ): BonusResult | undefined {
    for (const feature of theme.bonusFeatures) {
      const triggerCount = this.countSymbolInReels(
        reels,
        feature.triggerSymbol,
      );

      if (triggerCount >= feature.triggerCount) {
        return this.triggerBonusFeature(feature, triggerCount);
      }
    }

    return undefined;
  }

  private countSymbolInReels(reels: string[][], symbolId: string): number {
    let count = 0;

    for (const reel of reels) {
      for (const symbol of reel) {
        if (symbol === symbolId) {
          count++;
        }
      }
    }

    return count;
  }

  private triggerBonusFeature(
    feature: BonusFeature,
    triggerCount: number,
  ): BonusResult {
    switch (feature.type) {
      case "freespins":
        const spins =
          feature.config.spins + (triggerCount - feature.triggerCount) * 2;
        return {
          feature: feature.name,
          spinsAwarded: spins,
          multiplier: feature.config.multiplier,
          totalWin: 0, // Will be calculated during free spins
        };

      case "bonus_game":
        return this.playBonusGame(feature);

      default:
        return {
          feature: feature.name,
          totalWin: 0,
        };
    }
  }

  private playBonusGame(feature: BonusFeature): BonusResult {
    const picks: BonusPick[] = [];
    let totalWin = 0;

    // Simulate bonus game picks
    for (let i = 0; i < feature.config.picks; i++) {
      const value = Math.floor(Math.random() * 100) + 10; // Random value between 10-110
      const pick: BonusPick = {
        position: i,
        symbol: "bonus_prize",
        value,
      };
      picks.push(pick);
      totalWin += value;
    }

    // Apply random multiplier
    const multiplier =
      Math.floor(Math.random() * feature.config.maxMultiplier) + 1;
    totalWin *= multiplier;

    return {
      feature: feature.name,
      picks,
      totalWin,
      multiplier,
    };
  }

  private checkJackpots(
    reels: string[][],
    theme: SlotTheme,
  ): JackpotWin | undefined {
    for (const jackpot of theme.jackpots) {
      if (this.checkJackpotCombo(reels, jackpot.triggerCombo)) {
        const amount =
          jackpot.type === "progressive"
            ? this.progressiveJackpots.get(
                `${theme.id}-${jackpot.name.toLowerCase()}`,
              ) || jackpot.baseAmount
            : jackpot.baseAmount;

        // Reset progressive jackpot
        if (jackpot.type === "progressive") {
          this.progressiveJackpots.set(
            `${theme.id}-${jackpot.name.toLowerCase()}`,
            jackpot.baseAmount,
          );
        }

        return {
          name: jackpot.name,
          amount,
          currency: jackpot.currency,
        };
      }
    }

    return undefined;
  }

  private checkJackpotCombo(reels: string[][], combo: string[]): boolean {
    if (combo.length !== this.REEL_COUNT) return false;

    // Check if the combo appears on any payline
    const theme = Array.from(this.themes.values())[0]; // Get any theme for paylines

    for (const payline of theme.paylines) {
      let matches = 0;

      for (let reel = 0; reel < this.REEL_COUNT; reel++) {
        const position = payline[reel] - 1;
        if (reels[reel][position] === combo[reel]) {
          matches++;
        }
      }

      if (matches === this.REEL_COUNT) {
        return true;
      }
    }

    return false;
  }

  private updateProgressiveJackpots(bet: number): void {
    // Contribute a percentage of each bet to progressive jackpots
    const contribution = bet * 0.01; // 1% contribution

    for (const [jackpotId] of this.progressiveJackpots) {
      const currentAmount = this.progressiveJackpots.get(jackpotId) || 0;
      this.progressiveJackpots.set(jackpotId, currentAmount + contribution);
    }
  }

  // Public API Methods
  public spin(
    playerId: string,
    themeId: string,
    bet: number,
    currency: "GC" | "SC",
    clientSeed: string,
  ): SpinResult {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error("Theme not found");
    }

    // Validate client seed
    if (!this.validateClientSeed(clientSeed)) {
      throw new Error("Invalid client seed");
    }

    // Check if player can afford bet
    const canAfford =
      currency === "GC"
        ? player.balance.goldCoins >= bet
        : player.balance.sweepCoins >= bet;

    if (!canAfford) {
      throw new Error("Insufficient balance");
    }

    // Deduct bet
    this.deductBalance(playerId, bet, currency);

    // Update progressive jackpots
    this.updateProgressiveJackpots(bet);

    // Generate server seed and spin
    const serverSeed = this.generateServerSeed();
    const nonce = Date.now(); // In production, this should be per-player incremental

    const reels = this.generateReels(theme, serverSeed, clientSeed, nonce);
    const winningLines = this.checkWinningLines(reels, theme, bet);
    const bonusTriggered = this.checkBonusFeatures(reels, theme);
    const jackpotWon = this.checkJackpots(reels, theme);

    // Calculate total win
    let totalWin = winningLines.reduce((sum, line) => sum + line.payout, 0);

    if (bonusTriggered) {
      totalWin += bonusTriggered.totalWin;
    }

    if (jackpotWon) {
      totalWin += jackpotWon.amount;
    }

    // Award winnings
    if (totalWin > 0) {
      this.addBalance(playerId, totalWin, currency);
    }

    // Update game state
    let gameState = this.gameStates.get(playerId);
    if (!gameState) {
      gameState = {
        currentTheme: themeId,
        currentBet: bet,
        currency,
        freeSpinsRemaining: 0,
        bonusGameActive: false,
        totalWinThisSession: 0,
        spinCount: 0,
        jackpotAmounts: Object.fromEntries(this.progressiveJackpots),
      };
    }

    gameState.totalWinThisSession += totalWin;
    gameState.spinCount++;

    if (bonusTriggered && bonusTriggered.spinsAwarded) {
      gameState.freeSpinsRemaining += bonusTriggered.spinsAwarded;
    }

    this.gameStates.set(playerId, gameState);

    const result: SpinResult = {
      reels,
      winningLines,
      totalWin,
      currency,
      bonusTriggered,
      jackpotWon,
      multiplier: 1,
      freeSpinsRemaining: gameState.freeSpinsRemaining,
    };

    // Emit events
    this.emit("spinCompleted", {
      playerId,
      result,
      serverSeed,
      clientSeed,
      nonce,
    });

    if (jackpotWon) {
      this.emit("jackpotWon", { playerId, jackpot: jackpotWon });
    }

    return result;
  }

  public getThemes(): SlotTheme[] {
    return Array.from(this.themes.values());
  }

  public getTheme(themeId: string): SlotTheme | undefined {
    return this.themes.get(themeId);
  }

  public getProgressiveJackpots(): { [key: string]: number } {
    return Object.fromEntries(this.progressiveJackpots);
  }

  public getPlayerGameState(playerId: string): SlotGameState | undefined {
    return this.gameStates.get(playerId);
  }

  // Required GameEngine methods
  startGame(): void {
    this.setState("playing");
  }

  endGame(): void {
    this.setState("ended");
  }

  processAction(playerId: string, action: any): any {
    switch (action.type) {
      case "spin":
        return this.spin(
          playerId,
          action.themeId,
          action.bet,
          action.currency,
          action.clientSeed,
        );
      default:
        return { success: false, error: "Unknown action" };
    }
  }

  validateAction(playerId: string, action: any): boolean {
    return (
      action.type === "spin" &&
      action.themeId &&
      action.bet > 0 &&
      ["GC", "SC"].includes(action.currency)
    );
  }

  getGameState(playerId?: string): any {
    if (playerId) {
      return this.getPlayerGameState(playerId);
    }
    return {
      themes: this.getThemes(),
      progressiveJackpots: this.getProgressiveJackpots(),
    };
  }
}
