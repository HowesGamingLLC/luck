import { Heart, Diamond, Club, Spade } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlayingCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  value: number;
}

interface CoinKrazyCardProps {
  card: PlayingCard;
  isHidden?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export function CoinKrazyCard({
  card,
  isHidden = false,
  size = "md",
  className,
  onClick,
}: CoinKrazyCardProps) {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24",
    lg: "w-20 h-28",
    xl: "w-24 h-36",
  };

  const getSuitIcon = (suit: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (suit) {
      case "hearts":
        return (
          <Heart {...iconProps} className="w-4 h-4 text-red-500 fill-red-500" />
        );
      case "diamonds":
        return (
          <Diamond
            {...iconProps}
            className="w-4 h-4 text-red-500 fill-red-500"
          />
        );
      case "clubs":
        return (
          <Club {...iconProps} className="w-4 h-4 text-black fill-black" />
        );
      case "spades":
        return (
          <Spade {...iconProps} className="w-4 h-4 text-black fill-black" />
        );
      default:
        return null;
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds"
      ? "text-red-500"
      : "text-black";
  };

  if (isHidden) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-lg border-2 border-purple-500 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105",
          "flex items-center justify-center overflow-hidden",
          className,
        )}
        onClick={onClick}
      >
        {/* CoinKrazy.com Branding on Card Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 opacity-90" />
        <div className="relative z-10 text-center">
          <div className="text-gold font-bold text-xs mb-1 drop-shadow-lg">
            COIN
          </div>
          <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center mb-1 mx-auto">
            <div className="w-4 h-4 bg-purple-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gold rounded-full" />
            </div>
          </div>
          <div className="text-gold font-bold text-xs drop-shadow-lg">
            KRAZY
          </div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 left-1 w-2 h-2 bg-gold/30 rounded-full" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-gold/30 rounded-full" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-gold/30 rounded-full" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-gold/30 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative bg-white rounded-lg border-2 border-gray-300 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105",
        "flex flex-col items-center justify-between p-1 overflow-hidden",
        className,
      )}
      onClick={onClick}
    >
      {/* CoinKrazy.com subtle branding */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-gold opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-purple opacity-60" />

      {/* Top left rank and suit */}
      <div className="absolute top-1 left-1 text-center">
        <div
          className={cn(
            "text-xs font-bold leading-none",
            getSuitColor(card.suit),
          )}
        >
          {card.rank}
        </div>
        <div className="flex justify-center">{getSuitIcon(card.suit)}</div>
      </div>

      {/* Center suit (large) */}
      <div className="flex-1 flex items-center justify-center">
        <div className={cn("transform scale-150", getSuitColor(card.suit))}>
          {getSuitIcon(card.suit)}
        </div>
      </div>

      {/* Bottom right rank and suit (rotated) */}
      <div className="absolute bottom-1 right-1 text-center transform rotate-180">
        <div
          className={cn(
            "text-xs font-bold leading-none",
            getSuitColor(card.suit),
          )}
        >
          {card.rank}
        </div>
        <div className="flex justify-center">{getSuitIcon(card.suit)}</div>
      </div>

      {/* CoinKrazy.com watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-xs text-gray-200 font-semibold opacity-30 transform -rotate-45">
          CoinKrazy.com
        </div>
      </div>
    </div>
  );
}

interface CoinKrazyHandProps {
  cards: PlayingCard[];
  hiddenCards?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  spacing?: "tight" | "normal" | "wide";
}

export function CoinKrazyHand({
  cards,
  hiddenCards = 0,
  size = "md",
  className,
  spacing = "normal",
}: CoinKrazyHandProps) {
  const spacingClasses = {
    tight: "-space-x-4",
    normal: "-space-x-2",
    wide: "space-x-1",
  };

  const allCards = [
    ...Array(hiddenCards)
      .fill(null)
      .map((_, i) => ({
        suit: "spades" as const,
        rank: "A",
        value: 14,
        isHidden: true,
        id: `hidden-${i}`,
      })),
    ...cards.map((card, i) => ({ ...card, isHidden: false, id: `card-${i}` })),
  ];

  return (
    <div className={cn("flex", spacingClasses[spacing], className)}>
      {allCards.map((card, index) => (
        <div
          key={card.id}
          className="relative"
          style={{ zIndex: allCards.length - index }}
        >
          {card.isHidden ? (
            <CoinKrazyCard
              card={{ suit: "spades", rank: "A", value: 14 }}
              isHidden
              size={size}
            />
          ) : (
            <CoinKrazyCard card={card} size={size} />
          )}
        </div>
      ))}
    </div>
  );
}

interface CoinKrazyCommunityCardsProps {
  cards: PlayingCard[];
  stage: "preflop" | "flop" | "turn" | "river" | "showdown";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function CoinKrazyCommunityCards({
  cards,
  stage,
  size = "md",
  className,
}: CoinKrazyCommunityCardsProps) {
  const getVisibleCards = () => {
    switch (stage) {
      case "preflop":
        return 0;
      case "flop":
        return 3;
      case "turn":
        return 4;
      case "river":
      case "showdown":
        return 5;
      default:
        return 0;
    }
  };

  const visibleCount = getVisibleCards();
  const hiddenCount = 5 - visibleCount;

  return (
    <div className={cn("flex space-x-2 justify-center", className)}>
      {/* Visible cards */}
      {cards.slice(0, visibleCount).map((card, index) => (
        <div
          key={`visible-${index}`}
          className="transform hover:scale-105 transition-transform"
        >
          <CoinKrazyCard card={card} size={size} />
        </div>
      ))}

      {/* Hidden/placeholder cards */}
      {Array(hiddenCount)
        .fill(null)
        .map((_, index) => (
          <div
            key={`hidden-${index}`}
            className="transform hover:scale-105 transition-transform"
          >
            <CoinKrazyCard
              card={{ suit: "spades", rank: "A", value: 14 }}
              isHidden
              size={size}
            />
          </div>
        ))}
    </div>
  );
}

// Utility function to create a deck of CoinKrazy branded cards
export function createCoinKrazyDeck(): PlayingCard[] {
  const suits: PlayingCard["suit"][] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
  ];
  const ranks = [
    { rank: "A", value: 14 },
    { rank: "2", value: 2 },
    { rank: "3", value: 3 },
    { rank: "4", value: 4 },
    { rank: "5", value: 5 },
    { rank: "6", value: 6 },
    { rank: "7", value: 7 },
    { rank: "8", value: 8 },
    { rank: "9", value: 9 },
    { rank: "10", value: 10 },
    { rank: "J", value: 11 },
    { rank: "Q", value: 12 },
    { rank: "K", value: 13 },
  ];

  const deck: PlayingCard[] = [];
  suits.forEach((suit) => {
    ranks.forEach(({ rank, value }) => {
      deck.push({ suit, rank, value });
    });
  });

  return deck;
}

// Shuffle function for the deck
export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
