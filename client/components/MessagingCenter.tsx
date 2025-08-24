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
import {
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
  Target,
  TrendingDown,
  User,
  Globe,
  Zap,
  CheckCircle,
  Eye,
  Info,
  Settings,
} from "lucide-react";

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

export default function MessagingCenter() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messageStats, setMessageStats] = useState<MessageStats>({
    totalSent: 15650,
    deliveryRate: 94.2,
    openRate: 28.5,
    clickRate: 6.8,
    unsubscribeRate: 0.3,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "promotional" as EmailTemplate["type"],
  });
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [messagingActiveTab, setMessagingActiveTab] = useState("overview");

  // Mock data initialization
  useState(() => {
    const mockTemplates: EmailTemplate[] = [
      {
        id: "1",
        name: "Welcome Email",
        subject: "Welcome to CoinKrazy.com! 🎰",
        content: `<h1>Welcome!</h1>
<p>Thank you for joining CoinKrazy.com. We've added bonus Gold Coins to your account to get you started!</p>
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
<p>You haven't claimed your daily bonus today. Don't let those bonus Gold Coins go to waste!</p>
<p><a href="#login">Claim Now</a></p>`,
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
<p>As one of our valued VIP players, you're eligible for an exclusive 50% bonus on your next Gold Coin purchase!</p>
<p>Use code: VIP50</p>`,
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

    setEmailTemplates(mockTemplates);
    setCampaigns(mockCampaigns);
  });

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
    return matches ? matches.map(match => match.slice(2, -2)) : [];
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
    setEmailTemplates(emailTemplates.filter(t => t.id !== templateId));
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
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Messaging Center
        </CardTitle>
        <CardDescription>
          Manage email templates, newsletters, push notifications, and SMS campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={messagingActiveTab} onValueChange={setMessagingActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="sms">SMS Messaging</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sent</p>
                      <p className="text-2xl font-bold">{messageStats.totalSent.toLocaleString()}</p>
                    </div>
                    <Send className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Rate</p>
                      <p className="text-2xl font-bold text-green-500">{messageStats.deliveryRate}%</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Rate</p>
                      <p className="text-2xl font-bold text-blue-500">{messageStats.openRate}%</p>
                    </div>
                    <Eye className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Click Rate</p>
                      <p className="text-2xl font-bold text-purple-500">{messageStats.clickRate}%</p>
                    </div>
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unsubscribe</p>
                      <p className="text-2xl font-bold text-red-500">{messageStats.unsubscribeRate}%</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setMessagingActiveTab("templates")}>
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Create Email Template</h3>
                  <p className="text-sm text-muted-foreground">Design reusable email templates</p>
                </CardContent>
              </Card>
              <Card className="border hover:border-green-500 transition-colors cursor-pointer" onClick={() => setMessagingActiveTab("campaigns")}>
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Launch Campaign</h3>
                  <p className="text-sm text-muted-foreground">Send newsletters and promotions</p>
                </CardContent>
              </Card>
              <Card className="border hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setMessagingActiveTab("push")}>
                <CardContent className="p-6 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Push Notification</h3>
                  <p className="text-sm text-muted-foreground">Instant mobile notifications</p>
                </CardContent>
              </Card>
              <Card className="border hover:border-orange-500 transition-colors cursor-pointer" onClick={() => setMessagingActiveTab("sms")}>
                <CardContent className="p-6 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                  <h3 className="font-semibold mb-2">SMS Message</h3>
                  <p className="text-sm text-muted-foreground">Direct SMS communication</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg">Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {campaign.type === "email" && <Mail className="h-5 w-5 text-blue-500" />}
                        {campaign.type === "push" && <Bell className="h-5 w-5 text-purple-500" />}
                        {campaign.type === "sms" && <Smartphone className="h-5 w-5 text-orange-500" />}
                        {campaign.type === "newsletter" && <Globe className="h-5 w-5 text-green-500" />}
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.template}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={campaign.status === "completed" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.sent.toLocaleString()} sent
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Email Templates</h3>
                <p className="text-sm text-muted-foreground">Create and manage reusable email templates</p>
              </div>
              <Button onClick={() => setIsCreatingTemplate(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            {isCreatingTemplate && (
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">Create New Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Welcome Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select value={newTemplate.type} onValueChange={(value: EmailTemplate["type"]) => setNewTemplate({ ...newTemplate, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Subject Line</Label>
                    <Input
                      id="template-subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Welcome to CoinKrazy.com!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-content">Email Content (HTML)</Label>
                    <Textarea
                      id="template-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="<h1>Welcome!</h1><p>Thank you for joining us...</p>"
                      rows={8}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Use variables like {"{firstName}"}, {"{bonusAmount}"}, etc. for personalization
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={createTemplate} className="btn-primary">
                      Create Template
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailTemplates.map((template) => (
                <Card key={template.id} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={template.type === "promotional" ? "default" : "secondary"}>
                        {template.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch checked={template.active} />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Variables: {template.variables.length}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {template.created.toLocaleDateString()}
                        {template.lastUsed && (
                          <div>Last used: {template.lastUsed.toLocaleDateString()}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedTemplate(template)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => sendTestEmail(template)}>
                          <Send className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Marketing Campaigns</h3>
                <p className="text-sm text-muted-foreground">Create and manage email, newsletter, and promotional campaigns</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createCampaign("email", "Welcome Email")} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Campaign
                </Button>
                <Button onClick={() => createCampaign("newsletter", "Newsletter")} className="btn-primary">
                  <Globe className="h-4 w-4 mr-2" />
                  Newsletter
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.template}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaign.type === "email" && <Mail className="h-4 w-4 text-blue-500" />}
                          {campaign.type === "newsletter" && <Globe className="h-4 w-4 text-green-500" />}
                          {campaign.type === "push" && <Bell className="h-4 w-4 text-purple-500" />}
                          {campaign.type === "sms" && <Smartphone className="h-4 w-4 text-orange-500" />}
                          <span className="capitalize">{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <div>{campaign.delivered.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((campaign.delivered / campaign.recipients) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{campaign.opened.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((campaign.opened / campaign.delivered) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{campaign.clicked.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === "completed" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="push" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Send instant notifications to users' mobile devices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-500" />
                    Send Push Notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="push-title">Notification Title</Label>
                    <Input id="push-title" placeholder="Daily Bonus Available!" />
                  </div>
                  <div>
                    <Label htmlFor="push-message">Message</Label>
                    <Textarea id="push-message" placeholder="Your daily bonus is ready to claim!" rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="push-audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Users (7 days)</SelectItem>
                        <SelectItem value="inactive">Inactive Users (30+ days)</SelectItem>
                        <SelectItem value="vip">VIP Players</SelectItem>
                        <SelectItem value="new">New Users (under 7 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="schedule" />
                    <Label htmlFor="schedule">Schedule for later</Label>
                  </div>
                  <Button className="w-full btn-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Send Push Notification
                  </Button>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle>Push Notification Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Subscribers</span>
                      <span className="font-bold">2,847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sent Today</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Rate</span>
                      <span className="font-bold text-green-500">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Click Rate</span>
                      <span className="font-bold text-blue-500">12.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border">
              <CardHeader>
                <CardTitle>Recent Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Bonus Reminder</p>
                      <p className="text-sm text-muted-foreground">Don't miss your daily bonus!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">2,340 sent</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">New Game Alert</p>
                      <p className="text-sm text-muted-foreground">Check out our new slot machine!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">1,892 sent</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Messaging Tab */}
          <TabsContent value="sms" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">SMS Messaging</h3>
              <p className="text-sm text-muted-foreground">Send direct SMS messages to users with verified phone numbers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-orange-500" />
                    Send SMS Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sms-message">Message (160 characters)</Label>
                    <Textarea id="sms-message" placeholder="Your bonus is ready! Log in to claim 100 Gold Coins. Reply STOP to opt out." rows={3} maxLength={160} />
                    <p className="text-xs text-muted-foreground mt-1">Character count: 0/160</p>
                  </div>
                  <div>
                    <Label htmlFor="sms-audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified Phone Numbers</SelectItem>
                        <SelectItem value="high-value">High Value Players</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                        <SelectItem value="vip">VIP Players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      SMS messages are charged per message. Ensure compliance with SMS regulations and user consent.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full btn-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle>SMS Campaign Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Verified Numbers</span>
                      <span className="font-bold">1,234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sent This Month</span>
                      <span className="font-bold">456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Rate</span>
                      <span className="font-bold text-green-500">98.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Opt-out Rate</span>
                      <span className="font-bold text-red-500">0.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cost Per Message</span>
                      <span className="font-bold">$0.05</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border">
              <CardHeader>
                <CardTitle>SMS Compliance & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Opt-out Handling</p>
                      <p className="text-sm text-muted-foreground">Automatically process STOP replies</p>
                    </div>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delivery Reports</p>
                      <p className="text-sm text-muted-foreground">Track message delivery status</p>
                    </div>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Limit messages per user per day</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="3" className="w-16" />
                      <span className="text-sm">per day</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced SMS Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
