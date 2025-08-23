import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Play,
  Coins,
  Crown,
  Zap,
  Volume2,
  VolumeX,
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
  onWin?: (amount: number, combination: string[]) => void;
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
    { id: "lemon", symbol: "🍋", value: 10, rarity: 20, color: "text-yellow-500" },
    { id: "orange", symbol: "🍊", value: 15, rarity: 18, color: "text-orange-500" },
    { id: "plum", symbol: "🍇", value: 20, rarity: 15, color: "text-purple-500" },
    { id: "bell", symbol: "🔔", value: 25, rarity: 12, color: "text-gold" },
    { id: "star", symbol: "⭐", value: 50, rarity: 8, color: "text-yellow-400" },
    { id: "diamond", symbol: "💎", value: 100, rarity: 5, color: "text-blue-400" },
    { id: "seven", symbol: "7️⃣", value: 200, rarity: 3, color: "text-red-600" },
    { id: "jackpot", symbol: "🎰", value: 500, rarity: 1, color: "text-gold" },
  ],
};

export function SlotMachine({
  theme = CLASSIC_THEME,
  reels = 3,
  rows = 3,
  onWin,
  onSpin,
  disabled = false,
  autoPlay = false,
  className,
}: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([]);
  const [lastWin, setLastWin] = useState<{ amount: number; lines: number[] } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spinCount, setSpinCount] = useState(0);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize reels
  useEffect(() => {
    const initialReels = Array.from({ length: reels }, () =>
      Array.from({ length: rows }, () => getRandomSymbol().symbol)
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
    const symbols = Array.from({ length: rows + 20 }, () => getRandomSymbol().symbol);
    return symbols;
  };

  const checkWinningLines = (results: string[][]): { amount: number; lines: number[] } => {
    let totalWin = 0;
    const winningLines: number[] = [];

    // Check horizontal lines
    for (let row = 0; row < rows; row++) {
      const line = results.map(reel => reel[row]);
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

    const symbol = theme.symbols.find(s => s.symbol === firstSymbol);
    if (!symbol) return 0;

    // Calculate payout based on matches
    let multiplier = 1;
    if (consecutiveMatches === 2) multiplier = 1;
    else if (consecutiveMatches === 3) multiplier = 3;
    else if (consecutiveMatches === 4) multiplier = 10;
    else if (consecutiveMatches === 5) multiplier = 25;

    // Jackpot bonus for rare symbols
    if (symbol.id === "jackpot" && consecutiveMatches >= 3) {
      multiplier *= theme.jackpotMultiplier;
    }

    return symbol.value * multiplier;
  };

  const spin = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setLastWin(null);
    onSpin?.();
    setSpinCount(prev => prev + 1);

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
      await new Promise(resolve => setTimeout(resolve, spinDurations[i]));
      
      const reelSymbols = Array.from({ length: rows }, () => getRandomSymbol().symbol);
      newResults.push(reelSymbols);
      
      // Reset animation
      if (reelRefs.current[i]) {
        reelRefs.current[i]!.style.animation = '';
      }
    }

    setReelResults(newResults);

    // Check for wins
    const winResult = checkWinningLines(newResults);
    if (winResult.amount > 0) {
      setLastWin(winResult);
      onWin?.(winResult.amount, newResults.flat());
      
      if (soundEnabled) {
        console.log("🎵 Win sound effect");
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
          <div className={`p-2 rounded-full bg-gradient-to-r ${theme.background}`}>
            <Coins className="h-5 w-5 text-white" />
          </div>
          {theme.name}
          {lastWin && (
            <Badge className="bg-gold text-black animate-pulse">
              WIN! +${lastWin.amount}
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
                  ref={el => reelRefs.current[reelIndex] = el}
                  className="absolute inset-0 flex flex-col"
                >
                  {reel.map((symbol, symbolIndex) => (
                    <div
                      key={`${reelIndex}-${symbolIndex}`}
                      className={cn(
                        "flex items-center justify-center text-3xl font-bold h-[60px] border-b border-gray-200 last:border-b-0",
                        lastWin?.lines.includes(symbolIndex) && "bg-gold/20 animate-pulse"
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

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Spins: {spinCount}
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={isSpinning || disabled}
            className={cn(
              "btn-gold min-w-[120px] relative overflow-hidden group",
              isSpinning && "animate-pulse"
            )}
          >
            {isSpinning ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                SPIN
              </>
            )}
          </Button>
        </div>

        {/* Paytable Preview */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {theme.symbols.slice(0, 6).map((symbol) => (
            <div key={symbol.id} className="flex items-center gap-1 text-center">
              <span className="text-lg">{symbol.symbol}</span>
              <span className={cn("font-semibold", symbol.color)}>
                ${symbol.value}
              </span>
            </div>
          ))}
        </div>

        {/* Last Win Display */}
        {lastWin && (
          <div className="text-center p-3 bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-lg">
            <div className="text-lg font-bold text-gold">
              🎉 YOU WON ${lastWin.amount}! 🎉
            </div>
            <div className="text-sm text-muted-foreground">
              {lastWin.lines.length} winning line{lastWin.lines.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardContent>
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
