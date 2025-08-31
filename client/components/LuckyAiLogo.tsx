import React from "react";

export const LUCKY_AI_MASCOT_URL =
  "https://cdn.builder.io/api/v1/image/assets%2Fbe2ace04220d444da59d08df25b0c568%2F116266508b6d48b4a412eb383abda572?format=webp&width=800";

interface LuckyAiLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function LuckyAiLogo({
  size = 32,
  showText = true,
  className,
  textClassName,
}: LuckyAiLogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className ?? ""}`}>
      <img
        src={LUCKY_AI_MASCOT_URL}
        alt="LuckyAi mascot"
        width={size}
        height={size}
        className="rounded-lg shadow-gold-glow"
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span className={`text-xl font-display font-bold gradient-text ${textClassName ?? ""}`}>
          CoinKrazy.com
        </span>
      )}
    </div>
  );
}
