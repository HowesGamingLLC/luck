import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import {
  Spade,
  ArrowLeft,
  Coins,
  Gem,
  Trophy,
  Users,
  Timer,
  Target,
  Shuffle,
  RotateCcw,
  Plus,
  Minus,
  Play,
  Pause,
  Heart,
  Diamond,
  Club,
} from "lucide-react";
import { Link } from "react-router-dom";

interface TableGame {
  id: string;
  name: string;
  type: "blackjack" | "roulette" | "baccarat" | "poker";
  description: string;
  minBet: { gc: number; sc: number };
  maxBet: { gc: number; sc: number };
  players: number;
  maxPlayers: number;
  houseEdge: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  numValue: number;
}

export default function TableGamesPage() {
  const { user, canAffordWager, updateBalance } = useCurrency();
  const [selectedGame, setSelectedGame] = useState<string>("blackjack-1");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(CurrencyType.GC);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [gameActive, setGameActive] = useState(false);
  
  // Blackjack state
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const tableGames: TableGame[] = [
    {
      id: "blackjack-1",
      name: "Classic Blackjack",
      type: "blackjack",
      description: "Beat the dealer by getting as close to 21 as possible",
      minBet: { gc: 5, sc: 0.05 },
      maxBet: { gc: 500, sc: 5.00 },
      players: 3,
      maxPlayers: 6,
      houseEdge: 0.5,
      difficulty: "Easy",
    },
    {
      id: "roulette-1",
      name: "European Roulette",
      type: "roulette",
      description: "Spin the wheel and bet on where the ball will land",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 100, sc: 1.00 },
      players: 8,
      maxPlayers: 12,
      houseEdge: 2.7,
      difficulty: "Easy",
    },
    {
      id: "baccarat-1",
      name: "Punto Banco",
      type: "baccarat",
      description: "Bet on Player, Banker, or Tie in this classic card game",
      minBet: { gc: 10, sc: 0.10 },
      maxBet: { gc: 1000, sc: 10.00 },
      players: 5,
      maxPlayers: 8,
      houseEdge: 1.06,
      difficulty: "Medium",
    },
    {
      id: "poker-1",
      name: "Casino Hold'em",
      type: "poker",
      description: "Play poker against the house with ante and call bets",
      minBet: { gc: 10, sc: 0.10 },
      maxBet: { gc: 200, sc: 2.00 },
      players: 4,
      maxPlayers: 6,
      houseEdge: 2.16,
      difficulty: "Hard",
    },
  ];

  const currentGame = tableGames.find(game => game.id === selectedGame) || tableGames[0];

  const suits = {
    hearts: { symbol: "♥", color: "text-red-500", icon: Heart },
    diamonds: { symbol: "♦", color: "text-red-500", icon: Diamond },
    clubs: { symbol: "♣", color: "text-black", icon: Club },
    spades: { symbol: "♠", color: "text-black", icon: Spade },
  };

  const createDeck = (): Card[] => {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const deck: Card[] = [];

    suits.forEach(suit => {
      values.forEach((value, index) => {
        deck.push({
          suit,
          value,
          numValue: value === "A" ? 11 : index + 1 > 10 ? 10 : index + 1,
        });
      });
    });

    return deck.sort(() => Math.random() - 0.5); // Shuffle
  };

  const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.value === "A") {
        aces++;
        score += 11;
      } else {
        score += card.numValue;
      }
    });

    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  };

  const startBlackjack = () => {
    if (!canAffordWager(selectedCurrency, betAmount)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    const deck = createDeck();
    const newPlayerHand = [deck[0], deck[2]];
    const newDealerHand = [deck[1], deck[3]];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setPlayerScore(calculateScore(newPlayerHand));
    setDealerScore(calculateScore([newDealerHand[0]])); // Only show first card
    setGameActive(true);
    setGameResult(null);

    // Deduct bet
    updateBalance(selectedCurrency, -betAmount, "Blackjack bet", "wager");
  };

  const hit = () => {
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    const newScore = calculateScore(newHand);

    setPlayerHand(newHand);
    setPlayerScore(newScore);

    if (newScore > 21) {
      setGameResult("Bust! Dealer wins.");
      setGameActive(false);
    }
  };

  const stand = () => {
    let dealerCards = [...dealerHand];
    let dealerCurrentScore = calculateScore(dealerCards);

    // Dealer hits on 16, stands on 17
    const deck = createDeck();
    let deckIndex = 0;

    while (dealerCurrentScore < 17) {
      dealerCards.push(deck[deckIndex++]);
      dealerCurrentScore = calculateScore(dealerCards);
    }

    setDealerHand(dealerCards);
    setDealerScore(dealerCurrentScore);

    // Determine winner
    let result = "";
    let payout = 0;

    if (dealerCurrentScore > 21) {
      result = "Dealer busts! You win!";
      payout = betAmount * 2;
    } else if (playerScore > dealerCurrentScore) {
      result = "You win!";
      payout = betAmount * 2;
    } else if (playerScore < dealerCurrentScore) {
      result = "Dealer wins.";
      payout = 0;
    } else {
      result = "Push! It's a tie.";
      payout = betAmount; // Return bet
    }

    if (payout > 0) {
      updateBalance(selectedCurrency, payout, `Blackjack win: ${result}`, "win");
    }

    setGameResult(result);
    setGameActive(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500 bg-green-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/20";
      case "Hard": return "text-red-500 bg-red-500/20";
      default: return "text-gray-500 bg-gray-500/20";
    }
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
              Table Games
            </h1>
            <p className="text-muted-foreground">
              Classic casino table games with live dealers
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
              <div className="text-sm text-muted-foreground">Table Wins</div>
              <div className="font-bold text-success">42</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="font-bold text-purple">67%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Selection */}
          <div className="lg:col-span-1">
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Select Table</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tableGames.map((game) => (
                  <div
                    key={game.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGame === game.id
                        ? "border-purple bg-purple/10"
                        : "border-border hover:border-purple/50"
                    }`}
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{game.name}</div>
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {game.description}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Min: {selectedCurrency === CurrencyType.GC ? 
                            `${game.minBet.gc} GC` : 
                            `${game.minBet.sc} SC`
                          }
                        </span>
                        <span className="text-muted-foreground">
                          Players: {game.players}/{game.maxPlayers}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        House Edge: {game.houseEdge}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Betting Controls */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Place Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={selectedCurrency === CurrencyType.GC ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCurrency(CurrencyType.GC)}
                  >
                    <Coins className="h-4 w-4 mr-1 text-gold" />
                    GC
                  </Button>
                  <Button
                    variant={selectedCurrency === CurrencyType.SC ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCurrency(CurrencyType.SC)}
                  >
                    <Gem className="h-4 w-4 mr-1 text-teal" />
                    SC
                  </Button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(Math.max(
                        selectedCurrency === CurrencyType.GC ? currentGame.minBet.gc : currentGame.minBet.sc,
                        betAmount - (selectedCurrency === CurrencyType.GC ? 1 : 0.01)
                      ))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="flex-1 text-center font-bold">
                      {betAmount} {selectedCurrency}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(Math.min(
                        selectedCurrency === CurrencyType.GC ? currentGame.maxBet.gc : currentGame.maxBet.sc,
                        betAmount + (selectedCurrency === CurrencyType.GC ? 1 : 0.01)
                      ))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-1">
                    {[1, 5, 10, 25].map(amount => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setBetAmount(
                          selectedCurrency === CurrencyType.GC ? amount : amount * 0.01
                        )}
                      >
                        {selectedCurrency === CurrencyType.GC ? amount : (amount * 0.01).toFixed(2)}
                      </Button>
                    ))}
                  </div>
                </div>

                {currentGame.type === "blackjack" && (
                  <Button
                    className="w-full btn-primary"
                    onClick={startBlackjack}
                    disabled={gameActive || !user || !canAffordWager(selectedCurrency, betAmount)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Deal Cards
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {currentGame.type === "blackjack" && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Spade className="h-6 w-6 text-purple" />
                      {currentGame.name}
                    </span>
                    {gameResult && (
                      <Badge className={
                        gameResult.includes("win") || gameResult.includes("Win") ? 
                        "bg-success text-white" : 
                        gameResult.includes("Push") ? "bg-yellow-500 text-black" :
                        "bg-destructive text-white"
                      }>
                        {gameResult}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dealer Hand */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold">Dealer</span>
                      <Badge variant="outline">Score: {dealerScore}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {dealerHand.map((card, index) => (
                        <div
                          key={index}
                          className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-black shadow-md"
                        >
                          {(gameActive && index === 1) ? (
                            <div className="text-blue-500 font-bold">?</div>
                          ) : (
                            <>
                              <div className={`text-lg font-bold ${suits[card.suit].color}`}>
                                {card.value}
                              </div>
                              <div className={`text-xl ${suits[card.suit].color}`}>
                                {suits[card.suit].symbol}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player Hand */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold">You</span>
                      <Badge variant="outline">Score: {playerScore}</Badge>
                      {playerScore > 21 && (
                        <Badge className="bg-destructive text-white">BUST</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {playerHand.map((card, index) => (
                        <div
                          key={index}
                          className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-black shadow-md"
                        >
                          <div className={`text-lg font-bold ${suits[card.suit].color}`}>
                            {card.value}
                          </div>
                          <div className={`text-xl ${suits[card.suit].color}`}>
                            {suits[card.suit].symbol}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Controls */}
                  {gameActive && playerScore <= 21 && (
                    <div className="flex gap-3">
                      <Button onClick={hit} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Hit
                      </Button>
                      <Button onClick={stand} variant="outline" className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Stand
                      </Button>
                    </div>
                  )}

                  {!gameActive && playerHand.length > 0 && (
                    <Button onClick={() => {
                      setPlayerHand([]);
                      setDealerHand([]);
                      setPlayerScore(0);
                      setDealerScore(0);
                      setGameResult(null);
                    }} className="w-full">
                      <Shuffle className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Other Game Types - Placeholder */}
            {currentGame.type !== "blackjack" && (
              <Card className="glass">
                <CardContent className="p-8 text-center">
                  <Spade className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">{currentGame.name}</h3>
                  <p className="text-muted-foreground mb-4">{currentGame.description}</p>
                  <Badge className="mb-4">Coming Soon</Badge>
                  <p className="text-sm text-muted-foreground">
                    This game is currently under development. Try our Blackjack table for now!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Table Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">House Edge:</span>
                  <span className="font-semibold">{currentGame.houseEdge}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Bet:</span>
                  <span className="font-semibold">
                    {selectedCurrency === CurrencyType.GC ? 
                      `${currentGame.minBet.gc} GC` : 
                      `${currentGame.minBet.sc} SC`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Bet:</span>
                  <span className="font-semibold">
                    {selectedCurrency === CurrencyType.GC ? 
                      `${currentGame.maxBet.gc} GC` : 
                      `${currentGame.maxBet.sc} SC`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-semibold">{currentGame.players}/{currentGame.maxPlayers}</span>
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
                    <span className="font-medium">Card_Master***</span>
                    <span className="text-success font-semibold">+8.75 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Blackjack • 3m ago</p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Table_King***</span>
                    <span className="text-success font-semibold">+12.50 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Roulette • 8m ago</p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Lucky_21***</span>
                    <span className="text-success font-semibold">+25.00 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Blackjack • 15m ago</p>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {currentGame.type === "blackjack" && (
                  <div className="space-y-2">
                    <p><strong>Objective:</strong> Beat the dealer by getting closer to 21 without going over.</p>
                    <p><strong>Card Values:</strong> Face cards = 10, Aces = 1 or 11, Others = face value</p>
                    <p><strong>Actions:</strong> Hit (take card) or Stand (keep current total)</p>
                    <p><strong>Dealer Rules:</strong> Hits on 16, stands on 17</p>
                  </div>
                )}
                {currentGame.type === "roulette" && (
                  <div className="space-y-2">
                    <p><strong>Objective:</strong> Predict where the ball will land on the spinning wheel.</p>
                    <p><strong>Bet Types:</strong> Single numbers, colors, odd/even, groups</p>
                    <p><strong>Payouts:</strong> Vary by bet type (35:1 for single numbers)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
