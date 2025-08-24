import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrency,
  formatCurrency,
  CurrencyType,
} from "@/contexts/CurrencyContext";
import {
  Trophy,
  Clock,
  Users,
  Coins,
  Gem,
  Crown,
  Star,
  Target,
  Zap,
  Calendar,
  Timer,
  Play,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Gamepad2,
  Award,
  Sparkles,
  Spade,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  gameType: "poker" | "bingo" | "slots" | "mixed";
  type: "sit-n-go" | "scheduled" | "freeroll" | "satellite";
  status: "registering" | "starting" | "playing" | "finished" | "cancelled";
  buyIn: { gc: number; sc: number };
  prizePool: { gc: number; sc: number };
  participants: any[];
  maxPlayers: number;
  startTime?: Date;
  registrationEnd?: Date;
  structure: {
    levelDuration: number;
    startingChips?: number;
    lateRegistrationLevels: number;
  };
}

const mockTournaments: Tournament[] = [
  {
    id: "daily-freeroll",
    name: "🎁 CoinKrazy Daily Freeroll",
    gameType: "poker",
    type: "freeroll",
    status: "registering",
    buyIn: { gc: 0, sc: 0 },
    prizePool: { gc: 50000, sc: 500 },
    participants: Array(487).fill(null),
    maxPlayers: 1000,
    startTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes
    registrationEnd: new Date(Date.now() + 20 * 60 * 1000),
    structure: {
      levelDuration: 8,
      startingChips: 2000,
      lateRegistrationLevels: 3,
    },
  },
  {
    id: "turbo-sng",
    name: "⚡ Turbo Sit & Go",
    gameType: "poker",
    type: "sit-n-go",
    status: "starting",
    buyIn: { gc: 200, sc: 2 },
    prizePool: { gc: 1800, sc: 18 },
    participants: Array(8).fill(null),
    maxPlayers: 9,
    startTime: new Date(),
    structure: {
      levelDuration: 3,
      startingChips: 1000,
      lateRegistrationLevels: 0,
    },
  },
  {
    id: "weekend-warrior",
    name: "🏆 Weekend Warrior Championship",
    gameType: "poker",
    type: "scheduled",
    status: "registering",
    buyIn: { gc: 1000, sc: 10 },
    prizePool: { gc: 125000, sc: 1250 },
    participants: Array(89).fill(null),
    maxPlayers: 500,
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
    registrationEnd: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
    structure: {
      levelDuration: 12,
      startingChips: 5000,
      lateRegistrationLevels: 5,
    },
  },
  {
    id: "bingo-blast",
    name: "🎯 Bingo Blast Tournament",
    gameType: "bingo",
    type: "scheduled",
    status: "registering",
    buyIn: { gc: 500, sc: 5 },
    prizePool: { gc: 25000, sc: 250 },
    participants: Array(34).fill(null),
    maxPlayers: 100,
    startTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
    structure: {
      levelDuration: 5,
      lateRegistrationLevels: 2,
    },
  },
  {
    id: "slot-showdown",
    name: "🎰 Slots Showdown",
    gameType: "slots",
    type: "scheduled",
    status: "registering",
    buyIn: { gc: 300, sc: 3 },
    prizePool: { gc: 15000, sc: 150 },
    participants: Array(67).fill(null),
    maxPlayers: 200,
    startTime: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours
    structure: {
      levelDuration: 10,
      lateRegistrationLevels: 0,
    },
  },
  {
    id: "mixed-madness",
    name: "🎪 Mixed Game Madness",
    gameType: "mixed",
    type: "scheduled",
    status: "registering",
    buyIn: { gc: 750, sc: 7.5 },
    prizePool: { gc: 37500, sc: 375 },
    participants: Array(23).fill(null),
    maxPlayers: 150,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    structure: {
      levelDuration: 15,
      lateRegistrationLevels: 3,
    },
  },
];

export default function TournamentsPage() {
  const { user } = useAuth();
  const { canAffordWager } = useCurrency();
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "poker":
        return <Spade className="h-4 w-4" />;
      case "bingo":
        return <Target className="h-4 w-4" />;
      case "slots":
        return <Zap className="h-4 w-4" />;
      case "mixed":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Gamepad2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registering":
        return "bg-green-500";
      case "starting":
        return "bg-yellow-500";
      case "playing":
        return "bg-blue-500";
      case "finished":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "freeroll":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "sit-n-go":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "scheduled":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "satellite":
        return <Crown className="h-4 w-4 text-gold" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const formatTimeToStart = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();

    if (diff <= 0) return "Starting now";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const canRegister = (tournament: Tournament) => {
    if (!user) return false;
    if (tournament.status !== "registering") return false;
    if (tournament.participants.length >= tournament.maxPlayers) return false;

    if (tournament.buyIn.gc > 0) {
      return canAffordWager("GC" as CurrencyType, tournament.buyIn.gc);
    }
    if (tournament.buyIn.sc > 0) {
      return canAffordWager("SC" as CurrencyType, tournament.buyIn.sc);
    }

    return true;
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    if (selectedType !== "all" && tournament.type !== selectedType)
      return false;
    if (selectedGame !== "all" && tournament.gameType !== selectedGame)
      return false;
    return true;
  });

  const handleRegister = (tournament: Tournament) => {
    // Registration logic would go here
    console.log("Registering for tournament:", tournament.id);
    // TODO: Call API to register for tournament
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple/5">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display font-bold gradient-text mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-12 w-12" />
            CoinKrazy Tournaments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete against players worldwide in our premium tournament series.
            Win big prizes and climb the leaderboards!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-gold/30">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">1,247</div>
              <div className="text-sm text-muted-foreground">
                Active Players
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-purple/30">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-purple mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple">156</div>
              <div className="text-sm text-muted-foreground">Running Now</div>
            </CardContent>
          </Card>

          <Card className="glass border-teal/30">
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-teal">2.4M</div>
              <div className="text-sm text-muted-foreground">Total Prizes</div>
            </CardContent>
          </Card>

          <Card className="glass border-green/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">98.4%</div>
              <div className="text-sm text-muted-foreground">Payout Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tournament Type
                  </label>
                  <Tabs value={selectedType} onValueChange={setSelectedType}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="freeroll">Freeroll</TabsTrigger>
                      <TabsTrigger value="sit-n-go">Sit & Go</TabsTrigger>
                      <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Game Type
                  </label>
                  <Tabs value={selectedGame} onValueChange={setSelectedGame}>
                    <TabsList>
                      <TabsTrigger value="all">All Games</TabsTrigger>
                      <TabsTrigger value="poker">Poker</TabsTrigger>
                      <TabsTrigger value="bingo">Bingo</TabsTrigger>
                      <TabsTrigger value="slots">Slots</TabsTrigger>
                      <TabsTrigger value="mixed">Mixed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="glass hover:shadow-glow transition-all duration-300 border-border/50 hover:border-purple/50"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getGameIcon(tournament.gameType)}
                    <div>
                      <CardTitle className="text-lg">
                        {tournament.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeIcon(tournament.type)}
                        <span className="text-sm text-muted-foreground capitalize">
                          {tournament.type.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    className={`${getStatusColor(tournament.status)} text-white`}
                  >
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Prize Pool */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gold/10 to-purple/10 rounded-lg border border-gold/20">
                  <span className="font-medium">Prize Pool</span>
                  <div className="text-right">
                    {tournament.prizePool.gc > 0 && (
                      <div className="flex items-center gap-1 text-gold font-bold">
                        <Coins className="h-4 w-4" />
                        {formatCurrency(tournament.prizePool.gc, CurrencyType.GC)}
                      </div>
                    )}
                    {tournament.prizePool.sc > 0 && (
                      <div className="flex items-center gap-1 text-teal font-bold">
                        <Gem className="h-4 w-4" />
                        {formatCurrency(tournament.prizePool.sc, CurrencyType.SC)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy-in */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buy-in</span>
                  <div className="text-right">
                    {tournament.buyIn.gc === 0 && tournament.buyIn.sc === 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-500 border-green-500/30"
                      >
                        FREE
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        {tournament.buyIn.gc > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Coins className="h-3 w-3 text-gold" />
                            {formatCurrency(tournament.buyIn.gc, CurrencyType.GC)}
                          </div>
                        )}
                        {tournament.buyIn.sc > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Gem className="h-3 w-3 text-teal" />
                            {formatCurrency(tournament.buyIn.sc, CurrencyType.SC)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Players */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Players</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple" />
                    <span className="text-sm">
                      {tournament.participants.length}/{tournament.maxPlayers}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <Progress
                    value={
                      (tournament.participants.length / tournament.maxPlayers) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                {/* Start Time */}
                {tournament.startTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tournament.status === "registering"
                        ? "Starts in"
                        : "Started"}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-purple" />
                      {tournament.status === "registering"
                        ? formatTimeToStart(tournament.startTime)
                        : tournament.startTime.toLocaleTimeString()}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {tournament.status === "registering" ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full btn-primary"
                          disabled={!canRegister(tournament)}
                          onClick={() => setSelectedTournament(tournament)}
                        >
                          {canRegister(tournament)
                            ? "Register Now"
                            : "Cannot Register"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-gold" />
                            Tournament Registration
                          </DialogTitle>
                          <DialogDescription>
                            Register for {selectedTournament?.name}
                          </DialogDescription>
                        </DialogHeader>

                        {selectedTournament && (
                          <div className="space-y-4">
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                You are about to register for this tournament.
                                The buy-in will be deducted from your balance.
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Buy-in:
                                </span>
                                <div className="font-medium">
                                  {selectedTournament.buyIn.gc === 0 &&
                                  selectedTournament.buyIn.sc === 0
                                    ? "FREE"
                                    : `${selectedTournament.buyIn.gc > 0 ? `${formatCurrency(selectedTournament.buyIn.gc, "GC")}` : ""} ${selectedTournament.buyIn.sc > 0 ? `${formatCurrency(selectedTournament.buyIn.sc, "SC")}` : ""}`}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Starting Chips:
                                </span>
                                <div className="font-medium">
                                  {selectedTournament.structure.startingChips?.toLocaleString() ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Level Duration:
                                </span>
                                <div className="font-medium">
                                  {selectedTournament.structure.levelDuration}{" "}
                                  minutes
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Late Registration:
                                </span>
                                <div className="font-medium">
                                  {
                                    selectedTournament.structure
                                      .lateRegistrationLevels
                                  }{" "}
                                  levels
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSelectedTournament(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 btn-primary"
                                onClick={() => {
                                  handleRegister(selectedTournament);
                                  setSelectedTournament(null);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Registration
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ) : tournament.status === "starting" ? (
                    <Button className="w-full btn-gold" disabled>
                      <Timer className="mr-2 h-4 w-4" />
                      Starting Soon
                    </Button>
                  ) : tournament.status === "playing" ? (
                    <Button className="w-full btn-teal" asChild>
                      <Link to={`/tournaments/${tournament.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Live
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Tournament Finished
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new
              tournaments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
