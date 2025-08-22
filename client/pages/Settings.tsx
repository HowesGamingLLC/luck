import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Account Settings"
      description="Customize your account preferences and security settings."
      icon={Settings}
      comingSoonFeatures={[
        "Privacy and security controls",
        "Notification preferences",
        "Theme and display options",
        "Language and region settings",
        "Two-factor authentication setup"
      ]}
    />
  );
}
