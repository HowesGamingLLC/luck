import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Smartphone,
  Globe,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountSettings() {
  const { user, updateProfile } = useAuth();
  const { user: currencyUser } = useCurrency();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    soundEffects: true,
    animations: true,
    autoplay: false,
    language: "en",
    currency: "USD",
    timezone: "America/New_York",
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const [limits, setLimits] = useState({
    dailySpendLimit: 50.0,
    weeklySpendLimit: 200.0,
    monthlySpendLimit: 500.0,
    sessionTimeLimit: 120, // minutes
    enableLimits: true,
    cooldownPeriod: 24, // hours
  });

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    // Update password logic here
    alert("Password updated successfully");
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const activityLog = [
    {
      action: "Login",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      ip: "192.168.1.1",
      device: "Chrome on Windows",
    },
    {
      action: "Password Changed",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ip: "192.168.1.1",
      device: "Chrome on Windows",
    },
    {
      action: "Email Updated",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ip: "192.168.1.2",
      device: "Safari on iPhone",
    },
    {
      action: "Login",
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      ip: "192.168.1.1",
      device: "Chrome on Windows",
    },
  ];

  const paymentMethods = [
    { id: "1", type: "Visa", last4: "4242", expires: "12/25", isDefault: true },
    { id: "2", type: "PayPal", email: "user@example.com", isDefault: false },
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Account Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        {/* Account Status */}
        <Card className="glass mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple to-pink rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {user?.verified ? (
                      <Badge className="bg-success text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    {user?.kycStatus === "approved" && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        KYC Approved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Account Balance
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-gold">
                      {currencyUser?.balance.goldCoins.toLocaleString() || 0} GC
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gold Coins
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-teal">
                      {currencyUser?.balance.sweepCoins.toFixed(2) || "0.00"} SC
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sweep Coins
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="limits">Responsible Gaming</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Personal Information
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            zipCode: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-500" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>
                    Upload documents to verify your identity for withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Government ID</p>
                      <p className="text-xs text-muted-foreground">
                        Driver's License or Passport
                      </p>
                      <Button size="sm" className="mt-2">
                        Upload
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Proof of Address</p>
                      <p className="text-xs text-muted-foreground">
                        Utility Bill or Bank Statement
                      </p>
                      <Button size="sm" className="mt-2">
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-500" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    className="btn-primary"
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive codes via text message
                      </p>
                    </div>
                    <Switch
                      checked={preferences.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          twoFactorAuth: checked,
                        }))
                      }
                    />
                  </div>
                  {preferences.twoFactorAuth && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Two-factor authentication is enabled. You'll receive
                        codes at {formData.phone || "your phone number"}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Account updates, security alerts, and promotions
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          emailNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Important account alerts via text message
                      </p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          smsNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Browser notifications for wins and updates
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          pushNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Promotions, bonuses, and special offers
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          marketingEmails: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="grid gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Game Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for spins, wins, and game events
                      </p>
                    </div>
                    <Switch
                      checked={preferences.soundEffects}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          soundEffects: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Animations</p>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={preferences.animations}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          animations: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autoplay</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically continue playing games
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoplay}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          autoplay: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        value={preferences.timezone}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Responsible Gaming Limits Tab */}
          <TabsContent value="limits">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Responsible Gaming Limits
                </CardTitle>
                <CardDescription>
                  Set limits to help you play responsibly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These limits are designed to help you maintain control over
                    your gaming. Limit increases have a 24-hour cooling period.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Spending Limits</p>
                    <p className="text-sm text-muted-foreground">
                      Activate daily, weekly, and monthly spending limits
                    </p>
                  </div>
                  <Switch
                    checked={limits.enableLimits}
                    onCheckedChange={(checked) =>
                      setLimits((prev) => ({ ...prev, enableLimits: checked }))
                    }
                  />
                </div>

                {limits.enableLimits && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dailyLimit">Daily Limit (SC)</Label>
                        <Input
                          id="dailyLimit"
                          type="number"
                          value={limits.dailySpendLimit}
                          onChange={(e) =>
                            setLimits((prev) => ({
                              ...prev,
                              dailySpendLimit: parseFloat(e.target.value) || 0,
                            }))
                          }
                          step="0.25"
                          min="0.25"
                          max="1000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weeklyLimit">Weekly Limit (SC)</Label>
                        <Input
                          id="weeklyLimit"
                          type="number"
                          value={limits.weeklySpendLimit}
                          onChange={(e) =>
                            setLimits((prev) => ({
                              ...prev,
                              weeklySpendLimit: parseFloat(e.target.value) || 0,
                            }))
                          }
                          step="0.25"
                          min="0.25"
                          max="5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlyLimit">Monthly Limit (SC)</Label>
                        <Input
                          id="monthlyLimit"
                          type="number"
                          value={limits.monthlySpendLimit}
                          onChange={(e) =>
                            setLimits((prev) => ({
                              ...prev,
                              monthlySpendLimit:
                                parseFloat(e.target.value) || 0,
                            }))
                          }
                          step="0.25"
                          min="0.25"
                          max="10000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sessionLimit">
                        Session Time Limit (minutes)
                      </Label>
                      <Input
                        id="sessionLimit"
                        type="number"
                        value={limits.sessionTimeLimit}
                        onChange={(e) =>
                          setLimits((prev) => ({
                            ...prev,
                            sessionTimeLimit: parseInt(e.target.value) || 0,
                          }))
                        }
                        min="15"
                        max="480"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum continuous playing time before forced break
                      </p>
                    </div>

                    <Button className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Limits
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="grid gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    View your recent account activity and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLog.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-card/50 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.device} • {activity.ip}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-500" />
                    Data Export
                  </CardTitle>
                  <CardDescription>
                    Download your account data and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-sm">Download Account Data</span>
                      <span className="text-xs text-muted-foreground">
                        Personal information and settings
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-sm">Download Game History</span>
                      <span className="text-xs text-muted-foreground">
                        All games played and results
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that will permanently affect your
                    account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Deleting your account is permanent and cannot be undone.
                      All your data, including game history and remaining
                      balance, will be lost.
                    </AlertDescription>
                  </Alert>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
