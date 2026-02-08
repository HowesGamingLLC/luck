import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  TrendingUp,
  Users,
  Coins,
  Trophy,
  Settings,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  Zap,
  LineChart,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface GameStats {
  gameCount: number;
  activeRounds: number;
  todayEntries: number;
  pendingPayouts: number;
  todayRevenueGc: number;
  todayRevenueSc: number;
}

interface Game {
  id: string;
  name: string;
  type: "pooled_draw" | "instant_win" | "progressive_jackpot" | "scheduled_draw";
  enabled: boolean;
  entryFeeGc: number;
  entryFeeSc: number;
  maxEntriesPerUser: number;
  rtpPercentage: number;
  createdAt: string;
}

interface GameRound {
  id: string;
  gameId: string;
  status: "registering" | "live" | "drawing" | "completed" | "cancelled";
  entryCount: number;
  prizePool: number;
  drawTime: string;
  createdAt: string;
}

const AdminGamesPanel = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [activeRounds, setActiveRounds] = useState<GameRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats
      const statsRes = await fetch("/api/admin/games/dashboard");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // Fetch all games
      const gamesRes = await fetch("/api/games?limit=100");
      if (gamesRes.ok) {
        const data = await gamesRes.json();
        setGames(data.games || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGame = async (gameId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/games/${gameId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (res.ok) {
        setGames(
          games.map((g) =>
            g.id === gameId ? { ...g, enabled: !enabled } : g
          )
        );
        toast({
          title: "Success",
          description: `Game ${!enabled ? "enabled" : "disabled"}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle game",
        variant: "destructive",
      });
    }
  };

  const handlePauseRound = async (roundId: string) => {
    try {
      const res = await fetch(`/api/admin/games/rounds/${roundId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Round paused",
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause round",
        variant: "destructive",
      });
    }
  };

  const handleCancelRound = async (roundId: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/games/rounds/${roundId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Round cancelled and entries refunded",
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel round",
        variant: "destructive",
      });
    }
  };

  const handleManualDraw = async (roundId: string) => {
    try {
      const res = await fetch(`/api/admin/games/rounds/${roundId}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Draw executed successfully",
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute draw",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Zap className="h-12 w-12 text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-white">
              Jackpota Games Control Panel
            </h1>
          </div>
          <p className="text-slate-300">
            Manage games, monitor rounds, and view real-time statistics
          </p>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Games</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.gameCount}
                    </p>
                  </div>
                  <Gamepad2 className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Active Rounds</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.activeRounds}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Today Entries</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.todayEntries}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Pending Payouts</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.pendingPayouts}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Revenue (GC)</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.todayRevenueGc.toLocaleString()}
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Revenue (SC)</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.todayRevenueSc.toLocaleString()}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="games" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="games" className="data-[state=active]:bg-amber-600">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="rounds" className="data-[state=active]:bg-amber-600">
              <Play className="h-4 w-4 mr-2" />
              Active Rounds
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-amber-600">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Games</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all available games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/50">
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Entry Fee (GC)</TableHead>
                        <TableHead className="text-slate-300">Entry Fee (SC)</TableHead>
                        <TableHead className="text-slate-300">Max Entries</TableHead>
                        <TableHead className="text-slate-300">RTP</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {games.map((game) => (
                        <TableRow
                          key={game.id}
                          className="border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell className="font-medium text-white">
                            {game.name}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <Badge variant="outline">{game.type}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {game.entryFeeGc}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {game.entryFeeSc}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {game.maxEntriesPerUser}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {game.rtpPercentage}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                game.enabled ? "default" : "secondary"
                              }
                            >
                              {game.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleToggleGame(game.id, game.enabled)
                                }
                              >
                                {game.enabled ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedGameId(game.id)}
                              >
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rounds Tab */}
          <TabsContent value="rounds" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Game Rounds</CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor and manage active rounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-blue-900/20 border-blue-800">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300">
                      Active rounds are currently loading. Real-time updates will be available via WebSocket.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-700 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white">Round Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="round-select" className="text-slate-300">
                            Select Round
                          </Label>
                          <Select>
                            <SelectTrigger id="round-select" className="bg-slate-600 border-slate-500 text-white">
                              <SelectValue placeholder="Choose a round..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="round-1">Round 1 (Pooled Draw)</SelectItem>
                              <SelectItem value="round-2">Round 2 (Instant Win)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Button
                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => handlePauseRound("round-1")}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Round
                          </Button>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleManualDraw("round-1")}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Execute Draw
                          </Button>
                          <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() =>
                              handleCancelRound("round-1", "Admin cancelled")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Round
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white">Round Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-slate-300">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="outline">Registering</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Entries:</span>
                          <span className="font-semibold text-white">42</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prize Pool (GC):</span>
                          <span className="font-semibold text-yellow-400">
                            4,200
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prize Pool (SC):</span>
                          <span className="font-semibold text-purple-400">
                            2,100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Draw Time:</span>
                          <span className="font-semibold text-white">
                            08:00 PM
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Configuration</CardTitle>
                <CardDescription className="text-slate-400">
                  Update game settings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Select Game
                    </h3>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a game..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {games.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">RTP %</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="85"
                        min="0"
                        max="100"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Max Entries Per User
                    </h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="10"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Entry Fee (GC)
                    </h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="100"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Feature Toggles
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">
                        Provably Fair RNG
                      </span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">
                        Accept GC Entries
                      </span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">
                        Accept SC Entries
                      </span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">
                        Auto-Draw on Schedule
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue Analytics</CardTitle>
                <CardDescription className="text-slate-400">
                  Track revenue and player engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">
                        Daily Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Gold Coins</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {stats?.todayRevenueGc.toLocaleString() || "0"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-2">
                            Sweep Coins
                          </p>
                          <p className="text-2xl font-bold text-purple-400">
                            {stats?.todayRevenueSc.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">
                        Player Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-2">
                            Entries Today
                          </p>
                          <p className="text-2xl font-bold text-blue-400">
                            {stats?.todayEntries || "0"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-2">
                            Unique Players
                          </p>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.floor((stats?.todayEntries || 0) / 2.5)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="bg-blue-900/20 border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-200">Quick Help</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-100 space-y-2">
            <p>
              • Use the Games tab to enable/disable games and view current configuration
            </p>
            <p>
              • Monitor active rounds in the Rounds tab and take actions like pause or
              cancel
            </p>
            <p>
              • Configure game parameters (RTP, entry fees, max entries) in Configuration
            </p>
            <p>
              • View real-time analytics and revenue tracking in Analytics tab
            </p>
            <p>
              • Real-time updates for active rounds will sync via WebSocket connection
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGamesPanel;
