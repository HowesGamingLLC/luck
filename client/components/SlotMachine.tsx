import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useJackpotWin, JackpotCelebration } from "./ProgressiveJackpot";
import {
  useCurrency,
  CurrencyType,
  formatCurrency,
  getCurrencyColor,
  getCurrencyIcon,
} from "@/contexts/CurrencyContext";
import {
  Play,
  Coins,
  Crown,
  Zap,
  Volume2,
  VolumeX,
  Gem,
  AlertCircle,
} from "lucide-react";

export interface SlotSymbol {
  id: string;
  symbol: string;
  value: number;
  rarity: number; // 1-100, lower = rarer
  color: string;
}

export interface SlotTheme {
  name: string;
  symbols: SlotSymbol[];
  background: string;
  jackpotMultiplier: number;
}

interface SlotMachineProps {
  theme: SlotTheme;
  reels?: number;
  rows?: number;
  currency: CurrencyType;
  onWin?: (
    amount: number,
    combination: string[],
    currency: CurrencyType,
  ) => void;
  onSpin?: () => void;
  disabled?: boolean;
  autoPlay?: boolean;
  className?: string;
}

// Default classic slot theme
const CLASSIC_THEME: SlotTheme = {
  name: "Classic Fruits",
  background: "from-red-500 to-yellow-500",
  jackpotMultiplier: 1000,
  symbols: [
    { id: "cherry", symbol: "🍒", value: 5, rarity: 25, color: "text-red-500" },
    {
      id: "lemon",
      symbol: "🍋",
      value: 10,
      rarity: 20,
      color: "text-yellow-500",
    },
    {
      id: "orange",
      symbol: "🍊",
      value: 15,
      rarity: 18,
      color: "text-orange-500",
    },
    {
      id: "plum",
      symbol: "🍇",
      value: 20,
      rarity: 15,
      color: "text-purple-500",
    },
    { id: "bell", symbol: "🔔", value: 25, rarity: 12, color: "text-gold" },
    {
      id: "star",
      symbol: "⭐",
      value: 50,
      rarity: 8,
      color: "text-yellow-400",
    },
    {
      id: "diamond",
      symbol: "💎",
      value: 100,
      rarity: 5,
      color: "text-blue-400",
    },
    { id: "seven", symbol: "7️⃣", value: 200, rarity: 3, color: "text-red-600" },
    { id: "jackpot", symbol: "🎰", value: 500, rarity: 1, color: "text-gold" },
  ],
};

export function SlotMachine({
  theme = CLASSIC_THEME,
  reels = 3,
  rows = 3,
  currency,
  onWin,
  onSpin,
  disabled = false,
  autoPlay = false,
  className,
}: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([]);
  const [lastWin, setLastWin] = useState<{
    amount: number;
    lines: number[];
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spinCount, setSpinCount] = useState(0);
  const [jackpotWin, setJackpotWin] = useState<{
    amount: number;
    type: string;
  } | null>(null);
  const [betAmount] = useState(currency === CurrencyType.SC ? 0.01 : 1); // SC: 1 cent, GC: 1 coin
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { triggerJackpotWin, checkJackpotEligibility } = useJackpotWin();
  const { user, canAffordWager, updateBalance } = useCurrency();

  // Initialize reels
  useEffect(() => {
    const initialReels = Array.from({ length: reels }, () =>
      Array.from({ length: rows }, () => getRandomSymbol().symbol),
    );
    setReelResults(initialReels);
  }, [reels, rows]);

  const getRandomSymbol = (): SlotSymbol => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const symbol of theme.symbols) {
      cumulative += symbol.rarity;
      if (random <= cumulative) {
        return symbol;
      }
    }

    return theme.symbols[0]; // Fallback
  };

  const generateReelSymbols = (reelIndex: number): string[] => {
    // Generate more symbols for spinning effect
    const symbols = Array.from(
      { length: rows + 20 },
      () => getRandomSymbol().symbol,
    );
    return symbols;
  };

  const checkWinningLines = (
    results: string[][],
  ): { amount: number; lines: number[] } => {
    let totalWin = 0;
    const winningLines: number[] = [];

    // Check horizontal lines
    for (let row = 0; row < rows; row++) {
      const line = results.map((reel) => reel[row]);
      const winAmount = calculateLineWin(line);
      if (winAmount > 0) {
        totalWin += winAmount;
        winningLines.push(row);
      }
    }

    // Check diagonal lines (for 3x3 or larger)
    if (rows >= 3 && reels >= 3) {
      // Top-left to bottom-right
      const diagonal1 = results.map((reel, index) => reel[index]);
      const diagonal1Win = calculateLineWin(diagonal1);
      if (diagonal1Win > 0) {
        totalWin += diagonal1Win;
        winningLines.push(rows); // Use next available line number
      }

      // Top-right to bottom-left
      const diagonal2 = results.map((reel, index) => reel[rows - 1 - index]);
      const diagonal2Win = calculateLineWin(diagonal2);
      if (diagonal2Win > 0) {
        totalWin += diagonal2Win;
        winningLines.push(rows + 1);
      }
    }

    return { amount: totalWin, lines: winningLines };
  };

  const calculateLineWin = (line: string[]): number => {
    // Check for matching symbols
    const firstSymbol = line[0];
    let consecutiveMatches = 1;

    for (let i = 1; i < line.length; i++) {
      if (line[i] === firstSymbol) {
        consecutiveMatches++;
      } else {
        break;
      }
    }

    // Need at least 2 matching symbols (3 for higher payouts)
    if (consecutiveMatches < 2) return 0;

    const symbol = theme.symbols.find((s) => s.symbol === firstSymbol);
    if (!symbol) return 0;

    // Calculate payout based on matches
    let multiplier = 1;
    if (consecutiveMatches === 2) multiplier = 1;
    else if (consecutiveMatches === 3) multiplier = 3;
    else if (consecutiveMatches === 4) multiplier = 10;
    else if (consecutiveMatches === 5) multiplier = 25;

    // Base win amount
    let baseWin = symbol.value * multiplier;

    // Currency adjustments and limits
    if (currency === CurrencyType.SC) {
      // Convert to SC scale (much smaller amounts)
      baseWin = baseWin * 0.01; // Scale down for SC

      // Apply 10 SC maximum limit
      baseWin = Math.min(baseWin, 10);

      // Jackpot bonus for rare symbols (but still capped at 10 SC)
      if (symbol.id === "jackpot" && consecutiveMatches >= 3) {
        baseWin = 10; // Max jackpot for SC
      }
    } else {
      // GC can have higher amounts but scaled appropriately
      if (symbol.id === "jackpot" && consecutiveMatches >= 3) {
        baseWin = Math.min(baseWin * 5, 1000); // Cap GC jackpot at 1000
      }
    }

    return Math.round(baseWin * 100) / 100; // Round to 2 decimal places
  };

  const spin = async () => {
    if (isSpinning || disabled) return;

    // Check if user can afford the bet
    if (!canAffordWager(currency, betAmount)) {
      console.log(`Insufficient ${currency} balance for bet`);
      return;
    }

    setIsSpinning(true);
    setLastWin(null);

    // Deduct bet amount
    updateBalance(currency, -betAmount, `Slot bet - ${theme.name}`, "wager");

    onSpin?.();
    setSpinCount((prev) => prev + 1);

    // Play spin sound effect
    if (soundEnabled) {
      // In a real app, you'd play actual sound effects here
      console.log("🎵 Spinning sound effect");
    }

    // Animate each reel with different delays
    const spinDurations = [2000, 2200, 2400, 2600, 2800].slice(0, reels);
    const newResults: string[][] = [];

    // Start all reels spinning
    reelRefs.current.forEach((reel, index) => {
      if (reel) {
        reel.style.animation = `spin-reel ${spinDurations[index]}ms cubic-bezier(0.23, 1, 0.32, 1)`;
      }
    });

    // Stop reels one by one
    for (let i = 0; i < reels; i++) {
      await new Promise((resolve) => setTimeout(resolve, spinDurations[i]));

      const reelSymbols = Array.from(
        { length: rows },
        () => getRandomSymbol().symbol,
      );
      newResults.push(reelSymbols);

      // Reset animation
      if (reelRefs.current[i]) {
        reelRefs.current[i]!.style.animation = "";
      }
    }

    setReelResults(newResults);

    // Check for wins
    const winResult = checkWinningLines(newResults);
    if (winResult.amount > 0) {
      setLastWin(winResult);

      // Add winnings to user balance
      updateBalance(
        currency,
        winResult.amount,
        `Slot win - ${theme.name}`,
        "win",
      );

      // Check for jackpot eligibility (only for SC for real jackpots)
      const jackpotType =
        currency === CurrencyType.SC
          ? checkJackpotEligibility(newResults.flat(), theme.name)
          : null;
      if (jackpotType) {
        // Scale jackpot amounts for SC (much smaller but still exciting)
        const jackpotAmounts = { mini: 5, minor: 10, major: 25, mega: 50 };
        const jackpotAmount =
          jackpotAmounts[jackpotType as keyof typeof jackpotAmounts];
        const jackpotWinData = triggerJackpotWin(jackpotAmount, jackpotType);
        setJackpotWin(jackpotWinData);

        // Add additional jackpot winnings
        updateBalance(
          currency,
          jackpotAmount,
          `${jackpotType} Jackpot - ${theme.name}`,
          "win",
        );

        onWin?.(winResult.amount + jackpotAmount, newResults.flat(), currency);
      } else {
        onWin?.(winResult.amount, newResults.flat(), currency);
      }

      if (soundEnabled) {
        console.log(
          jackpotType ? "🎵 JACKPOT sound effect!" : "🎵 Win sound effect",
        );
      }
    }

    setIsSpinning(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isSpinning && !disabled) {
      const timer = setTimeout(() => {
        spin();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isSpinning, disabled, spinCount]);

  return (
    <Card className={cn("glass overflow-hidden", className)}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <div
            className={`p-2 rounded-full bg-gradient-to-r ${theme.background}`}
          >
            {currency === CurrencyType.SC ? (
              <Gem className="h-5 w-5 text-white" />
            ) : (
              <Coins className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex flex-col items-center">
            <span>{theme.name}</span>
            <span className={`text-xs ${getCurrencyColor(currency)}`}>
              {currency === CurrencyType.SC
                ? "Real Money Mode"
                : "Fun Play Mode"}
            </span>
          </div>
          {lastWin && (
            <Badge
              className={
                currency === CurrencyType.SC
                  ? "bg-teal text-white"
                  : "bg-gold text-black"
              }
              animate-pulse
            >
              WIN! +{formatCurrency(lastWin.amount, currency)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Reels */}
        <div className="relative">
          <div
            className={`grid gap-2 p-4 rounded-lg bg-gradient-to-br ${theme.background} shadow-inner`}
            style={{ gridTemplateColumns: `repeat(${reels}, 1fr)` }}
          >
            {reelResults.map((reel, reelIndex) => (
              <div
                key={reelIndex}
                className="relative overflow-hidden bg-white/90 rounded-lg shadow-lg"
                style={{ height: `${rows * 60}px` }}
              >
                <div
                  ref={(el) => (reelRefs.current[reelIndex] = el)}
                  className="absolute inset-0 flex flex-col"
                >
                  {reel.map((symbol, symbolIndex) => (
                    <div
                      key={`${reelIndex}-${symbolIndex}`}
                      className={cn(
                        "flex items-center justify-center text-3xl font-bold h-[60px] border-b border-gray-200 last:border-b-0",
                        lastWin?.lines.includes(symbolIndex) &&
                          "bg-gold/20 animate-pulse",
                      )}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>

                {/* Spinning overlay */}
                {isSpinning && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-spin-reel-overlay" />
                )}
              </div>
            ))}
          </div>

          {/* Win Lines Overlay */}
          {lastWin && lastWin.lines.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {lastWin.lines.map((lineIndex, i) => (
                <div
                  key={i}
                  className="absolute bg-gold/30 border-2 border-gold animate-pulse"
                  style={{
                    top: `${16 + lineIndex * 60}px`,
                    left: "16px",
                    right: "16px",
                    height: "60px",
                    borderRadius: "8px",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Betting Info */}
        <div className="bg-card/30 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Bet Amount:</span>
            <span className={`font-semibold ${getCurrencyColor(currency)}`}>
              {formatCurrency(betAmount, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Your Balance:</span>
            <span className={`font-semibold ${getCurrencyColor(currency)}`}>
              {currency === CurrencyType.SC
                ? formatCurrency(user?.balance.sweepCoins || 0, currency)
                : formatCurrency(user?.balance.goldCoins || 0, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Max Win:</span>
            <span className="font-semibold text-success">
              {currency === CurrencyType.SC ? "10.00 SC" : "1,000 GC"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              Spins: {spinCount}
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={
              isSpinning || disabled || !canAffordWager(currency, betAmount)
            }
            className={cn(
              currency === CurrencyType.SC
                ? "bg-gradient-to-r from-teal to-teal-dark text-white"
                : "btn-gold",
              "min-w-[120px] relative overflow-hidden group",
              isSpinning && "animate-pulse",
            )}
          >
            {!canAffordWager(currency, betAmount) ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Low Balance
              </>
            ) : isSpinning ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                SPIN {formatCurrency(betAmount, currency)}
              </>
            )}
          </Button>
        </div>

        {/* Paytable Preview */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {theme.symbols.slice(0, 6).map((symbol) => {
            const displayValue =
              currency === CurrencyType.SC
                ? Math.min(symbol.value * 0.01, 10)
                : symbol.value;
            return (
              <div
                key={symbol.id}
                className="flex items-center gap-1 text-center"
              >
                <span className="text-lg">{symbol.symbol}</span>
                <span
                  className={cn("font-semibold", getCurrencyColor(currency))}
                >
                  {formatCurrency(displayValue, currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Last Win Display */}
        {lastWin && (
          <div
            className={cn(
              "text-center p-3 bg-gradient-to-r border rounded-lg",
              currency === CurrencyType.SC
                ? "from-teal/20 to-teal/10 border-teal/30"
                : "from-gold/20 to-gold/10 border-gold/30",
            )}
          >
            <div
              className={cn(
                "text-lg font-bold",
                currency === CurrencyType.SC ? "text-teal" : "text-gold",
              )}
            >
              🎉 YOU WON {formatCurrency(lastWin.amount, currency)}! 🎉
            </div>
            <div className="text-sm text-muted-foreground">
              {lastWin.lines.length} winning line
              {lastWin.lines.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Sound Effects Info */}
        <div className="text-center text-xs text-muted-foreground">
          {soundEnabled
            ? "🔊 Sound effects enabled"
            : "🔇 Sound effects disabled"}
          {spinCount > 0 && (
            <span className="ml-2">• Lucky spin #{spinCount}</span>
          )}
        </div>
      </CardContent>

      {/* Jackpot Celebration Modal */}
      {jackpotWin && (
        <JackpotCelebration
          amount={jackpotWin.amount}
          type={jackpotWin.type}
          onComplete={() => setJackpotWin(null)}
        />
      )}
    </Card>
  );
}

// CSS for reel spinning animation (add to global.css)
export const slotAnimations = `
@keyframes spin-reel {
  0% { transform: translateY(0); }
  100% { transform: translateY(-1200px); }
}

@keyframes spin-reel-overlay {
  0% { opacity: 0; transform: translateY(-100%); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(100%); }
}

.animate-spin-reel-overlay {
  animation: spin-reel-overlay 0.5s ease-in-out infinite;
}
`;
