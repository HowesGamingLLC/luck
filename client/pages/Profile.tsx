import { PlaceholderPage } from "@/components/PlaceholderPage";
import { User } from "lucide-react";

export default function Profile() {
  return (
    <PlaceholderPage
      title="Player Profile"
      description="Manage your account information and view your gaming statistics."
      icon={User}
      comingSoonFeatures={[
        "Personal information management",
        "Gaming history and statistics",
        "Achievement and badge collection",
        "Profile customization options",
        "Account verification and security"
      ]}
    />
  );
}
