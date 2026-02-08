import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  RefreshCw,
  Coins,
} from "lucide-react";

interface ProgressiveJackpotGameProps {
  gameId: string;
  gameName: string;
  entryFeeGc: number;
  entryFeeSc: number;
  currentJackpot: number;
  jackpotIncrement: number;
  playerCount: number;
  totalEntries: number;
  maxJackpot: number;
  userBalance: { gc: number; sc: number };
  onEntrySubmitted?: () => void;
}

const ProgressiveJackpotGame = ({
  gameId,
  gameName,
  entryFeeGc,
  entryFeeSc,
  currentJackpot,
  jackpotIncrement,
  playerCount,
  totalEntries,
  maxJackpot,
  userBalance,
  onEntrySubmitted,
}: ProgressiveJackpotGameProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [userEntries, setUserEntries] = useState(0);
  const [jackpotGrowth, setJackpotGrowth] = useState(currentJackpot);

  useEffect(() => {
    // Simulate jackpot growth
    const timer = setInterval(() => {
      setJackpotGrowth((prev) => {
        const newValue = prev + jackpotIncrement;
        return newValue <= maxJackpot ? newValue : maxJackpot;
      });
    }, 5000); // Grows every 5 seconds

    return () => clearInterval(timer);
  }, [jackpotIncrement, maxJackpot]);

  const handleSubmitEntry = async () => {
    try {
      setIsSubmitting(true);

      const clientSeed = Math.random().toString(36).substring(2, 15);

      const res = await fetch("/api/games/entries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          clientSeed,
          currencyType: selectedCurrency,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Entry submitted! Jackpot now: ${(jackpotGrowth + jackpotIncrement).toLocaleString()} GC`,
        });
        setUserEntries(userEntries + 1);
        if (onEntrySubmitted) {
          onEntrySubmitted();
        }
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to submit entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAfford =
    selectedCurrency === "GC"
      ? userBalance.gc >= entryFeeGc
      : userBalance.sc >= entryFeeSc;
  const jackpotProgress = (jackpotGrowth / maxJackpot) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Main Game Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-800">
        <CardHeader className="border-b border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500 animate-pulse" />
                {gameName}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Progressive Jackpot - Prize grows with every entry
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-red-600 animate-pulse">
              🔥 Growing!
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Giant Jackpot Display */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-8 border-2 border-yellow-600 text-center space-y-3">
            <p className="text-sm text-yellow-300 font-semibold">
              CURRENT JACKPOT
            </p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse">
              {jackpotGrowth.toLocaleString()}
            </p>
            <p className="text-lg text-yellow-200">Gold Coins</p>
            <p className="text-sm text-yellow-300/70">
              Grows by {jackpotIncrement} GC with every entry
            </p>
          </div>

          {/* Jackpot Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Progress to Max</span>
              <span className="text-sm text-slate-400">
                {jackpotProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={jackpotProgress} className="h-3" />
            <p className="text-xs text-slate-400 text-right">
              Max: {maxJackpot.toLocaleString()} GC
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Users className="h-5 w-5 mx-auto mb-2 text-blue-400" />
              <p className="text-xs text-slate-400 mb-1">Players</p>
              <p className="text-2xl font-bold text-white">
                {playerCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Coins className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-xs text-slate-400 mb-1">Total Entries</p>
              <p className="text-2xl font-bold text-white">
                {totalEntries.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Zap className="h-5 w-5 mx-auto mb-2 text-purple-400" />
              <p className="text-xs text-slate-400 mb-1">Your Entries</p>
              <p className="text-2xl font-bold text-white">{userEntries}</p>
            </div>
          </div>

          {/* How Progressive Jackpot Works */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">
              How It Works
            </h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>
                • Each entry contributes {jackpotIncrement} GC to the shared
                jackpot
              </p>
              <p>• Jackpot keeps growing until someone wins the top prize</p>
              <p>• Winner is selected based on provably-fair RNG</p>
              <p>• After a win, jackpot resets and starts growing again</p>
            </div>
          </div>

          {/* Your Balance */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-400 mb-3">Your Balance</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">GC</p>
                <p
                  className={`text-lg font-semibold ${
                    userBalance.gc >= entryFeeGc
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {userBalance.gc.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">SC</p>
                <p
                  className={`text-lg font-semibold ${
                    userBalance.sc >= entryFeeSc
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {userBalance.sc.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Entry Cost */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-400 mb-3">Entry Cost</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">GC</p>
                <p className="text-lg font-semibold text-yellow-400">
                  {entryFeeGc}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">SC</p>
                <p className="text-lg font-semibold text-purple-400">
                  {entryFeeSc}
                </p>
              </div>
            </div>
          </div>

          {/* Currency Selection and Submit */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedCurrency === "GC" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("GC")}
                className={
                  selectedCurrency === "GC"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : ""
                }
              >
                Play with GC
              </Button>
              <Button
                variant={selectedCurrency === "SC" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("SC")}
                className={
                  selectedCurrency === "SC"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                Play with SC
              </Button>
            </div>

            <Button
              onClick={handleSubmitEntry}
              disabled={!canAfford || isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-6 text-lg"
            >
              {isSubmitting && (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              )}
              {!canAfford
                ? "Insufficient Balance"
                : `Join the Jackpot (${selectedCurrency === "GC" ? entryFeeGc + " GC" : entryFeeSc + " SC"})`}
            </Button>

            {!canAfford && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  You don't have enough {selectedCurrency} to play
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Winning Info */}
          <Alert className="bg-green-900/20 border-green-800">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Every entry increases your chances to win the progressive jackpot!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Jackpot Winners */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Recent Jackpot Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    Player #{i}
                  </p>
                  <p className="text-xs text-slate-400">
                    {Math.floor(Math.random() * 24)} hours ago
                  </p>
                </div>
                <p className="text-lg font-bold text-yellow-400">
                  {(Math.random() * 50000 + 10000).toLocaleString()} GC
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveJackpotGame;
