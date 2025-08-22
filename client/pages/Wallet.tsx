import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <PlaceholderPage
      title="Wallet & Payments"
      description="Manage your balance, deposits, withdrawals, and payment methods."
      icon={Wallet}
      comingSoonFeatures={[
        "Real-time balance tracking",
        "Multiple payment method support",
        "Instant withdrawal processing",
        "Transaction history and receipts",
        "Cryptocurrency payment options"
      ]}
    />
  );
}
