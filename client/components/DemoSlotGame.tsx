import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Play, Info } from "lucide-react";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { SlotMachine } from "@/components/SlotMachine";
import { getSlotTheme } from "@/components/SlotThemes";
import { cn } from "@/lib/utils";

interface DemoSlotGameProps {
  className?: string;
}

export function DemoSlotGame({ className }: DemoSlotGameProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    CurrencyType.GC,
  );
  const [showSlot, setShowSlot] = useState(false);
  const { user } = useCurrency();

  const demoGames = [
    {
      id: "demo-classic",
      name: "Classic Fruits Demo",
      description: "Traditional fruit machine with classic symbols",
      theme: "classic",
      provider: "Demo",
      rtp: 96.5,
      volatility: "medium",
      features: ["Wild Symbols", "Scatter Pays", "Auto Spin"],
    },
    {
      id: "demo-diamond",
      name: "Diamond Deluxe Demo",
      description: "Luxury gems and precious stones",
      theme: "diamond",
      provider: "Demo",
      rtp: 97.2,
      volatility: "high",
      features: ["Free Spins", "Multipliers", "Bonus Round"],
    },
  ];

  const [selectedGame, setSelectedGame] = useState(demoGames[0]);

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case "low":
        return "text-green-500 bg-green-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "high":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const handleWin = (
    amount: number,
    combination: string[],
    currency: CurrencyType,
  ) => {
    console.log(
      `Demo win: ${amount} ${currency} with ${combination.join(", ")}`,
    );
  };

  if (showSlot) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedGame.name}</h3>
            <p className="text-sm text-muted-foreground">
              Demo Mode - {selectedGame.description}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowSlot(false)}>
            Back to Games
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a demo slot machine. Configure real API credentials to
            access live games from BGaming and Pragmatic Play.
          </AlertDescription>
        </Alert>

        <Card className="glass">
          <CardContent className="p-6">
            <SlotMachine
              theme={getSlotTheme(selectedGame.theme as any)}
              currency={selectedCurrency}
              onWin={handleWin}
              onSpin={() => {}}
              className="max-w-lg mx-auto"
            />
          </CardContent>
        </Card>

        <div className="flex justify-center gap-2">
          <Button
            variant={
              selectedCurrency === CurrencyType.GC ? "default" : "outline"
            }
            onClick={() => setSelectedCurrency(CurrencyType.GC)}
          >
            Play with GC
          </Button>
          <Button
            variant={
              selectedCurrency === CurrencyType.SC ? "default" : "outline"
            }
            onClick={() => setSelectedCurrency(CurrencyType.SC)}
          >
            Play with SC
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Demo Slot Games</h3>
        <p className="text-muted-foreground">
          Try these demo slot machines while you configure your provider API
          credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoGames.map((game) => (
          <Card
            key={game.id}
            className={cn(
              "glass cursor-pointer transition-all duration-200 hover:scale-105",
              selectedGame.id === game.id && "ring-2 ring-purple",
            )}
            onClick={() => setSelectedGame(game)}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-purple/20 to-blue/20 rounded-lg mb-4 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-purple animate-pulse" />
                </div>
                <Badge className="absolute top-2 left-2 bg-purple text-white">
                  {game.provider}
                </Badge>
                <Badge
                  className={`absolute top-2 right-2 ${getVolatilityColor(game.volatility)}`}
                >
                  {game.volatility.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg">{game.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {game.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">RTP:</span>
                  <span className="font-semibold ml-2">{game.rtp}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-semibold ml-2">{game.provider}</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {game.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Play Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSlot(true);
                }}
                className="w-full btn-primary"
                disabled={!user}
              >
                <Play className="h-4 w-4 mr-2" />
                Play Demo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Demo Mode Features:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Play with virtual credits</li>
              <li>No real money wagering</li>
              <li>Test game mechanics and features</li>
              <li>Experience the full slot interface</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Configure BGaming and Pragmatic Play API credentials to access
              hundreds of real slot games.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
