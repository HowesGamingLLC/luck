import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useJackpot } from "@/contexts/JackpotContext";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, TrendingUp, Clock, Settings, Info, Zap } from "lucide-react";

interface ProgressiveJackpotProps {
  className?: string;
  showOptInToggle?: boolean;
}

export function ProgressiveJackpot({
  className,
  showOptInToggle = true,
}: ProgressiveJackpotProps) {
  const { jackpots, isOptedIn, totalContributed, recentWins, toggleOptIn, getJackpotProgress } = useJackpot();
  const { isAuthenticated } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return "Never";

    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
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
