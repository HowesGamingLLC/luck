import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailySpinWheel } from "@/components/DailySpinWheel";
import { ProgressiveJackpot } from "@/components/ProgressiveJackpot";
import { QuickActions } from "@/components/QuickActions";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrency,
  CurrencyType,
  formatCurrency,
  getCurrencyColor,
} from "@/contexts/CurrencyContext";
import {
  Coins,
  Gem,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Gift,
  Zap,
  Crown,
  Target,
  Clock,
  Users,
  ShoppingCart,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  probability: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const {
    user: currencyUser,
    canClaimDailySpin,
    claimDailySpin,
    getTransactionHistory,
  } = useCurrency();
  const [dailySpinClaimed, setDailySpinClaimed] = useState(false);
  const [welcomeBonusClaimed, setWelcomeBonusClaimed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  useEffect(() => {
    setDailySpinClaimed(!canClaimDailySpin());
    setWelcomeBonusClaimed(!currencyUser?.isNewUser);
  }, [canClaimDailySpin, currencyUser?.isNewUser]);

  const handleDailySpinResult = (result: WheelSegment) => {
    claimDailySpin();
    setDailySpinClaimed(true);
    console.log(`Daily Spin Won: ${result.label}`);
  };

  const handleClaimWelcomeBonus = () => {
    // This would be handled by the currency context
    setWelcomeBonusClaimed(true);
  };

  const getKYCStatusInfo = () => {
    if (!user)
      return { icon: XCircle, text: "Unknown", color: "text-gray-500" };

    switch (user.kycStatus) {
      case "approved":
        return { icon: CheckCircle, text: "Verified", color: "text-green-500" };
      case "pending":
        return {
          icon: Clock,
          text: "Pending Review",
          color: "text-yellow-500",
        };
      case "rejected":
        return { icon: XCircle, text: "Rejected", color: "text-red-500" };
      default:
        return {
          icon: AlertCircle,
          text: "Not Submitted",
          color: "text-orange-500",
        };
    }
  };

  const transactions = getTransactionHistory();
  const recentTransactions = transactions.slice(0, 5);

  const gameStats = [
    {
      label: "Gold Coins",
      value: `${currencyUser?.balance.goldCoins.toLocaleString() || 0} GC`,
      icon: Coins,
      color: "text-gold",
      description: "Fun Play Currency",
    },
    {
      label: "Sweep Coins",
      value: `${currencyUser?.balance.sweepCoins.toFixed(2) || 0} SC`,
      icon: Gem,
      color: "text-teal",
      description: "Real Money Currency",
    },
    {
      label: "Total Won",
      value: `${((currencyUser?.totalWon.goldCoins || 0) + (currencyUser?.totalWon.sweepCoins || 0)).toFixed(2)}`,
      icon: Trophy,
      color: "text-success",
      description: "Lifetime Winnings",
    },
    {
      label: "Player Level",
      value: `Level ${currencyUser?.level || 1}`,
      icon: Star,
      color: "text-purple",
      description: "Your Current Rank",
    },
  ];

  const kycStatus = getKYCStatusInfo();
  const KYCIcon = kycStatus.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to play and win big today?
          </p>
        </div>

        {/* Welcome Bonus Banner */}
        {!welcomeBonusClaimed && currencyUser?.isNewUser && (
          <Card className="mb-8 border-gold bg-gradient-to-r from-gold/10 to-gold/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Gift className="h-8 w-8 text-gold" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Welcome Bonus Available!
                    </h3>
                    <p className="text-muted-foreground">
                      Claim your free 10,000 GC + 10 SC to get started
                    </p>
                  </div>
                </div>
                <Button onClick={handleClaimWelcomeBonus} className="btn-gold">
                  Claim Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Status Banner */}
        {user?.kycStatus !== "approved" && (
          <Card className="mb-8 border-orange-500 bg-gradient-to-r from-orange-500/10 to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <KYCIcon className={`h-8 w-8 ${kycStatus.color}`} />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Identity Verification
                    </h3>
                    <p className="text-muted-foreground">
                      {user?.kycStatus === "not_submitted"
                        ? "Complete KYC verification to enable withdrawals"
                        : "Your verification is being reviewed"}
                    </p>
                  </div>
                </div>
                {user?.kycStatus === "not_submitted" && (
                  <Button asChild className="btn-primary">
                    <Link to="/kyc">Start Verification</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification:</span>
                  <Badge
                    variant={
                      user?.kycStatus === "approved" ? "default" : "secondary"
                    }
                  >
                    {kycStatus.text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jackpot Opt-in:</span>
                  <Badge variant={user?.jackpotOptIn ? "default" : "secondary"}>
                    {user?.jackpotOptIn ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since:</span>
                  <span className="text-sm font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <span>Your Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-sm">{stat.label}</span>
                        </div>
                        <span className={`font-semibold ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/store">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Gold Coins
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/games">
                    <Target className="h-4 w-4 mr-2" />
                    Play Games
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/withdraw">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Daily Spin & Jackpot */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Spin Wheel */}
            <Card className="glass">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5 text-gold" />
                  <span>Daily Spin Wheel</span>
                </CardTitle>
                <CardDescription>
                  {dailySpinClaimed
                    ? "Come back tomorrow for your next spin!"
                    : "Spin once every 24 hours for free rewards!"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DailySpinWheel
                  size={300}
                  onSpin={handleDailySpinResult}
                  disabled={dailySpinClaimed}
                />
              </CardContent>
            </Card>

            {/* Progressive Jackpot */}
            <ProgressiveJackpot />

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              transaction.type === "win"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.type}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.timestamp.toLocaleDateString()} at{" "}
                              {transaction.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(
                            Math.abs(transaction.amount),
                            transaction.currency,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity. Start playing to see your transaction
                    history!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Additional Info */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple" />
                  <span>Level Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">
                    Level {currencyUser?.level || 1}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(currencyUser?.totalWagered.goldCoins || 0) +
                      (currencyUser?.totalWagered.sweepCoins || 0) * 100}{" "}
                    XP
                  </p>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current</span>
                  <span>Next Level</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-gold" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">First Win</p>
                    <p className="text-xs text-muted-foreground">
                      Win your first game
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      High Roller
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wager $100 total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-teal" />
                  <span>Need Help?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/help">
                    <FileText className="h-4 w-4 mr-2" />
                    Help Center
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
