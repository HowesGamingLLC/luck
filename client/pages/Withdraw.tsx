import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrency,
  formatCurrency,
  CurrencyType,
} from "@/contexts/CurrencyContext";
import {
  Banknote,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  DollarSign,
  Calendar,
  Info,
  ExternalLink,
} from "lucide-react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: "bank" | "paypal" | "crypto";
  status: "pending" | "processing" | "completed" | "rejected";
  requestedAt: Date;
  processedAt?: Date;
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    accountHolder: string;
  };
  paypalEmail?: string;
  cryptoAddress?: string;
  fees: number;
  netAmount: number;
  rejectionReason?: string;
}

export default function Withdraw() {
  const { user } = useAuth();
  const { user: currencyUser } = useCurrency();
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<
    "bank" | "paypal" | "crypto"
  >("bank");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountHolder: "",
    bankName: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock withdrawal history
  const [withdrawalHistory] = useState<WithdrawalRequest[]>([
    {
      id: "WD001",
      amount: 150.0,
      method: "bank",
      status: "completed",
      requestedAt: new Date("2024-01-20"),
      processedAt: new Date("2024-01-22"),
      bankDetails: {
        accountNumber: "****1234",
        routingNumber: "****5678",
        accountHolder: "John Doe",
      },
      fees: 2.5,
      netAmount: 147.5,
    },
    {
      id: "WD002",
      amount: 75.25,
      method: "paypal",
      status: "processing",
      requestedAt: new Date("2024-01-21"),
      paypalEmail: "j***@example.com",
      fees: 1.5,
      netAmount: 73.75,
    },
    {
      id: "WD003",
      amount: 25.0,
      method: "bank",
      status: "rejected",
      requestedAt: new Date("2024-01-19"),
      rejectionReason: "Insufficient account verification",
      fees: 2.5,
      netAmount: 22.5,
    },
  ]);

  const availableBalance = currencyUser?.balance.sweepCoins || 0;
  const minWithdrawal = 100.0; // Updated minimum to 100 SC
  const maxWithdrawal = 1000.0;

  const fees = {
    bank: 2.5,
    paypal: 1.5,
    crypto: 0.5,
  };

  const calculateNetAmount = (
    amount: number,
    method: "bank" | "paypal" | "crypto",
  ): number => {
    return Math.max(0, amount - fees[method]);
  };

  const canWithdraw = () => {
    if (!user) return {
      canWithdraw: false,
      reason: "Not logged in",
      details: "Please log in to your account to request withdrawals."
    };

    if (user.kycStatus !== "approved") {
      const kycMessage = user.kycStatus === "pending"
        ? "Your KYC verification is being reviewed. Please wait for approval."
        : user.kycStatus === "rejected"
        ? "Your KYC verification was rejected. Please contact support."
        : "Complete identity verification to enable withdrawals.";

      return {
        canWithdraw: false,
        reason: "KYC verification required",
        details: kycMessage
      };
    }

    if (availableBalance < minWithdrawal) {
      return {
        canWithdraw: false,
        reason: `Minimum withdrawal is ${minWithdrawal} SC`,
        details: `You need at least ${minWithdrawal} Sweep Coins to request a withdrawal. You currently have ${availableBalance.toFixed(2)} SC.`
      };
    }

    return { canWithdraw: true, reason: "", details: "" };
  };

  const validateWithdrawal = (): string | null => {
    const amount = parseFloat(withdrawalAmount);
    const eligibility = canWithdraw();

    if (!eligibility.canWithdraw) {
      return eligibility.reason;
    }

    if (isNaN(amount) || amount <= 0) {
      return "Please enter a valid amount";
    }

    if (amount < minWithdrawal) {
      return `Minimum withdrawal amount is ${minWithdrawal} SC`;
    }

    if (amount > maxWithdrawal) {
      return `Maximum withdrawal amount is ${maxWithdrawal} SC per transaction`;
    }

    if (amount > availableBalance) {
      return `Insufficient balance. You have ${availableBalance.toFixed(2)} SC available.`;
    }

    // Method-specific validation
    switch (selectedMethod) {
      case "bank":
        if (
          !bankDetails.accountNumber ||
          !bankDetails.routingNumber ||
          !bankDetails.accountHolder ||
          !bankDetails.bankName
        ) {
          return "Please fill in all bank details";
        }
        break;
      case "paypal":
        if (!paypalEmail || !/\S+@\S+\.\S+/.test(paypalEmail)) {
          return "Please enter a valid PayPal email";
        }
        break;
      case "crypto":
        if (!cryptoAddress || cryptoAddress.length < 10) {
          return "Please enter a valid crypto wallet address";
        }
        break;
    }

    return null;
  };

  const handleSubmitWithdrawal = async () => {
    const validationError = validateWithdrawal();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real app, this would:
    // 1. Create withdrawal request in database
    // 2. Deduct amount from user balance
    // 3. Send to payment processor
    // 4. Send confirmation email

    alert("Withdrawal request submitted successfully!");

    // Reset form
    setWithdrawalAmount("");
    setBankDetails({
      accountNumber: "",
      routingNumber: "",
      accountHolder: "",
      bankName: "",
    });
    setPaypalEmail("");
    setCryptoAddress("");

    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "processing":
        return "text-yellow-500 bg-yellow-500/10";
      case "rejected":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const withdrawalEligibility = canWithdraw();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4 flex items-center justify-center gap-2">
            <Banknote className="h-8 w-8" />
            Withdraw Funds
          </h1>
          <p className="text-xl text-muted-foreground">
            Convert your Sweep Coins to real money
          </p>
        </div>

        {/* Balance Overview */}
        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal">
                  {formatCurrency(availableBalance, CurrencyType.SC)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Available for Withdrawal
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {minWithdrawal} SC - {maxWithdrawal} SC
                </div>
                <p className="text-sm text-muted-foreground">
                  Withdrawal Limits
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1-3 Business Days</div>
                <p className="text-sm text-muted-foreground">Processing Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Check */}
        {!withdrawalEligibility.canWithdraw && (
          <Alert className="mb-8 border-orange-500 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Withdrawal Requirements Not Met:</strong>
                  <p className="mt-1 text-sm">{withdrawalEligibility.details}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">To request withdrawals, you need:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li className="flex items-center gap-2">
                      {user?.kycStatus === "approved" ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      Identity verification (KYC) approved
                    </li>
                    <li className="flex items-center gap-2">
                      {availableBalance >= minWithdrawal ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      Minimum balance of {minWithdrawal} Sweep Coins
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  {user?.kycStatus !== "approved" && (
                    <Button asChild size="sm" className="btn-primary">
                      <Link to="/kyc">
                        <Shield className="h-4 w-4 mr-2" />
                        Complete KYC
                      </Link>
                    </Button>
                  )}
                  {availableBalance < minWithdrawal && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/store">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Coins
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="withdraw" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdraw">New Withdrawal</TabsTrigger>
            <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          </TabsList>

          {/* New Withdrawal Tab */}
          <TabsContent value="withdraw">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Choose your withdrawal method and enter the amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Withdrawal Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount (SC)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="pl-10"
                      min={minWithdrawal}
                      max={Math.min(maxWithdrawal, availableBalance)}
                      step="0.01"
                      disabled={!withdrawalEligibility.canWithdraw}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: ${minWithdrawal}</span>
                    <span>
                      Available:{" "}
                      {formatCurrency(availableBalance, CurrencyType.SC)}
                    </span>
                    <span>Max: ${maxWithdrawal}</span>
                  </div>
                </div>

                {/* Withdrawal Method Selection */}
                <div className="space-y-4">
                  <Label>Withdrawal Method</Label>

                  {/* Bank Transfer */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === "bank"
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedMethod("bank")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedMethod === "bank"}
                          onChange={() => setSelectedMethod("bank")}
                          className="text-blue-500"
                        />
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Bank Transfer</h4>
                          <p className="text-sm text-muted-foreground">
                            2-3 business days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Fee: ${fees.bank}
                        </div>
                        {withdrawalAmount && (
                          <div className="text-xs text-green-600">
                            Net: $
                            {calculateNetAmount(
                              parseFloat(withdrawalAmount) || 0,
                              "bank",
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedMethod === "bank" && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={bankDetails.bankName}
                            onChange={(e) =>
                              setBankDetails((prev) => ({
                                ...prev,
                                bankName: e.target.value,
                              }))
                            }
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolder">
                            Account Holder Name
                          </Label>
                          <Input
                            id="accountHolder"
                            value={bankDetails.accountHolder}
                            onChange={(e) =>
                              setBankDetails((prev) => ({
                                ...prev,
                                accountHolder: e.target.value,
                              }))
                            }
                            placeholder="Enter account holder name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={bankDetails.accountNumber}
                            onChange={(e) =>
                              setBankDetails((prev) => ({
                                ...prev,
                                accountNumber: e.target.value,
                              }))
                            }
                            placeholder="Enter account number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            value={bankDetails.routingNumber}
                            onChange={(e) =>
                              setBankDetails((prev) => ({
                                ...prev,
                                routingNumber: e.target.value,
                              }))
                            }
                            placeholder="Enter routing number"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PayPal */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === "paypal"
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedMethod("paypal")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedMethod === "paypal"}
                          onChange={() => setSelectedMethod("paypal")}
                          className="text-blue-500"
                        />
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-muted-foreground">
                            1-2 business days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Fee: ${fees.paypal}
                        </div>
                        {withdrawalAmount && (
                          <div className="text-xs text-green-600">
                            Net: $
                            {calculateNetAmount(
                              parseFloat(withdrawalAmount) || 0,
                              "paypal",
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedMethod === "paypal" && (
                      <div className="mt-4">
                        <Label htmlFor="paypalEmail">PayPal Email</Label>
                        <Input
                          id="paypalEmail"
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="Enter your PayPal email"
                        />
                      </div>
                    )}
                  </div>

                  {/* Crypto */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === "crypto"
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedMethod("crypto")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedMethod === "crypto"}
                          onChange={() => setSelectedMethod("crypto")}
                          className="text-blue-500"
                        />
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Cryptocurrency (USDC)</h4>
                          <p className="text-sm text-muted-foreground">
                            Minutes to hours
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Fee: ${fees.crypto}
                        </div>
                        {withdrawalAmount && (
                          <div className="text-xs text-green-600">
                            Net: $
                            {calculateNetAmount(
                              parseFloat(withdrawalAmount) || 0,
                              "crypto",
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedMethod === "crypto" && (
                      <div className="mt-4">
                        <Label htmlFor="cryptoAddress">
                          USDC Wallet Address
                        </Label>
                        <Input
                          id="cryptoAddress"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          placeholder="Enter your USDC wallet address"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Only send to USDC addresses on Ethereum network
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Withdrawal Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span>Withdrawal Amount:</span>
                      <span>${parseFloat(withdrawalAmount).toFixed(2)} SC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee:</span>
                      <span>${fees[selectedMethod]}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Net Amount:</span>
                      <span className="text-green-600">
                        $
                        {calculateNetAmount(
                          parseFloat(withdrawalAmount),
                          selectedMethod,
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Withdrawals are processed during business hours
                        (Mon-Fri)
                      </li>
                      <li>
                        • You'll receive an email confirmation once processed
                      </li>
                      <li>
                        • Processing fees are deducted from the withdrawal
                        amount
                      </li>
                      <li>
                        • Ensure all details are correct - incorrect information
                        may delay processing
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSubmitWithdrawal}
                  disabled={
                    !withdrawalEligibility.canWithdraw ||
                    isSubmitting ||
                    !withdrawalAmount
                  }
                  className="w-full btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Request Withdrawal - ${withdrawalAmount ? `$${calculateNetAmount(parseFloat(withdrawalAmount) || 0, selectedMethod).toFixed(2)}` : "$0.00"} net`
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal History Tab */}
          <TabsContent value="history">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>
                  Track your past and pending withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No withdrawal requests yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your withdrawal history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Net Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawalHistory.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell className="font-mono">
                              {withdrawal.id}
                            </TableCell>
                            <TableCell>
                              ${withdrawal.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {withdrawal.method}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(withdrawal.status)}
                                <Badge
                                  className={getStatusColor(withdrawal.status)}
                                >
                                  {withdrawal.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {withdrawal.requestedAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              ${withdrawal.netAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
