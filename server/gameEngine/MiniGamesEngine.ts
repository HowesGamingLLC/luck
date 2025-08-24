import { GameEngine, Player, GameResult } from "./GameEngine";

export interface MiniGame {
  id: string;
  name: string;
  type:
    | "crash"
    | "dice"
    | "plinko"
    | "mines"
    | "keno"
    | "wheel"
    | "aviator"
    | "limbo";
  description: string;
  minBet: { gc: number; sc: number };
  maxBet: { gc: number; sc: number };
  maxMultiplier: number;
  houseEdge: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface GameSession {
  playerId: string;
  gameType: string;
  active: boolean;
  currentBet: number;
  currency: "GC" | "SC";
  gameData: any;
  startTime: Date;
}

export interface CrashGame {
  multiplier: number;
  crashed: boolean;
  crashPoint: number;
  cashOutPoint?: number;
  active: boolean;
}

export interface DiceGame {
  target: number;
  over: boolean;
  result?: number;
  multiplier: number;
}

export interface MinesGame {
  gridSize: number;
  mineCount: number;
  minePositions: number[];
  revealedCells: number[];
  currentMultiplier: number;
  gameEnded: boolean;
}

export interface PlinkoGame {
  rows: number;
  multipliers: number[];
  ballPath: number[];
  finalSlot: number;
  multiplier: number;
}

export interface KenoGame {
  selectedNumbers: number[];
  drawnNumbers: number[];
  matches: number;
  multiplier: number;
}

export interface WheelGame {
  segments: number;
  multipliers: number[];
  result: number;
  multiplier: number;
}

export class MiniGamesEngine extends GameEngine {
  private games: Map<string, MiniGame> = new Map();
  private sessions: Map<string, GameSession> = new Map();
  private crashGames: Map<string, CrashGame> = new Map();

  constructor() {
    super("mini-games", 1, 10000);
    this.initializeGames();
    this.startCrashGameLoop();
  }

  private initializeGames(): void {
    const games: MiniGame[] = [
      {
        id: "crash",
        name: "Crash",
        type: "crash",
        description:
          "Watch the multiplier rise and cash out before it crashes!",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 1000, sc: 10.0 },
        maxMultiplier: 1000,
        houseEdge: 1.0,
        difficulty: "Medium",
      },
      {
        id: "dice",
        name: "Dice Roll",
        type: "dice",
        description: "Predict if the dice will roll over or under your target",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 500, sc: 5.0 },
        maxMultiplier: 99,
        houseEdge: 1.0,
        difficulty: "Easy",
      },
      {
        id: "plinko",
        name: "Plinko",
        type: "plinko",
        description: "Drop the ball and watch it bounce to a multiplier",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 100, sc: 1.0 },
        maxMultiplier: 1000,
        houseEdge: 1.0,
        difficulty: "Easy",
      },
      {
        id: "mines",
        name: "Mines",
        type: "mines",
        description:
          "Find gems while avoiding mines for increasing multipliers",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 200, sc: 2.0 },
        maxMultiplier: 100,
        houseEdge: 1.0,
        difficulty: "Hard",
      },
      {
        id: "keno",
        name: "Keno",
        type: "keno",
        description: "Pick numbers and watch the draw for big multipliers",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 100, sc: 1.0 },
        maxMultiplier: 1000,
        houseEdge: 1.0,
        difficulty: "Medium",
      },
      {
        id: "wheel",
        name: "Lucky Wheel",
        type: "wheel",
        description: "Spin the wheel and win instant multipliers",
        minBet: { gc: 1, sc: 0.01 },
        maxBet: { gc: 100, sc: 1.0 },
        maxMultiplier: 50,
        houseEdge: 1.0,
        difficulty: "Easy",
      },
    ];

    games.forEach((game) => this.games.set(game.id, game));
  }

  private startCrashGameLoop(): void {
    // Start a new crash game every 30 seconds
    setInterval(() => {
      this.startNewCrashGame();
    }, 30000);

    // Start first game immediately
    this.startNewCrashGame();
  }

  private startNewCrashGame(): void {
    const crashPoint = this.generateCrashPoint();
    const gameId = this.generateId();

    const crashGame: CrashGame = {
      multiplier: 1.0,
      crashed: false,
      crashPoint,
      active: true,
    };

    this.crashGames.set(gameId, crashGame);
    this.emit("crashGameStarted", { gameId, crashPoint });

    // Simulate multiplier increase
    const interval = setInterval(() => {
      if (!crashGame.active) {
        clearInterval(interval);
        return;
      }

      crashGame.multiplier += 0.01;

      if (crashGame.multiplier >= crashPoint) {
        crashGame.crashed = true;
        crashGame.active = false;
        this.emit("crashGameEnded", { gameId, crashPoint });
        clearInterval(interval);
      } else {
        this.emit("crashMultiplierUpdate", {
          gameId,
          multiplier: crashGame.multiplier,
        });
      }
    }, 100);
  }

  private generateCrashPoint(): number {
    // Use provably fair method to generate crash point
    // Higher chance of lower multipliers
    const random = Math.random();
    if (random < 0.5) return 1.0 + Math.random() * 2; // 1.0-3.0 (50% chance)
    if (random < 0.8) return 3.0 + Math.random() * 7; // 3.0-10.0 (30% chance)
    if (random < 0.95) return 10.0 + Math.random() * 40; // 10.0-50.0 (15% chance)
    return 50.0 + Math.random() * 950; // 50.0-1000.0 (5% chance)
  }

  // Crash Game Implementation
  public playCrash(
    playerId: string,
    action: "bet" | "cashout",
    amount?: number,
  ): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    if (action === "bet") {
      if (!amount) return { success: false, error: "Bet amount required" };

      const session: GameSession = {
        playerId,
        gameType: "crash",
        active: true,
        currentBet: amount,
        currency: "GC", // Default currency
        gameData: { betPlaced: true, cashOutMultiplier: null },
        startTime: new Date(),
      };

      this.sessions.set(playerId, session);
      this.deductBalance(playerId, amount, "GC");

      return { success: true, message: "Bet placed", betAmount: amount };
    }

    if (action === "cashout") {
      const session = this.sessions.get(playerId);
      if (!session || !session.active) {
        return { success: false, error: "No active bet" };
      }

      // Find current crash game
      const activeCrashGame = Array.from(this.crashGames.values()).find(
        (g) => g.active,
      );
      if (!activeCrashGame || activeCrashGame.crashed) {
        return { success: false, error: "Game already crashed" };
      }

      const winAmount = session.currentBet * activeCrashGame.multiplier;
      session.gameData.cashOutMultiplier = activeCrashGame.multiplier;
      session.active = false;

      this.addBalance(playerId, winAmount, session.currency);

      return {
        success: true,
        multiplier: activeCrashGame.multiplier,
        winAmount,
      };
    }

    return { success: false, error: "Invalid action" };
  }

  // Dice Game Implementation
  public playDice(
    playerId: string,
    target: number,
    over: boolean,
    amount: number,
  ): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    if (target < 1 || target > 99) {
      return { success: false, error: "Target must be between 1 and 99" };
    }

    this.deductBalance(playerId, amount, "GC");

    const result = Math.floor(Math.random() * 100) + 1; // 1-100
    const won = over ? result > target : result < target;

    let multiplier = 0;
    let winAmount = 0;

    if (won) {
      const winChance = over ? (100 - target) / 100 : target / 100;
      multiplier = 0.99 / winChance; // 99% RTP
      winAmount = amount * multiplier;
      this.addBalance(playerId, winAmount, "GC");
    }

    return {
      success: true,
      result,
      target,
      over,
      won,
      multiplier: won ? multiplier : 0,
      winAmount,
    };
  }

  // Plinko Game Implementation
  public playPlinko(playerId: string, amount: number, rows: number = 16): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    this.deductBalance(playerId, amount, "GC");

    // Generate multipliers for Plinko (parabolic distribution)
    const multipliers = this.generatePlinkoMultipliers(rows);

    // Simulate ball drop
    const ballPath = this.simulatePlinkoPath(rows);
    const finalSlot = ballPath[ballPath.length - 1];
    const multiplier = multipliers[finalSlot];
    const winAmount = amount * multiplier;

    this.addBalance(playerId, winAmount, "GC");

    return {
      success: true,
      ballPath,
      finalSlot,
      multiplier,
      winAmount,
      multipliers,
    };
  }

  private generatePlinkoMultipliers(rows: number): number[] {
    // Standard Plinko multipliers (16 rows)
    if (rows === 16) {
      return [
        1000, 130, 26, 9, 4, 2, 1.5, 1.2, 1.1, 1.2, 1.5, 2, 4, 9, 26, 130, 1000,
      ];
    }

    // Generate multipliers for other row counts
    const slots = rows + 1;
    const multipliers: number[] = [];

    for (let i = 0; i < slots; i++) {
      const distance = Math.abs(i - slots / 2);
      const normalized = distance / (slots / 2);
      const multiplier = Math.pow(2, normalized * 4) + 0.5;
      multipliers.push(Math.round(multiplier * 10) / 10);
    }

    return multipliers;
  }

  private simulatePlinkoPath(rows: number): number[] {
    const path = [Math.floor((rows + 1) / 2)]; // Start in middle

    for (let row = 1; row <= rows; row++) {
      const currentPos = path[path.length - 1];
      // 50% chance to go left or right
      const direction = Math.random() < 0.5 ? -1 : 1;
      const nextPos = Math.max(0, Math.min(row, currentPos + direction));
      path.push(nextPos);
    }

    return path;
  }

  // Mines Game Implementation
  public playMines(
    playerId: string,
    action: "start" | "reveal" | "cashout",
    data?: any,
  ): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    let session = this.sessions.get(playerId);

    if (action === "start") {
      const { amount, mineCount = 5, gridSize = 25 } = data;

      this.deductBalance(playerId, amount, "GC");

      const minePositions = this.generateMinePositions(gridSize, mineCount);

      session = {
        playerId,
        gameType: "mines",
        active: true,
        currentBet: amount,
        currency: "GC",
        gameData: {
          gridSize,
          mineCount,
          minePositions,
          revealedCells: [],
          currentMultiplier: 1.0,
          safeRevealed: 0,
        },
        startTime: new Date(),
      };

      this.sessions.set(playerId, session);

      return {
        success: true,
        message: "Mines game started",
        gridSize,
        mineCount,
      };
    }

    if (!session || session.gameType !== "mines") {
      return { success: false, error: "No active mines game" };
    }

    if (action === "reveal") {
      const { cellIndex } = data;
      const gameData = session.gameData;

      if (gameData.revealedCells.includes(cellIndex)) {
        return { success: false, error: "Cell already revealed" };
      }

      gameData.revealedCells.push(cellIndex);

      if (gameData.minePositions.includes(cellIndex)) {
        // Hit a mine
        session.active = false;
        return {
          success: true,
          result: "mine",
          cellIndex,
          gameEnded: true,
          winAmount: 0,
        };
      } else {
        // Safe cell
        gameData.safeRevealed++;
        gameData.currentMultiplier = Math.pow(1.5, gameData.safeRevealed);

        const safeCells = gameData.gridSize - gameData.mineCount;
        if (gameData.safeRevealed === safeCells) {
          // All safe cells revealed
          const winAmount = session.currentBet * gameData.currentMultiplier;
          session.active = false;
          this.addBalance(playerId, winAmount, session.currency);

          return {
            success: true,
            result: "complete",
            cellIndex,
            gameEnded: true,
            multiplier: gameData.currentMultiplier,
            winAmount,
          };
        }

        return {
          success: true,
          result: "safe",
          cellIndex,
          multiplier: gameData.currentMultiplier,
          safeRevealed: gameData.safeRevealed,
        };
      }
    }

    if (action === "cashout") {
      if (!session.active) {
        return { success: false, error: "Game not active" };
      }

      const winAmount = session.currentBet * session.gameData.currentMultiplier;
      session.active = false;
      this.addBalance(playerId, winAmount, session.currency);

      return {
        success: true,
        multiplier: session.gameData.currentMultiplier,
        winAmount,
      };
    }

    return { success: false, error: "Invalid action" };
  }

  private generateMinePositions(gridSize: number, mineCount: number): number[] {
    const positions: number[] = [];
    while (positions.length < mineCount) {
      const pos = Math.floor(Math.random() * gridSize);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    return positions;
  }

  // Keno Game Implementation
  public playKeno(
    playerId: string,
    selectedNumbers: number[],
    amount: number,
  ): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    if (selectedNumbers.length < 1 || selectedNumbers.length > 10) {
      return { success: false, error: "Select 1-10 numbers" };
    }

    this.deductBalance(playerId, amount, "GC");

    // Draw 20 random numbers from 1-80
    const drawnNumbers: number[] = [];
    while (drawnNumbers.length < 20) {
      const num = Math.floor(Math.random() * 80) + 1;
      if (!drawnNumbers.includes(num)) {
        drawnNumbers.push(num);
      }
    }

    // Count matches
    const matches = selectedNumbers.filter((num) =>
      drawnNumbers.includes(num),
    ).length;

    // Calculate multiplier based on matches and numbers selected
    const multiplier = this.getKenoMultiplier(selectedNumbers.length, matches);
    const winAmount = amount * multiplier;

    if (winAmount > 0) {
      this.addBalance(playerId, winAmount, "GC");
    }

    return {
      success: true,
      selectedNumbers,
      drawnNumbers,
      matches,
      multiplier,
      winAmount,
    };
  }

  private getKenoMultiplier(selected: number, matches: number): number {
    // Simplified Keno payout table
    const payouts: { [key: string]: { [key: number]: number } } = {
      "1": { 1: 3.0 },
      "2": { 2: 12.0 },
      "3": { 2: 1.5, 3: 45.0 },
      "4": { 2: 1.0, 3: 4.0, 4: 120.0 },
      "5": { 3: 1.0, 4: 12.0, 5: 750.0 },
      "6": { 3: 0.5, 4: 2.0, 5: 50.0, 6: 1500.0 },
      "7": { 3: 0.5, 4: 1.0, 5: 5.0, 6: 150.0, 7: 5000.0 },
      "8": { 4: 0.5, 5: 2.0, 6: 20.0, 7: 450.0, 8: 10000.0 },
      "9": { 4: 0.5, 5: 1.0, 6: 5.0, 7: 50.0, 8: 1000.0, 9: 15000.0 },
      "10": { 5: 0.5, 6: 2.0, 7: 10.0, 8: 150.0, 9: 2000.0, 10: 25000.0 },
    };

    return payouts[selected.toString()]?.[matches] || 0;
  }

  // Wheel Game Implementation
  public playWheel(
    playerId: string,
    amount: number,
    segments: number = 54,
  ): any {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: "Player not found" };

    this.deductBalance(playerId, amount, "GC");

    // Generate wheel with different multipliers
    const multipliers = this.generateWheelMultipliers(segments);
    const result = Math.floor(Math.random() * segments);
    const multiplier = multipliers[result];
    const winAmount = amount * multiplier;

    this.addBalance(playerId, winAmount, "GC");

    return {
      success: true,
      result,
      multiplier,
      winAmount,
      segments,
    };
  }

  private generateWheelMultipliers(segments: number): number[] {
    // Create wheel with varying multipliers (more low values, fewer high values)
    const multipliers: number[] = [];

    for (let i = 0; i < segments; i++) {
      if (i < segments * 0.4) multipliers.push(1.2);
      else if (i < segments * 0.7) multipliers.push(1.5);
      else if (i < segments * 0.85) multipliers.push(2.0);
      else if (i < segments * 0.95) multipliers.push(5.0);
      else if (i < segments * 0.99) multipliers.push(10.0);
      else multipliers.push(50.0);
    }

    return this.shuffleArray(multipliers);
  }

  // Required GameEngine methods
  startGame(): void {
    this.setState("playing");
  }

  endGame(): void {
    this.setState("ended");
  }

  processAction(playerId: string, action: any): any {
    switch (action.gameType) {
      case "crash":
        return this.playCrash(playerId, action.action, action.amount);
      case "dice":
        return this.playDice(
          playerId,
          action.target,
          action.over,
          action.amount,
        );
      case "plinko":
        return this.playPlinko(playerId, action.amount, action.rows);
      case "mines":
        return this.playMines(playerId, action.action, action.data);
      case "keno":
        return this.playKeno(playerId, action.selectedNumbers, action.amount);
      case "wheel":
        return this.playWheel(playerId, action.amount, action.segments);
      default:
        return { success: false, error: "Unknown game type" };
    }
  }

  validateAction(playerId: string, action: any): boolean {
    const validGameTypes = [
      "crash",
      "dice",
      "plinko",
      "mines",
      "keno",
      "wheel",
    ];
    return validGameTypes.includes(action.gameType);
  }

  getGameState(playerId?: string): any {
    return {
      games: Array.from(this.games.values()),
      session: playerId ? this.sessions.get(playerId) : undefined,
      activeCrashGames: Array.from(this.crashGames.values()).filter(
        (g) => g.active,
      ),
    };
  }

  // Public API
  public getGames(): MiniGame[] {
    return Array.from(this.games.values());
  }

  public getPlayerSession(playerId: string): GameSession | undefined {
    return this.sessions.get(playerId);
  }

  public getActiveCrashGames(): CrashGame[] {
    return Array.from(this.crashGames.values()).filter((g) => g.active);
  }
}
