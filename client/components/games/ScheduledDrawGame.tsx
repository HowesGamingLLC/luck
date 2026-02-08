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
  Clock,
  Play,
  Users,
  Coins,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Zap,
} from "lucide-react";

interface ScheduledDrawGameProps {
  gameId: string;
  gameName: string;
  entryFeeGc: number;
  entryFeeSc: number;
  drawTime: string;
  scheduleType: "hourly" | "daily" | "weekly";
  entryCount: number;
  prizePoolGc: number;
  prizePoolSc: number;
  userBalance: { gc: number; sc: number };
  onEntrySubmitted?: () => void;
}

const ScheduledDrawGame = ({
  gameId,
  gameName,
  entryFeeGc,
  entryFeeSc,
  drawTime,
  scheduleType,
  entryCount,
  prizePoolGc,
  prizePoolSc,
  userBalance,
  onEntrySubmitted,
}: ScheduledDrawGameProps) => {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [userEntries, setUserEntries] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const draw = new Date(drawTime);
      const diff = draw.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Draw in progress...");
        setCountdown(0);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(seconds);
        setTimeRemaining(
          scheduleType === "hourly"
            ? `${minutes}m ${seconds}s`
            : `${hours}h ${minutes}m ${seconds}s`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [drawTime, scheduleType]);

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
          description: "Entry submitted successfully!",
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

  const scheduleLabel = {
    hourly: "Every Hour",
    daily: "Every Day",
    weekly: "Every Week",
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Game Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800">
        <CardHeader className="border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-500" />
                {gameName}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Scheduled Draw - {scheduleLabel[scheduleType]}
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-blue-600">
              ⏰ Scheduled
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Big Countdown Timer */}
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-8 border-2 border-blue-600 text-center">
            <p className="text-sm text-blue-300 font-semibold mb-3">
              NEXT DRAW IN
            </p>
            <div className="text-6xl font-black text-blue-400 font-mono tracking-wider animate-pulse">
              {timeRemaining}
            </div>
            <p className="text-sm text-blue-200 mt-4">
              {new Date(drawTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Clock className="h-5 w-5 mx-auto mb-2 text-blue-400" />
              <p className="text-xs text-slate-400 mb-1">Frequency</p>
              <p className="font-semibold text-white capitalize">
                {scheduleType}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Users className="h-5 w-5 mx-auto mb-2 text-cyan-400" />
              <p className="text-xs text-slate-400 mb-1">Entries</p>
              <p className="font-semibold text-white">
                {entryCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-xs text-slate-400 mb-1">Your Entries</p>
              <p className="font-semibold text-white">{userEntries}</p>
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

          {/* How It Works */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">
              How It Works
            </h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• Entries are accepted until the scheduled draw time</p>
              <p>• Draw happens automatically at the scheduled time</p>
              <p>• Winners are selected using provably-fair RNG</p>
              <p>• Prizes are distributed immediately after the draw</p>
              <p>• Live countdown ensures transparency</p>
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
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg"
            >
              {isSubmitting && (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              )}
              {!canAfford
                ? "Insufficient Balance"
                : `Buy Entry (${selectedCurrency === "GC" ? entryFeeGc + " GC" : entryFeeSc + " SC"})`}
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

          {/* Draw Status */}
          <Alert className="bg-cyan-900/20 border-cyan-800">
            <Play className="h-4 w-4 text-cyan-400" />
            <AlertDescription className="text-cyan-300">
              Get in before the draw! Watch the countdown for the exact draw
              time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upcoming Draws */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Upcoming Draws
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => {
              const nextDraw = new Date(drawTime);
              if (scheduleType === "hourly") {
                nextDraw.setHours(nextDraw.getHours() + i);
              } else if (scheduleType === "daily") {
                nextDraw.setDate(nextDraw.getDate() + i);
              } else {
                nextDraw.setDate(nextDraw.getDate() + i * 7);
              }
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    {i === 0 ? (
                      <Badge className="bg-green-600">NOW</Badge>
                    ) : (
                      <Badge variant="outline">+{i}</Badge>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {nextDraw.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {nextDraw.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledDrawGame;
