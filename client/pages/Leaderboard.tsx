import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  return (
    <PlaceholderPage
      title="Leaderboard"
      description="Compete with other players and see who's winning the most!"
      icon={Trophy}
      comingSoonFeatures={[
        "Daily, weekly, and monthly leaderboards",
        "Player rankings and statistics", 
        "Exclusive rewards for top performers",
        "Achievement badges and milestones",
        "Friend competitions and challenges"
      ]}
    />
  );
}
