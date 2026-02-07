import { GameEngine, Player, GameResult } from "./GameEngine";

export interface BingoCard {
  id: string;
  numbers: (number | null)[][];
  marked: boolean[][];
  playerId: string;
}

export interface CalledNumber {
  letter: "B" | "I" | "N" | "G" | "O";
  number: number;
  callTime: Date;
  callOrder: number;
}

export interface BingoRoom {
  id: string;
  name: string;
  type: "speed" | "regular" | "coverall" | "progressive";
  buyIn: { gc: number; sc: number };
  prize: { gc: number; sc: number };
  maxPlayers: number;
  gameLength: number; // in minutes
  patterns: WinPattern[];
}

export interface WinPattern {
  name: string;
  description: string;
  pattern: boolean[][];
  multiplier: number;
}

export interface BingoPlayer extends Player {
  cards: BingoCard[];
  hasWon: boolean;
  winTime?: Date;
  winPattern?: string;
  winCard?: string;
}

export interface BingoGameState {
  room: BingoRoom;
  stage: "waiting" | "starting" | "playing" | "ended";
  calledNumbers: CalledNumber[];
  timeRemaining: number;
  currentCall: CalledNumber | null;
  winners: {
    playerId: string;
    pattern: string;
    cardId: string;
    winTime: Date;
  }[];
  pot: { gc: number; sc: number };
}

export class BingoEngine extends GameEngine {
  private room: BingoRoom;
  private calledNumbers: CalledNumber[] = [];
  private availableNumbers: number[] = [];
  private callTimer: NodeJS.Timeout | null = null;
  private gameTimer: NodeJS.Timeout | null = null;
  private timeRemaining: number = 0;
  private currentCall: CalledNumber | null = null;
  private winners: {
    playerId: string;
    pattern: string;
    cardId: string;
    winTime: Date;
  }[] = [];
  private pot: { gc: number; sc: number } = { gc: 0, sc: 0 };

  // Standard Bingo Patterns
  private static readonly WIN_PATTERNS: WinPattern[] = [
    {
      name: "Line",
      description: "Any horizontal, vertical, or diagonal line",
      pattern: [
        [true, true, true, true, true],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ],
      multiplier: 1.0,
    },
    {
      name: "X Pattern",
      description: "Both diagonals forming an X",
      pattern: [
        [true, false, false, false, true],
        [false, true, false, true, false],
        [false, false, true, false, false],
        [false, true, false, true, false],
        [true, false, false, false, true],
      ],
      multiplier: 2.0,
    },
    {
      name: "Four Corners",
      description: "All four corner squares",
      pattern: [
        [true, false, false, false, true],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [true, false, false, false, true],
      ],
      multiplier: 1.5,
    },
    {
      name: "Full House",
      description: "All numbers on the card",
      pattern: [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
      multiplier: 10.0,
    },
    {
      name: "T Pattern",
      description: "Top row and middle column",
      pattern: [
        [true, true, true, true, true],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
      ],
      multiplier: 3.0,
    },
  ];

  constructor(room: BingoRoom) {
    super(room.id, 1, room.maxPlayers);
    this.room = room;
    this.initializeNumbers();
    this.timeRemaining = room.gameLength * 60; // Convert minutes to seconds
  }

  private initializeNumbers(): void {
    this.availableNumbers = [];
    for (let i = 1; i <= 75; i++) {
      this.availableNumbers.push(i);
    }
    this.availableNumbers = this.shuffleArray(this.availableNumbers);
  }

  private generateBingoCard(playerId: string): BingoCard {
    const card: (number | null)[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    const marked: boolean[][] = Array(5)
      .fill(false)
      .map(() => Array(5).fill(false));

    // B column: 1-15, I column: 16-30, N column: 31-45, G column: 46-60, O column: 61-75
    const ranges = [
      [1, 15], // B
      [16, 30], // I
      [31, 45], // N
      [46, 60], // G
      [61, 75], // O
    ];

    for (let col = 0; col < 5; col++) {
      const [min, max] = ranges[col];
      const usedNumbers = new Set<number>();

      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          // Center FREE space
          card[row][col] = null;
          marked[row][col] = true;
        } else {
          let num;
          do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (usedNumbers.has(num));
          usedNumbers.add(num);
          card[row][col] = num;
        }
      }
    }

    return {
      id: this.generateId(),
      numbers: card,
      marked: marked,
      playerId: playerId,
    };
  }

  private callNextNumber(): void {
    if (this.availableNumbers.length === 0 || this.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    const number = this.availableNumbers.pop()!;
    const letter = this.getLetterForNumber(number);

    const calledNumber: CalledNumber = {
      letter,
      number,
      callTime: new Date(),
      callOrder: this.calledNumbers.length + 1,
    };

    this.calledNumbers.push(calledNumber);
    this.currentCall = calledNumber;

    // Auto-mark numbers on all cards
    this.autoMarkNumber(number);

    // Check for winners after each call
    this.checkForWinners();

    this.emit("numberCalled", calledNumber);
  }

  private getLetterForNumber(number: number): "B" | "I" | "N" | "G" | "O" {
    if (number <= 15) return "B";
    if (number <= 30) return "I";
    if (number <= 45) return "N";
    if (number <= 60) return "G";
    return "O";
  }

  private autoMarkNumber(number: number): void {
    const players = this.getPlayers() as BingoPlayer[];

    players.forEach((player) => {
      player.cards.forEach((card) => {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            if (card.numbers[row][col] === number) {
              card.marked[row][col] = true;
            }
          }
        }
      });
    });
  }

  private checkForWinners(): void {
    const players = this.getPlayers() as BingoPlayer[];

    players.forEach((player) => {
      if (player.hasWon) return; // Player already won

      player.cards.forEach((card) => {
        for (const pattern of BingoEngine.WIN_PATTERNS) {
          if (this.checkPattern(card, pattern)) {
            this.declareWinner(player, pattern, card);
          }
        }
      });
    });
  }

  private checkPattern(card: BingoCard, pattern: WinPattern): boolean {
    // Check for line patterns (horizontal, vertical, diagonal)
    if (pattern.name === "Line") {
      return this.checkLines(card);
    }

    // Check specific patterns
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (pattern.pattern[row][col] && !card.marked[row][col]) {
          return false;
        }
      }
    }

    return true;
  }

  private checkLines(card: BingoCard): boolean {
    // Check horizontal lines
    for (let row = 0; row < 5; row++) {
      if (card.marked[row].every((marked) => marked)) {
        return true;
      }
    }

    // Check vertical lines
    for (let col = 0; col < 5; col++) {
      if (card.marked.every((row) => row[col])) {
        return true;
      }
    }

    // Check diagonal lines
    const diagonal1 = card.marked.every((row, index) => row[index]);
    const diagonal2 = card.marked.every((row, index) => row[4 - index]);

    return diagonal1 || diagonal2;
  }

  private declareWinner(
    player: BingoPlayer,
    pattern: WinPattern,
    card: BingoCard,
  ): void {
    player.hasWon = true;
    player.winTime = new Date();
    player.winPattern = pattern.name;
    player.winCard = card.id;

    const winner = {
      playerId: player.id,
      pattern: pattern.name,
      cardId: card.id,
      winTime: new Date(),
    };

    this.winners.push(winner);

    // Calculate prize
    const basePrize = this.room.prize;
    const winAmount = {
      gc: Math.floor(basePrize.gc * pattern.multiplier),
      sc: basePrize.sc * pattern.multiplier,
    };

    // Award prize
    this.addBalance(player.id, winAmount.gc, "GC");
    this.addBalance(player.id, winAmount.sc, "SC");

    this.emit("winner", {
      player: player.id,
      pattern: pattern.name,
      card: card.id,
      prize: winAmount,
    });

    // End game for certain patterns or if it's speed bingo
    if (pattern.name === "Full House" || this.room.type === "speed") {
      this.endGame();
    }
  }

  private startCallingNumbers(): void {
    const callInterval =
      this.room.type === "speed"
        ? 2000 // 2 seconds for speed
        : this.room.type === "regular"
          ? 5000 // 5 seconds for regular
          : 3000; // 3 seconds for others

    this.callTimer = setInterval(() => {
      this.callNextNumber();
    }, callInterval);

    // Game timer
    this.gameTimer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.endGame();
      }
      this.emit("timeUpdate", this.timeRemaining);
    }, 1000);
  }

  private stopTimers(): void {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  // Public API Methods
  startGame(): void {
    if (!this.canStart()) {
      throw new Error("Not enough players to start game");
    }

    this.setState("starting");
    this.initializeNumbers();
    this.calledNumbers = [];
    this.winners = [];
    this.currentCall = null;
    this.timeRemaining = this.room.gameLength * 60;

    // Generate cards for all players
    const players = this.getPlayers() as BingoPlayer[];
    players.forEach((player) => {
      player.cards = [];
      player.hasWon = false;
      player.winTime = undefined;
      player.winPattern = undefined;
      player.winCard = undefined;

      // Generate multiple cards based on room type
      const cardCount =
        this.room.type === "speed" ? 1 : this.room.type === "regular" ? 3 : 4;

      for (let i = 0; i < cardCount; i++) {
        player.cards.push(this.generateBingoCard(player.id));
      }
    });

    this.setState("playing");
    this.startCallingNumbers();
    this.emit("gameStarted", this.getGameState());
  }

  endGame(): void {
    this.setState("ended");
    this.stopTimers();

    // Distribute remaining prizes if any
    if (this.winners.length === 0 && this.pot.gc > 0) {
      // No winners - return buy-ins or carry over to next game
      this.emit("noWinners", { pot: this.pot });
    }

    this.emit("gameEnded", {
      winners: this.winners,
      calledNumbers: this.calledNumbers,
      finalPot: this.pot,
    });
  }

  processAction(playerId: string, action: any): any {
    // Bingo is mostly automated, but players might claim wins manually
    if (action.type === "claimWin") {
      return this.validateAndClaimWin(playerId, action.cardId, action.pattern);
    }

    if (action.type === "markNumber") {
      return this.manualMarkNumber(
        playerId,
        action.cardId,
        action.row,
        action.col,
      );
    }

    return { success: false, error: "Invalid action" };
  }

  private validateAndClaimWin(
    playerId: string,
    cardId: string,
    patternName: string,
  ): any {
    const player = this.getPlayer(playerId) as BingoPlayer;
    if (!player || player.hasWon) {
      return { success: false, error: "Invalid player or already won" };
    }

    const card = player.cards.find((c) => c.id === cardId);
    if (!card) {
      return { success: false, error: "Card not found" };
    }

    const pattern = BingoEngine.WIN_PATTERNS.find(
      (p) => p.name === patternName,
    );
    if (!pattern) {
      return { success: false, error: "Invalid pattern" };
    }

    if (this.checkPattern(card, pattern)) {
      this.declareWinner(player, pattern, card);
      return { success: true, message: "Winner confirmed!" };
    }

    return { success: false, error: "Pattern not complete" };
  }

  private manualMarkNumber(
    playerId: string,
    cardId: string,
    row: number,
    col: number,
  ): any {
    const player = this.getPlayer(playerId) as BingoPlayer;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    const card = player.cards.find((c) => c.id === cardId);
    if (!card) {
      return { success: false, error: "Card not found" };
    }

    // Verify the number was called
    const number = card.numbers[row][col];
    if (number === null) {
      return { success: false, error: "Free space cannot be marked" };
    }

    const wasCalled = this.calledNumbers.some(
      (called) => called.number === number,
    );
    if (!wasCalled) {
      return { success: false, error: "Number not yet called" };
    }

    card.marked[row][col] = true;
    return { success: true };
  }

  validateAction(playerId: string, action: any): boolean {
    const validActions = ["claimWin", "markNumber"];
    return validActions.includes(action.type);
  }

  getGameState(playerId?: string): BingoGameState {
    return {
      room: this.room,
      stage: this.gameStateStatus as any,
      calledNumbers: this.calledNumbers,
      timeRemaining: this.timeRemaining,
      currentCall: this.currentCall,
      winners: this.winners,
      pot: this.pot,
    };
  }

  addPlayer(player: Player): boolean {
    const bingoPlayer: BingoPlayer = {
      ...player,
      cards: [],
      hasWon: false,
    };

    // Charge buy-in
    const success = super.addPlayer(bingoPlayer);
    if (success) {
      // Add to pot
      this.pot.gc += this.room.buyIn.gc;
      this.pot.sc += this.room.buyIn.sc;
    }

    return success;
  }

  // Additional utility methods
  getRemainingNumbers(): number[] {
    return [...this.availableNumbers];
  }

  getCalledNumbers(): CalledNumber[] {
    return [...this.calledNumbers];
  }

  getPlayerCards(playerId: string): BingoCard[] {
    const player = this.getPlayer(playerId) as BingoPlayer;
    return player?.cards || [];
  }

  getWinPatterns(): WinPattern[] {
    return BingoEngine.WIN_PATTERNS;
  }
}
