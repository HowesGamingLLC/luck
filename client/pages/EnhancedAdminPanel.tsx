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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllUsers } from "@/contexts/AuthContext";
import { useJackpot } from "@/contexts/JackpotContext";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Crown,
  Shield,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Gamepad2,
  Target,
  Spade,
  Dice1,
  Activity,
  Zap,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  PieChart,
  Calendar,
  Star,
  Gift,
  Flame,
} from "lucide-react";

interface GameData {
  id: string;
  name: string;
  type: "slots" | "table" | "bingo" | "poker" | "mini" | "sportsbook";
  players: number;
  revenue24h: number;
  totalPlayed: number;
  avgSessionTime: number;
  isActive: boolean;
  rtp: number;
  popularityScore: number;
}

interface GameMetrics {
  totalRevenue: number;
  totalPlayers: number;
  totalGames: number;
  averageRTP: number;
  topGame: string;
  peakHour: string;
}

export default function EnhancedAdminPanel() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const { jackpots, recentWins } = useJackpot();

  // Mock game data
  const [gameData, setGameData] = useState<GameData[]>([
    {
      id: "slots-1",
      name: "Diamond Deluxe Slots",
      type: "slots",
      players: 347,
      revenue24h: 2847.50,
      totalPlayed: 15678,
      avgSessionTime: 18.5,
      isActive: true,
      rtp: 94.2,
      popularityScore: 95,
    },
    {
      id: "blackjack-1",
      name: "Classic Blackjack",
      type: "table",
      players: 156,
      revenue24h: 1932.25,
      totalPlayed: 8934,
      avgSessionTime: 24.3,
      isActive: true,
      rtp: 99.5,
      popularityScore: 88,
    },
    {
      id: "bingo-1",
      name: "Speed Bingo",
      type: "bingo",
      players: 234,
      revenue24h: 1456.75,
      totalPlayed: 5623,
      avgSessionTime: 12.8,
      isActive: true,
      rtp: 85.0,
      popularityScore: 82,
    },
    {
      id: "poker-1",
      name: "Texas Hold'em",
      type: "poker",
      players: 89,
      revenue24h: 987.50,
      totalPlayed: 3456,
      avgSessionTime: 35.2,
      isActive: true,
      rtp: 96.5,
      popularityScore: 76,
    },
    {
      id: "crash-1",
      name: "Crash Game",
      type: "mini",
      players: 198,
      revenue24h: 1678.25,
      totalPlayed: 12456,
      avgSessionTime: 8.7,
      isActive: true,
      rtp: 99.0,
      popularityScore: 92,
    },
    {
      id: "sportsbook-1",
      name: "Parlay Betting",
      type: "sportsbook",
      players: 67,
      revenue24h: 2134.50,
      totalPlayed: 2341,
      avgSessionTime: 15.6,
      isActive: true,
      rtp: 95.5,
      popularityScore: 71,
    },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    gamesSoundEnabled: true,
    chatEnabled: true,
    bonusesEnabled: true,
    withdrawalsEnabled: true,
    maxDailyWithdrawal: 10000,
    minWithdrawalAmount: 10,
    supportEmail: "support@coinkrazy.com",
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    autoLogoutTime: 60,
  });

  const gameTypes = [
    { id: "all", name: "All Games", icon: Gamepad2 },
    { id: "slots", name: "Slots", icon: Crown },
    { id: "table", name: "Table Games", icon: Spade },
    { id: "bingo", name: "Bingo", icon: Target },
    { id: "poker", name: "Poker", icon: Dice1 },
    { id: "mini", name: "Mini Games", icon: Zap },
    { id: "sportsbook", name: "Sportsbook", icon: Activity },
  ];

  const calculateMetrics = (): GameMetrics => {
    const totalRevenue = gameData.reduce((sum, game) => sum + game.revenue24h, 0);
    const totalPlayers = gameData.reduce((sum, game) => sum + game.players, 0);
    const totalGames = gameData.filter(game => game.isActive).length;
    const averageRTP = gameData.reduce((sum, game) => sum + game.rtp, 0) / gameData.length;
    const topGame = gameData.sort((a, b) => b.revenue24h - a.revenue24h)[0]?.name || "N/A";
    
    return {
      totalRevenue,
      totalPlayers,
      totalGames,
      averageRTP,
      topGame,
      peakHour: "8:00 PM - 9:00 PM",
    };
  };

  const metrics = calculateMetrics();

  const filteredGames = gameFilter === "all" 
    ? gameData 
    : gameData.filter(game => game.type === gameFilter);

  const toggleGameStatus = (gameId: string) => {
    setGameData(prev => prev.map(game => 
      game.id === gameId ? { ...game, isActive: !game.isActive } : game
    ));
  };

  const updateGameRTP = (gameId: string, newRTP: number) => {
    setGameData(prev => prev.map(game => 
      game.id === gameId ? { ...game, rtp: newRTP } : game
    ));
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getGameTypeColor = (type: string) => {
    switch (type) {
      case "slots": return "text-purple-500 bg-purple-500/20";
      case "table": return "text-green-500 bg-green-500/20";
      case "bingo": return "text-blue-500 bg-blue-500/20";
      case "poker": return "text-red-500 bg-red-500/20";
      case "mini": return "text-pink-500 bg-pink-500/20";
      case "sportsbook": return "text-orange-500 bg-orange-500/20";
      default: return "text-gray-500 bg-gray-500/20";
    }
  };

  const getPopularityColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Enhanced Admin Panel
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Complete casino management, analytics, and game administration
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setLoading(true)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Dashboard
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        {systemSettings.maintenanceMode && (
          <Alert className="border-orange-500 bg-orange-500/5 mb-6">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              <strong>Maintenance Mode Active</strong> - New registrations and games are currently disabled.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Revenue ({selectedTimeframe})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${metrics.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Active Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {metrics.totalPlayers}
              </div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-purple-500" />
                Active Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {metrics.totalGames}
              </div>
              <p className="text-xs text-muted-foreground">Games running</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-500" />
                Avg RTP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-500">
                {metrics.averageRTP.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Return to player</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" />
                Top Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-gold truncate">
                {metrics.topGame}
              </div>
              <p className="text-xs text-muted-foreground">Highest revenue</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-orange-500">
                {metrics.peakHour}
              </div>
              <p className="text-xs text-muted-foreground">Busiest time</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="games">Game Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="players">Player Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Advanced Reports</TabsTrigger>
          </TabsList>

          {/* Game Management Tab */}
          <TabsContent value="games" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Game Management Dashboard</CardTitle>
                <CardDescription>
                  Monitor, configure, and manage all casino games in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Game Type Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="gameFilter">Filter by Game Type</Label>
                    <div className="flex gap-2 mt-2">
                      {gameTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant={gameFilter === type.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setGameFilter(type.id)}
                            className="flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            {type.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <select
                      id="timeframe"
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                      className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                    </select>
                  </div>
                </div>

                {/* Games Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>RTP</TableHead>
                        <TableHead>Popularity</TableHead>
                        <TableHead>Session Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Loading game data...
                          </TableCell>
                        </TableRow>
                      ) : filteredGames.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No games found for selected filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGames.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Badge className={getGameTypeColor(game.type)}>
                                    {game.type}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="font-medium">{game.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {game.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={game.isActive}
                                  onCheckedChange={() => toggleGameStatus(game.id)}
                                />
                                <span className={game.isActive ? "text-success" : "text-muted-foreground"}>
                                  {game.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{game.players}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-green-500 font-medium">
                                ${game.revenue24h.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedTimeframe}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={game.rtp}
                                  onChange={(e) => updateGameRTP(game.id, parseFloat(e.target.value))}
                                  min="80"
                                  max="99"
                                  step="0.1"
                                  className="w-20 h-8 text-xs"
                                />
                                <span className="text-xs">%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`text-sm font-medium ${getPopularityColor(game.popularityScore)}`}>
                                  {game.popularityScore}
                                </div>
                                <div className="w-12 bg-border rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                    style={{ width: `${game.popularityScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {game.avgSessionTime.toFixed(1)}m
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Revenue by Game Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gameTypes.slice(1).map((type) => {
                      const typeRevenue = gameData
                        .filter(game => game.type === type.id)
                        .reduce((sum, game) => sum + game.revenue24h, 0);
                      const percentage = (typeRevenue / metrics.totalRevenue) * 100;
                      
                      return (
                        <div key={type.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm capitalize">{type.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-border rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-purple"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Games Played:</span>
                      <span className="font-semibold">
                        {gameData.reduce((sum, game) => sum + game.totalPlayed, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Session Time:</span>
                      <span className="font-semibold">
                        {(gameData.reduce((sum, game) => sum + game.avgSessionTime, 0) / gameData.length).toFixed(1)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">System RTP:</span>
                      <span className="font-semibold text-teal">
                        {metrics.averageRTP.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue per Player:</span>
                      <span className="font-semibold text-green-500">
                        ${(metrics.totalRevenue / metrics.totalPlayers).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Games Online:</span>
                      <span className="font-semibold text-blue-500">
                        {gameData.filter(g => g.isActive).length}/{gameData.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Hourly Activity Heatmap
                </CardTitle>
                <CardDescription>
                  Player activity and revenue throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const activity = Math.random() * 100;
                    const intensity = activity / 100;
                    
                    return (
                      <div
                        key={hour}
                        className="aspect-square flex items-center justify-center text-xs rounded"
                        style={{
                          backgroundColor: `rgba(147, 51, 234, ${intensity})`,
                          color: intensity > 0.5 ? 'white' : 'inherit',
                        }}
                      >
                        {hour.toString().padStart(2, '0')}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>11 PM</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Disable all games and new registrations
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Registrations</p>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to create accounts
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.newRegistrations}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, newRegistrations: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Game Sound Effects</p>
                        <p className="text-sm text-muted-foreground">
                          Enable sound effects for all games
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.gamesSoundEnabled}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, gamesSoundEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Chat System</p>
                        <p className="text-sm text-muted-foreground">
                          Enable chat in multiplayer games
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.chatEnabled}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, chatEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bonuses & Promotions</p>
                        <p className="text-sm text-muted-foreground">
                          Enable daily bonuses and promotions
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.bonusesEnabled}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, bonusesEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Withdrawals</p>
                        <p className="text-sm text-muted-foreground">
                          Allow users to withdraw winnings
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.withdrawalsEnabled}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, withdrawalsEnabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Security & Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxDailyWithdrawal">Max Daily Withdrawal (SC)</Label>
                    <Input
                      id="maxDailyWithdrawal"
                      type="number"
                      value={systemSettings.maxDailyWithdrawal}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        maxDailyWithdrawal: parseInt(e.target.value) || 0
                      }))}
                      min="100"
                      max="50000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minWithdrawal">Min Withdrawal Amount (SC)</Label>
                    <Input
                      id="minWithdrawal"
                      type="number"
                      value={systemSettings.minWithdrawalAmount}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        minWithdrawalAmount: parseInt(e.target.value) || 0
                      }))}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        maxLoginAttempts: parseInt(e.target.value) || 0
                      }))}
                      min="3"
                      max="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value) || 0
                      }))}
                      min="5"
                      max="120"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={systemSettings.supportEmail}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        supportEmail: e.target.value
                      }))}
                    />
                  </div>

                  <Button className="w-full btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Server Status:</span>
                    <Badge className="bg-success text-white">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database:</span>
                    <Badge className="bg-success text-white">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Gateway:</span>
                    <Badge className="bg-success text-white">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Game Servers:</span>
                    <Badge className="bg-success text-white">6/6 Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Response:</span>
                    <Badge className="bg-success text-white">47ms</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Real-time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Players Online:</span>
                    <span className="font-semibold text-blue-500">{metrics.totalPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Games Playing:</span>
                    <span className="font-semibold">347</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bets/Minute:</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Registrations:</span>
                    <span className="font-semibold text-green-500">+23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Support Tickets:</span>
                    <span className="font-semibold text-orange-500">4 Open</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Alerts & Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                    <strong>High Activity:</strong> Crash game showing unusual popularity
                  </div>
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                    <strong>Info:</strong> Scheduled maintenance in 2 hours
                  </div>
                  <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                    <strong>Success:</strong> All systems running normally
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500" />
                  Live Game Activity Feed
                </CardTitle>
                <CardDescription>
                  Real-time stream of significant game events and wins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentWins.slice(0, 10).map((win, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-card/50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <span className="font-medium">Big Win!</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Player*** won ${win.amount.toFixed(2)} SC in {win.type}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-success text-white">
                        {win.amount > 50 ? "MEGA" : "BIG"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Management Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Player Management Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive player oversight and management tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Player Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced player management tools including KYC verification, 
                    responsible gaming limits, and player behavior analytics.
                  </p>
                  <Button variant="outline">
                    Go to Player Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Advanced Reporting Suite</CardTitle>
                <CardDescription>
                  Generate comprehensive reports for compliance, analytics, and business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <BarChart3 className="h-8 w-8" />
                    <span className="font-medium">Revenue Analytics</span>
                    <span className="text-xs text-muted-foreground">
                      Detailed revenue breakdown by game, time, and player segments
                    </span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Users className="h-8 w-8" />
                    <span className="font-medium">Player Behavior</span>
                    <span className="text-xs text-muted-foreground">
                      Player activity patterns, retention, and engagement metrics
                    </span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Shield className="h-8 w-8" />
                    <span className="font-medium">Compliance Report</span>
                    <span className="text-xs text-muted-foreground">
                      KYC status, responsible gaming, and regulatory compliance
                    </span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Gamepad2 className="h-8 w-8" />
                    <span className="font-medium">Game Performance</span>
                    <span className="text-xs text-muted-foreground">
                      Individual game analytics, RTP tracking, and optimization
                    </span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <TrendingUp className="h-8 w-8" />
                    <span className="font-medium">Financial Summary</span>
                    <span className="text-xs text-muted-foreground">
                      P&L statements, cash flow, and financial performance
                    </span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    <span className="font-medium">Risk Assessment</span>
                    <span className="text-xs text-muted-foreground">
                      Player risk analysis, fraud detection, and security alerts
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
