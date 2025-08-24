import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllUsers, User } from "@/contexts/AuthContext";
import { useJackpot } from "@/contexts/JackpotContext";
import MessagingCenter from "@/components/MessagingCenter";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Crown,
  Shield,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Mail,
  MessageSquare,
  Send,
  Bell,
  Smartphone,
  Edit,
  Plus,
  Trash2,
  Copy,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  User,
  Database,
  Globe,
  Zap,
} from "lucide-react";

interface PlayerAnalytics {
  userId: string;
  name: string;
  email: string;
  totalLosses: number;
  totalWagered: number;
  totalWon: number;
  netLoss: number;
  kycStatus: string;
  verified: boolean;
  registeredDate: Date;
  lastActive: Date;
  riskLevel: "low" | "medium" | "high";
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "welcome" | "promotional" | "notification" | "newsletter";
  variables: string[];
  created: Date;
  lastUsed?: Date;
  active: boolean;
}

interface Campaign {
  id: string;
  name: string;
  type: "email" | "push" | "sms" | "newsletter";
  template: string;
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  status: "draft" | "scheduled" | "sending" | "completed" | "paused";
  scheduledDate?: Date;
  createdDate: Date;
}

interface MessageStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
}

export default function AdminPanel() {
  const [players, setPlayers] = useState<PlayerAnalytics[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerAnalytics[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "high-risk" | "unverified"
  >("all");
  const [loading, setLoading] = useState(true);
  const { jackpots, recentWins } = useJackpot();

  // Messaging states
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messageStats, setMessageStats] = useState<MessageStats>({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0,
  });
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "promotional" as EmailTemplate["type"],
  });
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [messagingActiveTab, setMessagingActiveTab] = useState("overview");

  useEffect(() => {
    loadPlayerData();
    loadMessagingData();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, filterStatus]);

  const loadPlayerData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = getAllUsers();
    const analytics: PlayerAnalytics[] = users.map((user) => {
      // Mock additional data for analytics
      const totalWagered = Math.random() * 1000 + user.totalLosses;
      const totalWon = totalWagered * (0.85 + Math.random() * 0.1); // 85-95% RTP
      const netLoss = totalWagered - totalWon;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalLosses: user.totalLosses,
        totalWagered,
        totalWon,
        netLoss,
        kycStatus: user.kycStatus,
        verified: user.verified,
        registeredDate: user.createdAt,
        lastActive: user.lastLoginAt,
        riskLevel: netLoss > 200 ? "high" : netLoss > 100 ? "medium" : "low",
      };
    });

    setPlayers(analytics);
    setLoading(false);
  };

  const filterPlayers = () => {
    let filtered = players;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    switch (filterStatus) {
      case "high-risk":
        filtered = filtered.filter((player) => player.riskLevel === "high");
        break;
      case "unverified":
        filtered = filtered.filter((player) => !player.verified);
        break;
    }

    setFilteredPlayers(filtered);
  };

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-500 bg-red-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-green-500 bg-green-500/10";
    }
  };

  const totalSystemStats = {
    totalPlayers: players.length,
    totalLosses: players.reduce((sum, p) => sum + p.totalLosses, 0),
    totalWagered: players.reduce((sum, p) => sum + p.totalWagered, 0),
    averageRTP:
      players.length > 0
        ? (players.reduce(
            (sum, p) => sum + p.totalWon / Math.max(p.totalWagered, 1),
            0,
          ) /
            players.length) *
          100
        : 0,
    highRiskPlayers: players.filter((p) => p.riskLevel === "high").length,
    unverifiedPlayers: players.filter((p) => !p.verified).length,
  };

  const activeJackpotPool = jackpots.reduce((sum, j) => sum + j.amount, 0);

  // Messaging functions
  const loadMessagingData = async () => {
    // Mock data for demonstration
    const mockTemplates: EmailTemplate[] = [
      {
        id: "1",
        name: "Welcome Email",
        subject: "Welcome to CoinKrazy.com! 🎰",
        content: `<h1>Welcome {{firstName}}!</h1>
<p>Thank you for joining CoinKrazy.com. We've added <strong>{{welcomeBonus}} Gold Coins</strong> to your account to get you started!</p>
<p>Explore our exciting games and claim your daily bonuses.</p>
<p>Have fun and good luck!</p>`,
        type: "welcome",
        variables: ["firstName", "welcomeBonus"],
        created: new Date("2024-01-15"),
        lastUsed: new Date("2024-01-20"),
        active: true,
      },
      {
        id: "2",
        name: "Daily Bonus Reminder",
        subject: "Don't miss your daily bonus! 💰",
        content: `<h2>Your daily bonus is waiting!</h2>
<p>Hi {{firstName}},</p>
<p>You haven't claimed your daily bonus today. Don't let those <strong>{{bonusAmount}} Gold Coins</strong> go to waste!</p>
<p><a href="{{loginLink}}">Claim Now</a></p>`,
        type: "notification",
        variables: ["firstName", "bonusAmount", "loginLink"],
        created: new Date("2024-01-10"),
        lastUsed: new Date("2024-01-22"),
        active: true,
      },
      {
        id: "3",
        name: "VIP Promotion",
        subject: "Exclusive VIP Offer - 50% Bonus! 👑",
        content: `<h1>Exclusive VIP Offer</h1>
<p>Dear {{firstName}},</p>
<p>As one of our valued VIP players, you're eligible for an exclusive <strong>50% bonus</strong> on your next Gold Coin purchase!</p>
<p>Use code: <strong>{{promoCode}}</strong></p>
<p>Valid until {{expiryDate}}</p>`,
        type: "promotional",
        variables: ["firstName", "promoCode", "expiryDate"],
        created: new Date("2024-01-05"),
        active: true,
      },
    ];

    const mockCampaigns: Campaign[] = [
      {
        id: "1",
        name: "January Welcome Campaign",
        type: "email",
        template: "Welcome Email",
        recipients: 1250,
        sent: 1250,
        delivered: 1198,
        opened: 456,
        clicked: 89,
        status: "completed",
        createdDate: new Date("2024-01-15"),
      },
      {
        id: "2",
        name: "Daily Bonus Push",
        type: "push",
        template: "Daily Bonus Reminder",
        recipients: 2340,
        sent: 2340,
        delivered: 2205,
        opened: 892,
        clicked: 234,
        status: "completed",
        createdDate: new Date("2024-01-20"),
      },
      {
        id: "3",
        name: "VIP Weekend Promo",
        type: "email",
        template: "VIP Promotion",
        recipients: 156,
        sent: 156,
        delivered: 152,
        opened: 98,
        clicked: 34,
        status: "completed",
        createdDate: new Date("2024-01-22"),
      },
    ];

    const mockStats: MessageStats = {
      totalSent: 15650,
      deliveryRate: 94.2,
      openRate: 28.5,
      clickRate: 6.8,
      unsubscribeRate: 0.3,
    };

    setEmailTemplates(mockTemplates);
    setCampaigns(mockCampaigns);
    setMessageStats(mockStats);
  };

  const createTemplate = () => {
    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      content: newTemplate.content,
      type: newTemplate.type,
      variables: extractVariables(newTemplate.content),
      created: new Date(),
      active: true,
    };

    setEmailTemplates([...emailTemplates, template]);
    setNewTemplate({ name: "", subject: "", content: "", type: "promotional" });
    setIsCreatingTemplate(false);
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map((match) => match.slice(2, -2)) : [];
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const duplicate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      created: new Date(),
      lastUsed: undefined,
    };
    setEmailTemplates([...emailTemplates, duplicate]);
  };

  const deleteTemplate = (templateId: string) => {
    setEmailTemplates(emailTemplates.filter((t) => t.id !== templateId));
  };

  const sendTestEmail = (template: EmailTemplate) => {
    alert(`Test email sent with template: ${template.name}`);
  };

  const createCampaign = (type: Campaign["type"], templateName: string) => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: `New ${type} Campaign`,
      type,
      template: templateName,
      recipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      status: "draft",
      createdDate: new Date(),
    };
    setCampaigns([...campaigns, campaign]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Casino management and player analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={loadPlayerData} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSystemStats.totalPlayers}
              </div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                Total Player Losses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ${totalSystemStats.totalLosses.toFixed(2)} SC
              </div>
              <p className="text-xs text-muted-foreground">Real money losses</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                System RTP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {totalSystemStats.averageRTP.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Return to player</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold" />
                Jackpot Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">
                ${activeJackpotPool.toFixed(2)} SC
              </div>
              <p className="text-xs text-muted-foreground">Active jackpots</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {totalSystemStats.highRiskPlayers > 0 && (
            <Alert className="border-red-500 bg-red-500/5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription>
                <strong>{totalSystemStats.highRiskPlayers}</strong> players are
                in the high-risk category. Consider implementing responsible
                gambling measures.
              </AlertDescription>
            </Alert>
          )}

          {totalSystemStats.unverifiedPlayers > 0 && (
            <Alert className="border-orange-500 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                <strong>{totalSystemStats.unverifiedPlayers}</strong> players
                are unverified. Review KYC status for compliance.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="players">Player Analytics</TabsTrigger>
            <TabsTrigger value="messaging">Messaging Center</TabsTrigger>
            <TabsTrigger value="jackpots">Jackpot Management</TabsTrigger>
            <TabsTrigger value="packages">Manage Packages</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Player Analytics Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Player Loss Tracking</CardTitle>
                <CardDescription>
                  Monitor player gambling behavior and losses for responsible
                  gaming compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Players</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="filter">Filter</Label>
                    <select
                      id="filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All Players</option>
                      <option value="high-risk">High Risk</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>

                {/* Player Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead>Total Losses</TableHead>
                        <TableHead>Total Wagered</TableHead>
                        <TableHead>Net Loss</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Loading player data...
                          </TableCell>
                        </TableRow>
                      ) : filteredPlayers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No players found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPlayers.map((player) => (
                          <TableRow key={player.userId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {player.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getKYCStatusIcon(player.kycStatus)}
                                <span className="capitalize">
                                  {player.kycStatus}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-red-500 font-medium">
                              ${player.totalLosses.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${player.totalWagered.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-red-500">
                              ${player.netLoss.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getRiskLevelColor(player.riskLevel)}
                              >
                                {player.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {player.lastActive.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jackpot Management Tab */}
          <TabsContent value="jackpots" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Progressive Jackpot Management</CardTitle>
                <CardDescription>
                  Monitor and manage the progressive jackpot system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {jackpots.map((jackpot) => (
                    <Card key={jackpot.id} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {jackpot.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-lg font-bold">
                            ${jackpot.amount.toFixed(2)} SC
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Max: ${jackpot.maxAmount} SC
                          </div>
                          <div className="text-xs">
                            Progress:{" "}
                            {Math.round(
                              (jackpot.amount / jackpot.maxAmount) * 100,
                            )}
                            %
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Reset Jackpot
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Jackpot Wins */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Jackpot Wins
                  </h3>
                  <div className="space-y-2">
                    {recentWins.slice(0, 5).map((win) => (
                      <div
                        key={win.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{win.type}</div>
                          <div className="text-sm text-muted-foreground">
                            Player ID: {win.userId.slice(-4)}***
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-500">
                            ${win.amount.toFixed(2)} SC
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {win.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple" />
                  Package Management
                </CardTitle>
                <CardDescription>
                  Create and manage Gold Coin packages for the store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Package Management System
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    The comprehensive package management system is available as
                    a dedicated admin feature. Access full package creation,
                    editing, and analytics capabilities.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">
                          ✨ Package Creation
                        </h4>
                        <p className="text-muted-foreground">
                          Create custom Gold Coin packages with bonus Sweep
                          Coins, pricing, and visual themes
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">
                          📊 Sales Analytics
                        </h4>
                        <p className="text-muted-foreground">
                          Track package performance, revenue, and popular
                          choices
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">
                          ⚡ Real-time Management
                        </h4>
                        <p className="text-muted-foreground">
                          Edit, disable, or create promotional packages
                          instantly
                        </p>
                      </div>
                    </div>
                    <Button
                      className="btn-primary"
                      onClick={() => window.open("/admin/packages", "_blank")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Open Package Manager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Manage casino system settings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Game Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rtp">Base RTP (%)</Label>
                        <Input
                          id="rtp"
                          type="number"
                          defaultValue="94.5"
                          min="80"
                          max="99"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-bet">Max Bet (SC)</Label>
                        <Input
                          id="max-bet"
                          type="number"
                          defaultValue="1.00"
                          min="0.01"
                          max="10"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Responsible Gaming
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loss-limit">
                          Daily Loss Limit (SC)
                        </Label>
                        <Input
                          id="loss-limit"
                          type="number"
                          defaultValue="50"
                          min="1"
                          max="500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="session-limit">
                          Session Time Limit (hours)
                        </Label>
                        <Input
                          id="session-limit"
                          type="number"
                          defaultValue="4"
                          min="1"
                          max="24"
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="btn-primary">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Generate and download financial and compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Reports</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Daily Revenue Report
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Player Loss Summary
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        KYC Compliance Report
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Jackpot Activity Report
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Custom Report</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date-from">From Date</Label>
                        <Input id="date-from" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="date-to">To Date</Label>
                        <Input id="date-to" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="report-type">Report Type</Label>
                        <select
                          id="report-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="revenue">Revenue Analysis</option>
                          <option value="player-behavior">
                            Player Behavior
                          </option>
                          <option value="compliance">Compliance Report</option>
                          <option value="risk-assessment">
                            Risk Assessment
                          </option>
                        </select>
                      </div>
                      <Button className="w-full btn-primary">
                        Generate Custom Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
