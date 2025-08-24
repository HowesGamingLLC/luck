import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIEmployeeManager } from "@/components/AIEmployeeManager";
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
  Bot,
  ArrowLeft,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Activity,
  Clock,
  Shield,
  Brain,
  Zap,
  Target,
  Award,
  BarChart3,
  CheckCircle,
} from "lucide-react";

export default function AIEmployeePage() {
  const [activeTab, setActiveTab] = useState("manager");

  // Mock analytics data
  const analyticsData = {
    totalInteractions: 45680,
    averageResponseTime: 850,
    customerSatisfaction: 4.7,
    resolutionRate: 92,
    activeEmployees: 4,
    totalEmployees: 6,
    conversationsToday: 342,
    escalationRate: 6.2,
    costSavings: 15400,
    uptime: 99.2,
  };

  const performanceTrends = [
    {
      metric: "Customer Satisfaction",
      value: 4.7,
      trend: "+0.3",
      isPositive: true,
    },
    { metric: "Resolution Rate", value: 92, trend: "+5%", isPositive: true },
    { metric: "Response Time", value: 850, trend: "-120ms", isPositive: true },
    { metric: "Escalation Rate", value: 6.2, trend: "-1.8%", isPositive: true },
  ];

  const topPerformers = [
    { name: "Elena", role: "VIP Manager", rating: 4.9, conversations: 34 },
    { name: "Marcus", role: "Game Host", rating: 4.8, conversations: 89 },
    {
      name: "Sarah",
      role: "Customer Support",
      rating: 4.6,
      conversations: 127,
    },
  ];

  const recentTraining = [
    {
      employee: "Alex",
      course: "Advanced Security Protocols",
      completed: true,
    },
    { employee: "Sarah", course: "Conflict Resolution", completed: true },
    { employee: "Marcus", course: "Player Engagement", completed: false },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-2">
              <Bot className="h-8 w-8" />
              AI Employee Management Center
            </h1>
            <p className="text-muted-foreground">
              Comprehensive AI workforce management and analytics
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manager">Employee Manager</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="training">Training Center</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          {/* Employee Manager Tab */}
          <TabsContent value="manager">
            <AIEmployeeManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-muted-foreground">
                    Total Interactions
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.totalInteractions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm text-muted-foreground">
                    Avg Response Time
                  </div>
                  <div className="text-2xl font-bold text-purple-500">
                    {analyticsData.averageResponseTime}ms
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-gold" />
                  <div className="text-sm text-muted-foreground">
                    Customer Satisfaction
                  </div>
                  <div className="text-2xl font-bold text-gold">
                    {analyticsData.customerSatisfaction}/5
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-sm text-muted-foreground">
                    Resolution Rate
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {analyticsData.resolutionRate}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Key performance indicators and their recent trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performanceTrends.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.metric}</div>
                        <div className="text-2xl font-bold">
                          {typeof item.value === "number" && item.value < 10
                            ? item.value.toFixed(1)
                            : item.value}
                          {item.metric.includes("Rate") && "%"}
                          {item.metric.includes("Time") && "ms"}
                        </div>
                      </div>
                      <Badge
                        className={
                          item.isPositive
                            ? "text-green-600 bg-green-100"
                            : "text-red-600 bg-red-100"
                        }
                      >
                        {item.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold" />
                    Top Performers Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((performer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {performer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{performer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {performer.role}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-gold" />
                            <span className="font-semibold">
                              {performer.rating}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {performer.conversations} chats
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    System Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Employees</span>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">
                        {analyticsData.activeEmployees}/
                        {analyticsData.totalEmployees}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Conversations Today</span>
                    <span className="font-semibold">
                      {analyticsData.conversationsToday}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <span className="font-semibold text-green-500">
                      {analyticsData.uptime}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Cost Savings (Monthly)</span>
                    <span className="font-semibold text-green-500">
                      ${analyticsData.costSavings.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Escalation Rate</span>
                    <span className="font-semibold">
                      {analyticsData.escalationRate}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training Center Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Training Center
                </CardTitle>
                <CardDescription>
                  Monitor and manage AI employee training and skill development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">
                      Available Training Modules
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Advanced Communication Skills",
                          duration: "2 hours",
                          level: "Intermediate",
                        },
                        {
                          name: "Conflict Resolution Mastery",
                          duration: "3 hours",
                          level: "Advanced",
                        },
                        {
                          name: "Customer Psychology",
                          duration: "1.5 hours",
                          level: "Beginner",
                        },
                        {
                          name: "Technical Troubleshooting",
                          duration: "4 hours",
                          level: "Advanced",
                        },
                        {
                          name: "Sales and Upselling",
                          duration: "2.5 hours",
                          level: "Intermediate",
                        },
                      ].map((module, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{module.name}</h4>
                            <Badge variant="outline">{module.level}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {module.duration}
                          </div>
                          <Button size="sm" className="mt-2">
                            Assign Training
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">
                      Recent Training Activity
                    </h3>
                    <div className="space-y-3">
                      {recentTraining.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {activity.employee}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.course}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activity.completed ? (
                              <Badge className="bg-green-100 text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-600">
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Training Statistics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-500">
                            23
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Courses Completed
                          </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-500">
                            47h
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Training Hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  AI System Configuration
                </CardTitle>
                <CardDescription>
                  Global settings and configurations for the AI employee system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Response Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Maximum Response Time</label>
                        <select className="border rounded px-2 py-1 text-sm">
                          <option>5 seconds</option>
                          <option>10 seconds</option>
                          <option>15 seconds</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">
                          Auto-escalation Threshold
                        </label>
                        <select className="border rounded px-2 py-1 text-sm">
                          <option>3 failed attempts</option>
                          <option>5 failed attempts</option>
                          <option>Never</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Default Language</label>
                        <select className="border rounded px-2 py-1 text-sm">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Learning & Training</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Auto-learning</label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Continuous Training</label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">
                          Performance Monitoring
                        </label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Security & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Privacy</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        All conversations are encrypted and stored securely
                        according to GDPR standards.
                      </p>
                      <Button variant="outline" size="sm">
                        Review Privacy Settings
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Audit Logging</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete audit trail of all AI interactions and
                        decisions.
                      </p>
                      <Button variant="outline" size="sm">
                        View Audit Logs
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button className="btn-primary">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
