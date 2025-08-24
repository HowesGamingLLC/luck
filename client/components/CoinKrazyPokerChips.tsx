import { Coins, Crown, Gem, Star, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipValue {
  value: number;
  color: string;
  label: string;
  icon?: React.ReactNode;
}

// CoinKrazy.com branded chip denominations
export const COINKRIZY_CHIP_VALUES: ChipValue[] = [
  {
    value: 1,
    color: "bg-white border-gray-400 text-gray-800",
    label: "1",
    icon: <Coins className="w-3 h-3" />
  },
  {
    value: 5,
    color: "bg-red-500 border-red-600 text-white",
    label: "5",
    icon: <Star className="w-3 h-3" />
  },
  {
    value: 10,
    color: "bg-blue-500 border-blue-600 text-white",
    label: "10",
    icon: <Gem className="w-3 h-3" />
  },
  {
    value: 25,
    color: "bg-green-500 border-green-600 text-white",
    label: "25",
    icon: <Zap className="w-3 h-3" />
  },
  {
    value: 50,
    color: "bg-orange-500 border-orange-600 text-white",
    label: "50",
    icon: <Crown className="w-3 h-3" />
  },
  {
    value: 100,
    color: "bg-black border-gray-700 text-white",
    label: "100",
    icon: <Trophy className="w-3 h-3" />
  },
  {
    value: 500,
    color: "bg-purple-600 border-purple-700 text-white",
    label: "500",
    icon: <Crown className="w-3 h-3" />
  },
  {
    value: 1000,
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-500 text-black",
    label: "1K",
    icon: <Trophy className="w-3 h-3" />
  },
  {
    value: 5000,
    color: "bg-gradient-to-r from-pink-500 to-pink-700 border-pink-600 text-white",
    label: "5K",
    icon: <Crown className="w-3 h-3" />
  },
  {
    value: 10000,
    color: "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 border-purple-500 text-white",
    label: "10K",
    icon: <Trophy className="w-3 h-3" />
  }
];

interface CoinKrazyChipProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  count?: number;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

export function CoinKrazyChip({ 
  value, 
  size = "md", 
  count, 
  className, 
  onClick,
  animated = false
}: CoinKrazyChipProps) {
  const chipData = COINKRIZY_CHIP_VALUES.find(chip => chip.value === value) || COINKRIZY_CHIP_VALUES[0];
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
  };

  const ringSize = {
    sm: "ring-1",
    md: "ring-2",
    lg: "ring-2",
    xl: "ring-4",
  };

  return (
    <div
      className={cn(
        "relative rounded-full border-4 shadow-lg cursor-pointer transition-all duration-200",
        "flex flex-col items-center justify-center font-bold",
        "hover:scale-110 hover:shadow-xl",
        sizeClasses[size],
        chipData.color,
        ringSize[size],
        "ring-white/30",
        animated && "animate-pulse",
        className
      )}
      onClick={onClick}
    >
      {/* CoinKrazy.com branding ring */}
      <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-pulse" />
      
      {/* Chip icon */}
      <div className="mb-1">
        {chipData.icon}
      </div>
      
      {/* Chip value */}
      <div className="font-black text-xs leading-none">
        {chipData.label}
      </div>
      
      {/* CoinKrazy.com micro branding */}
      <div className="absolute bottom-0 text-[6px] font-bold opacity-60">
        CK
      </div>
      
      {/* Count badge */}
      {count && count > 1 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white">
          {count > 99 ? "99+" : count}
        </div>
      )}
      
      {/* Highlight effect for high value chips */}
      {value >= 1000 && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

interface CoinKrazyChipStackProps {
  chips: { value: number; count: number }[];
  size?: "sm" | "md" | "lg" | "xl";
  maxVisible?: number;
  className?: string;
  onClick?: (value: number) => void;
  stacked?: boolean;
}

export function CoinKrazyChipStack({ 
  chips, 
  size = "md", 
  maxVisible = 5,
  className,
  onClick,
  stacked = true
}: CoinKrazyChipStackProps) {
  const sortedChips = chips
    .filter(chip => chip.count > 0)
    .sort((a, b) => b.value - a.value);

  if (!stacked) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {sortedChips.map((chip) => (
          <CoinKrazyChip
            key={chip.value}
            value={chip.value}
            count={chip.count}
            size={size}
            onClick={() => onClick?.(chip.value)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-end space-x-1", className)}>
      {sortedChips.slice(0, maxVisible).map((chip, index) => {
        const stackHeight = Math.min(chip.count, 10);
        return (
          <div key={chip.value} className="relative">
            {/* Stack effect */}
            {stackHeight > 1 && (
              <div className="absolute inset-0">
                {Array.from({ length: Math.min(stackHeight, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      bottom: `${i * 2}px`,
                      left: `${i * 1}px`,
                      zIndex: stackHeight - i,
                    }}
                  >
                    <CoinKrazyChip
                      value={chip.value}
                      size={size}
                      className={i > 0 ? "opacity-60" : ""}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Top chip */}
            <div
              style={{
                marginBottom: `${(stackHeight - 1) * 2}px`,
                marginLeft: `${(stackHeight - 1) * 1}px`,
                zIndex: stackHeight + 10,
              }}
              className="relative"
            >
              <CoinKrazyChip
                value={chip.value}
                count={chip.count > maxVisible ? chip.count : undefined}
                size={size}
                onClick={() => onClick?.(chip.value)}
              />
            </div>
          </div>
        );
      })}
      
      {sortedChips.length > maxVisible && (
        <div className={cn("text-muted-foreground text-sm font-medium ml-2")}>
          +{sortedChips.length - maxVisible} more
        </div>
      )}
    </div>
  );
}

interface CoinKrazyChipTotalProps {
  total: number;
  currency?: "GC" | "SC";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

export function CoinKrazyChipTotal({ 
  total, 
  currency = "GC",
  size = "md", 
  className,
  animated = false
}: CoinKrazyChipTotalProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-2",
    xl: "text-xl px-5 py-3",
  };

  const currencyColor = currency === "GC" ? "text-gold" : "text-teal";
  const currencyBg = currency === "GC" ? "bg-gold/10 border-gold/30" : "bg-teal/10 border-teal/30";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 font-bold",
        sizeClasses[size],
        currencyBg,
        currencyColor,
        animated && "animate-pulse",
        className
      )}
    >
      {currency === "GC" ? (
        <Coins className="w-4 h-4" />
      ) : (
        <Gem className="w-4 h-4" />
      )}
      <span>{total.toLocaleString()}</span>
      <span className="text-xs opacity-75">{currency}</span>
      
      {/* CoinKrazy.com branding */}
      <div className="text-[8px] opacity-50 ml-1">
        CoinKrazy.com
      </div>
    </div>
  );
}

interface CoinKrazyBettingChipsProps {
  availableChips: { value: number; count: number }[];
  onChipClick: (value: number) => void;
  currentBet?: number;
  maxBet?: number;
  className?: string;
}

export function CoinKrazyBettingChips({
  availableChips,
  onChipClick,
  currentBet = 0,
  maxBet,
  className
}: CoinKrazyBettingChipsProps) {
  const canBet = (chipValue: number) => {
    if (maxBet && currentBet + chipValue > maxBet) return false;
    const chip = availableChips.find(c => c.value === chipValue);
    return chip && chip.count > 0;
  };

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {COINKRIZY_CHIP_VALUES.filter(chip => 
        availableChips.some(ac => ac.value === chip.value && ac.count > 0)
      ).map((chip) => {
        const available = availableChips.find(ac => ac.value === chip.value);
        const disabled = !canBet(chip.value);
        
        return (
          <div
            key={chip.value}
            className={cn(
              "relative transition-all duration-200",
              disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
            )}
          >
            <CoinKrazyChip
              value={chip.value}
              count={available?.count}
              size="lg"
              onClick={() => !disabled && onChipClick(chip.value)}
              className={disabled ? "grayscale" : ""}
            />
            
            {/* Betting action indicator */}
            {!disabled && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper function to convert chip count to optimal chip breakdown
export function optimizeChipBreakdown(amount: number): { value: number; count: number }[] {
  const breakdown: { value: number; count: number }[] = [];
  let remaining = amount;

  const sortedValues = COINKRIZY_CHIP_VALUES
    .map(chip => chip.value)
    .sort((a, b) => b - a);

  for (const value of sortedValues) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value);
      breakdown.push({ value, count });
      remaining -= value * count;
    }
  }

  return breakdown.filter(chip => chip.count > 0);
}

// Calculate total value from chip breakdown
export function calculateChipTotal(chips: { value: number; count: number }[]): number {
  return chips.reduce((total, chip) => total + (chip.value * chip.count), 0);
}
