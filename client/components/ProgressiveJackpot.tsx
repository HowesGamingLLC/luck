import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useJackpot } from "@/contexts/JackpotContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  TrendingUp,
  Clock,
  Settings,
  Info,
  Zap,
  Trophy,
} from "lucide-react";

interface ProgressiveJackpotProps {
  className?: string;
  showOptInToggle?: boolean;
}

export function ProgressiveJackpot({
  className,
  showOptInToggle = true,
}: ProgressiveJackpotProps) {
  const {
    jackpots,
    isOptedIn,
    totalContributed,
    recentWins,
    toggleOptIn,
    getJackpotProgress,
  } = useJackpot();
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
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <Card className={cn("glass", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <span>Progressive Jackpots</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live SC
              <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
            </Badge>
            {isAuthenticated && (
              <Badge
                variant={isOptedIn ? "default" : "secondary"}
                className="text-xs"
              >
                {isOptedIn ? "Opted In" : "Opt In"}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Jackpot Opt-in Section */}
        {isAuthenticated && showOptInToggle && (
          <div
            className={cn(
              "p-4 rounded-lg border transition-all duration-300",
              isOptedIn
                ? "border-green-500/50 bg-green-500/5"
                : "border-orange-500/50 bg-orange-500/5",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple" />
                <span className="font-medium text-sm">
                  Jackpot Participation
                </span>
              </div>
              <Switch
                checked={isOptedIn}
                onCheckedChange={toggleOptIn}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {isOptedIn ? (
                <>
                  <p className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-green-500" />
                    You're eligible to win real money jackpots!
                  </p>
                  <p>• 0.01 SC per spin contributes to jackpot pool</p>
                  <p>
                    • Your total contributed: {formatAmount(totalContributed)}{" "}
                    SC
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-orange-500" />
                    Opt in to participate in real money jackpots
                  </p>
                  <p>
                    • Small contribution (0.01 SC) per spin when playing SC
                    games
                  </p>
                  <p>• Chance to win up to 500 SC jackpots</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Jackpot Display */}
        {jackpots.map((jackpot) => (
          <div
            key={jackpot.id}
            className={cn(
              "relative p-4 rounded-lg border transition-all duration-300",
              jackpot.isHot
                ? "border-red-500/50 bg-red-500/5 animate-pulse-glow"
                : "border-border bg-card/30",
              !isOptedIn && isAuthenticated && "opacity-60",
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
                <span>Max: {formatAmount(jackpot.maxAmount)} SC</span>
              </div>
            </div>

            <div className="mb-3">
              <div className={cn("text-xl font-bold", jackpot.color)}>
                {formatAmount(jackpot.amount)} SC
              </div>
              <Progress
                value={getJackpotProgress(jackpot)}
                className="h-2 mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 SC</span>
                <span>{Math.round(getJackpotProgress(jackpot))}%</span>
                <span>{formatAmount(jackpot.maxAmount)} SC</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last won: {getTimeAgo(jackpot.lastWon)}</span>
              </div>
              <span>Avg: {jackpot.winFrequency}</span>
            </div>
          </div>
        ))}

        {/* Recent Wins */}
        {recentWins.length > 0 && (
          <div className="pt-2 border-t border-border">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gold" />
              Recent Jackpot Wins
            </h4>
            <div className="space-y-2">
              {recentWins.slice(0, 3).map((win) => (
                <div
                  key={win.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    Player**** won {win.type}
                  </span>
                  <span className="font-semibold text-success">
                    {formatAmount(win.amount)} SC
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="text-center pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Total Active Pool:
            <span className="font-semibold text-teal ml-1">
              {formatAmount(jackpots.reduce((sum, j) => sum + j.amount, 0))} SC
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Max Possible Pool:
            <span className="font-semibold text-gold ml-1">
              {formatAmount(jackpots.reduce((sum, j) => sum + j.maxAmount, 0))}{" "}
              SC
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

// Hook for components to trigger jackpot wins (now uses context)
export const useJackpotWin = () => {
  const { checkJackpotEligibility, triggerJackpotWin } = useJackpot();

  return {
    triggerJackpotWin: (jackpotId: string) => {
      const win = triggerJackpotWin(jackpotId);
      if (win) {
        console.log(`🎰 JACKPOT WIN! ${win.amount} SC (${win.type})`);
      }
      return win;
    },
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
          <p className="text-2xl font-semibold text-teal">
            {amount.toFixed(2)} SC
          </p>
          <p className="text-lg text-muted-foreground capitalize">
            {type} Winner!
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          🎉 Congratulations! Your winnings have been added to your balance! 🎉
        </div>
      </div>
    </div>
  );
}
