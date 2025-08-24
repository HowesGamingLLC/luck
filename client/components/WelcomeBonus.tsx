import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCurrency,
  CurrencyType,
  formatCurrency,
} from "@/contexts/CurrencyContext";
import { Gift, Sparkles, Coins, Gem } from "lucide-react";

export function WelcomeBonus() {
  const { user, claimWelcomeBonus } = useCurrency();
  const [showWelcome, setShowWelcome] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (user?.isNewUser && !claimed) {
      // Show welcome bonus after a brief delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, claimed]);

  const handleClaimBonus = () => {
    claimWelcomeBonus();
    setClaimed(true);

    // Hide the welcome modal after claiming
    setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
  };

  if (!showWelcome || !user?.isNewUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="glass border-gold/50 max-w-md mx-4 animate-bounce-slow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-gold to-gold-dark rounded-full">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Welcome to McLuck! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Claim your exclusive new player bonus!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-gold" />
                <span className="font-semibold">Gold Coins</span>
              </div>
              <Badge className="bg-gold text-black font-bold">
                {formatCurrency(10000, CurrencyType.GC)}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal/10 border border-teal/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-teal" />
                <span className="font-semibold">Sweep Coins</span>
              </div>
              <Badge className="bg-teal text-white font-bold">
                {formatCurrency(10, CurrencyType.SC)}
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Play for fun with Gold Coins</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Win real prizes with Sweep Coins</span>
            </div>
          </div>

          {!claimed ? (
            <Button
              onClick={handleClaimBonus}
              className="btn-gold w-full text-lg py-6"
            >
              <Gift className="h-5 w-5 mr-2" />
              Claim Your Bonus
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-success">
                🎉 Bonus Claimed! 🎉
              </div>
              <div className="text-sm text-muted-foreground">
                Your coins have been added to your account
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground">
            No purchase necessary. Must be 18+ to play.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
