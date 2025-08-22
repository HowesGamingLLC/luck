import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  probability: number;
}

interface SpinWheelProps {
  segments?: WheelSegment[];
  size?: number;
  onSpin?: (result: WheelSegment) => void;
  disabled?: boolean;
}

const defaultSegments: WheelSegment[] = [
  { label: "$10", value: 10, color: "#8B5CF6", probability: 0.3 },
  { label: "$25", value: 25, color: "#06B6D4", probability: 0.25 },
  { label: "$50", value: 50, color: "#10B981", probability: 0.2 },
  { label: "$100", value: 100, color: "#F59E0B", probability: 0.15 },
  { label: "$250", value: 250, color: "#EF4444", probability: 0.08 },
  { label: "$500", value: 500, color: "#EC4899", probability: 0.02 },
];

export function SpinWheel({
  segments = defaultSegments,
  size = 300,
  onSpin,
  disabled = false,
}: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    // Calculate random result based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedSegment = segments[0];

    for (const segment of segments) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        selectedSegment = segment;
        break;
      }
    }

    // Calculate the angle for the selected segment
    const segmentAngle = 360 / segments.length;
    const selectedIndex = segments.indexOf(selectedSegment);
    const targetAngle = selectedIndex * segmentAngle;

    // Add multiple full rotations plus random offset for effect
    const spinAmount = 360 * (5 + Math.random() * 3) + targetAngle;
    const newRotation = rotation + spinAmount;

    setRotation(newRotation);

    // Complete spin after animation
    setTimeout(() => {
      setIsSpinning(false);
      onSpin?.(selectedSegment);
    }, 4000);
  };

  const segmentAngle = 360 / segments.length;
  const radius = size / 2 - 20;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Wheel */}
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full border-4 border-gold shadow-2xl spin-wheel overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)"
              : "none",
          }}
        >
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            // Calculate path for segment
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = radius + radius * Math.cos(startAngleRad);
            const y1 = radius + radius * Math.sin(startAngleRad);
            const x2 = radius + radius * Math.cos(endAngleRad);
            const y2 = radius + radius * Math.sin(endAngleRad);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            // Text position
            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            const textX = radius + textRadius * Math.cos(textAngleRad);
            const textY = radius + textRadius * Math.sin(textAngleRad);

            return (
              <svg
                key={index}
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${size} ${size}`}
              >
                <path
                  d={pathData}
                  fill={segment.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-bold text-sm"
                  transform={`rotate(${textAngle} ${textX} ${textY})`}
                >
                  {segment.label}
                </text>
              </svg>
            );
          })}
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-gold drop-shadow-lg" />
        </div>

        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || disabled}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark hover:scale-110 transition-transform duration-200 font-bold text-black shadow-xl"
          >
            {isSpinning ? (
              <RotateCcw className="h-6 w-6 animate-spin" />
            ) : (
              "SPIN"
            )}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isSpinning ? "Spinning..." : "Click SPIN to try your luck!"}
        </p>
      </div>
    </div>
  );
}
