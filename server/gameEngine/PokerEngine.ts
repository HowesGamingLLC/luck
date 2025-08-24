import { GameEngine, Player, GameResult } from "./GameEngine";

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "T"
    | "J"
    | "Q"
    | "K";
  value: number;
}

export interface PokerPlayer extends Player {
  hand: Card[];
  chips: number;
  currentBet: number;
  totalBet: number;
  position: number;
  isDealer: boolean;
  isBigBlind: boolean;
  isSmallBlind: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  hasActed: boolean;
  seatNumber: number;
}

export interface HandResult {
  rank: number;
  name: string;
  cards: Card[];
  kickers: number[];
}

export interface PokerGameState {
  stage: "preflop" | "flop" | "turn" | "river" | "showdown";
  communityCards: Card[];
  pot: number;
  currentBet: number;
  actionOn: string | null; // player ID
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
  winners: { playerId: string; amount: number; hand: HandResult }[];
}

export class PokerEngine extends GameEngine {
  private deck: Card[] = [];
  private communityCards: Card[] = [];
  private pot: number = 0;
  private currentBet: number = 0;
  private actionOn: string | null = null;
  private smallBlind: number;
  private bigBlind: number;
  private dealerPosition: number = 0;
  private stage: "preflop" | "flop" | "turn" | "river" | "showdown" = "preflop";
  private sidePots: { amount: number; players: string[] }[] = [];

  constructor(gameId: string, smallBlind: number = 1, bigBlind: number = 2) {
    super(gameId, 2, 9);
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
  }

  private createDeck(): Card[] {
    const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Card["rank"][] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
    ];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (let i = 0; i < ranks.length; i++) {
        const rank = ranks[i];
        const value =
          rank === "A"
            ? 14
            : rank === "K"
              ? 13
              : rank === "Q"
                ? 12
                : rank === "J"
                  ? 11
                  : rank === "T"
                    ? 10
                    : parseInt(rank);
        deck.push({ suit, rank, value });
      }
    }

    return this.shuffleArray(deck);
  }

  private dealCards(): void {
    const players = this.getPlayers() as PokerPlayer[];
    players.forEach((player) => {
      player.hand = [this.deck.pop()!, this.deck.pop()!];
    });
  }

  private postBlinds(): void {
    const players = this.getPlayers() as PokerPlayer[];
    const activePlayersCount = players.filter((p) => !p.isFolded).length;

    if (activePlayersCount < 2) return;

    const smallBlindPlayer =
      players[(this.dealerPosition + 1) % players.length];
    const bigBlindPlayer = players[(this.dealerPosition + 2) % players.length];

    smallBlindPlayer.isSmallBlind = true;
    bigBlindPlayer.isBigBlind = true;

    this.forceBet(smallBlindPlayer.id, this.smallBlind);
    this.forceBet(bigBlindPlayer.id, this.bigBlind);

    this.currentBet = this.bigBlind;
    this.actionOn = players[(this.dealerPosition + 3) % players.length].id;
  }

  private forceBet(playerId: string, amount: number): void {
    const player = this.getPlayer(playerId) as PokerPlayer;
    if (!player) return;

    const betAmount = Math.min(amount, player.chips);
    player.chips -= betAmount;
    player.currentBet += betAmount;
    player.totalBet += betAmount;
    this.pot += betAmount;

    if (player.chips === 0) {
      player.isAllIn = true;
    }
  }

  private evaluateHand(
    playerCards: Card[],
    communityCards: Card[],
  ): HandResult {
    const allCards = [...playerCards, ...communityCards];
    const best5Cards = this.findBest5CardHand(allCards);

    return this.getHandRank(best5Cards);
  }

  private findBest5CardHand(cards: Card[]): Card[] {
    // Generate all possible 5-card combinations
    const combinations: Card[][] = [];
    this.generateCombinations(cards, 5, [], 0, combinations);

    let bestHand = combinations[0];
    let bestRank = this.getHandRank(bestHand);

    for (let i = 1; i < combinations.length; i++) {
      const currentRank = this.getHandRank(combinations[i]);
      if (this.compareHands(currentRank, bestRank) > 0) {
        bestHand = combinations[i];
        bestRank = currentRank;
      }
    }

    return bestHand;
  }

  private generateCombinations(
    cards: Card[],
    r: number,
    current: Card[],
    start: number,
    results: Card[][],
  ): void {
    if (current.length === r) {
      results.push([...current]);
      return;
    }

    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      this.generateCombinations(cards, r, current, i + 1, results);
      current.pop();
    }
  }

  private getHandRank(cards: Card[]): HandResult {
    const sorted = cards.sort((a, b) => b.value - a.value);
    const suits = sorted.map((c) => c.suit);
    const values = sorted.map((c) => c.value);

    const isFlush = suits.every((suit) => suit === suits[0]);
    const isStraight = this.isStraight(values);
    const valueCounts = this.getValueCounts(values);
    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    // Royal Flush
    if (isFlush && isStraight && values[0] === 14) {
      return { rank: 9, name: "Royal Flush", cards: sorted, kickers: [] };
    }

    // Straight Flush
    if (isFlush && isStraight) {
      return {
        rank: 8,
        name: "Straight Flush",
        cards: sorted,
        kickers: [values[0]],
      };
    }

    // Four of a Kind
    if (counts[0] === 4) {
      const fourKind = this.findValueWithCount(valueCounts, 4);
      const kicker = this.findValueWithCount(valueCounts, 1);
      return {
        rank: 7,
        name: "Four of a Kind",
        cards: sorted,
        kickers: [fourKind, kicker],
      };
    }

    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
      const threeKind = this.findValueWithCount(valueCounts, 3);
      const pair = this.findValueWithCount(valueCounts, 2);
      return {
        rank: 6,
        name: "Full House",
        cards: sorted,
        kickers: [threeKind, pair],
      };
    }

    // Flush
    if (isFlush) {
      return { rank: 5, name: "Flush", cards: sorted, kickers: values };
    }

    // Straight
    if (isStraight) {
      return { rank: 4, name: "Straight", cards: sorted, kickers: [values[0]] };
    }

    // Three of a Kind
    if (counts[0] === 3) {
      const threeKind = this.findValueWithCount(valueCounts, 3);
      const kickers = values.filter((v) => v !== threeKind).slice(0, 2);
      return {
        rank: 3,
        name: "Three of a Kind",
        cards: sorted,
        kickers: [threeKind, ...kickers],
      };
    }

    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = values
        .filter((v) => valueCounts[v] === 2)
        .sort((a, b) => b - a);
      const kicker = values.find((v) => valueCounts[v] === 1) || 0;
      return {
        rank: 2,
        name: "Two Pair",
        cards: sorted,
        kickers: [pairs[0], pairs[1], kicker],
      };
    }

    // One Pair
    if (counts[0] === 2) {
      const pair = this.findValueWithCount(valueCounts, 2);
      const kickers = values.filter((v) => v !== pair).slice(0, 3);
      return {
        rank: 1,
        name: "One Pair",
        cards: sorted,
        kickers: [pair, ...kickers],
      };
    }

    // High Card
    return { rank: 0, name: "High Card", cards: sorted, kickers: values };
  }

  private isStraight(values: number[]): boolean {
    const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
    if (uniqueValues.length < 5) return false;

    // Check for regular straight
    for (let i = 0; i < uniqueValues.length - 4; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) return true;
    }

    // Check for A-2-3-4-5 straight (wheel)
    if (
      uniqueValues.includes(14) &&
      uniqueValues.includes(5) &&
      uniqueValues.includes(4) &&
      uniqueValues.includes(3) &&
      uniqueValues.includes(2)
    ) {
      return true;
    }

    return false;
  }

  private getValueCounts(values: number[]): { [key: number]: number } {
    const counts: { [key: number]: number } = {};
    values.forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  private findValueWithCount(
    counts: { [key: number]: number },
    count: number,
  ): number {
    for (const [value, valueCount] of Object.entries(counts)) {
      if (valueCount === count) return parseInt(value);
    }
    return 0;
  }

  private compareHands(hand1: HandResult, hand2: HandResult): number {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank;
    }

    // Compare kickers
    for (
      let i = 0;
      i < Math.max(hand1.kickers.length, hand2.kickers.length);
      i++
    ) {
      const kicker1 = hand1.kickers[i] || 0;
      const kicker2 = hand2.kickers[i] || 0;
      if (kicker1 !== kicker2) {
        return kicker1 - kicker2;
      }
    }

    return 0; // Tie
  }

  private advanceAction(): void {
    const players = this.getPlayers() as PokerPlayer[];
    const activePlayers = players.filter((p) => !p.isFolded && !p.isAllIn);

    if (activePlayers.length <= 1) {
      this.advanceStage();
      return;
    }

    let currentIndex = players.findIndex((p) => p.id === this.actionOn);
    let nextIndex = (currentIndex + 1) % players.length;

    // Find next player who can act
    while (players[nextIndex].isFolded || players[nextIndex].isAllIn) {
      nextIndex = (nextIndex + 1) % players.length;
      if (nextIndex === currentIndex) {
        // No one else can act
        this.advanceStage();
        return;
      }
    }

    this.actionOn = players[nextIndex].id;
  }

  private advanceStage(): void {
    // Check if betting round is complete
    const players = this.getPlayers() as PokerPlayer[];
    const activePlayers = players.filter((p) => !p.isFolded);

    if (activePlayers.length === 1) {
      this.endGame();
      return;
    }

    // Reset betting for next stage
    players.forEach((player) => {
      player.currentBet = 0;
      player.hasActed = false;
    });
    this.currentBet = 0;

    switch (this.stage) {
      case "preflop":
        this.stage = "flop";
        this.communityCards.push(
          this.deck.pop()!,
          this.deck.pop()!,
          this.deck.pop()!,
        );
        break;
      case "flop":
        this.stage = "turn";
        this.communityCards.push(this.deck.pop()!);
        break;
      case "turn":
        this.stage = "river";
        this.communityCards.push(this.deck.pop()!);
        break;
      case "river":
        this.stage = "showdown";
        this.determineWinners();
        return;
    }

    // Set action to first player after dealer
    this.actionOn = players[(this.dealerPosition + 1) % players.length].id;
    this.emit("stageAdvanced", this.stage);
  }

  private determineWinners(): void {
    const players = this.getPlayers() as PokerPlayer[];
    const activePlayers = players.filter((p) => !p.isFolded);

    const handResults = activePlayers.map((player) => ({
      playerId: player.id,
      hand: this.evaluateHand(player.hand, this.communityCards),
    }));

    // Sort by hand strength (best first)
    handResults.sort((a, b) => this.compareHands(b.hand, a.hand));

    // Determine winning hands and distribute pot
    const winners = [];
    let currentRank = handResults[0];
    let winningAmount = this.pot;

    // Find all players with the best hand
    const bestHands = handResults.filter(
      (result) => this.compareHands(result.hand, currentRank.hand) === 0,
    );

    const winAmountPerPlayer = Math.floor(winningAmount / bestHands.length);

    for (const winner of bestHands) {
      const player = this.getPlayer(winner.playerId) as PokerPlayer;
      player.chips += winAmountPerPlayer;
      winners.push({
        playerId: winner.playerId,
        amount: winAmountPerPlayer,
        hand: winner.hand,
      });
    }

    this.emit("gameEnded", { winners, pot: this.pot });
  }

  // Public API Methods
  startGame(): void {
    if (!this.canStart()) {
      throw new Error("Not enough players to start game");
    }

    this.setState("starting");
    this.deck = this.createDeck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.stage = "preflop";

    // Initialize players
    const players = this.getPlayers() as PokerPlayer[];
    players.forEach((player, index) => {
      player.hand = [];
      player.currentBet = 0;
      player.totalBet = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.hasActed = false;
      player.seatNumber = index;
      player.isDealer = index === this.dealerPosition;
      player.isSmallBlind = false;
      player.isBigBlind = false;
    });

    this.dealCards();
    this.postBlinds();
    this.setState("playing");

    this.emit("gameStarted", this.getGameState());
  }

  endGame(): void {
    this.setState("ended");
    this.dealerPosition = (this.dealerPosition + 1) % this.getPlayers().length;

    // Remove players with no chips
    const players = this.getPlayers() as PokerPlayer[];
    players.forEach((player) => {
      if (player.chips <= 0) {
        this.removePlayer(player.id);
      }
    });

    this.emit("gameEnded");
  }

  processAction(playerId: string, action: any): any {
    if (!this.validateAction(playerId, action)) {
      return { success: false, error: "Invalid action" };
    }

    const player = this.getPlayer(playerId) as PokerPlayer;

    switch (action.type) {
      case "fold":
        player.isFolded = true;
        break;

      case "check":
        if (this.currentBet > player.currentBet) {
          return { success: false, error: "Cannot check, must call or fold" };
        }
        break;

      case "call":
        const callAmount = this.currentBet - player.currentBet;
        this.forceBet(playerId, callAmount);
        break;

      case "bet":
      case "raise":
        const betAmount = action.amount;
        if (betAmount < this.currentBet * 2) {
          return {
            success: false,
            error: "Raise must be at least double current bet",
          };
        }
        this.forceBet(playerId, betAmount - player.currentBet);
        this.currentBet = betAmount;
        break;

      case "allIn":
        this.forceBet(playerId, player.chips);
        if (player.currentBet > this.currentBet) {
          this.currentBet = player.currentBet;
        }
        break;
    }

    player.hasActed = true;
    this.advanceAction();

    return { success: true, gameState: this.getGameState() };
  }

  validateAction(playerId: string, action: any): boolean {
    if (this.actionOn !== playerId) return false;

    const player = this.getPlayer(playerId) as PokerPlayer;
    if (!player || player.isFolded || player.isAllIn) return false;

    const validActions = ["fold", "check", "call", "bet", "raise", "allIn"];
    return validActions.includes(action.type);
  }

  getGameState(playerId?: string): PokerGameState {
    return {
      stage: this.stage,
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      actionOn: this.actionOn,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      dealerPosition: this.dealerPosition,
      winners: [],
    };
  }

  addPlayer(player: Player): boolean {
    const pokerPlayer: PokerPlayer = {
      ...player,
      hand: [],
      chips: 1000, // Starting chips
      currentBet: 0,
      totalBet: 0,
      position: this.players.size,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: false,
      isFolded: false,
      isAllIn: false,
      hasActed: false,
      seatNumber: this.players.size,
    };

    return super.addPlayer(pokerPlayer);
  }
}
