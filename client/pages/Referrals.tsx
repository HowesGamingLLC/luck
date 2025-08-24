import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Crown,
  Star,
  Calendar,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  Link,
  Trophy,
  Target,
  Clock,
  Check,
} from "lucide-react";

// Mock referral data
const mockReferralData = {
  code: "JOHN2024",
  link: "https://coinkrazy.com/ref/JOHN2024",
  totalReferrals: 12,
  activeReferrals: 8,
  totalEarnings: 847.5,
  monthlyEarnings: 156.25,
  weeklyEarnings: 45.0,
  currentTier: "Gold",
  nextTier: "Platinum",
  tierProgress: 60,
  commissionRate: 15,
  nextTierRate: 20,
  referralsNeeded: 8,
};

const tiers = [
  {
    name: "Bronze",
    minReferrals: 0,
    rate: 10,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
  },
  {
    name: "Silver",
    minReferrals: 5,
    rate: 12,
    color: "text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  },
  {
    name: "Gold",
    minReferrals: 10,
    rate: 15,
    color: "text-gold",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    name: "Platinum",
    minReferrals: 20,
    rate: 20,
    color: "text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    name: "Diamond",
    minReferrals: 50,
    rate: 25,
    color: "text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
];

const referralHistory = [
  {
    id: "1",
    name: "Sarah M.",
    joinDate: "2 days ago",
    earnings: 25.5,
    status: "active",
    avatar: "",
  },
  {
    id: "2",
    name: "Mike R.",
    joinDate: "1 week ago",
    earnings: 78.25,
    status: "active",
    avatar: "",
  },
  {
    id: "3",
    name: "Lisa K.",
    joinDate: "2 weeks ago",
    earnings: 156.75,
    status: "active",
    avatar: "",
  },
  {
    id: "4",
    name: "David P.",
    joinDate: "3 weeks ago",
    earnings: 89.5,
    status: "active",
    avatar: "",
  },
  {
    id: "5",
    name: "Emma W.",
    joinDate: "1 month ago",
    earnings: 234.25,
    status: "inactive",
    avatar: "",
  },
  {
    id: "6",
    name: "James L.",
    joinDate: "1 month ago",
    earnings: 67.8,
    status: "active",
    avatar: "",
  },
];

const monthlyBonuses = [
  { month: "November 2024", referrals: 3, bonus: 50, claimed: true },
  { month: "October 2024", referrals: 2, bonus: 25, claimed: true },
  { month: "September 2024", referrals: 4, bonus: 75, claimed: true },
  { month: "August 2024", referrals: 1, bonus: 10, claimed: true },
];

export default function Referrals() {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    const text =
      "Join me on CoinKrazy.com and start winning big! Use my referral code for bonus spins.";
    const url = mockReferralData.link;

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const getCurrentTier = () => {
    return (
      tiers.find((tier) => tier.name === mockReferralData.currentTier) ||
      tiers[0]
    );
  };

  const getNextTier = () => {
    const currentIndex = tiers.findIndex(
      (tier) => tier.name === mockReferralData.currentTier,
    );
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Referral Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Invite friends and earn up to 25% commission on their winnings! The
            more you refer, the more you earn.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Referrals
              </CardTitle>
              <Users className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple">
                {mockReferralData.totalReferrals}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockReferralData.activeReferrals} active players
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">
                ${mockReferralData.totalEarnings}
              </div>
              <p className="text-xs text-muted-foreground">
                ${mockReferralData.monthlyEarnings} this month
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commission Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal">
                {mockReferralData.commissionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {getCurrentTier()?.name} tier
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Earnings
              </CardTitle>
              <Gift className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${mockReferralData.weeklyEarnings}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code & Link */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-purple" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>
                  Share your unique code or link to start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Referral Code</label>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1 p-3 bg-card border rounded-lg font-mono text-lg text-center">
                        {mockReferralData.code}
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            mockReferralData.code,
                            "Referral Code",
                          )
                        }
                        variant="outline"
                        className="px-3"
                      >
                        {copied === "Referral Code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Referral Link</label>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1 p-3 bg-card border rounded-lg text-sm break-all">
                        {mockReferralData.link}
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            mockReferralData.link,
                            "Referral Link",
                          )
                        }
                        variant="outline"
                        className="px-3"
                      >
                        {copied === "Referral Link" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">
                    Share on Social Media
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => shareOnSocial("twitter")}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("facebook")}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("whatsapp")}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal" />
                  Your Referrals
                </CardTitle>
                <CardDescription>
                  Track your referred players and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralHistory.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-card/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={referral.avatar}
                          alt={referral.name}
                        />
                        <AvatarFallback>
                          {referral.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{referral.name}</span>
                          <Badge
                            variant={
                              referral.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              referral.status === "active"
                                ? "bg-success text-white"
                                : ""
                            }
                          >
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Joined {referral.joinDate}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-gold">
                          +${referral.earnings}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Commission earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tier Progress */}
            <Card className="glass border-purple/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getCurrentTier()?.color}`}
                  >
                    {mockReferralData.currentTier}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current tier - {mockReferralData.commissionRate}% commission
                  </p>
                </div>

                {getNextTier() && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to {getNextTier()?.name}</span>
                        <span>{mockReferralData.tierProgress}%</span>
                      </div>
                      <Progress
                        value={mockReferralData.tierProgress}
                        className="h-2"
                      />
                    </div>

                    <div className="text-center p-3 bg-card/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Refer{" "}
                        <span className="font-semibold text-purple">
                          {mockReferralData.referralsNeeded} more friends
                        </span>{" "}
                        to reach
                      </p>
                      <p className={`font-semibold ${getNextTier()?.color}`}>
                        {getNextTier()?.name} ({getNextTier()?.rate}%
                        commission)
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Commission Tiers */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple" />
                  Commission Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={`p-3 rounded-lg border ${
                      tier.name === mockReferralData.currentTier
                        ? "border-purple bg-purple/10"
                        : "border-border bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold ${tier.color}`}>
                          {tier.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tier.minReferrals}+ referrals
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${tier.color}`}>
                        {tier.rate}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Bonuses */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-gold" />
                  Monthly Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthlyBonuses.map((bonus, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-card/30"
                  >
                    <div>
                      <div className="text-sm font-medium">{bonus.month}</div>
                      <div className="text-xs text-muted-foreground">
                        {bonus.referrals} referrals
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gold">
                        +${bonus.bonus}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {bonus.claimed ? "Claimed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>Share your referral code or link with friends</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>They sign up and start playing using your code</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>Earn commission on their winnings automatically</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <p>Unlock higher tiers for better commission rates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
