import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, TrendingUp, Clock } from "lucide-react";

interface JackpotData {
  id: string;
  name: string;
  amount: number;
  baseAmount: number;
  lastWon: string;
  averageTime: string;
  color: string;
  isHot: boolean;
}

interface ProgressiveJackpotProps {
  className?: string;
  onJackpotUpdate?: (jackpots: JackpotData[]) => void;
}

export function ProgressiveJackpot({
  className,
  onJackpotUpdate,
}: ProgressiveJackpotProps) {
  const [jackpots, setJackpots] = useState<JackpotData[]>([
    {
      id: "mega",
      name: "Mega Jackpot",
      amount: 25750.0,
      baseAmount: 10000,
      lastWon: "3 days ago",
      averageTime: "7 days",
      color: "text-red-500",
      isHot: true,
    },
    {
      id: "major",
      name: "Major Jackpot",
      amount: 8940.5,
      baseAmount: 5000,
      lastWon: "1 day ago",
      averageTime: "3 days",
      color: "text-purple-500",
      isHot: false,
    },
    {
      id: "minor",
      name: "Minor Jackpot",
      amount: 1875.25,
      baseAmount: 1000,
      lastWon: "6 hours ago",
      averageTime: "18 hours",
      color: "text-gold",
      isHot: true,
    },
    {
      id: "mini",
      name: "Mini Jackpot",
      amount: 425.75,
      baseAmount: 250,
      lastWon: "2 hours ago",
      averageTime: "4 hours",
      color: "text-teal",
      isHot: false,
    },
  ]);

  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simulate progressive jackpot growth
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpots((prevJackpots) => {
        const updatedJackpots = prevJackpots.map((jackpot) => {
          // Increase jackpot by random amount (simulating player contributions)
          const growthRate = getGrowthRate(jackpot.id);
          const increment = Math.random() * growthRate;

          return {
            ...jackpot,
            amount: jackpot.amount + increment,
            isHot: Math.random() > 0.7, // Randomly mark as "hot"
          };
        });

        onJackpotUpdate?.(updatedJackpots);
        return updatedJackpots;
      });

      setLastUpdate(Date.now());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [onJackpotUpdate]);

  const getGrowthRate = (jackpotId: string): number => {
    switch (jackpotId) {
      case "mega":
        return 5.0; // $0-5 per update
      case "major":
        return 2.0; // $0-2 per update
      case "minor":
        return 0.8; // $0-0.8 per update
      case "mini":
        return 0.3; // $0-0.3 per update
      default:
        return 1.0;
    }
  };

  const handleJackpotWin = (jackpotId: string) => {
    setJackpots((prevJackpots) =>
      prevJackpots.map((jackpot) =>
        jackpot.id === jackpotId
          ? {
              ...jackpot,
              amount: jackpot.baseAmount,
              lastWon: "Just now",
              isHot: false,
            }
          : jackpot,
      ),
    );
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getJackpotProgress = (jackpot: JackpotData): number => {
    const progress =
      ((jackpot.amount - jackpot.baseAmount) / jackpot.baseAmount) * 100;
    return Math.min(progress, 100);
  };

  return (
    <Card className={cn("glass", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <span>Progressive Jackpots</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Live
            <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {jackpots.map((jackpot, index) => (
          <div
            key={jackpot.id}
            className={cn(
              "relative p-4 rounded-lg border transition-all duration-300",
              jackpot.isHot
                ? "border-red-500/50 bg-red-500/5 animate-pulse-glow"
                : "border-border bg-card/30",
            )}
          >
            {jackpot.isHot && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                🔥 HOT
              </Badge>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{jackpot.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Growing</span>
              </div>
            </div>

            <div className="mb-3">
              <div className={cn("text-xl font-bold", jackpot.color)}>
                ${formatAmount(jackpot.amount)}
              </div>
              <div className="w-full bg-card rounded-full h-2 mt-1">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    jackpot.isHot
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-purple to-gold",
                  )}
                  style={{
                    width: `${Math.min(getJackpotProgress(jackpot), 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last won: {jackpot.lastWon}</span>
              </div>
              <span>Avg: {jackpot.averageTime}</span>
            </div>
          </div>
        ))}

        <div className="text-center pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Total Jackpot Pool:
            <span className="font-semibold text-gold ml-1">
              ${formatAmount(jackpots.reduce((sum, j) => sum + j.amount, 0))}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for components to trigger jackpot wins
export const useJackpotWin = () => {
  const triggerJackpotWin = (amount: number, type: string = "mini") => {
    // This would typically communicate with a jackpot context or state management
    console.log(`🎰 JACKPOT WIN! $${amount} (${type})`);

    // In a real app, this would:
    // 1. Update user balance
    // 2. Reset jackpot amount
    // 3. Show celebration animation
    // 4. Record win in database
    // 5. Notify other players

    return {
      amount,
      type,
      timestamp: Date.now(),
    };
  };

  const checkJackpotEligibility = (
    combination: string[],
    theme: string,
  ): string | null => {
    // Check if the combination is eligible for a jackpot
    const isJackpotSymbol = combination.every(
      (symbol) =>
        symbol === "🎰" ||
        symbol === "👸" ||
        symbol === "💰" ||
        symbol === "⭐" ||
        symbol === "✨" ||
        symbol === "🔱",
    );

    if (!isJackpotSymbol) return null;

    const consecutiveCount = combination.length;

    // Determine jackpot level based on consecutive matches
    if (consecutiveCount >= 5) return "mega";
    if (consecutiveCount >= 4) return "major";
    if (consecutiveCount >= 3) return "minor";
    if (consecutiveCount >= 2) return "mini";

    return null;
  };

  return {
    triggerJackpotWin,
    checkJackpotEligibility,
  };
};

// Jackpot celebration component
export function JackpotCelebration({
  amount,
  type,
  onComplete,
}: {
  amount: number;
  type: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-center space-y-6 animate-bounce-slow">
        <div className="text-6xl">🎰</div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">JACKPOT!</h1>
          <p className="text-2xl font-semibold text-gold">
            ${amount.toLocaleString()}
          </p>
          <p className="text-lg text-muted-foreground capitalize">
            {type} Jackpot Winner!
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          🎉 Congratulations! Your winnings have been added to your balance! 🎉
        </div>
      </div>
    </div>
  );
}
