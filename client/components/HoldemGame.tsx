import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Spade,
  Heart,
  Diamond,
  Club,
  Crown,
  Timer,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Trophy,
  Plus,
  Minus,
  RotateCcw,
  Volume2,
  VolumeX,
  Info,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Gem,
} from "lucide-react";
import {
  CoinKrazyCard,
  CoinKrazyCommunityCards,
  CoinKrazyHand,
} from "./CoinKrazyPokerCards";
import {
  CoinKrazyChip,
  CoinKrazyChipTotal,
  CoinKrazyBettingChips,
  optimizeChipBreakdown,
} from "./CoinKrazyPokerChips";

export interface PlayingCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  value: number;
}

export interface HoldemPlayer {
  id: string;
  name: string;
  avatar?: string;
  chips: number;
  position: number;
  hand: PlayingCard[];
  isActive: boolean;
  isFolded: boolean;
  currentBet: number;
  totalBet: number;
  isAllIn: boolean;
  isDealer: boolean;
  isBigBlind: boolean;
  isSmallBlind: boolean;
  actionTime: number;
  handStrength?: string;
  winProbability?: number;
  isBot: boolean;
}

export interface HoldemGameState {
  stage: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
  communityCards: PlayingCard[];
  pot: number;
  sidePots: { amount: number; players: string[] }[];
  currentBet: number;
  actionOn: string | null;
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
  gameNumber: number;
  winners: { playerId: string; amount: number; hand: string }[];
  lastAction?: { playerId: string; action: string; amount?: number };
}

interface HoldemGameProps {
  tableId: string;
  stakes: string;
  buyIn: { gc: number; sc: number };
  blinds: { small: number; big: number };
  maxPlayers: number;
  currency: CurrencyType;
  onLeave: () => void;
}

export function HoldemGame({
  tableId,
  stakes,
  buyIn,
  blinds,
  maxPlayers,
  currency,
  onLeave,
}: HoldemGameProps) {
  const { user: authUser } = useAuth();
  const { user: currencyUser, updateBalance, canAffordWager } = useCurrency();

  // Game state
  const [gameState, setGameState] = useState<HoldemGameState>({
    stage: "waiting",
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBet: 0,
    actionOn: null,
    smallBlind: blinds.small,
    bigBlind: blinds.big,
    dealerPosition: 0,
    gameNumber: 1,
    winners: [],
  });

  const [players, setPlayers] = useState<HoldemPlayer[]>([]);
  const [betAmount, setBetAmount] = useState(blinds.big);
  const [timeBank, setTimeBank] = useState(30);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHandHistory, setShowHandHistory] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [myCards, setMyCards] = useState<PlayingCard[]>([]);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [lastWin, setLastWin] = useState<{
    amount: number;
    hand: string;
  } | null>(null);

  // Initialize game with bot players
  useEffect(() => {
    const botNames = [
      "PokerPro",
      "CardShark",
      "AllInAnnie",
      "BluffMaster",
      "RiverRat",
      "TightPlayer",
      "LooseGannon",
      "CalculatedRisk",
      "LuckyCharm",
    ];

    const initialPlayers: HoldemPlayer[] = [
      {
        id: "human",
        name: authUser?.name || "You",
        chips: 1000,
        position: 0,
        hand: [],
        isActive: false,
        isFolded: false,
        currentBet: 0,
        totalBet: 0,
        isAllIn: false,
        isDealer: false,
        isBigBlind: false,
        isSmallBlind: false,
        actionTime: 30,
        isBot: false,
      },
    ];

    // Add 5-8 bot players
    const numBots = Math.floor(Math.random() * 4) + 5;
    for (let i = 1; i <= numBots && i < maxPlayers; i++) {
      initialPlayers.push({
        id: `bot_${i}`,
        name: `${botNames[i - 1]}***`,
        chips: Math.floor(Math.random() * 2000) + 500,
        position: i,
        hand: [],
        isActive: false,
        isFolded: false,
        currentBet: 0,
        totalBet: 0,
        isAllIn: false,
        isDealer: i === 1,
        isBigBlind: false,
        isSmallBlind: false,
        actionTime: 30,
        isBot: true,
      });
    }

    setPlayers(initialPlayers);
    startNewHand();
  }, []);

  // Timer for player actions
  useEffect(() => {
    if (
      gameState.actionOn &&
      gameState.stage !== "waiting" &&
      gameState.stage !== "showdown"
    ) {
      const timer = setInterval(() => {
        setTimeBank((prev) => {
          if (prev <= 1) {
            // Auto-fold if time runs out
            if (gameState.actionOn === "human") {
              handlePlayerAction("fold");
            } else {
              // Bot action
              simulateBotAction(gameState.actionOn!);
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.actionOn, gameState.stage]);

  const suits = {
    hearts: { symbol: "♥", color: "text-red-500", icon: Heart },
    diamonds: { symbol: "♦", color: "text-red-500", icon: Diamond },
    clubs: { symbol: "♣", color: "text-black", icon: Club },
    spades: { symbol: "♠", color: "text-black", icon: Spade },
  };

  const createDeck = (): PlayingCard[] => {
    const suits: PlayingCard["suit"][] = [
      "hearts",
      "diamonds",
      "clubs",
      "spades",
    ];
    const ranks = [
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
      "A",
    ];
    const deck: PlayingCard[] = [];

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

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  const startNewHand = () => {
    const deck = createDeck();
    const activePlayers = players.filter((p) => p.chips > 0);

    if (activePlayers.length < 2) {
      setGameState((prev) => ({ ...prev, stage: "waiting" }));
      return;
    }

    // Deal hole cards
    const newPlayers = [...players];
    activePlayers.forEach((player, index) => {
      const playerIndex = newPlayers.findIndex((p) => p.id === player.id);
      newPlayers[playerIndex] = {
        ...player,
        hand: [deck.pop()!, deck.pop()!],
        currentBet: 0,
        totalBet: 0,
        isFolded: false,
        isAllIn: false,
        isActive: false,
        actionTime: 30,
      };
    });

    // Set dealer and blinds
    const dealerPos = gameState.dealerPosition;
    const sbPos = (dealerPos + 1) % activePlayers.length;
    const bbPos = (dealerPos + 2) % activePlayers.length;

    newPlayers.forEach((player, index) => {
      player.isDealer = index === dealerPos;
      player.isSmallBlind = index === sbPos;
      player.isBigBlind = index === bbPos;
    });

    // Post blinds
    if (newPlayers[sbPos]) {
      newPlayers[sbPos].currentBet = gameState.smallBlind;
      newPlayers[sbPos].chips -= gameState.smallBlind;
      newPlayers[sbPos].totalBet = gameState.smallBlind;
    }

    if (newPlayers[bbPos]) {
      newPlayers[bbPos].currentBet = gameState.bigBlind;
      newPlayers[bbPos].chips -= gameState.bigBlind;
      newPlayers[bbPos].totalBet = gameState.bigBlind;
    }

    setPlayers(newPlayers);
    setMyCards(newPlayers.find((p) => p.id === "human")?.hand || []);

    setGameState((prev) => ({
      ...prev,
      stage: "preflop",
      communityCards: [],
      pot: gameState.smallBlind + gameState.bigBlind,
      currentBet: gameState.bigBlind,
      actionOn: activePlayers[(bbPos + 1) % activePlayers.length]?.id || null,
      gameNumber: prev.gameNumber + 1,
      winners: [],
    }));

    setTimeBank(30);
  };

  const handlePlayerAction = (action: string, amount?: number) => {
    if (gameState.actionOn !== "human") return;

    const humanPlayer = players.find((p) => p.id === "human");
    if (!humanPlayer || humanPlayer.isFolded) return;

    const actionAmount = amount || betAmount;
    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p) => p.id === "human");

    switch (action) {
      case "fold":
        newPlayers[playerIndex].isFolded = true;
        updateBalance(currency, 0, `Poker fold - ${stakes}`, "wager");
        break;

      case "check":
        if (gameState.currentBet > humanPlayer.currentBet) return;
        break;

      case "call":
        const callAmount = gameState.currentBet - humanPlayer.currentBet;
        if (callAmount > humanPlayer.chips) {
          newPlayers[playerIndex].isAllIn = true;
          newPlayers[playerIndex].currentBet += humanPlayer.chips;
          newPlayers[playerIndex].chips = 0;
        } else {
          newPlayers[playerIndex].currentBet += callAmount;
          newPlayers[playerIndex].chips -= callAmount;
        }
        updateBalance(currency, -callAmount, `Poker call - ${stakes}`, "wager");
        break;

      case "bet":
      case "raise":
        const betAmountToUse = Math.min(actionAmount, humanPlayer.chips);
        newPlayers[playerIndex].currentBet += betAmountToUse;
        newPlayers[playerIndex].chips -= betAmountToUse;
        setGameState((prev) => ({
          ...prev,
          currentBet: newPlayers[playerIndex].currentBet,
        }));
        updateBalance(
          currency,
          -betAmountToUse,
          `Poker ${action} - ${stakes}`,
          "wager",
        );
        break;

      case "allIn":
        newPlayers[playerIndex].currentBet += humanPlayer.chips;
        newPlayers[playerIndex].chips = 0;
        newPlayers[playerIndex].isAllIn = true;
        setGameState((prev) => ({
          ...prev,
          currentBet: Math.max(
            prev.currentBet,
            newPlayers[playerIndex].currentBet,
          ),
        }));
        updateBalance(
          currency,
          -humanPlayer.chips,
          `Poker all-in - ${stakes}`,
          "wager",
        );
        break;
    }

    setPlayers(newPlayers);
    advanceAction();
  };

  const simulateBotAction = (botId: string) => {
    const bot = players.find((p) => p.id === botId);
    if (!bot || bot.isFolded) return;

    const newPlayers = [...players];
    const botIndex = newPlayers.findIndex((p) => p.id === botId);

    // Simple bot AI logic
    const random = Math.random();
    const callAmount = gameState.currentBet - bot.currentBet;
    const potOdds = callAmount / (gameState.pot + callAmount);

    let action = "fold";

    if (callAmount === 0) {
      action = "check";
    } else if (random < 0.3) {
      action = "fold";
    } else if (random < 0.7) {
      action = "call";
    } else {
      action = "raise";
    }

    // Execute bot action
    switch (action) {
      case "fold":
        newPlayers[botIndex].isFolded = true;
        break;

      case "check":
        break;

      case "call":
        if (callAmount >= bot.chips) {
          newPlayers[botIndex].isAllIn = true;
          newPlayers[botIndex].currentBet += bot.chips;
          newPlayers[botIndex].chips = 0;
        } else {
          newPlayers[botIndex].currentBet += callAmount;
          newPlayers[botIndex].chips -= callAmount;
        }
        break;

      case "raise":
        const raiseAmount = Math.min(gameState.bigBlind * 3, bot.chips);
        newPlayers[botIndex].currentBet += raiseAmount;
        newPlayers[botIndex].chips -= raiseAmount;
        setGameState((prev) => ({
          ...prev,
          currentBet: newPlayers[botIndex].currentBet,
        }));
        break;
    }

    setGameState((prev) => ({
      ...prev,
      lastAction: { playerId: botId, action, amount: callAmount },
    }));

    setPlayers(newPlayers);
    setTimeout(() => advanceAction(), 1500);
  };

  const advanceAction = () => {
    const activePlayers = players.filter((p) => !p.isFolded && !p.isAllIn);

    if (activePlayers.length <= 1) {
      advanceStage();
      return;
    }

    const currentIndex = players.findIndex((p) => p.id === gameState.actionOn);
    let nextIndex = (currentIndex + 1) % players.length;

    // Find next active player
    while (players[nextIndex].isFolded || players[nextIndex].isAllIn) {
      nextIndex = (nextIndex + 1) % players.length;
      if (nextIndex === currentIndex) {
        advanceStage();
        return;
      }
    }

    setGameState((prev) => ({ ...prev, actionOn: players[nextIndex].id }));
    setTimeBank(30);
  };

  const advanceStage = () => {
    const deck = createDeck(); // In real game, deck would be maintained

    switch (gameState.stage) {
      case "preflop":
        setGameState((prev) => ({
          ...prev,
          stage: "flop",
          communityCards: [deck.pop()!, deck.pop()!, deck.pop()!],
          currentBet: 0,
          actionOn: players.find((p) => !p.isFolded && !p.isAllIn)?.id || null,
        }));
        break;

      case "flop":
        setGameState((prev) => ({
          ...prev,
          stage: "turn",
          communityCards: [...prev.communityCards, deck.pop()!],
          currentBet: 0,
          actionOn: players.find((p) => !p.isFolded && !p.isAllIn)?.id || null,
        }));
        break;

      case "turn":
        setGameState((prev) => ({
          ...prev,
          stage: "river",
          communityCards: [...prev.communityCards, deck.pop()!],
          currentBet: 0,
          actionOn: players.find((p) => !p.isFolded && !p.isAllIn)?.id || null,
        }));
        break;

      case "river":
        showdown();
        break;
    }

    // Reset bets for new street
    setPlayers((prev) => prev.map((p) => ({ ...p, currentBet: 0 })));
    setTimeBank(30);
  };

  const showdown = () => {
    const activePlayers = players.filter((p) => !p.isFolded);

    if (activePlayers.length === 1) {
      // Single winner
      const winner = activePlayers[0];
      const newPlayers = [...players];
      const winnerIndex = newPlayers.findIndex((p) => p.id === winner.id);
      newPlayers[winnerIndex].chips += gameState.pot;

      if (winner.id === "human") {
        updateBalance(currency, gameState.pot, `Poker win - ${stakes}`, "win");
        setLastWin({ amount: gameState.pot, hand: "Uncontested" });
        setShowWinDialog(true);
      }

      setPlayers(newPlayers);
      setGameState((prev) => ({
        ...prev,
        stage: "showdown",
        winners: [
          { playerId: winner.id, amount: gameState.pot, hand: "Uncontested" },
        ],
      }));
    } else {
      // Evaluate hands and determine winners
      const handStrengths = activePlayers.map((player) => ({
        playerId: player.id,
        strength: evaluateHand(player.hand, gameState.communityCards),
      }));

      // Sort by strength (simplified)
      handStrengths.sort((a, b) => b.strength.rank - a.strength.rank);

      const winnerStrength = handStrengths[0].strength;
      const winners = handStrengths.filter(
        (h) => h.strength.rank === winnerStrength.rank,
      );

      const winAmount = Math.floor(gameState.pot / winners.length);

      const newPlayers = [...players];
      winners.forEach((winner) => {
        const playerIndex = newPlayers.findIndex(
          (p) => p.id === winner.playerId,
        );
        newPlayers[playerIndex].chips += winAmount;

        if (winner.playerId === "human") {
          updateBalance(currency, winAmount, `Poker win - ${stakes}`, "win");
          setLastWin({ amount: winAmount, hand: winnerStrength.name });
          setShowWinDialog(true);
        }
      });

      setPlayers(newPlayers);
      setGameState((prev) => ({
        ...prev,
        stage: "showdown",
        winners: winners.map((w) => ({
          playerId: w.playerId,
          amount: winAmount,
          hand: winnerStrength.name,
        })),
      }));
    }

    // Start new hand after delay
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        dealerPosition:
          (prev.dealerPosition + 1) % players.filter((p) => p.chips > 0).length,
      }));
      startNewHand();
    }, 5000);
  };

  const evaluateHand = (
    playerCards: PlayingCard[],
    communityCards: PlayingCard[],
  ) => {
    // Simplified hand evaluation
    const allCards = [...playerCards, ...communityCards];
    const suits = allCards.map((c) => c.suit);
    const values = allCards.map((c) => c.value).sort((a, b) => b - a);

    const isFlush = suits.some(
      (suit) => suits.filter((s) => s === suit).length >= 5,
    );
    const isStraight = checkStraight(values);
    const pairs = countPairs(values);

    if (isFlush && isStraight) return { rank: 8, name: "Straight Flush" };
    if (pairs.fourOfAKind) return { rank: 7, name: "Four of a Kind" };
    if (pairs.threeOfAKind && pairs.pair)
      return { rank: 6, name: "Full House" };
    if (isFlush) return { rank: 5, name: "Flush" };
    if (isStraight) return { rank: 4, name: "Straight" };
    if (pairs.threeOfAKind) return { rank: 3, name: "Three of a Kind" };
    if (pairs.twoPair) return { rank: 2, name: "Two Pair" };
    if (pairs.pair) return { rank: 1, name: "One Pair" };
    return { rank: 0, name: "High Card" };
  };

  const checkStraight = (values: number[]): boolean => {
    const unique = [...new Set(values)].sort((a, b) => b - a);
    for (let i = 0; i < unique.length - 4; i++) {
      if (unique[i] - unique[i + 4] === 4) return true;
    }
    return false;
  };

  const countPairs = (values: number[]) => {
    const counts: { [key: number]: number } = {};
    values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    const countValues = Object.values(counts);

    return {
      fourOfAKind: countValues.includes(4),
      threeOfAKind: countValues.includes(3),
      pair: countValues.includes(2),
      twoPair: countValues.filter((c) => c === 2).length === 2,
    };
  };

  const humanPlayer = players.find((p) => p.id === "human");
  const isMyTurn = gameState.actionOn === "human";
  const callAmount = gameState.currentBet - (humanPlayer?.currentBet || 0);
  const canCheck = callAmount === 0;
  const canCall = callAmount > 0 && callAmount <= (humanPlayer?.chips || 0);
  const canBet = (humanPlayer?.chips || 0) >= betAmount;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-green-800 p-4 relative overflow-hidden">
        {/* CoinKrazy.com Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-gold rounded-full animate-pulse" />
          <div
            className="absolute top-32 right-20 w-16 h-16 bg-purple rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-20 left-32 w-12 h-12 bg-teal rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-32 right-10 w-14 h-14 bg-gold rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gold/30">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onLeave}
              className="bg-white/10 border-gold/30"
            >
              Leave Table
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-gold" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
                  CoinKrazy.com Texas Hold'em
                </h1>
                <Crown className="h-6 w-6 text-gold" />
              </div>
              <p className="text-green-200">
                {stakes} • Table {tableId} • Premium Gaming Experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white/20">
              Hand #{gameState.gameNumber}
            </Badge>
            <Badge variant="outline" className="text-white border-white/20">
              {gameState.stage.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white/10"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <div className="max-w-6xl mx-auto">
          {/* Community Cards & Pot */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="h-6 w-6 text-gold" />
                <h3 className="text-lg font-semibold text-white">
                  CoinKrazy.com Community Cards
                </h3>
                <Crown className="h-6 w-6 text-gold" />
              </div>
              <CoinKrazyCommunityCards
                cards={gameState.communityCards}
                stage={
                  gameState.stage === "waiting" ? "preflop" : gameState.stage
                }
                size="lg"
                className="justify-center"
              />
            </div>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-green-200 text-sm mb-2">Total Pot</p>
                <CoinKrazyChipTotal
                  total={gameState.pot}
                  currency={currency as "GC" | "SC"}
                  size="xl"
                  animated={true}
                />
              </div>
              <div className="text-center">
                <p className="text-green-200 text-sm mb-2">Current Bet</p>
                <CoinKrazyChipTotal
                  total={gameState.currentBet}
                  currency={currency as "GC" | "SC"}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            {players.map((player) => (
              <Card
                key={player.id}
                className={`relative transition-all duration-300 ${
                  player.id === gameState.actionOn
                    ? "ring-2 ring-yellow-400 bg-yellow-50"
                    : player.isFolded
                      ? "opacity-50 bg-gray-100"
                      : "bg-white"
                } ${player.isAllIn ? "ring-2 ring-red-500" : ""}`}
              >
                <CardContent className="p-4">
                  {/* Player badges */}
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    {player.isDealer && (
                      <Badge className="bg-yellow-500 text-black text-xs">
                        D
                      </Badge>
                    )}
                    {player.isBigBlind && (
                      <Badge className="bg-red-500 text-white text-xs">
                        BB
                      </Badge>
                    )}
                    {player.isSmallBlind && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        SB
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {player.name}
                      </span>
                      {player.id === gameState.actionOn && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-500">
                            {timeBank}s
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Chips:</span>
                        <div className="flex items-center gap-1">
                          <CoinKrazyChip value={100} size="sm" />
                          <span className="font-bold">{player.chips}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bet:</span>
                        <div className="flex items-center gap-1">
                          {player.currentBet > 0 && (
                            <CoinKrazyChip value={25} size="sm" />
                          )}
                          <span className="font-bold text-blue-600">
                            {player.currentBet}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
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

                    {/* Player cards (only show for human player) */}
                    {player.id === "human" && myCards.length === 2 && (
                      <div className="flex justify-center mt-2">
                        <CoinKrazyHand
                          cards={myCards}
                          size="sm"
                          spacing="tight"
                        />
                      </div>
                    )}

                    {/* Hand strength for human player */}
                    {player.id === "human" &&
                      myCards.length === 2 &&
                      gameState.communityCards.length >= 3 && (
                        <div className="text-center mt-2">
                          <p className="text-xs text-purple-600 font-medium">
                            {
                              evaluateHand(myCards, gameState.communityCards)
                                .name
                            }
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Player Actions */}
          {isMyTurn &&
            humanPlayer &&
            !humanPlayer.isFolded &&
            gameState.stage !== "showdown" && (
              <Card className="bg-white/95 backdrop-blur">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Bet amount slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Bet Amount</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setBetAmount(
                                Math.max(
                                  gameState.bigBlind,
                                  betAmount - gameState.bigBlind,
                                ),
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) =>
                              setBetAmount(Number(e.target.value))
                            }
                            className="w-20 text-center"
                            min={gameState.bigBlind}
                            max={humanPlayer.chips}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setBetAmount(
                                Math.min(
                                  humanPlayer.chips,
                                  betAmount + gameState.bigBlind,
                                ),
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <Slider
                        value={[betAmount]}
                        onValueChange={(value) => setBetAmount(value[0])}
                        max={humanPlayer.chips}
                        min={gameState.bigBlind}
                        step={gameState.bigBlind}
                        className="flex-1"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: {gameState.bigBlind}</span>
                        <span>Max: {humanPlayer.chips}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant="destructive"
                        onClick={() => handlePlayerAction("fold")}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Fold
                      </Button>

                      {canCheck && (
                        <Button
                          variant="outline"
                          onClick={() => handlePlayerAction("check")}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Check
                        </Button>
                      )}

                      {canCall && (
                        <Button
                          onClick={() => handlePlayerAction("call")}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Target className="h-4 w-4" />
                          Call {callAmount}
                        </Button>
                      )}

                      <Button
                        onClick={() =>
                          handlePlayerAction(callAmount > 0 ? "raise" : "bet")
                        }
                        disabled={!canBet}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <TrendingUp className="h-4 w-4" />
                        {callAmount > 0 ? "Raise" : "Bet"} {betAmount}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handlePlayerAction("allIn")}
                        className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Zap className="h-4 w-4" />
                        All In
                      </Button>
                    </div>

                    {/* Quick bet buttons */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setBetAmount(Math.floor(gameState.pot / 2))
                        }
                      >
                        1/2 Pot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(gameState.pot)}
                      >
                        Pot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(humanPlayer.chips)}
                      >
                        All In
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Last action display */}
          {gameState.lastAction && (
            <div className="text-center mt-4">
              <p className="text-white text-sm">
                <strong>
                  {
                    players.find((p) => p.id === gameState.lastAction?.playerId)
                      ?.name
                  }
                </strong>{" "}
                {gameState.lastAction.action}
                {gameState.lastAction.amount
                  ? ` ${gameState.lastAction.amount}`
                  : ""}
              </p>
            </div>
          )}
        </div>

        {/* Win Dialog */}
        <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
          <DialogContent className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="h-6 w-6" />
                Congratulations!
              </DialogTitle>
              <DialogDescription className="text-yellow-100">
                You won the hand!
              </DialogDescription>
            </DialogHeader>
            {lastWin && (
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold">
                  +{lastWin.amount} {currency}
                </div>
                <div className="text-lg">with {lastWin.hand}</div>
                <Button
                  onClick={() => setShowWinDialog(false)}
                  className="bg-white text-yellow-600 hover:bg-yellow-50"
                >
                  Continue Playing
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
