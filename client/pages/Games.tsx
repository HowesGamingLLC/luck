import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Gamepad2,
  Coins,
  Gem,
  Spade,
  Crown,
  Dice1,
  Users,
  Zap,
  Trophy,
  Star,
  Target,
  Play,
  TrendingUp,
  Clock,
  Gift,
  Flame,
  ChevronRight,
  Activity,
  BarChart3,
} from "lucide-react";

interface GameCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  playerCount: number;
  minBet: string;
  maxWin: string;
  currency: "GC" | "SC" | "Both";
  isNew?: boolean;
  isHot?: boolean;
  isComingSoon?: boolean;
  route: string;
}

export default function Games() {
  const navigate = useNavigate();
  const { user } = useCurrency();
  const { isAuthenticated } = useAuth();

  const gameCategories: GameCategory[] = [
    {
      id: "slots",
      name: "Slot Machines",
      description: "Classic and modern slot games with progressive jackpots",
      icon: Crown,
      color: "text-purple-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      playerCount: 1247,
      minBet: "1 GC",
      maxWin: "10 SC",
      currency: "Both",
      isHot: true,
      route: "/games/slots",
    },
    {
      id: "table-games",
      name: "Table Games",
      description: "Blackjack, Roulette, Baccarat and more classic casino games",
      icon: Spade,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 to-teal-500/20",
      playerCount: 892,
      minBet: "5 GC",
      maxWin: "25 SC",
      currency: "Both",
      route: "/games/table",
    },
    {
      id: "bingo",
      name: "Bingo Rooms",
      description: "Join live bingo rooms with other players for big prizes",
      icon: Target,
      color: "text-blue-400",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      playerCount: 534,
      minBet: "2 GC",
      maxWin: "15 SC",
      currency: "Both",
      route: "/games/bingo",
    },
    {
      id: "poker",
      name: "Poker Tables",
      description: "Texas Hold'em, Omaha, and tournament poker games",
      icon: Dice1,
      color: "text-amber-400",
      bgGradient: "from-amber-500/20 to-orange-500/20",
      playerCount: 678,
      minBet: "10 GC",
      maxWin: "50 SC",
      currency: "Both",
      route: "/games/poker",
    },
    {
      id: "mini-games",
      name: "Mini Games",
      description: "Quick and fun arcade-style games for instant wins",
      icon: Gamepad2,
      color: "text-pink-400",
      bgGradient: "from-pink-500/20 to-rose-500/20",
      playerCount: 423,
      minBet: "1 GC",
      maxWin: "5 SC",
      currency: "Both",
      isNew: true,
      route: "/games/mini",
    },
    {
      id: "sportsbook",
      name: "Parlay Picks",
      description: "Pick 3, 4, or 5 wins with spreads and over/under bets",
      icon: Activity,
      color: "text-green-400",
      bgGradient: "from-green-500/20 to-lime-500/20",
      playerCount: 234,
      minBet: "0.25 SC",
      maxWin: "100 SC",
      currency: "SC",
      isNew: true,
      route: "/games/sportsbook",
    },
  ];

  const dailyStats = [
    {
      label: "Your Balance",
      value: `${user?.balance.goldCoins.toLocaleString() || 0} GC`,
      subValue: `${user?.balance.sweepCoins.toFixed(2) || 0} SC`,
      icon: Coins,
      color: "text-gold",
    },
    {
      label: "Today's Wins",
      value: "247 GC",
      subValue: "1.25 SC",
      icon: Trophy,
      color: "text-success",
    },
    {
      label: "Active Players",
      value: "4,008",
      subValue: "Online now",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Total Jackpots",
      value: "125.75 SC",
      subValue: "All games",
      icon: Star,
      color: "text-purple-400",
    },
  ];

  const recentWinners = [
    { name: "Lucky_Player***", game: "Mega Slots", amount: "12.50 SC", time: "2m ago" },
    { name: "Bingo_King***", game: "Power Bingo", amount: "8.75 SC", time: "5m ago" },
    { name: "Card_Master***", game: "Blackjack", amount: "15.00 SC", time: "8m ago" },
    { name: "Slot_Queen***", game: "Diamond Rush", amount: "6.25 SC", time: "12m ago" },
  ];

  const handleGameSelect = (category: GameCategory) => {
    if (category.isComingSoon) {
      return;
    }
    
    if (!isAuthenticated) {
      // Redirect to login for unauthenticated users
      navigate('/login');
      return;
    }
    
    navigate(category.route);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-4">
            Casino Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our exciting collection of casino games. Play with Gold Coins for fun 
            or Sweep Coins for real prizes!
          </p>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {dailyStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass">
                <CardContent className="p-4 text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className={`font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.subValue}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Game Categories */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className={`glass hover:glow transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                      category.isComingSoon 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => handleGameSelect(category)}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      {category.isNew && (
                        <Badge className="bg-blue-500 text-white text-xs">NEW</Badge>
                      )}
                      {category.isHot && (
                        <Badge className="bg-red-500 text-white text-xs">🔥 HOT</Badge>
                      )}
                      {category.isComingSoon && (
                        <Badge variant="outline" className="text-xs">Soon</Badge>
                      )}
                    </div>

                    <CardHeader className="relative pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.bgGradient} border`}>
                          <Icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{category.playerCount} playing</span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative pt-0">
                      <div className="space-y-3">
                        {/* Game Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Min Bet</div>
                            <div className="font-semibold">{category.minBet}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Max Win</div>
                            <div className="font-semibold text-success">{category.maxWin}</div>
                          </div>
                        </div>

                        {/* Currency Support */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {(category.currency === "Both" || category.currency === "GC") && (
                              <div className="flex items-center gap-1">
                                <Coins className="h-3 w-3 text-gold" />
                                <span className="text-xs text-gold">GC</span>
                              </div>
                            )}
                            {(category.currency === "Both" || category.currency === "SC") && (
                              <div className="flex items-center gap-1">
                                <Gem className="h-3 w-3 text-teal" />
                                <span className="text-xs text-teal">SC</span>
                              </div>
                            )}
                          </div>
                          
                          {!category.isComingSoon && (
                            <Button 
                              size="sm" 
                              className="btn-primary group-hover:scale-110 transition-transform"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Play Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-gold" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Gift className="h-5 w-5 text-purple" />
                      <span className="text-sm">Daily Bonus</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Trophy className="h-5 w-5 text-gold" />
                      <span className="text-sm">Tournaments</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">My Stats</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Star className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Leaderboard</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Big Wins */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500" />
                  Recent Big Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{winner.name}</div>
                      <div className="text-xs text-muted-foreground">{winner.game}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success text-sm">{winner.amount}</div>
                      <div className="text-xs text-muted-foreground">{winner.time}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Tips */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Game Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="font-medium text-blue-400 mb-1">💡 Pro Tip</div>
                  <p className="text-muted-foreground">
                    Start with Gold Coins to learn game mechanics before playing with Sweep Coins.
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="font-medium text-green-400 mb-1">🎯 Strategy</div>
                  <p className="text-muted-foreground">
                    Set a budget and stick to it. Remember, gambling should be fun!
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="font-medium text-purple-400 mb-1">⭐ Bonus</div>
                  <p className="text-muted-foreground">
                    Check daily for free spins and bonus coin opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Progressive Jackpots */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  Live Jackpots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold">87.50 SC</div>
                  <div className="text-sm text-muted-foreground">Mega Jackpot</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-card rounded">
                    <div className="font-semibold text-purple-400">23.75 SC</div>
                    <div className="text-xs text-muted-foreground">Major</div>
                  </div>
                  <div className="text-center p-2 bg-card rounded">
                    <div className="font-semibold text-blue-400">14.50 SC</div>
                    <div className="text-xs text-muted-foreground">Minor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
