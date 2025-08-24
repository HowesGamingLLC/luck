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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCurrency,
  CurrencyType,
  formatCurrency,
  getCurrencyColor,
  getCurrencyIcon,
} from "@/contexts/CurrencyContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  X,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Lock,
  Smartphone,
  Building,
  Bitcoin,
} from "lucide-react";

// Mock wallet data
const mockWalletData = {
  balance: 1250.5,
  pending: 75.25,
  totalWithdrawn: 2340.75,
  totalDeposited: 0, // Free-to-play platform
  verificationStatus: "verified",
  lastTransaction: "2 hours ago",
};

const paymentMethods = [
  {
    id: "1",
    type: "paypal",
    name: "PayPal",
    details: "john.doe@example.com",
    verified: true,
    primary: true,
    icon: "🟦",
  },
  {
    id: "2",
    type: "bank",
    name: "Bank Account",
    details: "**** **** 1234",
    verified: true,
    primary: false,
    icon: "🏦",
  },
  {
    id: "3",
    type: "crypto",
    name: "Bitcoin",
    details: "bc1q...x7z9",
    verified: false,
    primary: false,
    icon: "₿",
  },
];

const transactionHistory = [
  {
    id: "1",
    type: "withdrawal",
    amount: -150.0,
    status: "completed",
    method: "PayPal",
    date: "2024-01-20",
    time: "14:30",
    description: "Withdrawal to PayPal",
    fee: 0,
  },
  {
    id: "2",
    type: "win",
    amount: 75.0,
    status: "completed",
    method: "Daily Spin",
    date: "2024-01-20",
    time: "12:15",
    description: "Prize from Daily Spin Wheel",
    fee: 0,
  },
  {
    id: "3",
    type: "referral",
    amount: 25.5,
    status: "completed",
    method: "Commission",
    date: "2024-01-19",
    time: "16:45",
    description: "Referral commission from Sarah M.",
    fee: 0,
  },
  {
    id: "4",
    type: "withdrawal",
    amount: -200.0,
    status: "pending",
    method: "Bank Transfer",
    date: "2024-01-19",
    time: "09:20",
    description: "Withdrawal to Bank Account",
    fee: 0,
  },
  {
    id: "5",
    type: "win",
    amount: 50.0,
    status: "completed",
    method: "Daily Spin",
    date: "2024-01-18",
    time: "11:30",
    description: "Prize from Daily Spin Wheel",
    fee: 0,
  },
  {
    id: "6",
    type: "bonus",
    amount: 15.0,
    status: "completed",
    method: "Welcome Bonus",
    date: "2024-01-17",
    time: "10:00",
    description: "New player welcome bonus",
    fee: 0,
  },
];

export default function WalletPage() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { user, getTransactionHistory } = useCurrency();
  const MIN_WITHDRAWAL_SC = 100;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case "win":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "referral":
        return <DollarSign className="h-4 w-4 text-gold" />;
      case "bonus":
        return <Plus className="h-4 w-4 text-purple" />;
      default:
        return <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning text-black">Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive text-white">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTransactions = transactionHistory.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleWithdraw = () => {
    // In real app, this would process the withdrawal
    console.log("Processing withdrawal:", {
      amount: withdrawAmount,
      method: selectedMethod,
    });
    setIsWithdrawOpen(false);
    setWithdrawAmount("");
    setSelectedMethod("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Wallet & Payments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your balance, track your winnings, and withdraw your earnings
            securely.
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-gold/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gold Coins</CardTitle>
              <Coins className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {user?.balance.goldCoins.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">Fun Play Balance</p>
            </CardContent>
          </Card>

          <Card className="glass border-teal/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sweep Coins</CardTitle>
              <Gem className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal">
                {user?.balance.sweepCoins.toFixed(2) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {(user?.balance.sweepCoins || 0) >= MIN_WITHDRAWAL_SC
                  ? "Ready for withdrawal"
                  : `Need ${(MIN_WITHDRAWAL_SC - (user?.balance.sweepCoins || 0)).toFixed(2)} SC to withdraw`}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Won</CardTitle>
              <Trophy className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {(
                  (user?.totalWon.goldCoins || 0) +
                  (user?.totalWon.sweepCoins || 0)
                ).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                GC: {user?.totalWon.goldCoins || 0} • SC:{" "}
                {(user?.totalWon.sweepCoins || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Withdrawal Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple">
                {(user?.balance.sweepCoins || 0) >= MIN_WITHDRAWAL_SC
                  ? "Ready"
                  : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground">
                Min: {MIN_WITHDRAWAL_SC} SC
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">Account Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Last transaction: {mockWalletData.lastTransaction}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gold">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Sweep Coins</DialogTitle>
                      <DialogDescription>
                        Only Sweep Coins can be withdrawn. Minimum withdrawal:{" "}
                        {MIN_WITHDRAWAL_SC} SC
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* SC Balance Display */}
                      <div className="bg-teal/10 border border-teal/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Gem className="h-4 w-4 text-teal" />
                            Available Sweep Coins
                          </span>
                          <span className="font-semibold text-teal">
                            {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
                          </span>
                        </div>
                      </div>

                      {(user?.balance.sweepCoins || 0) >= MIN_WITHDRAWAL_SC ? (
                        <>
                          <div>
                            <Label htmlFor="amount">Amount (SC)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={withdrawAmount}
                              onChange={(e) =>
                                setWithdrawAmount(e.target.value)
                              }
                              min={MIN_WITHDRAWAL_SC}
                              max={user?.balance.sweepCoins || 0}
                              step="0.01"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Minimum: {MIN_WITHDRAWAL_SC} SC • Available:{" "}
                              {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-warning">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">
                              Insufficient Balance
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            You need at least {MIN_WITHDRAWAL_SC} SC to make a
                            withdrawal. Current balance:{" "}
                            {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Play games to earn more Sweep Coins!
                          </p>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="method">Payment Method</Label>
                        <Select
                          value={selectedMethod}
                          onValueChange={setSelectedMethod}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods
                              .filter((method) => method.verified)
                              .map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{method.icon}</span>
                                    <span>{method.name}</span>
                                    {method.primary && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Primary
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {(user?.balance.sweepCoins || 0) >= MIN_WITHDRAWAL_SC && (
                        <div className="bg-card/50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Withdrawal Amount:</span>
                            <span className="text-teal font-semibold">
                              {withdrawAmount || "0.00"} SC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Processing Fee:</span>
                            <span className="text-success">FREE</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>USD Equivalent:</span>
                            <span className="text-muted-foreground">
                              ~${withdrawAmount || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                            <span>You'll Receive:</span>
                            <span className="text-teal">
                              {withdrawAmount || "0.00"} SC
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsWithdrawOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleWithdraw}
                        disabled={
                          !withdrawAmount ||
                          !selectedMethod ||
                          parseFloat(withdrawAmount) < MIN_WITHDRAWAL_SC ||
                          parseFloat(withdrawAmount) >
                            (user?.balance.sweepCoins || 0) ||
                          (user?.balance.sweepCoins || 0) < MIN_WITHDRAWAL_SC
                        }
                        className="bg-teal hover:bg-teal-dark text-white"
                      >
                        {(user?.balance.sweepCoins || 0) < MIN_WITHDRAWAL_SC
                          ? `Need ${MIN_WITHDRAWAL_SC} SC to Withdraw`
                          : "Confirm Withdrawal"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isAddMethodOpen}
                  onOpenChange={setIsAddMethodOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new payment method for withdrawals.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="glass cursor-pointer hover:border-purple transition-colors p-4 text-center">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple" />
                          <p className="text-sm font-medium">PayPal</p>
                        </Card>
                        <Card className="glass cursor-pointer hover:border-purple transition-colors p-4 text-center">
                          <Building className="h-8 w-8 mx-auto mb-2 text-purple" />
                          <p className="text-sm font-medium">Bank</p>
                        </Card>
                        <Card className="glass cursor-pointer hover:border-purple transition-colors p-4 text-center">
                          <Bitcoin className="h-8 w-8 mx-auto mb-2 text-purple" />
                          <p className="text-sm font-medium">Crypto</p>
                        </Card>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddMethodOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              </TabsList>

              {/* Transactions Tab */}
              <TabsContent value="transactions">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      View all your winnings, withdrawals, and commissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="win">Winnings</SelectItem>
                          <SelectItem value="withdrawal">
                            Withdrawals
                          </SelectItem>
                          <SelectItem value="referral">Referrals</SelectItem>
                          <SelectItem value="bonus">Bonuses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-card">
                            {getTransactionIcon(transaction.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {transaction.description}
                              </span>
                              <div className="text-right">
                                <div
                                  className={`font-semibold ${
                                    transaction.amount > 0
                                      ? "text-success"
                                      : "text-foreground"
                                  }`}
                                >
                                  {transaction.amount > 0 ? "+" : ""}$
                                  {Math.abs(transaction.amount).toFixed(2)}
                                </div>
                                {transaction.fee > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Fee: ${transaction.fee.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {transaction.method} • {transaction.date} at{" "}
                                {transaction.time}
                              </span>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="methods">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your withdrawal payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-lg border"
                      >
                        <div className="text-2xl">{method.icon}</div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{method.name}</span>
                            {method.primary && (
                              <Badge className="bg-purple text-white">
                                Primary
                              </Badge>
                            )}
                            {method.verified ? (
                              <Badge className="bg-success text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-warning">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.details}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          {!method.primary && (
                            <Button variant="outline" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Status */}
            <Card className="glass border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verified</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">2FA Enabled</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Verification</span>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Limits */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Withdrawal Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Minimum</span>
                  <span className="font-semibold">$10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Daily Limit</span>
                  <span className="font-semibold">$5,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Limit</span>
                  <span className="font-semibold">$50,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Time</span>
                  <span className="font-semibold">24-48h</span>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Transaction Dispute
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
