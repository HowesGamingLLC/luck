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
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import {
  Gamepad2,
  Coins,
  Gem,
  Trophy,
  Target,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Star,
  Flame,
  Clock,
  Plus,
  Minus,
  Dice6,
  Circle,
  Triangle,
  Square,
  TrendingUp,
  TrendingDown,
  Users,
  Crown,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: "crash" | "dice" | "plinko" | "mines" | "keno" | "wheel";
  minBet: { gc: number; sc: number };
  maxBet: { gc: number; sc: number };
  maxMultiplier: number;
  difficulty: "Easy" | "Medium" | "Hard";
  players: number;
  isNew?: boolean;
}

interface GameResult {
  win: boolean;
  amount: number;
  multiplier: number;
  result: string;
}

export default function MiniGamesPage() {
  const { user, canAffordWager, updateBalance } = useCurrency();
  const [selectedGame, setSelectedGame] = useState<string>("crash");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    CurrencyType.GC,
  );
  const [betAmount, setBetAmount] = useState<number>(1);
  const [gameActive, setGameActive] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Crash game state
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.0);
  const [crashedAt, setCrashedAt] = useState<number | null>(null);
  const [cashOutAt, setCashOutAt] = useState<number>(2.0);
  const [hasCashedOut, setHasCashedOut] = useState(false);

  // Dice game state
  const [diceTarget, setDiceTarget] = useState<number>(50);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [diceOver, setDiceOver] = useState<boolean>(true);

  // Plinko state
  const [plinkoDropping, setPlinkoDropping] = useState(false);
  const [plinkoResult, setPlinkoResult] = useState<number | null>(null);

  // Mines state
  const [mineField, setMineField] = useState<boolean[]>(Array(25).fill(false));
  const [revealedCells, setRevealedCells] = useState<boolean[]>(
    Array(25).fill(false),
  );
  const [minesCount, setMinesCount] = useState<number>(5);
  const [safeRevealed, setSafeRevealed] = useState<number>(0);

  const miniGames: MiniGame[] = [
    {
      id: "crash",
      name: "Crash",
      description: "Watch the multiplier rise and cash out before it crashes!",
      icon: TrendingUp,
      type: "crash",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 1000, sc: 10.0 },
      maxMultiplier: 1000,
      difficulty: "Medium",
      players: 234,
    },
    {
      id: "dice",
      name: "Dice Roll",
      description: "Predict if the dice will roll over or under your target",
      icon: Dice6,
      type: "dice",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 500, sc: 5.0 },
      maxMultiplier: 99,
      difficulty: "Easy",
      players: 156,
    },
    {
      id: "plinko",
      name: "Plinko",
      description: "Drop the ball and watch it bounce to a multiplier",
      icon: Circle,
      type: "plinko",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 100, sc: 1.0 },
      maxMultiplier: 1000,
      difficulty: "Easy",
      players: 89,
      isNew: true,
    },
    {
      id: "mines",
      name: "Mines",
      description: "Find gems while avoiding mines for increasing multipliers",
      icon: Square,
      type: "mines",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 200, sc: 2.0 },
      maxMultiplier: 100,
      difficulty: "Hard",
      players: 67,
    },
    {
      id: "keno",
      name: "Keno",
      description: "Pick numbers and watch the draw for big multipliers",
      icon: Target,
      type: "keno",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 100, sc: 1.0 },
      maxMultiplier: 1000,
      difficulty: "Medium",
      players: 123,
    },
    {
      id: "wheel",
      name: "Lucky Wheel",
      description: "Spin the wheel and win instant multipliers",
      icon: Circle,
      type: "wheel",
      minBet: { gc: 1, sc: 0.01 },
      maxBet: { gc: 100, sc: 1.0 },
      maxMultiplier: 50,
      difficulty: "Easy",
      players: 178,
    },
  ];

  const currentGame =
    miniGames.find((game) => game.id === selectedGame) || miniGames[0];

  const recentWins = [
    {
      player: "MiniGamer***",
      game: "Crash",
      amount: "47.50 SC",
      multiplier: "95.0x",
      time: "2m ago",
    },
    {
      player: "LuckyDice***",
      game: "Dice",
      amount: "23.75 SC",
      multiplier: "47.5x",
      time: "5m ago",
    },
    {
      player: "PlinkoKing***",
      game: "Plinko",
      amount: "125.00 SC",
      multiplier: "250.0x",
      time: "8m ago",
    },
    {
      player: "MineHunter***",
      game: "Mines",
      amount: "88.88 SC",
      multiplier: "177.8x",
      time: "12m ago",
    },
  ];

  // Crash Game Logic
  const startCrash = () => {
    if (!canAffordWager(selectedCurrency, betAmount)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    setGameActive(true);
    setCrashMultiplier(1.0);
    setCrashedAt(null);
    setHasCashedOut(false);
    updateBalance(selectedCurrency, -betAmount, "Crash game bet", "wager");

    // Simulate crash multiplier increasing
    const interval = setInterval(() => {
      setCrashMultiplier((prev) => {
        const newMultiplier = prev + 0.01;

        // Random crash point between 1.01x and 50x
        const crashPoint = 1.01 + Math.random() * Math.random() * 49;

        if (newMultiplier >= crashPoint) {
          clearInterval(interval);
          setCrashedAt(newMultiplier);
          setGameActive(false);

          if (!hasCashedOut) {
            setGameResult({
              win: false,
              amount: 0,
              multiplier: newMultiplier,
              result: `Crashed at ${newMultiplier.toFixed(2)}x`,
            });
          }
          return newMultiplier;
        }

        return newMultiplier;
      });
    }, 100);
  };

  const cashOut = () => {
    if (gameActive && !hasCashedOut) {
      setHasCashedOut(true);
      setGameActive(false);
      const winAmount = betAmount * crashMultiplier;
      updateBalance(
        selectedCurrency,
        winAmount,
        `Crash cashout at ${crashMultiplier.toFixed(2)}x`,
        "win",
      );
      setGameResult({
        win: true,
        amount: winAmount,
        multiplier: crashMultiplier,
        result: `Cashed out at ${crashMultiplier.toFixed(2)}x`,
      });
    }
  };

  // Dice Game Logic
  const rollDice = () => {
    if (!canAffordWager(selectedCurrency, betAmount)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    updateBalance(selectedCurrency, -betAmount, "Dice game bet", "wager");
    const roll = Math.floor(Math.random() * 100) + 1;
    setDiceRoll(roll);

    const won =
      (diceOver && roll > diceTarget) || (!diceOver && roll < diceTarget);

    if (won) {
      const winChance = diceOver ? (100 - diceTarget) / 100 : diceTarget / 100;
      const multiplier = 0.99 / winChance; // 99% RTP
      const winAmount = betAmount * multiplier;
      updateBalance(selectedCurrency, winAmount, `Dice win: ${roll}`, "win");
      setGameResult({
        win: true,
        amount: winAmount,
        multiplier,
        result: `Rolled ${roll} - You win!`,
      });
    } else {
      setGameResult({
        win: false,
        amount: 0,
        multiplier: 0,
        result: `Rolled ${roll} - You lose`,
      });
    }
  };

  // Plinko Game Logic
  const dropPlinko = () => {
    if (!canAffordWager(selectedCurrency, betAmount)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    updateBalance(selectedCurrency, -betAmount, "Plinko game bet", "wager");
    setPlinkoDropping(true);

    // Simulate ball dropping
    setTimeout(() => {
      const multipliers = [
        1000, 130, 26, 9, 4, 2, 1.5, 1.5, 2, 4, 9, 26, 130, 1000,
      ];
      const slot = Math.floor(Math.random() * multipliers.length);
      const multiplier = multipliers[slot];

      setPlinkoResult(slot);
      setPlinkoDropping(false);

      const winAmount = betAmount * multiplier;
      updateBalance(
        selectedCurrency,
        winAmount,
        `Plinko win: ${multiplier}x`,
        "win",
      );
      setGameResult({
        win: multiplier > 1,
        amount: winAmount,
        multiplier,
        result: `Ball landed on ${multiplier}x`,
      });
    }, 3000);
  };

  // Mines Game Logic
  const initializeMines = () => {
    const newField = Array(25).fill(false);
    const minePositions = new Set<number>();

    while (minePositions.size < minesCount) {
      minePositions.add(Math.floor(Math.random() * 25));
    }

    minePositions.forEach((pos) => {
      newField[pos] = true;
    });

    setMineField(newField);
    setRevealedCells(Array(25).fill(false));
    setSafeRevealed(0);
  };

  const revealCell = (index: number) => {
    if (revealedCells[index] || !gameActive) return;

    const newRevealed = [...revealedCells];
    newRevealed[index] = true;
    setRevealedCells(newRevealed);

    if (mineField[index]) {
      // Hit a mine
      setGameActive(false);
      setGameResult({
        win: false,
        amount: 0,
        multiplier: 0,
        result: "You hit a mine!",
      });
    } else {
      // Safe cell
      const newSafeRevealed = safeRevealed + 1;
      setSafeRevealed(newSafeRevealed);

      // Calculate current multiplier
      const multiplier = Math.pow(1.2, newSafeRevealed);

      if (newSafeRevealed === 25 - minesCount) {
        // All safe cells revealed
        setGameActive(false);
        const winAmount = betAmount * multiplier;
        updateBalance(
          selectedCurrency,
          winAmount,
          `Mines complete: ${multiplier.toFixed(2)}x`,
          "win",
        );
        setGameResult({
          win: true,
          amount: winAmount,
          multiplier,
          result: `All gems found! ${multiplier.toFixed(2)}x`,
        });
      }
    }
  };

  const startMines = () => {
    if (!canAffordWager(selectedCurrency, betAmount)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    updateBalance(selectedCurrency, -betAmount, "Mines game bet", "wager");
    setGameActive(true);
    initializeMines();
  };

  const cashOutMines = () => {
    if (gameActive && safeRevealed > 0) {
      setGameActive(false);
      const multiplier = Math.pow(1.2, safeRevealed);
      const winAmount = betAmount * multiplier;
      updateBalance(
        selectedCurrency,
        winAmount,
        `Mines cashout: ${multiplier.toFixed(2)}x`,
        "win",
      );
      setGameResult({
        win: true,
        amount: winAmount,
        multiplier,
        result: `Cashed out at ${multiplier.toFixed(2)}x`,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500 bg-green-500/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "Hard":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  useEffect(() => {
    initializeMines();
  }, [minesCount]);

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
              Mini Games
            </h1>
            <p className="text-muted-foreground">
              Quick arcade-style games for instant wins
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
              <div className="text-sm text-muted-foreground">Games Won</div>
              <div className="font-bold text-success">127</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">
                Best Multiplier
              </div>
              <div className="font-bold text-purple">247.5x</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Selection */}
          <div className="lg:col-span-1">
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Select Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {miniGames.map((game) => {
                  const Icon = game.icon;
                  const isSelected = selectedGame === game.id;
                  return (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple bg-purple/10"
                          : "border-border hover:border-purple/50"
                      }`}
                      onClick={() => setSelectedGame(game.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-purple" />
                            <div className="font-medium text-sm">
                              {game.name}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {game.isNew && (
                              <Badge className="text-xs bg-blue-500">NEW</Badge>
                            )}
                            <Badge
                              className={getDifficultyColor(game.difficulty)}
                            >
                              {game.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {game.description}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Max: {game.maxMultiplier}x
                          </span>
                          <span className="text-muted-foreground">
                            {game.players} playing
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Betting Controls */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Place Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                  variant="inline"
                  showBalance={false}
                  minBetAmount={
                    selectedCurrency === CurrencyType.GC
                      ? currentGame.minBet.gc
                      : currentGame.minBet.sc
                  }
                />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setBetAmount(
                          Math.max(
                            selectedCurrency === CurrencyType.GC
                              ? currentGame.minBet.gc
                              : currentGame.minBet.sc,
                            betAmount -
                              (selectedCurrency === CurrencyType.GC ? 1 : 0.01),
                          ),
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="flex-1 text-center font-bold">
                      {betAmount} {selectedCurrency}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setBetAmount(
                          Math.min(
                            selectedCurrency === CurrencyType.GC
                              ? currentGame.maxBet.gc
                              : currentGame.maxBet.sc,
                            betAmount +
                              (selectedCurrency === CurrencyType.GC ? 1 : 0.01),
                          ),
                        )
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    {[1, 5, 10, 25].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() =>
                          setBetAmount(
                            selectedCurrency === CurrencyType.GC
                              ? amount
                              : amount * 0.01,
                          )
                        }
                      >
                        {selectedCurrency === CurrencyType.GC
                          ? amount
                          : (amount * 0.01).toFixed(2)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <currentGame.icon className="h-6 w-6 text-purple" />
                    {currentGame.name}
                  </span>
                  {gameResult && (
                    <Badge
                      className={
                        gameResult.win
                          ? "bg-success text-white"
                          : "bg-destructive text-white"
                      }
                    >
                      {gameResult.result}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{currentGame.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Crash Game */}
                {selectedGame === "crash" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-6xl font-bold gradient-text mb-2">
                        {crashMultiplier.toFixed(2)}x
                      </div>
                      {crashedAt && (
                        <div className="text-red-500 font-semibold">
                          CRASHED AT {crashedAt.toFixed(2)}x
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Auto Cash Out At:
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCashOutAt(Math.max(1.01, cashOutAt - 0.1))
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 text-center font-bold">
                          {cashOutAt.toFixed(2)}x
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCashOutAt(cashOutAt + 0.1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {!gameActive ? (
                        <Button
                          onClick={startCrash}
                          className="flex-1 btn-primary"
                          disabled={
                            !user ||
                            !canAffordWager(selectedCurrency, betAmount)
                          }
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Crash ({betAmount} {selectedCurrency})
                        </Button>
                      ) : (
                        <Button
                          onClick={cashOut}
                          className="flex-1 btn-primary"
                          disabled={hasCashedOut}
                        >
                          Cash Out ({(betAmount * crashMultiplier).toFixed(2)}{" "}
                          {selectedCurrency})
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dice Game */}
                {selectedGame === "dice" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      {diceRoll !== null && (
                        <div className="text-6xl font-bold gradient-text mb-2">
                          {diceRoll}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Target Number: {diceTarget}
                        </label>
                        <div className="mt-2">
                          <input
                            type="range"
                            min="1"
                            max="99"
                            value={diceTarget}
                            onChange={(e) =>
                              setDiceTarget(parseInt(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={diceOver ? "default" : "outline"}
                          onClick={() => setDiceOver(true)}
                          className="flex-1"
                        >
                          Over {diceTarget}
                        </Button>
                        <Button
                          variant={!diceOver ? "default" : "outline"}
                          onClick={() => setDiceOver(false)}
                          className="flex-1"
                        >
                          Under {diceTarget}
                        </Button>
                      </div>

                      <Button
                        onClick={rollDice}
                        className="w-full btn-primary"
                        disabled={
                          !user || !canAffordWager(selectedCurrency, betAmount)
                        }
                      >
                        <Dice6 className="h-4 w-4 mr-2" />
                        Roll Dice ({betAmount} {selectedCurrency})
                      </Button>
                    </div>
                  </div>
                )}

                {/* Plinko Game */}
                {selectedGame === "plinko" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="h-48 bg-gradient-to-b from-purple/20 to-card border rounded-lg relative overflow-hidden">
                        {plinkoDropping && (
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-4 bg-gold rounded-full animate-bounce"></div>
                          </div>
                        )}
                        <div className="absolute bottom-0 w-full">
                          <div className="grid grid-cols-14 gap-px text-xs text-center">
                            {[
                              1000, 130, 26, 9, 4, 2, 1.5, 1.5, 2, 4, 9, 26,
                              130, 1000,
                            ].map((mult, index) => (
                              <div
                                key={index}
                                className={`p-2 text-white font-bold ${
                                  mult >= 100
                                    ? "bg-gold"
                                    : mult >= 10
                                      ? "bg-orange-500"
                                      : mult >= 4
                                        ? "bg-green-500"
                                        : mult >= 2
                                          ? "bg-blue-500"
                                          : "bg-gray-500"
                                } ${plinkoResult === index ? "ring-2 ring-white" : ""}`}
                              >
                                {mult}x
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={dropPlinko}
                      className="w-full btn-primary"
                      disabled={
                        plinkoDropping ||
                        !user ||
                        !canAffordWager(selectedCurrency, betAmount)
                      }
                    >
                      <Circle className="h-4 w-4 mr-2" />
                      {plinkoDropping
                        ? "Dropping..."
                        : `Drop Ball (${betAmount} ${selectedCurrency})`}
                    </Button>
                  </div>
                )}

                {/* Mines Game */}
                {selectedGame === "mines" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          Mines: {minesCount}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setMinesCount(Math.max(1, minesCount - 1))
                            }
                            disabled={gameActive}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{minesCount}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setMinesCount(Math.min(24, minesCount + 1))
                            }
                            disabled={gameActive}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {gameActive && safeRevealed > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Current Multiplier
                          </div>
                          <div className="font-bold text-success">
                            {Math.pow(1.2, safeRevealed).toFixed(2)}x
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {mineField.map((isMine, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`aspect-square p-0 ${
                            revealedCells[index]
                              ? isMine
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                              : "hover:bg-purple/20"
                          }`}
                          onClick={() => revealCell(index)}
                          disabled={!gameActive || revealedCells[index]}
                        >
                          {revealedCells[index] && (isMine ? "💣" : "💎")}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {!gameActive ? (
                        <Button
                          onClick={startMines}
                          className="flex-1 btn-primary"
                          disabled={
                            !user ||
                            !canAffordWager(selectedCurrency, betAmount)
                          }
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Game ({betAmount} {selectedCurrency})
                        </Button>
                      ) : (
                        <Button
                          onClick={cashOutMines}
                          className="flex-1 btn-primary"
                          disabled={safeRevealed === 0}
                        >
                          Cash Out (
                          {(betAmount * Math.pow(1.2, safeRevealed)).toFixed(2)}{" "}
                          {selectedCurrency})
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Games - Placeholder */}
                {!["crash", "dice", "plinko", "mines"].includes(
                  selectedGame,
                ) && (
                  <div className="text-center py-8">
                    <currentGame.icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {currentGame.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {currentGame.description}
                    </p>
                    <Badge className="mb-4">Coming Soon</Badge>
                    <p className="text-sm text-muted-foreground">
                      This game is currently under development. Try our other
                      mini games!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Multiplier:</span>
                  <span className="font-semibold text-purple">
                    {currentGame.maxMultiplier}x
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Bet:</span>
                  <span className="font-semibold">
                    {selectedCurrency === CurrencyType.GC
                      ? `${currentGame.minBet.gc} GC`
                      : `${currentGame.minBet.sc} SC`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Bet:</span>
                  <span className="font-semibold">
                    {selectedCurrency === CurrencyType.GC
                      ? `${currentGame.maxBet.gc} GC`
                      : `${currentGame.maxBet.sc} SC`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-semibold">{currentGame.players}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge className={getDifficultyColor(currentGame.difficulty)}>
                    {currentGame.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Big Wins */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500" />
                  Recent Big Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWins.map((win, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{win.player}</span>
                      <span className="text-success font-semibold">
                        {win.amount}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {win.game} • {win.multiplier}
                      </span>
                      <span>{win.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Tips */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  Tips & Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {selectedGame === "crash" && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className="font-medium text-blue-400 mb-1">
                      💡 Crash Tips
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Set an auto-cashout target and stick to it. Greed often
                      leads to crashes!
                    </p>
                  </div>
                )}
                {selectedGame === "dice" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div className="font-medium text-green-400 mb-1">
                      🎯 Dice Tips
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Lower targets have higher win chances but smaller
                      multipliers.
                    </p>
                  </div>
                )}
                {selectedGame === "mines" && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                    <div className="font-medium text-purple-400 mb-1">
                      💎 Mines Tips
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Fewer mines = safer but lower multipliers. Find your risk
                      balance!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  Daily Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { rank: 1, name: "CrashKing***", multiplier: "1247.5x" },
                  { rank: 2, name: "MineHunter***", multiplier: "856.2x" },
                  { rank: 3, name: "DiceRoller***", multiplier: "432.1x" },
                ].map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          leader.rank === 1
                            ? "bg-gold text-black"
                            : leader.rank === 2
                              ? "bg-gray-400 text-black"
                              : "bg-amber-600 text-black"
                        }`}
                      >
                        {leader.rank}
                      </div>
                      <span>{leader.name}</span>
                    </div>
                    <span className="font-semibold text-success">
                      {leader.multiplier}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
