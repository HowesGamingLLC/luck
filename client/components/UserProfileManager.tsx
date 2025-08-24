import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth, getAllUsers, User } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  User as UserIcon,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Coins,
  Gem,
  TrendingUp,
  TrendingDown,
  Ban,
  UserCheck,
  UserX,
  Settings,
  History,
  CreditCard,
  FileText,
  Activity,
  Flag,
  MessageSquare,
  Crown,
  Save,
  X,
  Plus,
  MoreHorizontal,
  Lock,
  Unlock,
  RefreshCw,
  Upload,
  Camera,
  Target,
} from "lucide-react";

interface UserProfile extends User {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  accountInfo: {
    level: number;
    vipStatus: boolean;
    accountLocked: boolean;
    accountNotes: string;
    riskLevel: "low" | "medium" | "high";
    totalDeposits: number;
    totalWithdrawals: number;
    netPosition: number;
    lifetimeValue: number;
    averageSessionTime: number;
    lastIP: string;
    lastUserAgent: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    responsibleGamingLimits: {
      dailyLossLimit?: number;
      weeklyLossLimit?: number;
      monthlyLossLimit?: number;
      sessionTimeLimit?: number;
    };
  };
  documents: {
    id: string;
    type: "id" | "proof_of_address" | "selfie" | "bank_statement";
    filename: string;
    uploadDate: Date;
    status: "pending" | "approved" | "rejected";
    notes?: string;
  }[];
  activityLog: {
    id: string;
    action: string;
    timestamp: Date;
    ip: string;
    details: string;
  }[];
}

interface UserProfileManagerProps {
  onUserSelect?: (user: UserProfile) => void;
  selectedUserId?: string;
}

export function UserProfileManager({
  onUserSelect,
  selectedUserId,
}: UserProfileManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [showDetails, setShowDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filterBy, sortBy]);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.id === selectedUserId);
      if (user) {
        setSelectedUser(user);
        setShowDetails(true);
      }
    }
  }, [selectedUserId, users]);

  const loadUsers = () => {
    const baseUsers = getAllUsers();

    // Enhance with mock profile data
    const enhancedUsers: UserProfile[] = baseUsers.map((user) => ({
      ...user,
      personalInfo: {
        firstName: user.name.split(" ")[0] || user.name,
        lastName: user.name.split(" ")[1] || "",
        phone:
          user.id === "admin_1"
            ? "+1 (555) 123-4567"
            : "+1 (555) " +
              Math.floor(Math.random() * 900 + 100) +
              "-" +
              Math.floor(Math.random() * 9000 + 1000),
        address: {
          street: `${Math.floor(Math.random() * 9999)} Main St`,
          city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][
            Math.floor(Math.random() * 5)
          ],
          state: ["NY", "CA", "IL", "TX", "AZ"][Math.floor(Math.random() * 5)],
          zipCode: Math.floor(Math.random() * 90000 + 10000).toString(),
          country: "USA",
        },
      },
      accountInfo: {
        level: Math.floor(Math.random() * 10) + 1,
        vipStatus: Math.random() > 0.8,
        accountLocked: false,
        accountNotes: "",
        riskLevel:
          user.totalLosses > 200
            ? "high"
            : user.totalLosses > 100
              ? "medium"
              : "low",
        totalDeposits: Math.random() * 1000 + user.totalLosses,
        totalWithdrawals: Math.random() * 500,
        netPosition: Math.random() * 200 - 100,
        lifetimeValue: Math.random() * 2000,
        averageSessionTime: Math.random() * 120 + 30,
        lastIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        lastUserAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        responsibleGamingLimits: {
          dailyLossLimit: 100,
          weeklyLossLimit: 500,
          monthlyLossLimit: 2000,
          sessionTimeLimit: 240,
        },
      },
      documents: [
        {
          id: "doc_1",
          type: "id",
          filename: "drivers_license.jpg",
          uploadDate: new Date(
            Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
          ),
          status:
            user.kycStatus === "approved"
              ? "approved"
              : user.kycStatus === "pending"
                ? "pending"
                : "rejected",
        },
        {
          id: "doc_2",
          type: "proof_of_address",
          filename: "utility_bill.pdf",
          uploadDate: new Date(
            Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000,
          ),
          status:
            user.kycStatus === "approved"
              ? "approved"
              : user.kycStatus === "pending"
                ? "pending"
                : "rejected",
        },
      ],
      activityLog: [
        {
          id: "act_1",
          action: "Login",
          timestamp: user.lastLoginAt,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          details: "Successful login from desktop",
        },
        {
          id: "act_2",
          action: "Game Session",
          timestamp: new Date(user.lastLoginAt.getTime() - 30 * 60 * 1000),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          details: "Played slots for 45 minutes",
        },
        {
          id: "act_3",
          action: "Deposit",
          timestamp: new Date(
            user.lastLoginAt.getTime() - 2 * 24 * 60 * 60 * 1000,
          ),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          details: "Deposited $25.00 via credit card",
        },
      ],
    }));

    setUsers(enhancedUsers);
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.personalInfo.phone?.includes(searchTerm) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    switch (filterBy) {
      case "verified":
        filtered = filtered.filter((user) => user.verified);
        break;
      case "unverified":
        filtered = filtered.filter((user) => !user.verified);
        break;
      case "high_risk":
        filtered = filtered.filter(
          (user) => user.accountInfo.riskLevel === "high",
        );
        break;
      case "vip":
        filtered = filtered.filter((user) => user.accountInfo.vipStatus);
        break;
      case "locked":
        filtered = filtered.filter((user) => user.accountInfo.accountLocked);
        break;
      case "kyc_pending":
        filtered = filtered.filter((user) => user.kycStatus === "pending");
        break;
      case "kyc_rejected":
        filtered = filtered.filter((user) => user.kycStatus === "rejected");
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "created_desc":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "created_asc":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "losses_desc":
        filtered.sort((a, b) => b.totalLosses - a.totalLosses);
        break;
      case "losses_asc":
        filtered.sort((a, b) => a.totalLosses - b.totalLosses);
        break;
      case "last_active":
        filtered.sort(
          (a, b) =>
            new Date(b.lastLoginAt).getTime() -
            new Date(a.lastLoginAt).getTime(),
        );
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetails(true);
    onUserSelect?.(user);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    setSelectedUser(updatedUser);
  };

  const handleKycStatusChange = (
    userId: string,
    newStatus: User["kycStatus"],
  ) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, kycStatus: newStatus } : user,
    );
    setUsers(updatedUsers);

    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, kycStatus: newStatus });
    }
  };

  const handleAccountLock = (userId: string, locked: boolean) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            accountInfo: { ...user.accountInfo, accountLocked: locked },
          }
        : user,
    );
    setUsers(updatedUsers);

    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        accountInfo: { ...selectedUser.accountInfo, accountLocked: locked },
      });
    }
  };

  const handleNotesUpdate = (userId: string, notes: string) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? { ...user, accountInfo: { ...user.accountInfo, accountNotes: notes } }
        : user,
    );
    setUsers(updatedUsers);

    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        accountInfo: { ...selectedUser.accountInfo, accountNotes: notes },
      });
    }
  };

  const getKycStatusIcon = (status: string) => {
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
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  const exportUserData = () => {
    const csv = filteredUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      "KYC Status": user.kycStatus,
      "Risk Level": user.accountInfo.riskLevel,
      "Total Losses": user.totalLosses,
      "Total Deposits": user.accountInfo.totalDeposits,
      "Account Level": user.accountInfo.level,
      "VIP Status": user.accountInfo.vipStatus ? "Yes" : "No",
      "Last Active": user.lastLoginAt.toISOString(),
      Created: user.createdAt.toISOString(),
    }));

    const csvContent = [
      Object.keys(csv[0]).join(","),
      ...csv.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              User Profile Management
            </h2>
            <p className="text-muted-foreground">
              View and manage user profiles, KYC status, and account settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportUserData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Name, email, ID, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter">Filter By</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="high_risk">High Risk</SelectItem>
                    <SelectItem value="vip">VIP Members</SelectItem>
                    <SelectItem value="locked">Locked Accounts</SelectItem>
                    <SelectItem value="kyc_pending">KYC Pending</SelectItem>
                    <SelectItem value="kyc_rejected">KYC Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">Newest First</SelectItem>
                    <SelectItem value="created_asc">Oldest First</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                    <SelectItem value="losses_desc">Highest Losses</SelectItem>
                    <SelectItem value="losses_asc">Lowest Losses</SelectItem>
                    <SelectItem value="last_active">Recently Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Total Losses</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No users found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell onClick={() => handleUserSelect(user)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.name}
                                {user.isAdmin && (
                                  <Crown className="h-3 w-3 text-gold" />
                                )}
                                {user.accountInfo.vipStatus && (
                                  <Badge className="text-xs bg-purple-500">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getKycStatusIcon(user.kycStatus)}
                            <span className="capitalize text-sm">
                              {user.kycStatus}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={user.verified ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {user.verified ? "Verified" : "Unverified"}
                            </Badge>
                            {user.accountInfo.accountLocked && (
                              <Badge variant="destructive" className="text-xs">
                                Locked
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`text-xs ${getRiskLevelColor(user.accountInfo.riskLevel)}`}
                          >
                            {user.accountInfo.riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium text-red-500">
                            ${user.totalLosses.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Deposits: $
                            {user.accountInfo.totalDeposits.toFixed(2)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              Level {user.accountInfo.level}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {user.lastLoginAt.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.lastLoginAt.toLocaleTimeString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserSelect(user);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAccountLock(
                                      user.id,
                                      !user.accountInfo.accountLocked,
                                    );
                                  }}
                                >
                                  {user.accountInfo.accountLocked ? (
                                    <Unlock className="h-3 w-3" />
                                  ) : (
                                    <Lock className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {user.accountInfo.accountLocked
                                  ? "Unlock Account"
                                  : "Lock Account"}
                              </TooltipContent>
                            </Tooltip>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    Quick Actions - {user.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Choose an action to perform on this user
                                    account.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      variant="outline"
                                      className="h-auto flex-col p-4"
                                      onClick={() =>
                                        handleKycStatusChange(
                                          user.id,
                                          "approved",
                                        )
                                      }
                                      disabled={user.kycStatus === "approved"}
                                    >
                                      <CheckCircle className="h-4 w-4 mb-1" />
                                      <span className="text-xs">
                                        Approve KYC
                                      </span>
                                    </Button>

                                    <Button
                                      variant="outline"
                                      className="h-auto flex-col p-4"
                                      onClick={() =>
                                        handleKycStatusChange(
                                          user.id,
                                          "rejected",
                                        )
                                      }
                                      disabled={user.kycStatus === "rejected"}
                                    >
                                      <XCircle className="h-4 w-4 mb-1" />
                                      <span className="text-xs">
                                        Reject KYC
                                      </span>
                                    </Button>

                                    <Button
                                      variant="outline"
                                      className="h-auto flex-col p-4"
                                      onClick={() =>
                                        alert(
                                          "Send message functionality would be implemented here",
                                        )
                                      }
                                    >
                                      <MessageSquare className="h-4 w-4 mb-1" />
                                      <span className="text-xs">
                                        Send Message
                                      </span>
                                    </Button>

                                    <Button
                                      variant="outline"
                                      className="h-auto flex-col p-4"
                                      onClick={() => handleUserSelect(user)}
                                    >
                                      <Settings className="h-4 w-4 mb-1" />
                                      <span className="text-xs">
                                        Edit Profile
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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

        {/* User Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-medium">
                  {selectedUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedUser?.name}
                    {selectedUser?.isAdmin && (
                      <Crown className="h-4 w-4 text-gold" />
                    )}
                    {selectedUser?.accountInfo.vipStatus && (
                      <Badge className="text-xs bg-purple-500">VIP</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {selectedUser?.email} • ID: {selectedUser?.id}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="preferences">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <div className="text-sm text-muted-foreground">
                          Total Losses
                        </div>
                        <div className="text-lg font-bold text-red-500">
                          ${selectedUser.totalLosses.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <div className="text-sm text-muted-foreground">
                          Total Deposits
                        </div>
                        <div className="text-lg font-bold text-green-500">
                          ${selectedUser.accountInfo.totalDeposits.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="text-sm text-muted-foreground">
                          Account Level
                        </div>
                        <div className="text-lg font-bold text-blue-500">
                          Level {selectedUser.accountInfo.level}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <div className="text-sm text-muted-foreground">
                          Risk Level
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            selectedUser.accountInfo.riskLevel === "high"
                              ? "text-red-500"
                              : selectedUser.accountInfo.riskLevel === "medium"
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        >
                          {selectedUser.accountInfo.riskLevel.toUpperCase()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>KYC Status</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getKycStatusIcon(selectedUser.kycStatus)}
                            <span className="capitalize">
                              {selectedUser.kycStatus}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label>Verification</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {selectedUser.verified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>
                              {selectedUser.verified
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label>Account Lock</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {selectedUser.accountInfo.accountLocked ? (
                              <Lock className="h-4 w-4 text-red-500" />
                            ) : (
                              <Unlock className="h-4 w-4 text-green-500" />
                            )}
                            <span>
                              {selectedUser.accountInfo.accountLocked
                                ? "Locked"
                                : "Active"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label>Registration</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Admin Notes
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNotes(!editingNotes);
                            setTempNotes(selectedUser.accountInfo.accountNotes);
                          }}
                        >
                          {editingNotes ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingNotes ? (
                        <div className="space-y-3">
                          <Textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add notes about this user account..."
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                handleNotesUpdate(selectedUser.id, tempNotes);
                                setEditingNotes(false);
                              }}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingNotes(false);
                                setTempNotes(
                                  selectedUser.accountInfo.accountNotes,
                                );
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {selectedUser.accountInfo.accountNotes || (
                            <span className="text-muted-foreground italic">
                              No notes added yet.
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personal" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.personalInfo.firstName}{" "}
                            {selectedUser.personalInfo.lastName}
                          </div>
                        </div>

                        <div>
                          <Label>Email Address</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.email}
                          </div>
                        </div>

                        <div>
                          <Label>Phone Number</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.personalInfo.phone || "Not provided"}
                          </div>
                        </div>

                        <div>
                          <Label>Date of Birth</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.personalInfo.dateOfBirth?.toLocaleDateString() ||
                              "Not provided"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Address</Label>
                        <div className="text-sm mt-1 space-y-1">
                          <div>{selectedUser.personalInfo.address?.street}</div>
                          <div>
                            {selectedUser.personalInfo.address?.city},{" "}
                            {selectedUser.personalInfo.address?.state}{" "}
                            {selectedUser.personalInfo.address?.zipCode}
                          </div>
                          <div>
                            {selectedUser.personalInfo.address?.country}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Account Level</Label>
                            <div className="text-sm mt-1">
                              Level {selectedUser.accountInfo.level}
                            </div>
                          </div>

                          <div>
                            <Label>VIP Status</Label>
                            <div className="text-sm mt-1">
                              {selectedUser.accountInfo.vipStatus
                                ? "VIP Member"
                                : "Regular Member"}
                            </div>
                          </div>

                          <div>
                            <Label>Risk Assessment</Label>
                            <Badge
                              className={`mt-1 ${getRiskLevelColor(selectedUser.accountInfo.riskLevel)}`}
                            >
                              {selectedUser.accountInfo.riskLevel.toUpperCase()}{" "}
                              RISK
                            </Badge>
                          </div>

                          <div>
                            <Label>Average Session Time</Label>
                            <div className="text-sm mt-1">
                              {Math.round(
                                selectedUser.accountInfo.averageSessionTime,
                              )}{" "}
                              minutes
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Total Deposits</Label>
                            <div className="text-sm mt-1 text-green-500 font-medium">
                              $
                              {selectedUser.accountInfo.totalDeposits.toFixed(
                                2,
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>Total Withdrawals</Label>
                            <div className="text-sm mt-1 text-blue-500 font-medium">
                              $
                              {selectedUser.accountInfo.totalWithdrawals.toFixed(
                                2,
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>Net Position</Label>
                            <div
                              className={`text-sm mt-1 font-medium ${
                                selectedUser.accountInfo.netPosition >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              ${selectedUser.accountInfo.netPosition.toFixed(2)}
                            </div>
                          </div>

                          <div>
                            <Label>Lifetime Value</Label>
                            <div className="text-sm mt-1 font-medium">
                              $
                              {selectedUser.accountInfo.lifetimeValue.toFixed(
                                2,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Last Known IP Address</Label>
                          <div className="text-sm mt-1 font-mono">
                            {selectedUser.accountInfo.lastIP}
                          </div>
                        </div>

                        <div>
                          <Label>Last User Agent</Label>
                          <div className="text-sm mt-1 break-all">
                            {selectedUser.accountInfo.lastUserAgent}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Documents</CardTitle>
                      <CardDescription>
                        Identity verification documents submitted by the user
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedUser.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {doc.type
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {doc.filename}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Uploaded:{" "}
                                  {doc.uploadDate.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  doc.status === "approved"
                                    ? "default"
                                    : doc.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {doc.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Log</CardTitle>
                      <CardDescription>
                        Recent account activity and system events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedUser.activityLog.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 border rounded-lg"
                          >
                            <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{log.action}</div>
                                <div className="text-xs text-muted-foreground">
                                  {log.timestamp.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {log.details}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <Switch
                          id="email-notifications"
                          checked={selectedUser.preferences.emailNotifications}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">
                          SMS Notifications
                        </Label>
                        <Switch
                          id="sms-notifications"
                          checked={selectedUser.preferences.smsNotifications}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing-emails">
                          Marketing Emails
                        </Label>
                        <Switch
                          id="marketing-emails"
                          checked={selectedUser.preferences.marketingEmails}
                          disabled
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Responsible Gaming Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Daily Loss Limit</Label>
                          <div className="text-sm mt-1">
                            $
                            {selectedUser.preferences.responsibleGamingLimits
                              .dailyLossLimit || "Not set"}
                          </div>
                        </div>

                        <div>
                          <Label>Weekly Loss Limit</Label>
                          <div className="text-sm mt-1">
                            $
                            {selectedUser.preferences.responsibleGamingLimits
                              .weeklyLossLimit || "Not set"}
                          </div>
                        </div>

                        <div>
                          <Label>Monthly Loss Limit</Label>
                          <div className="text-sm mt-1">
                            $
                            {selectedUser.preferences.responsibleGamingLimits
                              .monthlyLossLimit || "Not set"}
                          </div>
                        </div>

                        <div>
                          <Label>Session Time Limit</Label>
                          <div className="text-sm mt-1">
                            {selectedUser.preferences.responsibleGamingLimits
                              .sessionTimeLimit || "Not set"}{" "}
                            minutes
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
