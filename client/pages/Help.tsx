import { PlaceholderPage } from "@/components/PlaceholderPage";
import { HelpCircle } from "lucide-react";

export default function Help() {
  return (
    <PlaceholderPage
      title="Help & Support"
      description="Get answers to your questions and learn how to maximize your winnings."
      icon={HelpCircle}
      comingSoonFeatures={[
        "Comprehensive FAQ section",
        "Step-by-step game tutorials",
        "Live chat support",
        "Video guides and walkthroughs",
        "Community forum and discussions"
      ]}
    />
  );
}
