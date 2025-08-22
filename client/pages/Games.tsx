import { SpinWheel } from "@/components/SpinWheel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Trophy, Coins, Gift, Zap, Clock, Users } from "lucide-react";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  probability: number;
}

export default function Games() {
  const [spinResult, setSpinResult] = useState<WheelSegment | null>(null);
  const [userBalance] = useState(1250.5);

  const handleSpinResult = (result: WheelSegment) => {
    setSpinResult(result);
    // In a real app, this would update the user's balance
    console.log(`Won: ${result.label}`);
  };

  const gameStats = [
    {
      label: "Your Balance",
      value: `$${userBalance.toLocaleString()}`,
      icon: Coins,
      color: "text-gold",
    },
    { label: "Total Spins", value: "47", icon: Zap, color: "text-purple" },
    { label: "Total Won", value: "$430", icon: Trophy, color: "text-teal" },
    { label: "Win Rate", value: "68%", icon: Gift, color: "text-success" },
  ];

  const recentActivity = [
    { type: "win", amount: "$25", time: "2 minutes ago" },
    { type: "spin", amount: "-", time: "5 minutes ago" },
    { type: "win", amount: "$10", time: "12 minutes ago" },
    { type: "win", amount: "$50", time: "1 hour ago" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Spin & Win
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Try your luck with our daily spin wheel! Win cash prizes, bonuses,
            and exclusive rewards.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm text-muted-foreground">
                          {stat.label}
                        </span>
                      </div>
                      <span className={`font-semibold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          activity.type === "win" ? "default" : "secondary"
                        }
                        className={activity.type === "win" ? "bg-success" : ""}
                      >
                        {activity.type === "win" ? "Win" : "Spin"}
                      </Badge>
                      {activity.type === "win" && (
                        <span className="font-semibold text-success">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Spin Wheel */}
          <div className="flex flex-col items-center space-y-6">
            <Card className="glass p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Daily Spin Wheel</h2>
                <p className="text-muted-foreground">
                  You have{" "}
                  <span className="text-gold font-semibold">3 spins</span>{" "}
                  remaining today
                </p>
              </div>

              <SpinWheel size={300} onSpin={handleSpinResult} />

              {spinResult && (
                <div className="mt-6 text-center">
                  <div className="bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gold mb-1">
                      Congratulations! 🎉
                    </h3>
                    <p className="text-2xl font-bold gradient-text">
                      You won {spinResult.label}!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your winnings have been added to your balance.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <div className="text-center space-y-2">
              <Button className="btn-gold w-full" disabled={true}>
                Get More Spins - Coming Soon!
              </Button>
              <p className="text-xs text-muted-foreground">
                More spins available through daily login bonuses and referrals
              </p>
            </div>
          </div>

          {/* Right Sidebar - Game Info */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-teal" />
                  <span>Prize Pool</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">
                    $12,450
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total available prizes today
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$10 prizes</span>
                    <Badge variant="secondary">30% chance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$25 prizes</span>
                    <Badge variant="secondary">25% chance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$50 prizes</span>
                    <Badge variant="secondary">20% chance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$100 prizes</span>
                    <Badge variant="secondary">15% chance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$250 prizes</span>
                    <Badge variant="secondary">8% chance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">$500 prizes</span>
                    <Badge variant="secondary">2% chance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple" />
                  <span>Live Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Player47***</span>
                    <span className="text-success font-semibold">+$100</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Just now</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Sarah_M***</span>
                    <span className="text-success font-semibold">+$25</span>
                  </div>
                  <p className="text-muted-foreground text-xs">2 minutes ago</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Mike_R***</span>
                    <span className="text-success font-semibold">+$50</span>
                  </div>
                  <p className="text-muted-foreground text-xs">5 minutes ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
