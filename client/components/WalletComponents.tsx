import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  CreditCard,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Gem,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Smartphone,
  Mail,
  Building2,
  Bitcoin,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  History,
  Star,
  Award,
  Banknote,
} from "lucide-react";

interface SpendingLimit {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  amount: number;
  currentUsed: number;
  enabled: boolean;
  category: "withdrawal" | "gaming" | "total";
}

interface AutoWithdrawal {
  id: string;
  enabled: boolean;
  threshold: number;
  method: string;
  percentage: number;
  lastTriggered?: Date;
}

interface WalletInsight {
  id: string;
  type: "spending" | "earning" | "saving" | "risk";
  title: string;
  description: string;
  value: number;
  change: number;
  recommendation?: string;
  severity: "low" | "medium" | "high";
}

// Spending Limits Manager
export function SpendingLimitsManager() {
  const [limits, setLimits] = useState<SpendingLimit[]>([
    {
      id: "daily_withdrawal",
      name: "Daily Withdrawal Limit",
      type: "daily",
      amount: 500,
      currentUsed: 150,
      enabled: true,
      category: "withdrawal",
    },
    {
      id: "weekly_gaming",
      name: "Weekly Gaming Budget",
      type: "weekly",
      amount: 200,
      currentUsed: 45,
      enabled: true,
      category: "gaming",
    },
    {
      id: "monthly_total",
      name: "Monthly Spending Limit",
      type: "monthly",
      amount: 1000,
      currentUsed: 320,
      enabled: false,
      category: "total",
    },
  ]);

  const [isAddingLimit, setIsAddingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState({
    name: "",
    type: "daily" as SpendingLimit["type"],
    amount: 100,
    category: "withdrawal" as SpendingLimit["category"],
  });

  const updateLimit = (id: string, updates: Partial<SpendingLimit>) => {
    setLimits((prev) =>
      prev.map((limit) => (limit.id === id ? { ...limit, ...updates } : limit)),
    );
  };

  const addLimit = () => {
    const limit: SpendingLimit = {
      id: Date.now().toString(),
      name: newLimit.name,
      type: newLimit.type,
      amount: newLimit.amount,
      currentUsed: 0,
      enabled: true,
      category: newLimit.category,
    };
    setLimits([...limits, limit]);
    setNewLimit({
      name: "",
      type: "daily",
      amount: 100,
      category: "withdrawal",
    });
    setIsAddingLimit(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Spending Limits
            </CardTitle>
            <CardDescription>
              Set responsible gaming limits to control your spending
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingLimit(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Limit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map((limit) => (
          <div key={limit.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium">{limit.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {limit.type} • {limit.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={limit.enabled}
                  onCheckedChange={(enabled) =>
                    updateLimit(limit.id, { enabled })
                  }
                />
                <Badge
                  variant={limit.enabled ? "default" : "secondary"}
                  className="text-xs"
                >
                  {limit.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            </div>

            {limit.enabled && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: ${limit.currentUsed}</span>
                  <span>Limit: ${limit.amount}</span>
                </div>
                <Progress
                  value={(limit.currentUsed / limit.amount) * 100}
                  className={
                    limit.currentUsed / limit.amount > 0.8
                      ? "bg-red-100 [&>div]:bg-red-500"
                      : limit.currentUsed / limit.amount > 0.6
                        ? "bg-yellow-100 [&>div]:bg-yellow-500"
                        : "bg-green-100 [&>div]:bg-green-500"
                  }
                />
                <div className="text-xs text-muted-foreground">
                  ${(limit.amount - limit.currentUsed).toFixed(2)} remaining
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Limit Dialog */}
        <Dialog open={isAddingLimit} onOpenChange={setIsAddingLimit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Spending Limit</DialogTitle>
              <DialogDescription>
                Create a new spending limit to help manage your gaming budget
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Limit Name</Label>
                <Input
                  value={newLimit.name}
                  onChange={(e) =>
                    setNewLimit({ ...newLimit, name: e.target.value })
                  }
                  placeholder="e.g., Weekend Gaming Budget"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Period</Label>
                  <Select
                    value={newLimit.type}
                    onValueChange={(value) =>
                      setNewLimit({ ...newLimit, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={newLimit.category}
                    onValueChange={(value) =>
                      setNewLimit({ ...newLimit, category: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="total">Total Spending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Amount Limit ($)</Label>
                <Input
                  type="number"
                  value={newLimit.amount}
                  onChange={(e) =>
                    setNewLimit({ ...newLimit, amount: Number(e.target.value) })
                  }
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addLimit} className="flex-1">
                  Create Limit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingLimit(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Auto Withdrawal Settings
export function AutoWithdrawalSettings() {
  const [autoWithdrawal, setAutoWithdrawal] = useState<AutoWithdrawal>({
    id: "auto_1",
    enabled: false,
    threshold: 100,
    method: "paypal",
    percentage: 50,
    lastTriggered: undefined,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          Auto-Withdrawal
        </CardTitle>
        <CardDescription>
          Automatically withdraw funds when balance reaches a threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Enable Auto-Withdrawal</h4>
            <p className="text-sm text-muted-foreground">
              Automatically withdraw when balance reaches threshold
            </p>
          </div>
          <Switch
            checked={autoWithdrawal.enabled}
            onCheckedChange={(enabled) =>
              setAutoWithdrawal({ ...autoWithdrawal, enabled })
            }
          />
        </div>

        {autoWithdrawal.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label>Trigger Threshold (SC)</Label>
              <Input
                type="number"
                value={autoWithdrawal.threshold}
                onChange={(e) =>
                  setAutoWithdrawal({
                    ...autoWithdrawal,
                    threshold: Number(e.target.value),
                  })
                }
                min="100"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Withdraw when balance reaches this amount
              </p>
            </div>

            <div>
              <Label>Withdrawal Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={autoWithdrawal.percentage}
                  onChange={(e) =>
                    setAutoWithdrawal({
                      ...autoWithdrawal,
                      percentage: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="100"
                  step="1"
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  % of balance
                </span>
              </div>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={autoWithdrawal.method}
                onValueChange={(method) =>
                  setAutoWithdrawal({ ...autoWithdrawal, method })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Preview:</strong> When your balance reaches{" "}
                {autoWithdrawal.threshold} SC,
                {autoWithdrawal.percentage}% (
                {(
                  (autoWithdrawal.threshold * autoWithdrawal.percentage) /
                  100
                ).toFixed(2)}{" "}
                SC) will be automatically withdrawn to your{" "}
                {autoWithdrawal.method}.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Wallet Insights
export function WalletInsights() {
  const [insights] = useState<WalletInsight[]>([
    {
      id: "spending_trend",
      type: "spending",
      title: "Weekly Spending Down",
      description: "You've spent 23% less this week compared to last week",
      value: 23,
      change: -23,
      recommendation: "Great job! Keep maintaining healthy spending habits.",
      severity: "low",
    },
    {
      id: "earning_streak",
      type: "earning",
      title: "5-Day Winning Streak",
      description: "You've had positive sessions for 5 consecutive days",
      value: 5,
      change: 5,
      recommendation: "Consider setting aside some winnings for future play.",
      severity: "low",
    },
    {
      id: "balance_risk",
      type: "risk",
      title: "Low Balance Alert",
      description: "Your balance is below your typical playing amount",
      value: 45,
      change: -55,
      recommendation: "Consider taking a break or depositing more funds.",
      severity: "medium",
    },
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "spending":
        return <DollarSign className="h-5 w-5 text-red-500" />;
      case "earning":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "saving":
        return <Target className="h-5 w-5 text-blue-500" />;
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-purple-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-green-500 bg-green-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Wallet Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights about your gaming and spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 border rounded-lg ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-white">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <p className="text-sm font-medium text-blue-600">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
              <Badge
                variant={insight.change >= 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {insight.change >= 0 ? "+" : ""}
                {insight.change}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Balance Protection
export function BalanceProtection() {
  const [protection, setProtection] = useState({
    lowBalanceAlert: true,
    threshold: 50,
    pauseGaming: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Balance Protection
        </CardTitle>
        <CardDescription>
          Protect your funds with smart alerts and controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Low Balance Alerts</h4>
            <p className="text-sm text-muted-foreground">
              Get notified when your balance is low
            </p>
          </div>
          <Switch
            checked={protection.lowBalanceAlert}
            onCheckedChange={(checked) =>
              setProtection({ ...protection, lowBalanceAlert: checked })
            }
          />
        </div>

        {protection.lowBalanceAlert && (
          <div className="ml-4 space-y-3">
            <div>
              <Label>Alert Threshold (SC)</Label>
              <Input
                type="number"
                value={protection.threshold}
                onChange={(e) =>
                  setProtection({
                    ...protection,
                    threshold: Number(e.target.value),
                  })
                }
                min="1"
                step="0.01"
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">
                Pause gaming when threshold reached
              </span>
              <Switch
                checked={protection.pauseGaming}
                onCheckedChange={(checked) =>
                  setProtection({ ...protection, pauseGaming: checked })
                }
              />
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Notification Methods</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Email Notifications</span>
            </div>
            <Switch
              checked={protection.emailNotifications}
              onCheckedChange={(checked) =>
                setProtection({ ...protection, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-500" />
              <span className="text-sm">SMS Notifications</span>
            </div>
            <Switch
              checked={protection.smsNotifications}
              onCheckedChange={(checked) =>
                setProtection({ ...protection, smsNotifications: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Transaction Analytics
export function TransactionAnalytics() {
  const [timeframe, setTimeframe] = useState("7d");
  const [analytics] = useState({
    totalTransactions: 47,
    totalVolume: 1256.75,
    avgTransactionSize: 26.74,
    largestTransaction: 150.0,
    winRate: 68,
    netProfit: 234.5,
    categories: [
      { name: "Winnings", value: 45, amount: 890.25 },
      { name: "Withdrawals", value: 15, amount: -450.0 },
      { name: "Bonuses", value: 25, amount: 125.5 },
      { name: "Referrals", value: 15, amount: 78.25 },
    ],
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Transaction Analytics
            </CardTitle>
            <CardDescription>
              Detailed analysis of your transaction patterns
            </CardDescription>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">
              {analytics.totalTransactions}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Transactions
            </div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">
              ${analytics.totalVolume.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">
              ${analytics.avgTransactionSize.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Size</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-green-500">
              {analytics.winRate}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="font-medium mb-3">Transaction Categories</h4>
          <div className="space-y-2">
            {analytics.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index === 0
                        ? "bg-green-500"
                        : index === 1
                          ? "bg-red-500"
                          : index === 2
                            ? "bg-blue-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category.value}%</div>
                  <div
                    className={`text-xs ${
                      category.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(category.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Net Profit ({timeframe})</h4>
              <p className="text-sm text-muted-foreground">
                Total earnings minus withdrawals
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                +${analytics.netProfit.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                +12.5% vs last period
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
