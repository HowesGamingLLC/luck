import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency, CurrencyType, formatCurrency } from "@/contexts/CurrencyContext";
import { Coins, Gem, Info, Wallet } from "lucide-react";

interface CurrencySelectorProps {
  selectedCurrency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  showBalance?: boolean;
  showDescription?: boolean;
  variant?: "default" | "compact" | "inline";
  className?: string;
  disabled?: boolean;
  minBetAmount?: number;
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  showBalance = true,
  showDescription = true,
  variant = "default",
  className = "",
  disabled = false,
  minBetAmount = 0,
}: CurrencySelectorProps) {
  const { user, canAffordWager } = useCurrency();

  const canAffordGC = user && canAffordWager(CurrencyType.GC, minBetAmount);
  const canAffordSC = user && canAffordWager(CurrencyType.SC, minBetAmount > 0 ? minBetAmount * 0.01 : 0.01);

  if (variant === "inline") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant={selectedCurrency === CurrencyType.GC ? "default" : "outline"}
          onClick={() => onCurrencyChange(CurrencyType.GC)}
          disabled={disabled || !canAffordGC}
          className="flex-1"
        >
          <Coins className="h-4 w-4 mr-2 text-gold" />
          Gold Coins
        </Button>
        <Button
          variant={selectedCurrency === CurrencyType.SC ? "default" : "outline"}
          onClick={() => onCurrencyChange(CurrencyType.SC)}
          disabled={disabled || !canAffordSC}
          className="flex-1"
        >
          <Gem className="h-4 w-4 mr-2 text-teal" />
          Sweep Coins
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`glass ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Currency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={selectedCurrency === CurrencyType.GC ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onCurrencyChange(CurrencyType.GC)}
              disabled={disabled || !canAffordGC}
            >
              <Coins className="h-4 w-4 mr-1 text-gold" />
              GC
            </Button>
            <Button
              variant={selectedCurrency === CurrencyType.SC ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onCurrencyChange(CurrencyType.SC)}
              disabled={disabled || !canAffordSC}
            >
              <Gem className="h-4 w-4 mr-1 text-teal" />
              SC
            </Button>
          </div>
          
          {showBalance && user && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">GC Balance:</span>
                <span className="font-medium text-gold">
                  {formatCurrency(user.balance.goldCoins, CurrencyType.GC)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SC Balance:</span>
                <span className="font-medium text-teal">
                  {formatCurrency(user.balance.sweepCoins, CurrencyType.SC)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`glass ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Select Currency
        </CardTitle>
        {showDescription && (
          <CardDescription>
            Choose between Gold Coins (fun play) or Sweep Coins (real value)
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gold Coins Option */}
        <Button
          variant={selectedCurrency === CurrencyType.GC ? "default" : "outline"}
          className="w-full justify-start h-auto p-4"
          onClick={() => onCurrencyChange(CurrencyType.GC)}
          disabled={disabled || !canAffordGC}
        >
          <div className="flex items-center gap-3 w-full">
            <Coins className="h-6 w-6 text-gold flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Gold Coins (GC)</div>
              <div className="text-sm text-muted-foreground">
                Fun play currency
              </div>
              {showBalance && user && (
                <div className="text-sm font-medium text-gold mt-1">
                  Balance: {formatCurrency(user.balance.goldCoins, CurrencyType.GC)}
                </div>
              )}
            </div>
            {selectedCurrency === CurrencyType.GC && (
              <Badge className="bg-primary">Selected</Badge>
            )}
            {!canAffordGC && minBetAmount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Insufficient
              </Badge>
            )}
          </div>
        </Button>

        {/* Sweep Coins Option */}
        <Button
          variant={selectedCurrency === CurrencyType.SC ? "default" : "outline"}
          className="w-full justify-start h-auto p-4"
          onClick={() => onCurrencyChange(CurrencyType.SC)}
          disabled={disabled || !canAffordSC}
        >
          <div className="flex items-center gap-3 w-full">
            <Gem className="h-6 w-6 text-teal flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Sweep Coins (SC)</div>
              <div className="text-sm text-muted-foreground">
                Real value currency
              </div>
              {showBalance && user && (
                <div className="text-sm font-medium text-teal mt-1">
                  Balance: {formatCurrency(user.balance.sweepCoins, CurrencyType.SC)}
                </div>
              )}
            </div>
            {selectedCurrency === CurrencyType.SC && (
              <Badge className="bg-primary">Selected</Badge>
            )}
            {!canAffordSC && minBetAmount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Insufficient
              </Badge>
            )}
          </div>
        </Button>

        {showDescription && (
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-400">
              <div className="font-medium mb-1">Currency Info</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Gold Coins are for entertainment only</li>
                <li>• Sweep Coins have real cash value</li>
                <li>• You can switch currencies anytime</li>
                <li>• Different games may have different currency requirements</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
