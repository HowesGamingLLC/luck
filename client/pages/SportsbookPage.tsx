import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import {
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Trophy,
  Gem,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Calculator,
  Zap,
  Star,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  homeSpread: number;
  awaySpread: number;
  overUnder: number;
  homeOdds: number;
  awayOdds: number;
  overOdds: number;
  underOdds: number;
  status: "upcoming" | "live" | "finished";
  homeScore?: number;
  awayScore?: number;
}

interface BetSelection {
  gameId: string;
  game: Game;
  type: "spread" | "overunder" | "moneyline";
  selection: string;
  odds: number;
  value: number; // spread value or total
}

interface ParlayTicket {
  id: string;
  selections: BetSelection[];
  wager: number;
  potentialPayout: number;
  odds: number;
  status: "pending" | "won" | "lost";
  createdAt: Date;
}

export default function SportsbookPage() {
  const { user, canAffordWager, updateBalance } = useCurrency();
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [betSelections, setBetSelections] = useState<BetSelection[]>([]);
  const [wagerAmount, setWagerAmount] = useState<number>(0.25);
  const [parlayTickets, setParlayTickets] = useState<ParlayTicket[]>([]);

  const sports = [
    { id: "all", name: "All Sports", icon: Activity },
    { id: "nfl", name: "NFL", icon: Target },
    { id: "nba", name: "NBA", icon: Target },
    { id: "mlb", name: "MLB", icon: Target },
    { id: "nhl", name: "NHL", icon: Target },
  ];

  const liveGames: Game[] = [
    {
      id: "game-1",
      sport: "nfl",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      homeSpread: -3.5,
      awaySpread: 3.5,
      overUnder: 47.5,
      homeOdds: -180,
      awayOdds: 150,
      overOdds: -110,
      underOdds: -110,
      status: "upcoming",
    },
    {
      id: "game-2",
      sport: "nba",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      homeSpread: -2.5,
      awaySpread: 2.5,
      overUnder: 218.5,
      homeOdds: -130,
      awayOdds: 110,
      overOdds: -105,
      underOdds: -115,
      status: "upcoming",
    },
    {
      id: "game-3",
      sport: "mlb",
      homeTeam: "New York Yankees",
      awayTeam: "Boston Red Sox",
      gameTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      homeSpread: -1.5,
      awaySpread: 1.5,
      overUnder: 9.5,
      homeOdds: -140,
      awayOdds: 120,
      overOdds: -110,
      underOdds: -110,
      status: "upcoming",
    },
    {
      id: "game-4",
      sport: "nhl",
      homeTeam: "Vegas Golden Knights",
      awayTeam: "Colorado Avalanche",
      gameTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      homeSpread: -0.5,
      awaySpread: 0.5,
      overUnder: 6.5,
      homeOdds: -110,
      awayOdds: -110,
      overOdds: -105,
      underOdds: -115,
      status: "upcoming",
    },
    {
      id: "game-5",
      sport: "nfl",
      homeTeam: "Dallas Cowboys",
      awayTeam: "Philadelphia Eagles",
      gameTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      homeSpread: -1.0,
      awaySpread: 1.0,
      overUnder: 42.5,
      homeOdds: -105,
      awayOdds: -115,
      overOdds: -110,
      underOdds: -110,
      status: "upcoming",
    },
  ];

  const recentTickets: ParlayTicket[] = [
    {
      id: "ticket-1",
      selections: [
        {
          gameId: "game-1",
          game: liveGames[0],
          type: "spread",
          selection: "Buffalo Bills +3.5",
          odds: -110,
          value: 3.5,
        },
        {
          gameId: "game-2",
          game: liveGames[1],
          type: "overunder",
          selection: "Over 218.5",
          odds: -105,
          value: 218.5,
        },
        {
          gameId: "game-3",
          game: liveGames[2],
          type: "moneyline",
          selection: "Boston Red Sox",
          odds: 120,
          value: 0,
        },
      ],
      wager: 1.0,
      potentialPayout: 7.5,
      odds: 650,
      status: "pending",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ];

  const filteredGames =
    selectedSport === "all"
      ? liveGames
      : liveGames.filter((game) => game.sport === selectedSport);

  const addBetSelection = (
    game: Game,
    type: "spread" | "overunder" | "moneyline",
    selection: string,
    odds: number,
    value: number,
  ) => {
    // Check if already selected
    const existingIndex = betSelections.findIndex(
      (bet) => bet.gameId === game.id && bet.type === type,
    );

    if (existingIndex >= 0) {
      // Update existing selection
      setBetSelections((prev) =>
        prev.map((bet, index) =>
          index === existingIndex
            ? { gameId: game.id, game, type, selection, odds, value }
            : bet,
        ),
      );
    } else {
      // Add new selection (max 5)
      if (betSelections.length < 5) {
        setBetSelections((prev) => [
          ...prev,
          { gameId: game.id, game, type, selection, odds, value },
        ]);
      }
    }
  };

  const removeBetSelection = (index: number) => {
    setBetSelections((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateParlayOdds = (selections: BetSelection[]): number => {
    if (selections.length === 0) return 0;

    let totalOdds = 1;
    selections.forEach((selection) => {
      const decimal =
        selection.odds > 0
          ? selection.odds / 100 + 1
          : 100 / Math.abs(selection.odds) + 1;
      totalOdds *= decimal;
    });

    return Math.round((totalOdds - 1) * 100);
  };

  const calculatePayout = (wager: number, odds: number): number => {
    return wager * (odds / 100 + 1);
  };

  const placeParlayBet = () => {
    if (betSelections.length < 3) {
      alert("Parlay must have at least 3 selections");
      return;
    }

    if (!canAffordWager(CurrencyType.SC, wagerAmount)) {
      alert("Insufficient Sweep Coins balance");
      return;
    }

    const parlayOdds = calculateParlayOdds(betSelections);
    const potentialPayout = calculatePayout(wagerAmount, parlayOdds);

    const newTicket: ParlayTicket = {
      id: `ticket-${Date.now()}`,
      selections: [...betSelections],
      wager: wagerAmount,
      potentialPayout,
      odds: parlayOdds,
      status: "pending",
      createdAt: new Date(),
    };

    setParlayTickets((prev) => [newTicket, ...prev]);
    updateBalance(
      CurrencyType.SC,
      -wagerAmount,
      `Parlay bet: ${betSelections.length} picks`,
      "wager",
    );
    setBetSelections([]);
    setWagerAmount(0.25);
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getGameTime = (gameTime: Date): string => {
    const now = new Date();
    const diff = gameTime.getTime() - now.getTime();

    if (diff < 0) return "Live";
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000)
      return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
  };

  const isSelectionActive = (
    gameId: string,
    type: string,
    selection: string,
  ): boolean => {
    return betSelections.some(
      (bet) =>
        bet.gameId === gameId &&
        bet.type === type &&
        bet.selection === selection,
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Sportsbook & Parlay
            </h1>
            <p className="text-muted-foreground">
              Pick 3, 4, or 5 wins with spreads and over/under bets • SC Only
            </p>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Gem className="h-6 w-6 mx-auto mb-2 text-teal" />
              <div className="text-sm text-muted-foreground">Sweep Coins</div>
              <div className="font-bold text-teal">
                {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-success" />
              <div className="text-sm text-muted-foreground">Tickets Won</div>
              <div className="font-bold text-success">
                {parlayTickets.filter((t) => t.status === "won").length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="font-bold text-purple">
                {parlayTickets.length > 0
                  ? Math.round(
                      (parlayTickets.filter((t) => t.status === "won").length /
                        parlayTickets.length) *
                        100,
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Calculator className="h-6 w-6 mx-auto mb-2 text-gold" />
              <div className="text-sm text-muted-foreground">Total Wagered</div>
              <div className="font-bold text-gold">
                {parlayTickets
                  .reduce((sum, ticket) => sum + ticket.wager, 0)
                  .toFixed(2)}{" "}
                SC
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sports Filter */}
          <div className="lg:col-span-1">
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Sports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sports.map((sport) => {
                  const Icon = sport.icon;
                  return (
                    <Button
                      key={sport.id}
                      variant={
                        selectedSport === sport.id ? "default" : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => setSelectedSport(sport.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {sport.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Bet Slip */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple" />
                    Bet Slip
                  </span>
                  <Badge variant="outline">
                    {betSelections.length}/5 picks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {betSelections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add 3-5 picks to create a parlay
                  </p>
                ) : (
                  <>
                    {/* Selections */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {betSelections.map((selection, index) => (
                        <div
                          key={index}
                          className="p-2 bg-card/50 rounded text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {selection.game.awayTeam} @{" "}
                              {selection.game.homeTeam}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBetSelection(index)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-muted-foreground">
                            {selection.selection} ({formatOdds(selection.odds)})
                          </div>
                        </div>
                      ))}
                    </div>

                    {betSelections.length >= 3 && (
                      <>
                        {/* Wager Amount */}
                        <div>
                          <Label htmlFor="wager">Wager Amount (SC)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setWagerAmount(
                                  Math.max(0.25, wagerAmount - 0.25),
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              id="wager"
                              type="number"
                              value={wagerAmount}
                              onChange={(e) =>
                                setWagerAmount(parseFloat(e.target.value) || 0)
                              }
                              step="0.25"
                              min="0.25"
                              max="25.00"
                              className="text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setWagerAmount(Math.min(25, wagerAmount + 0.25))
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Odds & Payout */}
                        <div className="p-3 bg-purple/10 border border-purple/20 rounded">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Parlay Odds:</span>
                            <span className="font-bold">
                              +{calculateParlayOdds(betSelections)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Potential Payout:</span>
                            <span className="font-bold text-success">
                              {calculatePayout(
                                wagerAmount,
                                calculateParlayOdds(betSelections),
                              ).toFixed(2)}{" "}
                              SC
                            </span>
                          </div>
                        </div>

                        {/* Place Bet Button */}
                        <Button
                          className="w-full btn-primary"
                          onClick={placeParlayBet}
                          disabled={
                            !user ||
                            !canAffordWager(CurrencyType.SC, wagerAmount)
                          }
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Place Parlay Bet
                        </Button>
                      </>
                    )}

                    {betSelections.length < 3 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">
                            Need {3 - betSelections.length} more picks
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="games" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="games">Live Games</TabsTrigger>
                <TabsTrigger value="tickets">
                  My Tickets ({parlayTickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="games">
                <div className="space-y-4">
                  {filteredGames.map((game) => (
                    <Card key={game.id} className="glass">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {game.awayTeam} @ {game.homeTeam}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {game.sport.toUpperCase()}
                              </Badge>
                              <Clock className="h-3 w-3" />
                              {getGameTime(game.gameTime)}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              game.status === "live"
                                ? "bg-red-500 text-white"
                                : game.status === "upcoming"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-500 text-white"
                            }
                          >
                            {game.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Spread */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Point Spread
                            </Label>
                            <div className="space-y-2">
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "spread",
                                    `${game.awayTeam} ${game.awaySpread > 0 ? "+" : ""}${game.awaySpread}`,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "spread",
                                    `${game.awayTeam} ${game.awaySpread > 0 ? "+" : ""}${game.awaySpread}`,
                                    -110,
                                    game.awaySpread,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>{game.awayTeam.split(" ").pop()}</span>
                                  <span>
                                    {game.awaySpread > 0 ? "+" : ""}
                                    {game.awaySpread}
                                  </span>
                                  <span>-110</span>
                                </div>
                              </Button>
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "spread",
                                    `${game.homeTeam} ${game.homeSpread > 0 ? "+" : ""}${game.homeSpread}`,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "spread",
                                    `${game.homeTeam} ${game.homeSpread > 0 ? "+" : ""}${game.homeSpread}`,
                                    -110,
                                    game.homeSpread,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>{game.homeTeam.split(" ").pop()}</span>
                                  <span>
                                    {game.homeSpread > 0 ? "+" : ""}
                                    {game.homeSpread}
                                  </span>
                                  <span>-110</span>
                                </div>
                              </Button>
                            </div>
                          </div>

                          {/* Over/Under */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Total Points
                            </Label>
                            <div className="space-y-2">
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "overunder",
                                    `Over ${game.overUnder}`,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "overunder",
                                    `Over ${game.overUnder}`,
                                    game.overOdds,
                                    game.overUnder,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>Over</span>
                                  <span>{game.overUnder}</span>
                                  <span>{formatOdds(game.overOdds)}</span>
                                </div>
                              </Button>
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "overunder",
                                    `Under ${game.overUnder}`,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "overunder",
                                    `Under ${game.overUnder}`,
                                    game.underOdds,
                                    game.overUnder,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>Under</span>
                                  <span>{game.overUnder}</span>
                                  <span>{formatOdds(game.underOdds)}</span>
                                </div>
                              </Button>
                            </div>
                          </div>

                          {/* Moneyline */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Moneyline
                            </Label>
                            <div className="space-y-2">
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "moneyline",
                                    game.awayTeam,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "moneyline",
                                    game.awayTeam,
                                    game.awayOdds,
                                    0,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>{game.awayTeam.split(" ").pop()}</span>
                                  <span>{formatOdds(game.awayOdds)}</span>
                                </div>
                              </Button>
                              <Button
                                variant={
                                  isSelectionActive(
                                    game.id,
                                    "moneyline",
                                    game.homeTeam,
                                  )
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  addBetSelection(
                                    game,
                                    "moneyline",
                                    game.homeTeam,
                                    game.homeOdds,
                                    0,
                                  )
                                }
                              >
                                <div className="flex justify-between w-full">
                                  <span>{game.homeTeam.split(" ").pop()}</span>
                                  <span>{formatOdds(game.homeOdds)}</span>
                                </div>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tickets">
                <div className="space-y-4">
                  {parlayTickets.length === 0 ? (
                    <Card className="glass">
                      <CardContent className="p-8 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Parlay Tickets
                        </h3>
                        <p className="text-muted-foreground">
                          Place your first parlay bet by selecting 3-5 games
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    parlayTickets.map((ticket) => (
                      <Card key={ticket.id} className="glass">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              {ticket.selections.length}-Pick Parlay
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  ticket.status === "won"
                                    ? "bg-success text-white"
                                    : ticket.status === "lost"
                                      ? "bg-destructive text-white"
                                      : "bg-yellow-500 text-black"
                                }
                              >
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {ticket.createdAt.toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Selections */}
                            <div className="space-y-1">
                              {ticket.selections.map((selection, index) => (
                                <div
                                  key={index}
                                  className="text-xs p-2 bg-card/50 rounded"
                                >
                                  <div className="flex justify-between">
                                    <span>
                                      {selection.game.awayTeam} @{" "}
                                      {selection.game.homeTeam}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {formatOdds(selection.odds)}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {selection.selection}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Ticket Summary */}
                            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">
                                  Wager
                                </div>
                                <div className="font-semibold">
                                  {ticket.wager.toFixed(2)} SC
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">
                                  Odds
                                </div>
                                <div className="font-semibold">
                                  +{ticket.odds}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">
                                  Payout
                                </div>
                                <div className="font-semibold text-success">
                                  {ticket.potentialPayout.toFixed(2)} SC
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Parlay Guide */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  Parlay Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="font-medium text-blue-400 mb-1">
                    How to Play
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Pick 3, 4, or 5 games. All picks must win for the parlay to
                    pay out.
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="font-medium text-green-400 mb-1">
                    Higher Risk, Higher Reward
                  </div>
                  <p className="text-muted-foreground text-xs">
                    More picks = bigger payouts but lower chance of winning.
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                  <div className="font-medium text-purple-400 mb-1">
                    SC Only
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Sportsbook bets use Sweep Coins only. Minimum bet: 0.25 SC
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payout Table */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-teal" />
                  Typical Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>3-Pick Parlay:</span>
                    <span className="font-semibold">~6:1 odds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4-Pick Parlay:</span>
                    <span className="font-semibold">~12:1 odds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5-Pick Parlay:</span>
                    <span className="font-semibold">~25:1 odds</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-xs text-muted-foreground">
                    *Actual odds vary based on individual game lines
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Recent Big Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Parlay_King***</span>
                    <span className="text-success font-semibold">
                      +47.50 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    5-Pick Parlay • 2h ago
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Sports_Pro***</span>
                    <span className="text-success font-semibold">
                      +23.75 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    4-Pick Parlay • 5h ago
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Lucky_Bet***</span>
                    <span className="text-success font-semibold">
                      +12.50 SC
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    3-Pick Parlay • 1d ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
