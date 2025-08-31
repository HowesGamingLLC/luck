import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import {
  ShoppingCart,
  Coins,
  Gem,
  Gift,
  Star,
  Crown,
  Zap,
  CreditCard,
  Lock,
  Check,
  AlertTriangle,
  Info,
  Percent,
  TrendingUp,
} from "lucide-react";

export interface GoldCoinPackage {
  id: string;
  name: string;
  goldCoins: number;
  bonusSweepCoins: number;
  price: number;
  originalPrice?: number;
  popular: boolean;
  bestValue: boolean;
  icon: any;
  color: string;
  description: string;
  features: string[];
  savings?: number;
}

export default function Store() {
  const { isAuthenticated, user: authUser } = useAuth();
  const { updateBalance } = useCurrency();
  const [selectedPackage, setSelectedPackage] =
    useState<GoldCoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "crypto"
  >("card");

  const [serverPackages, setServerPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/payments/packages");
        const data = await res.json();
        if (!res.ok || !data?.packages) throw new Error(data?.error || "Failed to load packages");
        setServerPackages(data.packages);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mapIcon = (id: string) => {
    switch (id) {
      case "starter":
        return Coins;
      case "popular":
        return Star;
      case "pro":
        return Crown;
      case "whale":
        return Gem;
      case "daily":
        return Zap;
      default:
        return Coins;
    }
  };

  const packages: GoldCoinPackage[] = serverPackages.map((p) => ({
    id: p.id,
    name: p.name,
    goldCoins: p.gc,
    bonusSweepCoins: p.bonusSc,
    price: (p.priceCents || 0) / 100,
    popular: p.id === "popular",
    bestValue: p.id === "pro",
    icon: mapIcon(p.id),
    color:
      p.id === "starter"
        ? "from-blue-500 to-blue-600"
        : p.id === "popular"
          ? "from-purple-500 to-purple-600"
          : p.id === "pro"
            ? "from-gold to-yellow-600"
            : p.id === "whale"
              ? "from-red-500 to-pink-600"
              : "from-green-500 to-green-600",
    description:
      p.id === "starter"
        ? "Perfect for new players to get started"
        : p.id === "popular"
          ? "Most popular package with great value"
          : p.id === "pro"
            ? "Best value for serious players"
            : p.id === "whale"
              ? "Ultimate package for high rollers"
              : "Limited time offer - today only!",
    features: [
      `${Number(p.gc).toLocaleString()} Gold Coins`,
      `${p.bonusSc} FREE Sweep Coins`,
      "Instant delivery",
      "24/7 support",
    ],
  }));

  const handlePurchase = async (pkg: GoldCoinPackage) => {
    if (!isAuthenticated) {
      alert("Please log in to make a purchase");
      return;
    }

    setSelectedPackage(pkg);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          quantity: 1,
          userId: authUser?.id,
          email: buyerEmail || authUser?.email,
          returnUrl: window.location.origin + "/wallet",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error
            ? JSON.stringify(data.error)
            : "Failed to create payment link",
        );
      }
      window.location.href = data.url;
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getValuePerDollar = (pkg: GoldCoinPackage) => {
    const totalValue = pkg.goldCoins + pkg.bonusSweepCoins * 100; // Rough SC to GC conversion
    return Math.round(totalValue / pkg.price);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4 flex items-center justify-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Gold Coin Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Purchase Gold Coins to play your favorite games and get FREE Sweep
            Coins with every package!
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass text-center">
            <CardContent className="p-6">
              <Coins className="h-8 w-8 mx-auto mb-3 text-gold" />
              <h3 className="font-semibold mb-2">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Coins are added to your account immediately after purchase
              </p>
            </CardContent>
          </Card>

          <Card className="glass text-center">
            <CardContent className="p-6">
              <Gift className="h-8 w-8 mx-auto mb-3 text-teal" />
              <h3 className="font-semibold mb-2">FREE Sweep Coins</h3>
              <p className="text-sm text-muted-foreground">
                Every package includes bonus Sweep Coins for real money games
              </p>
            </CardContent>
          </Card>

          <Card className="glass text-center">
            <CardContent className="p-6">
              <Lock className="h-8 w-8 mx-auto mb-3 text-purple" />
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                256-bit SSL encryption and trusted payment processors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Required Alert */}
        {!isAuthenticated && (
          <Alert className="mb-8 border-orange-500 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              Please <strong>log in</strong> or{" "}
              <strong>create an account</strong> to purchase Gold Coin packages.
            </AlertDescription>
          </Alert>
        )}

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  pkg.bestValue
                    ? "border-gold shadow-gold-glow"
                    : pkg.popular
                      ? "border-purple shadow-glow"
                      : "border-border"
                } ${!isAuthenticated ? "opacity-75" : ""}`}
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {pkg.bestValue && (
                    <Badge className="bg-gold text-black font-bold">
                      BEST VALUE
                    </Badge>
                  )}
                  {pkg.popular && (
                    <Badge className="bg-purple text-white font-bold">
                      POPULAR
                    </Badge>
                  )}
                  {pkg.savings && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-600 border-green-500"
                    >
                      {pkg.savings}% OFF
                    </Badge>
                  )}
                </div>

                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="text-center">
                    {pkg.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${pkg.originalPrice}
                      </div>
                    )}
                    <div className="text-3xl font-bold">${pkg.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {getValuePerDollar(pkg).toLocaleString()} coins per dollar
                    </div>
                  </div>

                  {/* Contents */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gold/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-gold" />
                        <span className="font-medium">Gold Coins</span>
                      </div>
                      <span className="font-bold text-gold">
                        {pkg.goldCoins.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-teal/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-teal" />
                        <span className="font-medium">Bonus Sweep Coins</span>
                        <Badge variant="secondary" className="text-xs">
                          FREE
                        </Badge>
                      </div>
                      <span className="font-bold text-teal">
                        {pkg.bonusSweepCoins}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={!isAuthenticated}
                    className={`w-full ${
                      pkg.bestValue
                        ? "btn-gold"
                        : pkg.popular
                          ? "btn-primary"
                          : "btn-primary"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Purchase Now" : "Login to Purchase"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Security Info */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium text-sm">Secure Payments</h4>
                <p className="text-xs text-muted-foreground">SSL Encrypted</p>
              </div>
              <div>
                <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <h4 className="font-medium text-sm">Instant Delivery</h4>
                <p className="text-xs text-muted-foreground">
                  Coins added immediately
                </p>
              </div>
              <div>
                <Info className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium text-sm">24/7 Support</h4>
                <p className="text-xs text-muted-foreground">
                  Help when you need it
                </p>
              </div>
              <div>
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <h4 className="font-medium text-sm">Best Value</h4>
                <p className="text-xs text-muted-foreground">
                  Competitive pricing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Confirmation Dialog */}
        <Dialog
          open={!!selectedPackage}
          onOpenChange={() => setSelectedPackage(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Review your order before completing the purchase
              </DialogDescription>
            </DialogHeader>

            {selectedPackage && (
              <div className="space-y-6">
                {/* Buyer email */}
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">Email for receipt</Label>
                  <Input
                    id="buyerEmail"
                    placeholder={authUser?.email || "you@example.com"}
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                </div>

                {/* Package Summary */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <selectedPackage.icon className="h-6 w-6 text-purple" />
                    <div>
                      <h3 className="font-semibold">{selectedPackage.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPackage.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gold Coins:</span>
                      <span className="font-medium text-gold">
                        {selectedPackage.goldCoins.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Sweep Coins:</span>
                      <span className="font-medium text-teal">
                        {selectedPackage.bonusSweepCoins}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Price:</span>
                      <span>${selectedPackage.price}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="space-y-2">
                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-500/5"
                          : ""
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={paymentMethod === "card"}
                          readOnly
                        />
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-blue-500 bg-blue-500/5"
                          : ""
                      }`}
                      onClick={() => setPaymentMethod("paypal")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={paymentMethod === "paypal"}
                          readOnly
                        />
                        <CreditCard className="h-4 w-4" />
                        <span>PayPal</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This is a demo purchase. No real money will be charged.
                    Coins will be added to your account for testing purposes.
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPackage(null)}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmPurchase}
                    disabled={isProcessing}
                    className="flex-1 btn-primary"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Pay $${selectedPackage.price}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
