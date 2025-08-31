import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Crown, Star, TrendingUp, Zap, Target, Gift, Search, Medal, Coins, Users, Calendar, Clock, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  rank: number;
  value: number; // total GC wins in period
}

type Period = "daily" | "weekly";

const gcPrizes = {
  daily: [
    { rank: 1, prize: "50,000 GC", icon: Crown, color: "text-gold" },
    { rank: 2, prize: "30,000 GC", icon: Medal, color: "text-gray-400" },
    { rank: 3, prize: "20,000 GC", icon: Medal, color: "text-amber-600" },
    { rank: "4-10", prize: "5,000 GC", icon: Gift, color: "text-purple" },
  ],
  weekly: [
    { rank: 1, prize: "200,000 GC", icon: Crown, color: "text-gold" },
    { rank: 2, prize: "100,000 GC", icon: Medal, color: "text-gray-400" },
    { rank: 3, prize: "50,000 GC", icon: Medal, color: "text-amber-600" },
    { rank: "4-25", prize: "10,000 GC", icon: Gift, color: "text-purple" },
  ],
};

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily");
  const [selectedCategory, setSelectedCategory] = useState("biggestWinners");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/leaderboard?period=${encodeURIComponent(selectedPeriod)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to load leaderboard");
        setEntries((data.entries || []) as LeaderboardEntry[]);
      } catch (e: any) {
        setError(e?.message || String(e));
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    if (selectedCategory === "biggestWinners") load();
    else {
      // Unsupported categories for now
      setEntries([]);
    }
  }, [selectedPeriod, selectedCategory]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (entries || []).filter((p) => (q ? p.name.toLowerCase().includes(q) : true));
  }, [entries, searchQuery]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-gold" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getValueLabel = () => {
    if (selectedCategory === "biggestWinners") return "GC";
    if (selectedCategory === "mostSpins") return "";
    if (selectedCategory === "highestWinRate") return "%";
    return "";
  };

  const getCategoryIcon = () => {
    switch (selectedCategory) {
      case "biggestWinners":
        return <Coins className="h-5 w-5" />;
      case "mostSpins":
        return <Zap className="h-5 w-5" />;
      case "highestWinRate":
        return <Target className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const currentUserName = user?.email || "You";

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">Leaderboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Climb the ranks with Gold Coins. Weekly top 3 also receive Sweep Coin bonuses every Monday (1st +10 SC, 2nd +5 SC, 3rd +5 SC).
          </p>
        </div>

        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Daily
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Weekly
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biggestWinners">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Biggest Winners (GC)
                      </div>
                    </SelectItem>
                    <SelectItem value="mostSpins">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Most Spins (coming soon)
                      </div>
                    </SelectItem>
                    <SelectItem value="highestWinRate">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Highest Win Rate (coming soon)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[250px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon()}
                  {selectedCategory === "biggestWinners" && "Biggest Winners"}
                  {selectedCategory === "mostSpins" && "Most Spins"}
                  {selectedCategory === "highestWinRate" && "Highest Win Rate"}
                  <Badge variant="outline" className="ml-auto">
                    {selectedPeriod === "daily" ? "Today" : "This Week"}
                  </Badge>
                </CardTitle>
                <CardDescription>Top players competing for GC prizes</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-sm text-destructive mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {error}
                  </div>
                )}
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((player) => (
                      <div
                        key={player.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                          user && player.user_id === user.id
                            ? "bg-gradient-to-r from-purple/20 to-gold/20 border border-purple/50"
                            : "bg-card/50 hover:bg-card/80"
                        } ${player.rank <= 3 ? "border border-gold/30" : ""}`}
                      >
                        <div className="w-12 flex justify-center">{getRankIcon(player.rank)}</div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={undefined} alt={player.name} />
                          <AvatarFallback>
                            {player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{player.name}</span>
                            {user && player.user_id === user.id && (
                              <Badge className="bg-teal text-white text-xs">You</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {player.value.toLocaleString()} {getValueLabel()}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Wins</div>
                        </div>
                      </div>
                    ))}
                    {!filtered.length && (
                      <div className="text-sm text-muted-foreground">No entries yet.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-gold" />
                  {selectedPeriod === "daily" ? "Daily" : "Weekly"} Prizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gcPrizes[selectedPeriod].map((prize, idx) => {
                  const Icon = prize.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${prize.color}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Rank {prize.rank}</div>
                        <div className={`text-sm ${prize.color}`}>{prize.prize}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="text-xs text-muted-foreground pt-2">
                  Weekly top 3 also receive SC bonuses every Monday: 1st +10 SC, 2nd +5 SC, 3rd +5 SC.
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple" />
                  Competition Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>Rankings are based on total Gold Coin wins for the selected period.</div>
                <div>Bonuses are credited automatically to winners.</div>
              </CardContent>
            </Card>

            {user && (
              <Card className="glass border-purple/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold" />
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      #{entries.find((p) => p.user_id === user.id)?.rank ?? "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Total Wins</p>
                    <Button className="btn-primary w-full">View Full Profile</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
