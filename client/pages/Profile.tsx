import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  User,
  Edit3,
  Trophy,
  Target,
  Calendar,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  Coins,
  Gift,
  Crown,
  Star,
  TrendingUp,
  Zap,
  Award,
  MapPin,
  Phone,
  Camera,
} from "lucide-react";

// Mock user data - in real app this would come from API
const mockUser = {
  id: "user_12345",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "",
  memberSince: "March 2024",
  location: "New York, NY",
  phone: "+1 (555) 123-4567",
  verified: true,
  level: 12,
  xp: 2850,
  xpToNext: 3500,
  balance: 1250.50,
  totalWon: 5420.75,
  totalSpins: 347,
  winRate: 68,
  favoriteGame: "Daily Spin Wheel",
  currentStreak: 7,
  longestStreak: 23,
  rank: 156,
  referrals: 12,
};

const achievements = [
  { id: 1, name: "First Win", description: "Won your first prize", icon: Trophy, earned: true, rarity: "common" },
  { id: 2, name: "Lucky Seven", description: "Won 7 times in a row", icon: Target, earned: true, rarity: "rare" },
  { id: 3, name: "Big Spender", description: "Accumulated $1000+ in winnings", icon: Coins, earned: true, rarity: "epic" },
  { id: 4, name: "Streak Master", description: "Maintain a 20+ day winning streak", icon: Zap, earned: true, rarity: "legendary" },
  { id: 5, name: "Referral King", description: "Refer 10+ friends", icon: Crown, earned: true, rarity: "epic" },
  { id: 6, name: "High Roller", description: "Win $500+ in a single spin", icon: Star, earned: false, rarity: "legendary" },
  { id: 7, name: "Dedication", description: "Play for 100 consecutive days", icon: Calendar, earned: false, rarity: "epic" },
  { id: 8, name: "Fortune Finder", description: "Win the maximum prize", icon: Gift, earned: false, rarity: "mythic" },
];

const recentActivity = [
  { type: "win", amount: "$50", game: "Daily Spin", time: "2 hours ago", icon: Trophy },
  { type: "achievement", title: "Lucky Seven", time: "1 day ago", icon: Award },
  { type: "win", amount: "$25", game: "Daily Spin", time: "1 day ago", icon: Trophy },
  { type: "referral", title: "New referral bonus", amount: "$10", time: "3 days ago", icon: Gift },
  { type: "win", amount: "$100", game: "Daily Spin", time: "5 days ago", icon: Trophy },
];

export default function Profile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: mockUser.name,
    location: mockUser.location,
    phone: mockUser.phone,
  });

  const handleSaveProfile = () => {
    // In real app, this would save to API
    console.log("Saving profile:", editForm);
    setIsEditingProfile(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-400 border-gray-400";
      case "rare": return "text-blue-400 border-blue-400";
      case "epic": return "text-purple-400 border-purple-400";
      case "legendary": return "text-gold border-gold";
      case "mythic": return "text-red-400 border-red-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-6xl">
        {/* Profile Header */}
        <Card className="glass mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-gold">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple to-gold text-white text-2xl">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                  variant="outline"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-display font-bold">{mockUser.name}</h1>
                      {mockUser.verified && (
                        <Badge className="bg-success text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {mockUser.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member since {mockUser.memberSince}
                    </p>
                  </div>

                  <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level {mockUser.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {mockUser.xp} / {mockUser.xpToNext} XP
                    </span>
                  </div>
                  <Progress 
                    value={(mockUser.xp / mockUser.xpToNext) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <Coins className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gold">${mockUser.balance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Available to withdraw</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Won</CardTitle>
                  <Trophy className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">${mockUser.totalWon.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Lifetime winnings</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal">{mockUser.winRate}%</div>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Zap className="h-4 w-4 text-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple">{mockUser.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days winning</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Gaming Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Spins</span>
                    <span className="font-semibold">{mockUser.totalSpins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Favorite Game</span>
                    <span className="font-semibold">{mockUser.favoriteGame}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Global Rank</span>
                    <span className="font-semibold">#{mockUser.rank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Longest Streak</span>
                    <span className="font-semibold">{mockUser.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Referrals</span>
                    <span className="font-semibold">{mockUser.referrals}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{mockUser.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{mockUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Account Verified</span>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>User ID: {mockUser.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Your Achievements</h3>
              <p className="text-muted-foreground">
                {achievements.filter(a => a.earned).length} of {achievements.length} achievements unlocked
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <Card 
                    key={achievement.id} 
                    className={`glass transition-all duration-200 ${
                      achievement.earned 
                        ? 'border-2 ' + getRarityColor(achievement.rarity) + ' hover:scale-105' 
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`mx-auto mb-3 p-3 rounded-full ${
                        achievement.earned 
                          ? 'bg-gradient-to-br from-purple to-gold' 
                          : 'bg-muted'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          achievement.earned ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <h4 className="font-semibold mb-1">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest gaming activity and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-card/50">
                        <div className="p-2 rounded-full bg-gradient-to-br from-purple to-gold">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              {activity.type === 'win' ? (
                                <p className="font-medium">
                                  Won {activity.amount} playing {activity.game}
                                </p>
                              ) : activity.type === 'achievement' ? (
                                <p className="font-medium">
                                  Unlocked achievement: {activity.title}
                                </p>
                              ) : (
                                <p className="font-medium">
                                  {activity.title} {activity.amount && `- ${activity.amount}`}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">{activity.time}</p>
                            </div>
                            {activity.amount && activity.type === 'win' && (
                              <Badge className="bg-success text-white">
                                {activity.amount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced settings and preferences will be available in the full Settings page.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/settings">Go to Settings Page</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
