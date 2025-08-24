import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SpendingLimitsManager,
  AutoWithdrawalSettings,
  WalletInsights,
  BalanceProtection,
  TransactionAnalytics,
} from "@/components/WalletComponents";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Coins,
  Gem,
  Trophy,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Plus,
  Download,
  Upload,
  Smartphone,
  Mail,
  Building2,
  Bitcoin,
  RefreshCw,
  Star,
  Award,
  Lock,
  Unlock,
  Bell,
  Calendar,
  History,
  Filter,
  Search,
} from "lucide-react";

export default function WalletEnhanced() {
  const { user: authUser } = useAuth();
  const { user, getTransactionHistory } = useCurrency();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock enhanced data
  const walletData = {
    totalValue:
      (user?.balance.goldCoins || 0) * 0.01 + (user?.balance.sweepCoins || 0),
    dayChange: 12.5,
    weekChange: -5.2,
    monthChange: 23.8,
    performanceScore: 87,
    riskLevel: "Medium",
    lastUpdate: new Date(),
  };

  const quickStats = [
    {
      label: "Today's P&L",
      value: "+$12.50",
      change: +12.5,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Weekly P&L",
      value: "-$5.20",
      change: -5.2,
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      label: "Monthly P&L",
      value: "+$23.80",
      change: +23.8,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Win Rate",
      value: "68%",
      change: +5,
      icon: Target,
      color: "text-blue-500",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "win",
      description: "Poker Tournament Win",
      amount: 45.5,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      description: "PayPal Withdrawal",
      amount: -100.0,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "processing",
    },
    {
      id: "3",
      type: "bonus",
      description: "Daily Login Bonus",
      amount: 5.0,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "completed",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "win":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
      case "bonus":
        return <Star className="h-4 w-4 text-gold" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Digital Wallet
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete financial management for your gaming experience
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Gold Coins */}
          <Card className="glass border-gold/50 hover:border-gold transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gold">
                Gold Coins
              </CardTitle>
              <Coins className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {showBalance
                  ? user?.balance.goldCoins.toLocaleString() || 0
                  : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fun Play Currency • Non-Withdrawable
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+15% this week</span>
              </div>
            </CardContent>
          </Card>

          {/* Sweep Coins */}
          <Card className="glass border-teal/50 hover:border-teal transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal">
                Sweep Coins
              </CardTitle>
              <Gem className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal">
                {showBalance
                  ? user?.balance.sweepCoins.toFixed(2) || "0.00"
                  : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Real Money Value • Withdrawable
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">-2% this week</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Portfolio Value */}
          <Card className="glass border-purple/50 hover:border-purple transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple">
                Portfolio Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple">
                {showBalance
                  ? `$${walletData.totalValue.toFixed(2)}`
                  : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Combined Asset Value
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">
                  +{walletData.monthChange}% this month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card className="glass border-green/50 hover:border-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-500">
                Performance Score
              </CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {showBalance ? walletData.performanceScore : "••"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Risk Level: {walletData.riskLevel}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">Excellent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Performance Stats */}
        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                    <Badge
                      variant={stat.change >= 0 ? "default" : "secondary"}
                      className="mt-1 text-xs"
                    >
                      {stat.change >= 0 ? "+" : ""}
                      {stat.change}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="protection">Protection</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest transactions and activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {activity.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            activity.amount > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {activity.amount > 0 ? "+" : ""}$
                          {Math.abs(activity.amount).toFixed(2)}
                        </div>
                        <Badge
                          variant={
                            activity.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <History className="h-4 w-4 mr-2" />
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>

              {/* Wallet Insights */}
              <WalletInsights />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Balance Protection */}
              <BalanceProtection />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common wallet operations</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button className="h-auto flex-col p-4 gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    <span>Withdraw</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Payment</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Limits</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Advanced Transaction Management
              </h3>
              <p className="text-muted-foreground mb-4">
                Detailed transaction history with advanced filtering and search
                capabilities
              </p>
              <Button asChild>
                <Link to="/wallet">
                  <History className="h-4 w-4 mr-2" />
                  Open Full Transaction History
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <TransactionAnalytics />
          </TabsContent>

          {/* Protection Tab */}
          <TabsContent value="protection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingLimitsManager />
              <BalanceProtection />
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <AutoWithdrawalSettings />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control how your wallet information is displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Hide Balance by Default</h4>
                      <p className="text-sm text-muted-foreground">
                        Always hide wallet balances when opening the page
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Transaction Privacy</h4>
                      <p className="text-sm text-muted-foreground">
                        Hide transaction amounts in activity feeds
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Performance Metrics</h4>
                      <p className="text-sm text-muted-foreground">
                        Show detailed performance analytics
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize how you receive wallet notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Security Alerts</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export & Backup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-purple-500" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export transaction data and manage your wallet information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Export CSV</span>
                    <span className="text-xs text-muted-foreground">
                      Transaction history
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Generate Report</span>
                    <span className="text-xs text-muted-foreground">
                      Monthly summary
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col p-4 gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Backup Settings</span>
                    <span className="text-xs text-muted-foreground">
                      Save preferences
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
