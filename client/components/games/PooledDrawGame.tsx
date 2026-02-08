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
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Clock,
  Users,
  Coins,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface PooledDrawGameProps {
  gameId: string;
  gameName: string;
  entryFeeGc: number;
  entryFeeSc: number;
  maxEntries: number;
  roundId: string;
  drawTime: string;
  status: "registering" | "live" | "drawing" | "completed" | "cancelled";
  entryCount: number;
  prizePoolGc: number;
  prizePoolSc: number;
  userBalance: { gc: number; sc: number };
  onEntrySubmitted?: () => void;
}

const PooledDrawGame = ({
  gameId,
  gameName,
  entryFeeGc,
  entryFeeSc,
  maxEntries,
  roundId,
  drawTime,
  status,
  entryCount,
  prizePoolGc,
  prizePoolSc,
  userBalance,
  onEntrySubmitted,
}: PooledDrawGameProps) => {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [userEntryCount, setUserEntryCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const draw = new Date(drawTime);
      const diff = draw.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Draw in progress...");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [drawTime]);

  const handleSubmitEntry = async () => {
    try {
      setIsSubmitting(true);

      // Generate client seed
      const clientSeed = Math.random().toString(36).substring(2, 15);

      const res = await fetch("/api/games/entries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          roundId,
          clientSeed,
          currencyType: selectedCurrency,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Entry submitted successfully!",
        });
        setUserEntryCount(userEntryCount + 1);
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
  const canEnter =
    status === "registering" && canAfford && userEntryCount < maxEntries;

  return (
    <div className="w-full space-y-4">
      {/* Main Game Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-800">
        <CardHeader className="border-b border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                {gameName}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Pooled Draw - Win from accumulated prize pool
              </CardDescription>
            </div>
            <Badge
              variant={status === "registering" ? "default" : "secondary"}
              className="text-lg py-2"
            >
              {status === "registering" && "🟢 Accepting Entries"}
              {status === "live" && "🟡 Registration Closed"}
              {status === "drawing" && "⏳ Drawing..."}
              {status === "completed" && "✅ Completed"}
              {status === "cancelled" && "❌ Cancelled"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Status Alert */}
          {status !== "registering" && (
            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                This round is no longer accepting entries.{" "}
                {status === "completed" && "Winners have been drawn."}
                {status === "cancelled" && "This round has been cancelled."}
              </AlertDescription>
            </Alert>
          )}

          {/* Countdown Timer */}
          <div className="bg-slate-700/50 rounded-lg p-6 border border-amber-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-amber-500" />
                <span className="text-slate-300">Time to Draw</span>
              </div>
              <span className="text-3xl font-bold text-amber-400 font-mono">
                {timeRemaining}
              </span>
            </div>
          </div>

          {/* Prize Pool */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-slate-300">Prize Pool (GC)</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {prizePoolGc.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-slate-300">Prize Pool (SC)</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {prizePoolSc.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Entry Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-slate-300 mb-1">Active Entries</p>
              <p className="text-2xl font-bold text-white">{entryCount}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm text-slate-300 mb-1">Your Entries</p>
              <p className="text-2xl font-bold text-white">{userEntryCount}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-2 text-amber-400" />
              <p className="text-sm text-slate-300 mb-1">Max per Player</p>
              <p className="text-2xl font-bold text-white">{maxEntries}</p>
            </div>
          </div>

          {/* Entry Cost */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-400 mb-3">Entry Cost</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Gold Coins (GC)</p>
                <p className="text-lg font-semibold text-yellow-400">
                  {entryFeeGc}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Sweep Coins (SC)</p>
                <p className="text-lg font-semibold text-purple-400">
                  {entryFeeSc}
                </p>
              </div>
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

          {/* Currency Selection and Submit */}
          {status === "registering" && (
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
                disabled={!canEnter || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-lg"
              >
                {isSubmitting && (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                )}
                {!canEnter && userEntryCount >= maxEntries
                  ? "Max Entries Reached"
                  : !canAfford
                    ? "Insufficient Balance"
                    : status !== "registering"
                      ? "Registration Closed"
                      : `Submit Entry (${selectedCurrency === "GC" ? entryFeeGc + " GC" : entryFeeSc + " SC"})`}
              </Button>

              {userEntryCount >= maxEntries && (
                <Alert className="bg-blue-900/20 border-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    You've reached the maximum number of entries for this round.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {status !== "registering" && (
            <Alert className="bg-slate-700/50 border-slate-600">
              <AlertTriangle className="h-4 w-4 text-slate-400" />
              <AlertDescription className="text-slate-300">
                Entries are no longer being accepted for this round.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>✓ Submit your entry with GC or SC before the draw time</p>
          <p>✓ All entries contribute to the shared prize pool</p>
          <p>✓ Winners are selected randomly using provably-fair RNG</p>
          <p>✓ Prizes are distributed automatically after the draw</p>
          <p>✓ Each player can submit up to {maxEntries} entries per round</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PooledDrawGame;
