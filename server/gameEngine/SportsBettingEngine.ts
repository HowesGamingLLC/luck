import { EventEmitter } from "events";

export interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  status: "upcoming" | "live" | "finished" | "postponed" | "cancelled";
  homeScore?: number;
  awayScore?: number;
  period?: string; // Quarter, Half, Inning, etc.
  timeRemaining?: string;
  venue?: string;
  weather?: string;
}

export interface Market {
  id: string;
  gameId: string;
  type: "spread" | "moneyline" | "total" | "prop";
  name: string;
  description: string;
  status: "open" | "closed" | "suspended";
  outcomes: Outcome[];
  limits: {
    min: number;
    max: number;
  };
}

export interface Outcome {
  id: string;
  name: string;
  odds: number; // American odds format
  line?: number; // Spread or total value
  probability: number; // Implied probability
  isWinning?: boolean;
}

export interface Bet {
  id: string;
  playerId: string;
  type: "straight" | "parlay" | "teaser";
  selections: BetSelection[];
  wager: number;
  currency: "GC" | "SC";
  potentialPayout: number;
  status: "pending" | "won" | "lost" | "pushed" | "cancelled";
  placedAt: Date;
  settledAt?: Date;
  actualPayout?: number;
}

export interface BetSelection {
  gameId: string;
  marketId: string;
  outcomeId: string;
  odds: number;
  line?: number;
  isWinner?: boolean;
}

export interface ParlayTicket extends Bet {
  type: "parlay";
  combinedOdds: number;
  minSelectionsRequired: number;
}

export interface LiveData {
  gameId: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  events: GameEvent[];
  updatedAt: Date;
}

export interface GameEvent {
  id: string;
  type:
    | "goal"
    | "touchdown"
    | "basket"
    | "run"
    | "timeout"
    | "penalty"
    | "injury";
  team: "home" | "away";
  player?: string;
  description: string;
  timestamp: Date;
  period: string;
}

export interface OddsMovement {
  marketId: string;
  outcomeId: string;
  oldOdds: number;
  newOdds: number;
  timestamp: Date;
  reason: string;
}

export class SportsBettingEngine extends EventEmitter {
  private games: Map<string, Game> = new Map();
  private markets: Map<string, Market> = new Map();
  private bets: Map<string, Bet> = new Map();
  private liveData: Map<string, LiveData> = new Map();
  private oddsHistory: Map<string, OddsMovement[]> = new Map();
  private riskLimits: {
    maxExposure: number;
    maxParlayLegs: number;
    maxPayout: number;
  } = {
    maxExposure: 10000,
    maxParlayLegs: 12,
    maxPayout: 50000,
  };

  constructor() {
    super();
    this.initializeSampleData();
    this.startLiveDataUpdates();
  }

  private initializeSampleData(): void {
    // Sample NFL game
    const nflGame: Game = {
      id: "nfl-game-1",
      sport: "NFL",
      league: "NFL",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: "upcoming",
      venue: "Arrowhead Stadium",
    };

    // Sample NBA game
    const nbaGame: Game = {
      id: "nba-game-1",
      sport: "NBA",
      league: "NBA",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      status: "upcoming",
      venue: "Crypto.com Arena",
    };

    this.games.set(nflGame.id, nflGame);
    this.games.set(nbaGame.id, nbaGame);

    // Create markets for games
    this.createMarketsForGame(nflGame);
    this.createMarketsForGame(nbaGame);
  }

  private createMarketsForGame(game: Game): void {
    // Spread market
    const spreadMarket: Market = {
      id: `${game.id}-spread`,
      gameId: game.id,
      type: "spread",
      name: "Point Spread",
      description: "Point spread betting",
      status: "open",
      limits: { min: 0.25, max: 500 },
      outcomes: [
        {
          id: `${game.id}-spread-home`,
          name: `${game.homeTeam} -3.5`,
          odds: -110,
          line: -3.5,
          probability: 0.524,
        },
        {
          id: `${game.id}-spread-away`,
          name: `${game.awayTeam} +3.5`,
          odds: -110,
          line: 3.5,
          probability: 0.524,
        },
      ],
    };

    // Moneyline market
    const moneylineMarket: Market = {
      id: `${game.id}-moneyline`,
      gameId: game.id,
      type: "moneyline",
      name: "Moneyline",
      description: "Win outright",
      status: "open",
      limits: { min: 0.25, max: 250 },
      outcomes: [
        {
          id: `${game.id}-ml-home`,
          name: game.homeTeam,
          odds: -180,
          probability: 0.643,
        },
        {
          id: `${game.id}-ml-away`,
          name: game.awayTeam,
          odds: 150,
          probability: 0.4,
        },
      ],
    };

    // Total (Over/Under) market
    const totalMarket: Market = {
      id: `${game.id}-total`,
      gameId: game.id,
      type: "total",
      name: "Total Points",
      description: "Over/Under total points",
      status: "open",
      limits: { min: 0.25, max: 300 },
      outcomes: [
        {
          id: `${game.id}-total-over`,
          name: "Over 47.5",
          odds: -110,
          line: 47.5,
          probability: 0.524,
        },
        {
          id: `${game.id}-total-under`,
          name: "Under 47.5",
          odds: -110,
          line: 47.5,
          probability: 0.524,
        },
      ],
    };

    this.markets.set(spreadMarket.id, spreadMarket);
    this.markets.set(moneylineMarket.id, moneylineMarket);
    this.markets.set(totalMarket.id, totalMarket);
  }

  private startLiveDataUpdates(): void {
    // Simulate live data updates every 30 seconds
    setInterval(() => {
      this.updateLiveGames();
    }, 30000);

    // Simulate odds movements every 2 minutes
    setInterval(() => {
      this.simulateOddsMovements();
    }, 120000);
  }

  private updateLiveGames(): void {
    for (const [gameId, game] of this.games) {
      if (game.status === "live") {
        this.simulateLiveGameUpdate(game);
      } else if (game.status === "upcoming" && game.gameTime <= new Date()) {
        this.startGame(gameId);
      }
    }
  }

  private simulateLiveGameUpdate(game: Game): void {
    const liveData = this.liveData.get(game.id);
    if (!liveData) return;

    // Simulate score updates
    if (Math.random() < 0.1) {
      // 10% chance of score change
      const scoringTeam = Math.random() < 0.5 ? "home" : "away";
      const points = this.getRandomScore(game.sport);

      if (scoringTeam === "home") {
        liveData.homeScore += points;
        game.homeScore = liveData.homeScore;
      } else {
        liveData.awayScore += points;
        game.awayScore = liveData.awayScore;
      }

      const event: GameEvent = {
        id: this.generateId(),
        type: this.getScoreEventType(game.sport),
        team: scoringTeam,
        description: `Score: ${points} points`,
        timestamp: new Date(),
        period: liveData.period,
      };

      liveData.events.push(event);
      liveData.updatedAt = new Date();

      this.emit("liveUpdate", { gameId: game.id, liveData, event });
      this.adjustLiveOdds(game.id);
    }
  }

  private getRandomScore(sport: string): number {
    switch (sport) {
      case "NFL":
        return Math.random() < 0.7 ? 7 : 3; // TD or FG
      case "NBA":
        return Math.random() < 0.6 ? 2 : 3; // 2pt or 3pt
      case "MLB":
        return 1; // Single run
      case "NHL":
        return 1; // Single goal
      default:
        return 1;
    }
  }

  private getScoreEventType(sport: string): GameEvent["type"] {
    switch (sport) {
      case "NFL":
        return "touchdown";
      case "NBA":
        return "basket";
      case "MLB":
        return "run";
      case "NHL":
        return "goal";
      default:
        return "goal";
    }
  }

  private adjustLiveOdds(gameId: string): void {
    const game = this.games.get(gameId);
    const liveData = this.liveData.get(gameId);
    if (!game || !liveData) return;

    // Adjust moneyline odds based on current score
    const scoreDiff = liveData.homeScore - liveData.awayScore;
    const moneylineMarket = Array.from(this.markets.values()).find(
      (m) => m.gameId === gameId && m.type === "moneyline",
    );

    if (moneylineMarket) {
      const homeOutcome = moneylineMarket.outcomes.find(
        (o) => o.name === game.homeTeam,
      );
      const awayOutcome = moneylineMarket.outcomes.find(
        (o) => o.name === game.awayTeam,
      );

      if (homeOutcome && awayOutcome) {
        // Adjust odds based on score differential
        const adjustment = scoreDiff * 20; // Simple adjustment factor

        const oldHomeOdds = homeOutcome.odds;
        const oldAwayOdds = awayOutcome.odds;

        homeOutcome.odds -= adjustment;
        awayOutcome.odds += adjustment;

        // Record odds movements
        this.recordOddsMovement(
          moneylineMarket.id,
          homeOutcome.id,
          oldHomeOdds,
          homeOutcome.odds,
          "Score change",
        );
        this.recordOddsMovement(
          moneylineMarket.id,
          awayOutcome.id,
          oldAwayOdds,
          awayOutcome.odds,
          "Score change",
        );

        this.emit("oddsChanged", {
          marketId: moneylineMarket.id,
          reason: "Live score update",
        });
      }
    }
  }

  private simulateOddsMovements(): void {
    // Randomly adjust odds for open markets
    for (const [marketId, market] of this.markets) {
      if (market.status === "open" && Math.random() < 0.3) {
        // 30% chance
        this.adjustMarketOdds(market, "Market movement");
      }
    }
  }

  private adjustMarketOdds(market: Market, reason: string): void {
    for (const outcome of market.outcomes) {
      const adjustment = (Math.random() - 0.5) * 20; // +/- 10 points
      const oldOdds = outcome.odds;
      outcome.odds += adjustment;

      // Ensure odds stay within reasonable bounds
      outcome.odds = Math.max(-500, Math.min(500, outcome.odds));

      if (Math.abs(adjustment) > 5) {
        this.recordOddsMovement(
          market.id,
          outcome.id,
          oldOdds,
          outcome.odds,
          reason,
        );
      }
    }

    this.emit("oddsChanged", { marketId: market.id, reason });
  }

  private recordOddsMovement(
    marketId: string,
    outcomeId: string,
    oldOdds: number,
    newOdds: number,
    reason: string,
  ): void {
    const movement: OddsMovement = {
      marketId,
      outcomeId,
      oldOdds,
      newOdds,
      timestamp: new Date(),
      reason,
    };

    if (!this.oddsHistory.has(outcomeId)) {
      this.oddsHistory.set(outcomeId, []);
    }
    this.oddsHistory.get(outcomeId)!.push(movement);
  }

  private startGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.status = "live";
    game.homeScore = 0;
    game.awayScore = 0;

    const liveData: LiveData = {
      gameId,
      homeScore: 0,
      awayScore: 0,
      period: "1st",
      timeRemaining: "15:00",
      events: [],
      updatedAt: new Date(),
    };

    this.liveData.set(gameId, liveData);
    this.emit("gameStarted", { gameId, game, liveData });
  }

  private calculateParlayOdds(selections: BetSelection[]): number {
    let totalOdds = 1;

    for (const selection of selections) {
      const decimalOdds = this.americanToDecimalOdds(selection.odds);
      totalOdds *= decimalOdds;
    }

    return this.decimalToAmericanOdds(totalOdds);
  }

  private americanToDecimalOdds(americanOdds: number): number {
    if (americanOdds > 0) {
      return americanOdds / 100 + 1;
    } else {
      return 100 / Math.abs(americanOdds) + 1;
    }
  }

  private decimalToAmericanOdds(decimalOdds: number): number {
    if (decimalOdds >= 2) {
      return (decimalOdds - 1) * 100;
    } else {
      return -100 / (decimalOdds - 1);
    }
  }

  private calculatePayout(wager: number, odds: number): number {
    if (odds > 0) {
      return wager + (wager * odds) / 100;
    } else {
      return wager + (wager * 100) / Math.abs(odds);
    }
  }

  private validateBet(bet: Omit<Bet, "id" | "placedAt" | "status">): {
    valid: boolean;
    error?: string;
  } {
    // Check minimum wager
    if (bet.wager < 0.25) {
      return { valid: false, error: "Minimum wager is $0.25" };
    }

    // Check selections
    if (bet.selections.length === 0) {
      return { valid: false, error: "No selections provided" };
    }

    // Validate parlay requirements
    if (bet.type === "parlay") {
      if (bet.selections.length < 2) {
        return { valid: false, error: "Parlay requires at least 2 selections" };
      }
      if (bet.selections.length > this.riskLimits.maxParlayLegs) {
        return {
          valid: false,
          error: `Maximum ${this.riskLimits.maxParlayLegs} selections allowed`,
        };
      }
    }

    // Check market limits and availability
    for (const selection of bet.selections) {
      const market = this.markets.get(selection.marketId);
      if (!market) {
        return { valid: false, error: "Market not found" };
      }
      if (market.status !== "open") {
        return { valid: false, error: "Market is not accepting bets" };
      }
      if (bet.wager < market.limits.min || bet.wager > market.limits.max) {
        return {
          valid: false,
          error: `Wager must be between $${market.limits.min} and $${market.limits.max}`,
        };
      }
    }

    // Check maximum payout
    if (bet.potentialPayout > this.riskLimits.maxPayout) {
      return {
        valid: false,
        error: `Maximum payout is $${this.riskLimits.maxPayout}`,
      };
    }

    return { valid: true };
  }

  private settleBet(bet: Bet): void {
    if (bet.status !== "pending") return;

    let isWinner = true;
    let allSettled = true;

    for (const selection of bet.selections) {
      const market = this.markets.get(selection.marketId);
      if (!market) continue;

      const outcome = market.outcomes.find((o) => o.id === selection.outcomeId);
      if (!outcome || outcome.isWinning === undefined) {
        allSettled = false;
        continue;
      }

      selection.isWinner = outcome.isWinning;
      if (!outcome.isWinning) {
        isWinner = false;
      }
    }

    if (!allSettled) return; // Wait for all selections to be settled

    if (isWinner) {
      bet.status = "won";
      bet.actualPayout = bet.potentialPayout;
    } else {
      bet.status = "lost";
      bet.actualPayout = 0;
    }

    bet.settledAt = new Date();
    this.emit("betSettled", bet);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public API Methods
  public getGames(sport?: string, status?: Game["status"]): Game[] {
    let games = Array.from(this.games.values());

    if (sport) {
      games = games.filter((g) => g.sport === sport);
    }
    if (status) {
      games = games.filter((g) => g.status === status);
    }

    return games;
  }

  public getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  public getMarketsForGame(gameId: string): Market[] {
    return Array.from(this.markets.values()).filter((m) => m.gameId === gameId);
  }

  public getMarket(marketId: string): Market | undefined {
    return this.markets.get(marketId);
  }

  public placeBet(betData: Omit<Bet, "id" | "placedAt" | "status">): {
    success: boolean;
    betId?: string;
    error?: string;
  } {
    const validation = this.validateBet(betData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Calculate potential payout
    let potentialPayout: number;
    if (betData.type === "parlay") {
      const combinedOdds = this.calculateParlayOdds(betData.selections);
      potentialPayout = this.calculatePayout(betData.wager, combinedOdds);
    } else {
      const odds = betData.selections[0].odds;
      potentialPayout = this.calculatePayout(betData.wager, odds);
    }

    const bet: Bet = {
      ...betData,
      id: this.generateId(),
      potentialPayout,
      status: "pending",
      placedAt: new Date(),
    };

    this.bets.set(bet.id, bet);
    this.emit("betPlaced", bet);

    return { success: true, betId: bet.id };
  }

  public getBet(betId: string): Bet | undefined {
    return this.bets.get(betId);
  }

  public getPlayerBets(playerId: string): Bet[] {
    return Array.from(this.bets.values()).filter(
      (b) => b.playerId === playerId,
    );
  }

  public getLiveData(gameId: string): LiveData | undefined {
    return this.liveData.get(gameId);
  }

  public getOddsHistory(outcomeId: string): OddsMovement[] {
    return this.oddsHistory.get(outcomeId) || [];
  }

  public finishGame(
    gameId: string,
    homeScore: number,
    awayScore: number,
  ): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.status = "finished";
    game.homeScore = homeScore;
    game.awayScore = awayScore;

    // Settle all outcomes for this game
    const gameMarkets = this.getMarketsForGame(gameId);
    for (const market of gameMarkets) {
      this.settleMarket(market, homeScore, awayScore);
    }

    // Settle all related bets
    const relatedBets = Array.from(this.bets.values()).filter((bet) =>
      bet.selections.some((s) => s.gameId === gameId),
    );

    for (const bet of relatedBets) {
      this.settleBet(bet);
    }

    this.emit("gameFinished", { gameId, homeScore, awayScore });
  }

  private settleMarket(
    market: Market,
    homeScore: number,
    awayScore: number,
  ): void {
    const scoreDiff = homeScore - awayScore;

    switch (market.type) {
      case "moneyline":
        market.outcomes.forEach((outcome) => {
          const game = this.games.get(market.gameId)!;
          if (outcome.name === game.homeTeam) {
            outcome.isWinning = homeScore > awayScore;
          } else {
            outcome.isWinning = awayScore > homeScore;
          }
        });
        break;

      case "spread":
        market.outcomes.forEach((outcome) => {
          if (outcome.line! < 0) {
            // Home team spread
            outcome.isWinning = scoreDiff > Math.abs(outcome.line!);
          } else {
            // Away team spread
            outcome.isWinning = scoreDiff < -Math.abs(outcome.line!);
          }
        });
        break;

      case "total":
        const totalScore = homeScore + awayScore;
        market.outcomes.forEach((outcome) => {
          if (outcome.name.includes("Over")) {
            outcome.isWinning = totalScore > outcome.line!;
          } else {
            outcome.isWinning = totalScore < outcome.line!;
          }
        });
        break;
    }

    market.status = "closed";
  }

  public updateRiskLimits(limits: Partial<typeof this.riskLimits>): void {
    this.riskLimits = { ...this.riskLimits, ...limits };
  }

  public suspendMarket(marketId: string): void {
    const market = this.markets.get(marketId);
    if (market) {
      market.status = "suspended";
      this.emit("marketSuspended", marketId);
    }
  }

  public reopenMarket(marketId: string): void {
    const market = this.markets.get(marketId);
    if (market) {
      market.status = "open";
      this.emit("marketReopened", marketId);
    }
  }
}
