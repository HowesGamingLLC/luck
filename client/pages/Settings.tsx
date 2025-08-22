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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Shield,
  Bell,
  Eye,
  Palette,
  Globe,
  User,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Key,
  QrCode,
  Languages,
  MapPin,
  Clock,
  Volume2,
  Database,
  UserX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock settings data
const mockSettings = {
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-01-15",
    timezone: "America/New_York",
    language: "en",
    country: "US",
  },
  security: {
    twoFactorEnabled: true,
    smsVerification: true,
    emailVerification: true,
    loginNotifications: true,
    sessionTimeout: 30,
  },
  notifications: {
    email: {
      winnings: true,
      promotions: true,
      referrals: true,
      security: true,
      newsletter: false,
    },
    sms: {
      winnings: true,
      security: true,
      promotions: false,
    },
    push: {
      winnings: true,
      games: true,
      referrals: true,
    },
  },
  privacy: {
    showOnLeaderboard: true,
    allowReferralTracking: true,
    dataCollection: true,
    marketingCommunications: false,
  },
  display: {
    theme: "dark",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    soundEffects: true,
    animations: true,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const { toast } = useToast();

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const updateNestedSetting = (
    section: string,
    subsection: string,
    key: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [key]: value,
        },
      },
    }));

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    // In real app, this would call API
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });

    setIsChangePasswordOpen(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const exportData = () => {
    toast({
      title: "Data Export Started",
      description: "You'll receive an email with your data within 24 hours.",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Account Settings
          </h1>
          <p className="text-xl text-muted-foreground">
            Customize your account preferences, security, and privacy settings.
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.profile.firstName}
                      onChange={(e) =>
                        updateSetting("profile", "firstName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.profile.lastName}
                      onChange={(e) =>
                        updateSetting("profile", "lastName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      updateSetting("profile", "email", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      updateSetting("profile", "phone", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.profile.timezone}
                      onValueChange={(value) =>
                        updateSetting("profile", "timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={settings.profile.country}
                      onValueChange={(value) =>
                        updateSetting("profile", "country", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("security", "twoFactorEnabled", checked)
                      }
                    />
                    {settings.security.twoFactorEnabled && (
                      <Badge className="bg-success text-white">Enabled</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive verification codes via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.smsVerification}
                    onCheckedChange={(checked) =>
                      updateSetting("security", "smsVerification", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.loginNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting("security", "loginNotifications", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Session Management</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-logout after:</span>
                    <Select
                      value={settings.security.sessionTimeout.toString()}
                      onValueChange={(value) =>
                        updateSetting(
                          "security",
                          "sessionTimeout",
                          parseInt(value),
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Dialog
                    open={isChangePasswordOpen}
                    onOpenChange={setIsChangePasswordOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwords.current}
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                current: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwords.new}
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                new: e.target.value,
                              })
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
                            value={passwords.confirm}
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                confirm: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsChangePasswordOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordChange}>
                          Update Password
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Setup 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about account activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4" />
                    <Label className="text-base">Email Notifications</Label>
                  </div>
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Winnings and prizes</span>
                      <Switch
                        checked={settings.notifications.email.winnings}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "email",
                            "winnings",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Promotions and bonuses</span>
                      <Switch
                        checked={settings.notifications.email.promotions}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "email",
                            "promotions",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Referral updates</span>
                      <Switch
                        checked={settings.notifications.email.referrals}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "email",
                            "referrals",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security alerts</span>
                      <Switch
                        checked={settings.notifications.email.security}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "email",
                            "security",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Newsletter</span>
                      <Switch
                        checked={settings.notifications.email.newsletter}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "email",
                            "newsletter",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SMS Notifications */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4" />
                    <Label className="text-base">SMS Notifications</Label>
                  </div>
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Big winnings ($100+)</span>
                      <Switch
                        checked={settings.notifications.sms.winnings}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "sms",
                            "winnings",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security alerts</span>
                      <Switch
                        checked={settings.notifications.sms.security}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "sms",
                            "security",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Special promotions</span>
                      <Switch
                        checked={settings.notifications.sms.promotions}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "sms",
                            "promotions",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-4 w-4" />
                    <Label className="text-base">Push Notifications</Label>
                  </div>
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Winnings and prizes</span>
                      <Switch
                        checked={settings.notifications.push.winnings}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "push",
                            "winnings",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Game reminders</span>
                      <Switch
                        checked={settings.notifications.push.games}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "push",
                            "games",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Referral activity</span>
                      <Switch
                        checked={settings.notifications.push.referrals}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "notifications",
                            "push",
                            "referrals",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show on Leaderboard</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your username on public leaderboards
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showOnLeaderboard}
                    onCheckedChange={(checked) =>
                      updateSetting("privacy", "showOnLeaderboard", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Referral Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see referral statistics in their dashboard
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowReferralTracking}
                    onCheckedChange={(checked) =>
                      updateSetting("privacy", "allowReferralTracking", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow analytics to improve your experience
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) =>
                      updateSetting("privacy", "dataCollection", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized offers and promotions
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.marketingCommunications}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "privacy",
                        "marketingCommunications",
                        checked,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Preferences
                </CardTitle>
                <CardDescription>
                  Customize the appearance and behavior of the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select
                    value={settings.display.theme}
                    onValueChange={(value) =>
                      updateSetting("display", "theme", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value) =>
                      updateSetting("display", "language", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for wins and interactions
                    </p>
                  </div>
                  <Switch
                    checked={settings.display.soundEffects}
                    onCheckedChange={(checked) =>
                      updateSetting("display", "soundEffects", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and effects
                    </p>
                  </div>
                  <Switch
                    checked={settings.display.animations}
                    onCheckedChange={(checked) =>
                      updateSetting("display", "animations", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export your data or manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export Account Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of all your account data
                    </p>
                  </div>
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-destructive">Danger Zone</Label>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                    <div>
                      <Label className="text-destructive">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Dialog
                      open={isDeleteAccountOpen}
                      onOpenChange={setIsDeleteAccountOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-destructive">
                            Delete Account
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-destructive/10 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="font-semibold text-destructive">
                              Warning
                            </span>
                          </div>
                          <p className="text-sm">
                            Please withdraw any remaining balance before
                            deleting your account.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteAccountOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive">
                            Yes, Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
