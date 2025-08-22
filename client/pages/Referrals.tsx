import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Users } from "lucide-react";

export default function Referrals() {
  return (
    <PlaceholderPage
      title="Referral Program"
      description="Invite friends and earn up to 20% commission on their winnings!"
      icon={Users}
      comingSoonFeatures={[
        "Personal referral codes and links",
        "Real-time commission tracking",
        "Tier-based reward system",
        "Social media integration",
        "Monthly referral bonuses"
      ]}
    />
  );
}
