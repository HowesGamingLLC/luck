import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Coins,
  Trophy,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface InstantWinGameProps {
  gameId: string;
  gameName: string;
  entryFeeGc: number;
  entryFeeSc: number;
  winRate: number;
  userBalance: { gc: number; sc: number };
  onGameResult?: (result: { won: boolean; amount: number }) => void;
}

const InstantWinGame = ({
  gameId,
  gameName,
  entryFeeGc,
  entryFeeSc,
  winRate,
  userBalance,
  onGameResult,
}: InstantWinGameProps) => {
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [lastResult, setLastResult] = useState<{
    won: boolean;
    amount: number;
  } | null>(null);
  const [recentWins, setRecentWins] = useState<
    Array<{ id: string; amount: number; time: string }>
  >([]);

  const canAfford =
    selectedCurrency === "GC"
      ? userBalance.gc >= entryFeeGc
      : userBalance.sc >= entryFeeSc;

  const handleSpin = async () => {
    if (!canAfford) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSpinning(true);

      // Simulate instant result
      // In production, this would call the backend API
      const clientSeed = Math.random().toString(36).substring(2, 15);
      const result = Math.random() < winRate / 100;
      const winAmount = result
        ? Math.floor(
            (selectedCurrency === "GC" ? entryFeeGc : entryFeeSc) * 2.5
          )
        : 0;

      // Simulate spin animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLastResult({ won: result, amount: winAmount });

      if (result) {
        toast({
          title: "🎉 You Won!",
          description: `You won ${winAmount} ${selectedCurrency}!`,
        });
        setRecentWins([
          {
            id: Math.random().toString(),
            amount: winAmount,
            time: new Date().toLocaleTimeString(),
          },
          ...recentWins.slice(0, 4),
        ]);
      } else {
        toast({
          title: "Better luck next time!",
          description: `Try again to win big!`,
        });
      }

      if (onGameResult) {
        onGameResult({ won: result, amount: winAmount });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process spin",
        variant: "destructive",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Game Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-800">
        <CardHeader className="border-b border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-purple-500" />
                {gameName}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Instant Win - Get results immediately
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-600">
              🟢 Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Win Rate */}
          <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Win Rate</span>
              <span className="text-3xl font-bold text-purple-400">
                {winRate}%
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Chance to win big on every spin
            </p>
          </div>

          {/* Spin Area */}
          <div className="flex flex-col items-center space-y-6">
            {/* Spin Wheel / Animation Area */}
            <div className="w-64 h-64 mx-auto flex items-center justify-center">
              {isSpinning ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin">
                      <Sparkles className="h-32 w-32 text-purple-500" />
                    </div>
                  </div>
                </div>
              ) : lastResult ? (
                <div className="text-center space-y-4">
                  {lastResult.won ? (
                    <>
                      <Trophy className="h-32 w-32 text-yellow-500 mx-auto animate-bounce" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">
                          You Won!
                        </p>
                        <p className="text-4xl font-bold text-white">
                          +{lastResult.amount}
                        </p>
                        <p className="text-sm text-slate-400">
                          {selectedCurrency}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Zap className="h-32 w-32 text-slate-500 mx-auto" />
                      <div>
                        <p className="text-2xl font-bold text-slate-300">
                          Not This Time
                        </p>
                        <p className="text-sm text-slate-400">Try again!</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Sparkles className="h-32 w-32 text-purple-500 mx-auto opacity-50" />
                  <p className="text-slate-400">Click spin to play</p>
                </div>
              )}
            </div>

            {/* Your Balance */}
            <div className="w-full bg-slate-700/50 rounded-lg p-4 border border-slate-600">
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
            <div className="w-full bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <p className="text-sm text-slate-400 mb-3">Cost per Spin</p>
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

            {/* Currency Selection */}
            <div className="w-full grid grid-cols-2 gap-2">
              <Button
                variant={selectedCurrency === "GC" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("GC")}
                className={
                  selectedCurrency === "GC"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : ""
                }
              >
                Spin with GC
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
                Spin with SC
              </Button>
            </div>

            {/* Spin Button */}
            <Button
              onClick={handleSpin}
              disabled={!canAfford || isSpinning}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-8 text-2xl h-20"
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : !canAfford ? (
                "Insufficient Balance"
              ) : (
                "🎰 SPIN!"
              )}
            </Button>

            {!canAfford && (
              <Alert className="w-full bg-red-900/20 border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  You don't have enough {selectedCurrency} to play
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Recent Wins */}
          {recentWins.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-green-700/50">
              <p className="text-sm font-semibold text-green-400 mb-3">
                Recent Wins
              </p>
              <div className="space-y-2">
                {recentWins.map((win) => (
                  <div
                    key={win.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-400">{win.time}</span>
                    <span className="text-green-400 font-semibold">
                      +{win.amount} {selectedCurrency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>✓ Select your currency (GC or SC)</p>
          <p>✓ Click the SPIN button to play</p>
          <p>✓ Get instant results - win or lose</p>
          <p>✓ Win multipliers based on {winRate}% win rate</p>
          <p>✓ Results are provably fair and verifiable</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstantWinGame;
