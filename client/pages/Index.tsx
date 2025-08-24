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
import { SpinWheel } from "@/components/SpinWheel";
import {
  Trophy,
  Users,
  Shield,
  Coins,
  Gift,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle,
} from "lucide-react";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  probability: number;
}

export default function Index() {
  const [spinResult, setSpinResult] = useState<WheelSegment | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpinResult = (result: WheelSegment) => {
    setSpinResult(result);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 3000);
  };

  const features = [
    {
      icon: Trophy,
      title: "Daily Jackpots",
      description:
        "Win big with our daily progressive jackpots. The more you play, the bigger they get!",
      highlight: "Up to $10,000",
    },
    {
      icon: Users,
      title: "Referral Rewards",
      description:
        "Invite friends and earn up to 20% of their winnings. Build your network, boost your earnings.",
      highlight: "20% Commission",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Bank-level security with instant payouts. Your money and data are always protected.",
      highlight: "SSL Encrypted",
    },
    {
      icon: Zap,
      title: "Instant Wins",
      description:
        "No waiting around. Spin, win, and get paid instantly to your wallet.",
      highlight: "Instant Payouts",
    },
  ];

  const stats = [
    { label: "Total Winners", value: "50,000+", icon: Trophy },
    { label: "Prizes Awarded", value: "$2.5M+", icon: Coins },
    { label: "Active Players", value: "15,000+", icon: Users },
    { label: "Success Rate", value: "94%", icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      amount: "$2,500",
      quote:
        "I couldn't believe it when I hit the jackpot! CoinKrazy.com changed my life.",
      rating: 5,
    },
    {
      name: "Mike R.",
      amount: "$850",
      quote:
        "The referral program is amazing. I'm earning passive income daily!",
      rating: 5,
    },
    {
      name: "Lisa K.",
      amount: "$1,200",
      quote: "Fast payouts and fair games. This is the real deal!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-purple/5 to-background py-20">
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-50'
          }
        />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-purple to-teal text-white px-4 py-1">
                  🎉 Welcome Bonus: Double Your First Spin!
                </Badge>
                <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                  Win Big with{" "}
                  <span className="gradient-text">CoinKrazy.com</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Join thousands of winners in the most exciting sweepstakes
                  platform. Spin the wheel, claim your prizes, and change your
                  life today!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="btn-primary text-lg px-8 py-6 group"
                  asChild
                >
                  <Link to="/games">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Playing Now
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 hover:bg-purple/10"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="h-6 w-6 mx-auto mb-2 text-purple" />
                      <div className="font-bold text-lg">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content - Spin Wheel */}
            <div className="relative">
              <div className="relative z-10">
                <SpinWheel size={350} onSpin={handleSpinResult} />

                {/* Spin Result */}
                {showResult && spinResult && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Card className="glass border-gold/50 animate-bounce-slow">
                      <CardContent className="p-6 text-center">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-gold" />
                        <h3 className="text-2xl font-bold gradient-text">
                          Congratulations!
                        </h3>
                        <p className="text-xl font-semibold text-gold">
                          You won {spinResult.label}!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 animate-float">
                <div className="bg-gradient-to-r from-gold to-gold-dark p-3 rounded-full shadow-gold-glow">
                  <Coins className="h-6 w-6 text-black" />
                </div>
              </div>
              <div
                className="absolute -bottom-4 -left-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="bg-gradient-to-r from-teal to-teal-dark p-3 rounded-full shadow-teal-glow">
                  <Gift className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose <span className="gradient-text">CoinKrazy.com</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most rewarding sweepstakes platform with unmatched
              features and prizes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="glass hover:glow transition-all duration-300 group"
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple to-purple-dark rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <Badge variant="secondary" className="mx-auto">
                      {feature.highlight}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Recent <span className="gradient-text">Winners</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied players who've changed their lives
              with CoinKrazy.com.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-2xl font-bold text-gold">
                        Won {testimonial.amount}
                      </p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-gold text-gold"
                          />
                        ),
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center mt-4 text-success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Verified Winner</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple via-purple-dark to-purple">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
              Ready to Win Big?
            </h2>
            <p className="text-xl text-purple-foreground/80">
              Join CoinKrazy.com today and get double your first spin! Start
              your winning journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-gold text-lg px-8 py-6" asChild>
                <Link to="/games">Start Playing - It's Free!</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-purple"
              >
                See All Games
              </Button>
            </div>
            <p className="text-sm text-purple-foreground/60">
              No purchase necessary. Must be 18+ to play. Terms and conditions
              apply.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
