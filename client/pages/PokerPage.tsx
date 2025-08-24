import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import {
  Spade,
  Users,
  Clock,
  Trophy,
  Coins,
  Gem,
  ArrowLeft,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Target,
  Crown,
  Star,
  Heart,
  Diamond,
  Club,
  Timer,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PokerCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  value: number;
}

interface PokerPlayer {
  id: string;
  name: string;
  avatar?: string;
  chips: number;
  position: number;
  hand: PokerCard[];
  isActive: boolean;
  isFolded: boolean;
  currentBet: number;
  isAllIn: boolean;
  isDealer: boolean;
  isBigBlind: boolean;
  isSmallBlind: boolean;
}

interface PokerTable {
  id: string;
  name: string;
  gameType: "holdem" | "omaha" | "stud";
  stakes: string;
  buyIn: { gc: number; sc: number };
  blinds: { small: number; big: number };
  maxPlayers: number;
  currentPlayers: number;
  currency: "GC" | "SC" | "Both";
  isActive: boolean;
  pot: number;
  gameStage: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
}

interface Tournament {
  id: string;
  name: string;
  type: "sit-n-go" | "scheduled" | "freeroll";
  buyIn: { gc: number; sc: number };
  prize: { gc: number; sc: number };
  startTime: Date;
  registered: number;
  maxPlayers: number;
  status: "registering" | "starting" | "playing" | "finished";
  timeToStart: number; // minutes
}

export default function PokerPage() {
  const { user, canAffordWager, updateBalance } = useCurrency();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    CurrencyType.GC,
  );
  const [playerAction, setPlayerAction] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);

  // Mock poker tables
  const pokerTables: PokerTable[] = [
    {
      id: "table-1",
      name: "Beginner Texas Hold'em",
      gameType: "holdem",
      stakes: "1/2",
      buyIn: { gc: 100, sc: 1.0 },
      blinds: { small: 1, big: 2 },
      maxPlayers: 6,
      currentPlayers: 4,
      currency: "Both",
      isActive: true,
      pot: 24,
      gameStage: "flop",
    },
    {
      id: "table-2",
      name: "Intermediate Hold'em",
      gameType: "holdem",
      stakes: "5/10",
      buyIn: { gc: 500, sc: 5.0 },
      blinds: { small: 5, big: 10 },
      maxPlayers: 9,
      currentPlayers: 7,
      currency: "Both",
      isActive: true,
      pot: 87,
      gameStage: "preflop",
    },
    {
      id: "table-3",
      name: "High Stakes VIP",
      gameType: "holdem",
      stakes: "25/50",
      buyIn: { gc: 2500, sc: 25.0 },
      blinds: { small: 25, big: 50 },
      maxPlayers: 6,
      currentPlayers: 3,
      currency: "SC",
      isActive: true,
      pot: 150,
      gameStage: "turn",
    },
  ];

  // Mock tournaments
  const tournaments: Tournament[] = [
    {
      id: "tourney-1",
      name: "Daily Freeroll",
      type: "freeroll",
      buyIn: { gc: 0, sc: 0 },
      prize: { gc: 10000, sc: 100 },
      startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      registered: 234,
      maxPlayers: 500,
      status: "registering",
      timeToStart: 15,
    },
    {
      id: "tourney-2",
      name: "Sit & Go Turbo",
      type: "sit-n-go",
      buyIn: { gc: 100, sc: 1.0 },
      prize: { gc: 1000, sc: 10.0 },
      startTime: new Date(),
      registered: 8,
      maxPlayers: 9,
      status: "starting",
      timeToStart: 0,
    },
    {
      id: "tourney-3",
      name: "Weekend Warrior",
      type: "scheduled",
      buyIn: { gc: 500, sc: 5.0 },
      prize: { gc: 25000, sc: 250.0 },
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      registered: 67,
      maxPlayers: 200,
      status: "registering",
      timeToStart: 120,
    },
  ];

  // Mock community cards and player hands
  const [communityCards, setCommunityCards] = useState<PokerCard[]>([
    { suit: "hearts", rank: "A", value: 14 },
    { suit: "spades", rank: "K", value: 13 },
    { suit: "diamonds", rank: "Q", value: 12 },
  ]);

  const [playerHand, setPlayerHand] = useState<PokerCard[]>([
    { suit: "hearts", rank: "J", value: 11 },
    { suit: "hearts", rank: "10", value: 10 },
  ]);

  const [players, setPlayers] = useState<PokerPlayer[]>([
    {
      id: "player-1",
      name: "You",
      chips: 485,
      position: 0,
      hand: playerHand,
      isActive: true,
      isFolded: false,
      currentBet: 10,
      isAllIn: false,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: true,
    },
    {
      id: "player-2",
      name: "PokerPro***",
      chips: 720,
      position: 1,
      hand: [],
      isActive: false,
      isFolded: false,
      currentBet: 10,
      isAllIn: false,
      isDealer: false,
      isBigBlind: true,
      isSmallBlind: false,
    },
    {
      id: "player-3",
      name: "CardShark***",
      chips: 340,
      position: 2,
      hand: [],
      isActive: false,
      isFolded: true,
      currentBet: 0,
      isAllIn: false,
      isDealer: true,
      isBigBlind: false,
      isSmallBlind: false,
    },
    {
      id: "player-4",
      name: "AllInAnnie***",
      chips: 0,
      position: 3,
      hand: [],
      isActive: false,
      isFolded: false,
      currentBet: 50,
      isAllIn: true,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: false,
    },
  ]);

  const suits = {
    hearts: { symbol: "♥", color: "text-red-500", icon: Heart },
    diamonds: { symbol: "♦", color: "text-red-500", icon: Diamond },
    clubs: { symbol: "♣", color: "text-black", icon: Club },
    spades: { symbol: "♠", color: "text-black", icon: Spade },
  };

  const currentTable = selectedTable
    ? pokerTables.find((t) => t.id === selectedTable)
    : null;
  const currentPot = currentTable?.pot || 0;
  const minimumBet = currentTable?.blinds.big || 2;
  const callAmount =
    Math.max(...players.map((p) => p.currentBet)) -
    (players[0]?.currentBet || 0);

  const joinTable = (table: PokerTable) => {
    const cost =
      selectedCurrency === CurrencyType.GC ? table.buyIn.gc : table.buyIn.sc;

    if (!canAffordWager(selectedCurrency, cost)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    setSelectedTable(table.id);
    updateBalance(
      selectedCurrency,
      -cost,
      `Poker table buy-in: ${table.name}`,
      "wager",
    );
  };

  const handlePokerAction = (action: string, amount?: number) => {
    setPlayerAction(action);

    if (action === "fold") {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === "player-1" ? { ...p, isFolded: true, isActive: false } : p,
        ),
      );
    } else if (action === "call" && callAmount > 0) {
      updateBalance(selectedCurrency, -callAmount, "Poker call", "wager");
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === "player-1"
            ? {
                ...p,
                currentBet: p.currentBet + callAmount,
                chips: p.chips - callAmount,
              }
            : p,
        ),
      );
    } else if (action === "bet" || action === "raise") {
      const betAmountToUse = amount || betAmount;
      updateBalance(
        selectedCurrency,
        -betAmountToUse,
        `Poker ${action}`,
        "wager",
      );
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === "player-1"
            ? {
                ...p,
                currentBet: p.currentBet + betAmountToUse,
                chips: p.chips - betAmountToUse,
              }
            : p,
        ),
      );
    }

    // Simulate next player action after a delay
    setTimeout(() => {
      simulatePlayerAction();
    }, 2000);
  };

  const simulatePlayerAction = () => {
    // Simple AI logic for demo
    const activePlayer = players.find(
      (p) => !p.isFolded && !p.isActive && p.id !== "player-1",
    );
    if (activePlayer) {
      const actions = ["call", "fold", "raise"];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === activePlayer.id) {
            if (randomAction === "fold") {
              return { ...p, isFolded: true };
            } else if (randomAction === "call") {
              const callAmt =
                Math.max(...prev.map((pl) => pl.currentBet)) - p.currentBet;
              return {
                ...p,
                currentBet: p.currentBet + callAmt,
                chips: p.chips - callAmt,
              };
            } else if (randomAction === "raise") {
              const raiseAmt = minimumBet * 2;
              return {
                ...p,
                currentBet: p.currentBet + raiseAmt,
                chips: p.chips - raiseAmt,
              };
            }
          }
          return p;
        }),
      );
    }
  };

  const getTimeUntilStart = (startTime: Date): string => {
    const diff = Math.max(0, startTime.getTime() - Date.now());
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getHandStrength = (
    hand: PokerCard[],
    community: PokerCard[],
  ): string => {
    // Simplified hand evaluation for demo
    const allCards = [...hand, ...community];
    const suits = allCards.map((c) => c.suit);
    const ranks = allCards.map((c) => c.rank);

    // Check for flush
    const suitCounts = suits.reduce(
      (acc, suit) => {
        acc[suit] = (acc[suit] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const hasFlush = Object.values(suitCounts).some((count) => count >= 5);

    // Check for straight
    const uniqueValues = [...new Set(allCards.map((c) => c.value))].sort(
      (a, b) => b - a,
    );
    let hasConsecutive = false;
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        hasConsecutive = true;
        break;
      }
    }

    if (hasFlush && hasConsecutive) return "Straight Flush";
    if (hasFlush) return "Flush";
    if (hasConsecutive) return "Straight";

    // Check for pairs, trips, etc.
    const rankCounts = ranks.reduce(
      (acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    if (counts[0] === 4) return "Four of a Kind";
    if (counts[0] === 3 && counts[1] === 2) return "Full House";
    if (counts[0] === 3) return "Three of a Kind";
    if (counts[0] === 2 && counts[1] === 2) return "Two Pair";
    if (counts[0] === 2) return "One Pair";

    return "High Card";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Poker Room
            </h1>
            <p className="text-muted-foreground">
              Texas Hold'em tables and tournaments
            </p>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 mx-auto mb-2 text-gold" />
              <div className="text-sm text-muted-foreground">Gold Coins</div>
              <div className="font-bold text-gold">
                {user?.balance.goldCoins.toLocaleString() || 0} GC
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Gem className="h-6 w-6 mx-auto mb-2 text-teal" />
              <div className="text-sm text-muted-foreground">Sweep Coins</div>
              <div className="font-bold text-teal">
                {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-success" />
              <div className="text-sm text-muted-foreground">
                Tournaments Won
              </div>
              <div className="font-bold text-success">3</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="font-bold text-purple">34%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Tables & Tournaments */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="tables" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              </TabsList>

              <TabsContent value="tables">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Spade className="h-5 w-5 text-purple" />
                      Active Tables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pokerTables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedTable === table.id
                            ? "border-purple bg-purple/10"
                            : "border-border hover:border-purple/50"
                        }`}
                        onClick={() => setSelectedTable(table.id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">
                              {table.name}
                            </div>
                            <Badge
                              variant={table.isActive ? "default" : "secondary"}
                            >
                              {table.isActive ? "Active" : "Waiting"}
                            </Badge>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Stakes:
                              </span>
                              <span>
                                {table.stakes} {selectedCurrency}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Buy-in:
                              </span>
                              <span>
                                {selectedCurrency === CurrencyType.GC
                                  ? `${table.buyIn.gc} GC`
                                  : `${table.buyIn.sc} SC`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Players:
                              </span>
                              <span>
                                {table.currentPlayers}/{table.maxPlayers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Pot:
                              </span>
                              <span className="text-success font-medium">
                                {table.pot} {selectedCurrency}
                              </span>
                            </div>
                          </div>

                          <Progress
                            value={
                              (table.currentPlayers / table.maxPlayers) * 100
                            }
                            className="h-2"
                          />

                          {selectedTable !== table.id && (
                            <Button
                              size="sm"
                              className="w-full mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                joinTable(table);
                              }}
                              disabled={
                                !user ||
                                !canAffordWager(
                                  selectedCurrency,
                                  selectedCurrency === CurrencyType.GC
                                    ? table.buyIn.gc
                                    : table.buyIn.sc,
                                )
                              }
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Join Table
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tournaments">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-gold" />
                      Tournaments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="p-3 rounded-lg border"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">
                              {tournament.name}
                            </div>
                            <Badge
                              className={
                                tournament.status === "registering"
                                  ? "bg-green-500 text-white"
                                  : tournament.status === "starting"
                                    ? "bg-yellow-500 text-black"
                                    : tournament.status === "playing"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-500 text-white"
                              }
                            >
                              {tournament.status}
                            </Badge>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Buy-in:
                              </span>
                              <span>
                                {tournament.buyIn.gc === 0
                                  ? "FREE"
                                  : selectedCurrency === CurrencyType.GC
                                    ? `${tournament.buyIn.gc} GC`
                                    : `${tournament.buyIn.sc} SC`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Prize:
                              </span>
                              <span className="text-success font-medium">
                                {selectedCurrency === CurrencyType.GC
                                  ? `${tournament.prize.gc} GC`
                                  : `${tournament.prize.sc} SC`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Registered:
                              </span>
                              <span>
                                {tournament.registered}/{tournament.maxPlayers}
                              </span>
                            </div>
                            {tournament.status === "registering" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Starts in:
                                </span>
                                <span className="font-mono text-xs">
                                  {getTimeUntilStart(tournament.startTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          <Progress
                            value={
                              (tournament.registered / tournament.maxPlayers) *
                              100
                            }
                            className="h-2"
                          />

                          {tournament.status === "registering" && (
                            <Button
                              size="sm"
                              className="w-full mt-2"
                              disabled={
                                !user ||
                                (tournament.buyIn.gc > 0 &&
                                  !canAffordWager(
                                    selectedCurrency,
                                    selectedCurrency === CurrencyType.GC
                                      ? tournament.buyIn.gc
                                      : tournament.buyIn.sc,
                                  ))
                              }
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Register
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Poker Table */}
          <div className="lg:col-span-2">
            {selectedTable ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Spade className="h-6 w-6 text-purple" />
                      {currentTable?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Pot: {currentPot} {selectedCurrency}
                      </Badge>
                      <Badge variant="outline">{currentTable?.gameStage}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Community Cards */}
                  <div className="text-center">
                    <div className="text-sm font-medium mb-3">
                      Community Cards
                    </div>
                    <div className="flex justify-center gap-2">
                      {communityCards.map((card, index) => (
                        <div
                          key={index}
                          className="w-12 h-16 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-black shadow-md"
                        >
                          <div
                            className={`text-sm font-bold ${suits[card.suit].color}`}
                          >
                            {card.rank}
                          </div>
                          <div className={`text-lg ${suits[card.suit].color}`}>
                            {suits[card.suit].symbol}
                          </div>
                        </div>
                      ))}
                      {/* Empty slots for remaining community cards */}
                      {Array(5 - communityCards.length)
                        .fill(null)
                        .map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="w-12 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center"
                          >
                            <span className="text-muted-foreground text-xs">
                              ?
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Players */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg border ${
                          player.isActive
                            ? "border-purple bg-purple/10"
                            : player.isFolded
                              ? "border-red-500 bg-red-500/10"
                              : "border-border"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {player.name}
                            </span>
                            <div className="flex gap-1">
                              {player.isDealer && (
                                <Crown className="h-3 w-3 text-gold" />
                              )}
                              {player.isBigBlind && (
                                <Badge className="text-xs bg-red-500">BB</Badge>
                              )}
                              {player.isSmallBlind && (
                                <Badge className="text-xs bg-yellow-500">
                                  SB
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Chips:
                              </span>
                              <span className="font-medium">
                                {player.chips}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Bet:
                              </span>
                              <span className="font-medium">
                                {player.currentBet}
                              </span>
                            </div>
                          </div>

                          {player.isAllIn && (
                            <Badge className="w-full justify-center bg-red-500 text-white text-xs">
                              ALL IN
                            </Badge>
                          )}

                          {player.isFolded && (
                            <Badge className="w-full justify-center bg-gray-500 text-white text-xs">
                              FOLDED
                            </Badge>
                          )}

                          {/* Show player's cards only for the current player */}
                          {player.id === "player-1" && (
                            <div className="flex gap-1 justify-center">
                              {playerHand.map((card, cardIndex) => (
                                <div
                                  key={cardIndex}
                                  className="w-8 h-10 bg-white border border-gray-300 rounded flex flex-col items-center justify-center text-black text-xs"
                                >
                                  <div
                                    className={`font-bold ${suits[card.suit].color}`}
                                  >
                                    {card.rank}
                                  </div>
                                  <div className={`${suits[card.suit].color}`}>
                                    {suits[card.suit].symbol}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Player Actions */}
                  {selectedTable && !players[0]?.isFolded && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setBetAmount(
                              Math.max(minimumBet, betAmount - minimumBet),
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 text-center font-bold">
                          Bet: {betAmount} {selectedCurrency}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBetAmount(betAmount + minimumBet)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handlePokerAction("fold")}
                          className="text-sm"
                        >
                          Fold
                        </Button>

                        {callAmount > 0 ? (
                          <Button
                            onClick={() => handlePokerAction("call")}
                            className="text-sm"
                          >
                            Call {callAmount}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePokerAction("check")}
                            className="text-sm"
                          >
                            Check
                          </Button>
                        )}

                        <Button
                          onClick={() => handlePokerAction("bet", betAmount)}
                          disabled={betAmount < minimumBet}
                          className="text-sm"
                        >
                          {callAmount > 0 ? "Raise" : "Bet"}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handlePokerAction("all-in", players[0]?.chips || 0)
                          }
                          className="text-sm"
                        >
                          All In
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardContent className="p-8 text-center">
                  <Spade className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    Select a Poker Table
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose from Texas Hold'em cash games or tournaments
                  </p>
                  <div className="flex justify-center">
                    <CurrencySelector
                      selectedCurrency={selectedCurrency}
                      onCurrencyChange={setSelectedCurrency}
                      variant="inline"
                      showBalance={false}
                      className="max-w-md"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hand Strength */}
            {selectedTable && playerHand.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold" />
                    Hand Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple mb-2">
                      {getHandStrength(playerHand, communityCards)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-center gap-1">
                        {playerHand.map((card, index) => (
                          <div
                            key={index}
                            className="w-10 h-12 bg-white border border-gray-300 rounded flex flex-col items-center justify-center text-black text-xs"
                          >
                            <div
                              className={`font-bold ${suits[card.suit].color}`}
                            >
                              {card.rank}
                            </div>
                            <div className={`${suits[card.suit].color}`}>
                              {suits[card.suit].symbol}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Your Hole Cards
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Poker Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hands Played:</span>
                  <span className="font-semibold">347</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="font-semibold text-success">34%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VPIP:</span>
                  <span className="font-semibold">28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PFR:</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aggression:</span>
                  <span className="font-semibold">2.1</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Recent Winners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">PokerAce***</span>
                    <span className="text-success font-semibold">
                      +47.50 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    High Stakes • Full House
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">BluffMaster***</span>
                    <span className="text-success font-semibold">
                      +23.75 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Tournament • Straight
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">RiverRat***</span>
                    <span className="text-success font-semibold">
                      +15.25 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Beginner • Two Pair
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Poker Tips */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple" />
                  Poker Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="font-medium text-blue-400 mb-1">
                    💡 Position Matters
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Play tighter in early position, looser in late position.
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="font-medium text-green-400 mb-1">
                    🎯 Bankroll Management
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Never play at stakes higher than 5% of your bankroll.
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                  <div className="font-medium text-purple-400 mb-1">
                    🧠 Read Your Opponents
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Watch betting patterns and timing tells to gain an edge.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
