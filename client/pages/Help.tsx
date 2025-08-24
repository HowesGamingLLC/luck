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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Book,
  Users,
  Settings,
  Coins,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ExternalLink,
  Play,
  FileText,
  Headphones,
  Zap,
} from "lucide-react";

const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Play,
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          "Click the 'Sign Up' button in the top right corner, enter your email and create a password. You'll receive a verification email to complete your registration.",
      },
      {
        question: "How do I verify my account?",
        answer:
          "After signing up, check your email for a verification link. Click the link to verify your account. You may also need to verify your identity with a government-issued ID for withdrawals.",
      },
      {
        question: "What games can I play?",
        answer:
          "CoinKrazy.com offers various sweepstakes games including the Daily Spin Wheel, scratch cards, slots, and special promotional games. All games are free to play with chances to win real prizes.",
      },
      {
        question: "Is CoinKrazy.com free to play?",
        answer:
          "Yes! CoinKrazy.com is completely free to play. You get free spins daily and can earn more through various activities like referrals, daily login bonuses, and special promotions.",
      },
    ],
  },
  {
    id: "gameplay",
    title: "Gameplay & Rules",
    icon: Coins,
    faqs: [
      {
        question: "How does the spin wheel work?",
        answer:
          "The spin wheel is a game of chance where you can win various prizes. Each spin has predetermined odds for different prize amounts. You get free spins daily and can earn more through activities.",
      },
      {
        question: "What are the winning odds?",
        answer:
          "Odds vary by prize amount. Smaller prizes have higher odds (30% for $10) while larger prizes are rarer (2% for $500). All odds are clearly displayed on the game page.",
      },
      {
        question: "How often can I spin?",
        answer:
          "You get 3 free spins daily. Additional spins can be earned through daily login bonuses, referrals, achievements, and special promotions.",
      },
      {
        question: "Can I improve my chances of winning?",
        answer:
          "All games are based on chance with predetermined odds. However, playing consistently, referring friends, and participating in promotions can give you more opportunities to win.",
      },
    ],
  },
  {
    id: "winnings",
    title: "Winnings & Withdrawals",
    icon: TrendingUp,
    faqs: [
      {
        question: "How do I withdraw my winnings?",
        answer:
          "Go to your Wallet page, click 'Withdraw', choose your payment method, and enter the amount. Withdrawals are processed within 24-48 hours after verification.",
      },
      {
        question: "What is the minimum withdrawal amount?",
        answer:
          "The minimum withdrawal amount is $10. This ensures cost-effective processing while allowing you to access your winnings quickly.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We support PayPal, bank transfers, and various digital payment methods. Cryptocurrency options are also available in select regions.",
      },
      {
        question: "Are there any withdrawal fees?",
        answer:
          "Standard withdrawals are free for verified accounts. Express withdrawals (processed within 2 hours) may have a small fee depending on the payment method.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Security",
    icon: Shield,
    faqs: [
      {
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to your email address.",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "Go to your Profile page and click 'Edit Profile'. You can update your name, location, and other personal information. Some changes may require verification.",
      },
      {
        question: "Is my personal information safe?",
        answer:
          "Yes, we use bank-level SSL encryption and follow strict data protection protocols. Your information is never shared with third parties without your consent.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible and you'll need to withdraw any remaining balance first.",
      },
    ],
  },
  {
    id: "referrals",
    title: "Referral Program",
    icon: Users,
    faqs: [
      {
        question: "How does the referral program work?",
        answer:
          "Share your unique referral code with friends. When they sign up and play, you earn a percentage of their winnings as commission. Higher tiers offer better commission rates.",
      },
      {
        question: "What commission rates do you offer?",
        answer:
          "Commission rates range from 10% (Bronze) to 25% (Diamond) based on your tier. Tiers are determined by the number of successful referrals you've made.",
      },
      {
        question: "When do I receive referral commissions?",
        answer:
          "Commissions are calculated and paid daily. You can track your earnings in real-time on your Referrals page and withdraw them anytime.",
      },
      {
        question: "Is there a limit to how much I can earn?",
        answer:
          "There's no limit to referral earnings! The more active players you refer, the more you can earn. Top referrers earn thousands of dollars monthly.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical Support",
    icon: Settings,
    faqs: [
      {
        question: "The game won't load, what should I do?",
        answer:
          "Try refreshing the page, clearing your browser cache, or switching to a different browser. If issues persist, contact our technical support team.",
      },
      {
        question: "Can I play on mobile devices?",
        answer:
          "Yes! CoinKrazy.com is fully optimized for mobile devices. You can play on any smartphone or tablet through your web browser. A mobile app is coming soon.",
      },
      {
        question: "What browsers are supported?",
        answer:
          "CoinKrazy.com works best on Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your preferred browser.",
      },
      {
        question: "I'm experiencing connection issues",
        answer:
          "Check your internet connection and try again. If you continue having issues, our technical team can help diagnose connection problems.",
      },
    ],
  },
];

const tutorials = [
  {
    title: "Getting Started with CoinKrazy.com",
    description:
      "Complete guide to setting up your account and playing your first game",
    duration: "5 min",
    type: "video",
    icon: Play,
    difficulty: "Beginner",
  },
  {
    title: "Maximizing Your Winnings",
    description:
      "Tips and strategies to increase your chances and optimize your gameplay",
    duration: "8 min",
    type: "video",
    icon: TrendingUp,
    difficulty: "Intermediate",
  },
  {
    title: "Referral Program Mastery",
    description:
      "How to build a successful referral network and earn passive income",
    duration: "6 min",
    type: "video",
    icon: Users,
    difficulty: "Beginner",
  },
  {
    title: "Account Security Best Practices",
    description: "Keep your account safe and secure with these essential tips",
    duration: "4 min",
    type: "article",
    icon: Shield,
    difficulty: "Beginner",
  },
];

const supportOptions = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7",
    responseTime: "< 2 minutes",
    icon: MessageCircle,
    action: "Start Chat",
    primary: true,
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    availability: "24/7",
    responseTime: "< 4 hours",
    icon: Mail,
    action: "Send Email",
    primary: false,
  },
  {
    title: "Phone Support",
    description: "Speak directly with our team",
    availability: "Mon-Fri 9AM-6PM EST",
    responseTime: "Immediate",
    icon: Phone,
    action: "Call Now",
    primary: false,
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.faqs.length > 0 || searchQuery === "");

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, learn how to maximize your
            winnings, and get support when you need it.
          </p>
        </div>

        {/* Search */}
        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help topics, questions, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="faq" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card
                        key={category.id}
                        className={`glass cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedCategory === category.id
                            ? "border-purple bg-purple/10"
                            : ""
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-purple" />
                          <h3 className="font-semibold">{category.title}</h3>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredFAQs.map((category) => (
                  <Card key={category.id} className="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-purple" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category.id}-${index}`}
                          >
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Tutorials Tab */}
              <TabsContent value="tutorials" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {tutorials.map((tutorial, index) => {
                    const Icon = tutorial.icon;
                    return (
                      <Card
                        key={index}
                        className="glass hover:glow transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple to-gold rounded-full">
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {tutorial.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {tutorial.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {tutorial.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {tutorial.duration}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {tutorial.type === "video" ? (
                                      <Video className="h-3 w-3" />
                                    ) : (
                                      <FileText className="h-3 w-3" />
                                    )}
                                    {tutorial.type}
                                  </div>
                                </div>
                                <Button size="sm" className="btn-primary">
                                  {tutorial.type === "video" ? "Watch" : "Read"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {supportOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <Card
                        key={index}
                        className={`glass transition-all duration-200 hover:scale-105 ${
                          option.primary ? "border-purple bg-purple/5" : ""
                        }`}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Icon
                              className={`h-8 w-8 mx-auto ${option.primary ? "text-purple" : "text-muted-foreground"}`}
                            />
                          </div>
                          <h3 className="font-semibold mb-2">{option.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {option.description}
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="text-xs text-muted-foreground">
                              <strong>Available:</strong> {option.availability}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <strong>Response:</strong> {option.responseTime}
                            </div>
                          </div>
                          <Button
                            className={
                              option.primary ? "btn-primary w-full" : "w-full"
                            }
                            variant={option.primary ? "default" : "outline"}
                          >
                            {option.action}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Other Ways to Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-purple" />
                        <div>
                          <h4 className="font-medium">Community Forum</h4>
                          <p className="text-sm text-muted-foreground">
                            Connect with other players and share experiences
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>

                      <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-teal" />
                        <div>
                          <h4 className="font-medium">Knowledge Base</h4>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive guides and documentation
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-gold" />
                        <div>
                          <h4 className="font-medium">Video Tutorials</h4>
                          <p className="text-sm text-muted-foreground">
                            Step-by-step video guides for all features
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>

                      <div className="flex items-center gap-3">
                        <Headphones className="h-5 w-5 text-success" />
                        <div>
                          <h4 className="font-medium">Audio Support</h4>
                          <p className="text-sm text-muted-foreground">
                            Voice support for accessibility needs
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gold" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check Account Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Withdrawal Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="glass border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Games</span>
                  <Badge className="bg-success text-white">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payments</span>
                  <Badge className="bg-success text-white">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support</span>
                  <Badge className="bg-success text-white">Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Maintenance</span>
                  <Badge variant="outline">None Scheduled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Popular Help Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>How to withdraw winnings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Referral program guide</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Account verification</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Game rules and odds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
