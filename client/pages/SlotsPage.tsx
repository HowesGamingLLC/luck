import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlotMachine } from "@/components/SlotMachine";
import { ProgressiveJackpot } from "@/components/ProgressiveJackpot";
import { SLOT_THEMES, getSlotTheme } from "@/components/SlotThemes";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import {
  Crown,
  Coins,
  Gem,
  Star,
  Sparkles,
  Rocket,
  Castle,
  Waves,
  Flame,
  ArrowLeft,
  TrendingUp,
  Zap,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SlotGameInfo {
  id: string;
  name: string;
  icon: any;
  description: string;
  minBet: number;
  maxPayoutGC: number;
  maxPayoutSC: number;
  jackpotGC: number;
  jackpotSC: number;
  popularity: number;
  difficulty: string;
  theme: string;
  features: string[];
}

export default function SlotsPage() {
  const [selectedSlot, setSelectedSlot] = useState<string>("classic");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(CurrencyType.GC);
  const { user, canAffordWager } = useCurrency();

  const slotGames: SlotGameInfo[] = [
    {
      id: "classic",
      name: "Classic Fruits",
      icon: Sparkles,
      description: "Traditional fruit machine with classic symbols",
      minBet: 1,
      maxPayoutGC: 500,
      maxPayoutSC: 5.00,
      jackpotGC: 2500,
      jackpotSC: 25.00,
      popularity: 95,
      difficulty: "Easy",
      theme: "classic",
      features: ["Wild Symbols", "Scatter Pays", "Auto Spin", "Fast Play"],
    },
    {
      id: "diamond",
      name: "Diamond Deluxe",
      icon: Gem,
      description: "Luxury gems and precious stones",
      minBet: 2,
      maxPayoutGC: 1000,
      maxPayoutSC: 10.00,
      jackpotGC: 5000,
      jackpotSC: 50.00,
      popularity: 88,
      difficulty: "Medium",
      theme: "diamond",
      features: ["Multipliers", "Free Spins", "Bonus Round", "Progressive"],
    },
    {
      id: "treasure",
      name: "Treasure Hunt",
      icon: Crown,
      description: "Pirate treasure and golden coins",
      minBet: 1,
      maxPayoutGC: 750,
      maxPayoutSC: 7.50,
      jackpotGC: 3750,
      jackpotSC: 37.50,
      popularity: 82,
      difficulty: "Easy",
      theme: "treasure",
      features: ["Treasure Maps", "Bonus Chest", "Wild Reels", "Mini Game"],
    },
    {
      id: "sevens",
      name: "Lucky Sevens",
      icon: Star,
      description: "Classic casino with lucky sevens",
      minBet: 5,
      maxPayoutGC: 1500,
      maxPayoutSC: 15.00,
      jackpotGC: 7777,
      jackpotSC: 77.77,
      popularity: 90,
      difficulty: "Hard",
      theme: "sevens",
      features: ["777 Jackpot", "Big Win Multipliers", "Lucky Spin", "High Volatility"],
    },
    {
      id: "space",
      name: "Space Adventure",
      icon: Rocket,
      description: "Cosmic journey through the galaxy",
      minBet: 2,
      maxPayoutGC: 888,
      maxPayoutSC: 8.88,
      jackpotGC: 4440,
      jackpotSC: 44.40,
      popularity: 76,
      difficulty: "Medium",
      theme: "space",
      features: ["Cosmic Wilds", "Planet Bonus", "Alien Encounters", "Space Spins"],
    },
    {
      id: "magic",
      name: "Magic Kingdom",
      icon: Castle,
      description: "Magical spells and enchanted symbols",
      minBet: 2,
      maxPayoutGC: 999,
      maxPayoutSC: 9.99,
      jackpotGC: 4995,
      jackpotSC: 49.95,
      popularity: 79,
      difficulty: "Medium",
      theme: "magic",
      features: ["Magic Spells", "Enchanted Wilds", "Castle Bonus", "Mystical Free Spins"],
    },
  ];

  const currentGame = slotGames.find(game => game.id === selectedSlot) || slotGames[0];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500 bg-green-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/20";
      case "Hard": return "text-red-500 bg-red-500/20";
      default: return "text-gray-500 bg-gray-500/20";
    }
  };

  const handleSlotWin = (amount: number, combination: string[], currency: CurrencyType) => {
    console.log(`Slot Win: ${amount} ${currency} with ${combination.join(", ")}`);
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
              Slot Machines
            </h1>
            <p className="text-muted-foreground">
              Choose your slot game and currency to start spinning
            </p>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 mx-auto mb-2 text-gold" />
              <div className="text-sm text-muted-foreground">Gold Coins</div>
              <div className="font-bold text-gold">
                {user?.balance.goldCoins.toLocaleString() || 0} GC
              </div>
            </CardContent>
          </Card>
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
              <div className="text-sm text-muted-foreground">Total Won</div>
              <div className="font-bold text-success">
                {((user?.totalWon.goldCoins || 0) + (user?.totalWon.sweepCoins || 0)).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">Player Level</div>
              <div className="font-bold text-purple">Level {user?.level || 1}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Selection */}
          <div className="lg:col-span-1">
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Select Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {slotGames.map((game) => {
                  const Icon = game.icon;
                  const isSelected = selectedSlot === game.id;
                  return (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple bg-purple/10"
                          : "border-border hover:border-purple/50"
                      }`}
                      onClick={() => setSelectedSlot(game.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-purple" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{game.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Max: {selectedCurrency === CurrencyType.GC ? `${game.maxPayoutGC} GC` : `${game.maxPayoutSC} SC`}
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Currency Selection */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={selectedCurrency === CurrencyType.GC ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCurrency(CurrencyType.GC)}
                  disabled={!user || !canAffordWager(CurrencyType.GC, currentGame.minBet)}
                >
                  <Coins className="h-4 w-4 mr-2 text-gold" />
                  Play with Gold Coins (Fun)
                </Button>
                <Button
                  variant={selectedCurrency === CurrencyType.SC ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCurrency(CurrencyType.SC)}
                  disabled={!user || !canAffordWager(CurrencyType.SC, 0.01)}
                >
                  <Gem className="h-4 w-4 mr-2 text-teal" />
                  Play with Sweep Coins (Real)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="glass mb-6">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <currentGame.icon className="h-6 w-6 text-purple" />
                  {currentGame.name}
                </CardTitle>
                <CardDescription>{currentGame.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <SlotMachine
                    theme={getSlotTheme(selectedSlot as any)}
                    currency={selectedCurrency}
                    onWin={handleSlotWin}
                    onSpin={() => {}}
                    className="max-w-lg w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Game Features */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gold" />
                  Game Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {currentGame.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-card/50 rounded">
                      <Sparkles className="h-4 w-4 text-purple" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progressive Jackpots */}
            <ProgressiveJackpot showOptInToggle={false} />

            {/* Game Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Min Bet:</span>
                  <span className="font-semibold">
                    {currentGame.minBet} {selectedCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Payout:</span>
                  <span className="font-semibold text-success">
                    {selectedCurrency === CurrencyType.GC ? 
                      `${currentGame.maxPayoutGC} GC` : 
                      `${currentGame.maxPayoutSC} SC`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jackpot:</span>
                  <span className="font-semibold text-gold">
                    {selectedCurrency === CurrencyType.GC ? 
                      `${currentGame.jackpotGC} GC` : 
                      `${currentGame.jackpotSC} SC`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Popularity:</span>
                  <span className="font-semibold">{currentGame.popularity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Difficulty:</span>
                  <Badge className={getDifficultyColor(currentGame.difficulty)}>
                    {currentGame.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Recent Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">You</span>
                    <span className="text-success font-semibold">+12.50 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {currentGame.name} • 5 min ago
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Slot_King***</span>
                    <span className="text-success font-semibold">+8.75 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Diamond Deluxe • 12 min ago
                  </p>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Lucky_777***</span>
                    <span className="text-success font-semibold">+25.00 SC</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Lucky Sevens • 18 min ago
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
