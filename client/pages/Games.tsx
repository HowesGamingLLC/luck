import { DailySpinWheel } from "@/components/DailySpinWheel";
import { SlotMachine } from "@/components/SlotMachine";
import { ProgressiveJackpot } from "@/components/ProgressiveJackpot";
import { SLOT_THEMES, getSlotTheme } from "@/components/SlotThemes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { useState } from "react";
import {
  Trophy,
  Coins,
  Gift,
  Zap,
  Clock,
  Users,
  Sparkles,
  Crown,
  Star,
  Gem,
  Flame,
  Rocket,
  Castle,
  Waves,
} from "lucide-react";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  probability: number;
}

interface SlotGameInfo {
  id: string;
  name: string;
  icon: any;
  description: string;
  minBet: number;
  maxPayout: number;
  jackpot: number;
  popularity: number;
  difficulty: string;
}

export default function Games() {
  const [spinResult, setSpinResult] = useState<WheelSegment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("classic");
  const [selectedSlotCurrency, setSelectedSlotCurrency] = useState<CurrencyType>(CurrencyType.GC);
  const [totalWinnings, setTotalWinnings] = useState(430);
  const [totalSpins, setTotalSpins] = useState(47);
  const [slotWins, setSlotWins] = useState(0);

  const { user, canAffordWager } = useCurrency();

  const handleSpinResult = (result: WheelSegment) => {
    setSpinResult(result);
    setTotalWinnings(prev => prev + result.value);
    console.log(`Spin Wheel Won: ${result.label}`);
  };

  const handleSlotWin = (amount: number, combination: string[]) => {
    setTotalWinnings(prev => prev + amount);
    setSlotWins(prev => prev + 1);
    console.log(`Slot Win: $${amount} with ${combination.join(', ')}`);
  };

  const gameStats = [
    {
      label: "Gold Coins",
      value: `${user?.balance.goldCoins.toLocaleString() || 0} GC`,
      icon: Coins,
      color: "text-gold",
    },
    {
      label: "Sweep Coins",
      value: `${user?.balance.sweepCoins.toFixed(2) || 0} SC`,
      icon: Gem,
      color: "text-teal",
    },
    {
      label: "Total Won",
      value: `${(user?.totalWon.goldCoins || 0) + (user?.totalWon.sweepCoins || 0)} Total`,
      icon: Trophy,
      color: "text-success"
    },
    {
      label: "Player Level",
      value: `Level ${user?.level || 1}`,
      icon: Star,
      color: "text-purple"
    },
  ];

  const slotGames: SlotGameInfo[] = [
    {
      id: "classic",
      name: "Classic Fruits",
      icon: Sparkles,
      description: "Traditional fruit machine with classic symbols",
      minBet: 1,
      maxPayout: 500,
      jackpot: 2500,
      popularity: 95,
      difficulty: "Easy"
    },
    {
      id: "diamond",
      name: "Diamond Deluxe",
      icon: Gem,
      description: "Luxury gems and precious stones",
      minBet: 2,
      maxPayout: 1000,
      jackpot: 5000,
      popularity: 88,
      difficulty: "Medium"
    },
    {
      id: "treasure",
      name: "Treasure Hunt",
      icon: Crown,
      description: "Pirate treasure and golden coins",
      minBet: 1,
      maxPayout: 750,
      jackpot: 3750,
      popularity: 82,
      difficulty: "Easy"
    },
    {
      id: "sevens",
      name: "Lucky Sevens",
      icon: Star,
      description: "Classic casino with lucky sevens",
      minBet: 3,
      maxPayout: 1500,
      jackpot: 7777,
      popularity: 90,
      difficulty: "Hard"
    },
    {
      id: "space",
      name: "Space Adventure",
      icon: Rocket,
      description: "Cosmic journey through the galaxy",
      minBet: 2,
      maxPayout: 888,
      jackpot: 4440,
      popularity: 76,
      difficulty: "Medium"
    },
    {
      id: "magic",
      name: "Magic Kingdom",
      icon: Castle,
      description: "Magical spells and enchanted symbols",
      minBet: 2,
      maxPayout: 999,
      jackpot: 4995,
      popularity: 79,
      difficulty: "Medium"
    },
    {
      id: "ocean",
      name: "Ocean Adventure",
      icon: Waves,
      description: "Deep sea treasures and marine life",
      minBet: 1,
      maxPayout: 650,
      jackpot: 3250,
      popularity: 73,
      difficulty: "Easy"
    },
    {
      id: "west",
      name: "Wild West",
      icon: Flame,
      description: "Cowboys, gold rush, and frontier life",
      minBet: 2,
      maxPayout: 600,
      jackpot: 3000,
      popularity: 85,
      difficulty: "Medium"
    },
  ];

  const recentActivity = [
    { type: "slot-win", game: "Diamond Deluxe", amount: "$85", time: "1 minute ago" },
    { type: "spin", amount: "-", time: "2 minutes ago" },
    { type: "win", amount: "$25", time: "3 minutes ago" },
    { type: "slot-win", game: "Lucky Sevens", amount: "$150", time: "8 minutes ago" },
    { type: "win", amount: "$10", time: "12 minutes ago" },
    { type: "slot-win", game: "Classic Fruits", amount: "$35", time: "18 minutes ago" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Casino Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Try your luck with our exciting games! Spin wheels, play slots, and win amazing prizes.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm text-muted-foreground">
                          {stat.label}
                        </span>
                      </div>
                      <span className={`font-semibold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          activity.type.includes("win") ? "default" : "secondary"
                        }
                        className={activity.type.includes("win") ? "bg-success" : ""}
                      >
                        {activity.type === "win" ? "Wheel" : 
                         activity.type === "slot-win" ? "Slot" : "Spin"}
                      </Badge>
                      {activity.type.includes("win") && (
                        <span className="font-semibold text-success">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Games */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="wheel" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wheel">Spin Wheel</TabsTrigger>
                <TabsTrigger value="slots">Slot Machines</TabsTrigger>
              </TabsList>

              {/* Spin Wheel Tab */}
              <TabsContent value="wheel">
                <div className="flex justify-center">
                  <DailySpinWheel
                    size={350}
                    onSpin={(result) => {
                      setTotalWinnings(prev => prev + result.value);
                      console.log(`Daily Spin Won: ${result.label}`);
                    }}
                  />
                </div>
              </TabsContent>

              {/* Slots Tab */}
              <TabsContent value="slots" className="space-y-6">
                {/* Slot Game Selection */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Choose Your Slot Game</CardTitle>
                    <CardDescription>Select a game and currency to start playing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {slotGames.map((game) => {
                        const Icon = game.icon;
                        const isSelected = selectedSlot === game.id;
                        return (
                          <Card
                            key={game.id}
                            className={`transition-all duration-200 hover:scale-105 cursor-pointer ${
                              isSelected
                                ? "border-purple bg-purple/10 shadow-glow"
                                : "border-border hover:border-purple/50"
                            }`}
                            onClick={() => setSelectedSlot(game.id)}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="text-center">
                                <Icon className="h-8 w-8 mx-auto mb-2 text-purple" />
                                <div className="text-sm font-medium">{game.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Max Win: {game.difficulty === "Hard" ? "10 SC" : `${Math.min(game.maxPayout, 10)} SC`}
                                </div>
                              </div>

                              {/* Currency Selection Buttons */}
                              <div className="space-y-2">
                                <Button
                                  size="sm"
                                  variant={selectedSlotCurrency === CurrencyType.GC && isSelected ? "default" : "outline"}
                                  className="w-full bg-red-500 hover:bg-red-600 text-white border-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSlot(game.id);
                                    setSelectedSlotCurrency(CurrencyType.GC);
                                  }}
                                  disabled={!user || !canAffordWager(CurrencyType.GC, 1)}
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  Play with GC (Fun)
                                </Button>

                                <Button
                                  size="sm"
                                  variant={selectedSlotCurrency === CurrencyType.SC && isSelected ? "default" : "outline"}
                                  className="w-full bg-green-500 hover:bg-green-600 text-white border-green-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSlot(game.id);
                                    setSelectedSlotCurrency(CurrencyType.SC);
                                  }}
                                  disabled={!user || !canAffordWager(CurrencyType.SC, 0.01)}
                                >
                                  <Gem className="h-3 w-3 mr-1" />
                                  Play with SC (Real)
                                </Button>
                              </div>

                              {/* Balances */}
                              <div className="text-xs text-center space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">GC Balance:</span>
                                  <span className="text-gold font-medium">
                                    {user?.balance.goldCoins.toLocaleString() || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">SC Balance:</span>
                                  <span className="text-teal font-medium">
                                    {user?.balance.sweepCoins.toFixed(2) || 0}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Slot Machine */}
                <div className="flex justify-center">
                  <SlotMachine
                    theme={getSlotTheme(selectedSlot as any)}
                    currency={selectedSlotCurrency}
                    onWin={(amount, combination, currency) => {
                      console.log(`Slot Win: ${amount} ${currency} with ${combination.join(', ')}`);
                    }}
                    onSpin={() => setTotalSpins(prev => prev + 1)}
                    className="max-w-lg w-full"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Game Info */}
          <div className="space-y-6">
            <ProgressiveJackpot />

            {/* Current Game Info */}
            {selectedSlot && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <span>Game Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const game = slotGames.find(g => g.id === selectedSlot);
                    if (!game) return null;
                    return (
                      <>
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">{game.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {game.description}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Min Bet:</span>
                            <span className="font-semibold">${game.minBet}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Max Payout:</span>
                            <span className="font-semibold">${game.maxPayout}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Jackpot:</span>
                            <span className="font-semibold text-gold">${game.jackpot}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Difficulty:</span>
                            <span className={`font-semibold ${getDifficultyColor(game.difficulty)}`}>
                              {game.difficulty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Popularity:</span>
                            <span className="font-semibold">{game.popularity}%</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple" />
                  <span>Live Wins</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Lucky_Player***</span>
                    <span className="text-success font-semibold">+$777</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Lucky Sevens • Just now</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Diamond_Queen***</span>
                    <span className="text-success font-semibold">+$250</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Diamond Deluxe • 1 min ago</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Slot_Master***</span>
                    <span className="text-success font-semibold">+$125</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Classic Fruits • 3 min ago</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Space_Explorer***</span>
                    <span className="text-success font-semibold">+$88</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Space Adventure • 5 min ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
