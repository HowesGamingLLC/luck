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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Crown,
  Gem,
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  Gift,
  Percent,
  Settings,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Palette,
  Image,
  Type,
  Layout,
  Save,
  X,
} from "lucide-react";

interface GoldCoinPackage {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  bonusSweepCoins: number;
  price: number;
  originalPrice?: number;
  popular: boolean;
  bestValue: boolean;
  featured: boolean;
  active: boolean;
  icon: string;
  color: string;
  gradient: string;
  features: string[];
  category: "starter" | "premium" | "vip" | "special";
  tier: number;
  salesCount: number;
  revenue: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  targetAudience: string;
  maxPurchases?: number;
  validUntil?: Date;
  promotionalText?: string;
  customCSS?: string;
}

interface PackageAnalytics {
  totalSales: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  topPackages: { id: string; name: string; sales: number; revenue: number }[];
  salesTrend: { date: string; sales: number; revenue: number }[];
  categoryPerformance: { category: string; sales: number; percentage: number }[];
}

interface PackageManagerProps {
  onPackageSelect?: (pkg: GoldCoinPackage) => void;
  selectedPackageId?: string;
}

export function PackageManager({ onPackageSelect, selectedPackageId }: PackageManagerProps) {
  const [packages, setPackages] = useState<GoldCoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GoldCoinPackage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");

  // Form state for creating/editing packages
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    goldCoins: 10000,
    bonusSweepCoins: 5,
    price: 9.99,
    originalPrice: 0,
    popular: false,
    bestValue: false,
    featured: false,
    active: true,
    icon: "🪙",
    color: "from-blue-500 to-blue-600",
    features: [""],
    category: "starter" as GoldCoinPackage["category"],
    tier: 1,
    tags: [""],
    targetAudience: "New Players",
    maxPurchases: undefined as number | undefined,
    validUntil: undefined as Date | undefined,
    promotionalText: "",
  });

  // Mock analytics data
  const [analytics] = useState<PackageAnalytics>({
    totalSales: 2547,
    totalRevenue: 127350.50,
    avgOrderValue: 49.99,
    conversionRate: 12.5,
    topPackages: [
      { id: "premium", name: "Premium Pack", sales: 856, revenue: 59920.00 },
      { id: "popular", name: "Popular Choice", sales: 742, revenue: 29680.00 },
      { id: "starter", name: "Starter Pack", sales: 521, revenue: 5209.79 },
    ],
    salesTrend: [
      { date: "2024-01-15", sales: 45, revenue: 2250.00 },
      { date: "2024-01-16", sales: 52, revenue: 2600.00 },
      { date: "2024-01-17", sales: 38, revenue: 1900.00 },
      { date: "2024-01-18", sales: 61, revenue: 3050.00 },
      { date: "2024-01-19", sales: 73, revenue: 3650.00 },
    ],
    categoryPerformance: [
      { category: "Premium", sales: 45, percentage: 35 },
      { category: "Starter", sales: 30, percentage: 25 },
      { category: "VIP", sales: 25, percentage: 20 },
      { category: "Special", sales: 20, percentage: 15 },
    ],
  });

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      const pkg = packages.find(p => p.id === selectedPackageId);
      if (pkg) {
        setSelectedPackage(pkg);
        onPackageSelect?.(pkg);
      }
    }
  }, [selectedPackageId, packages]);

  const loadPackages = () => {
    // Mock package data with enhanced properties
    const mockPackages: GoldCoinPackage[] = [
      {
        id: "starter",
        name: "Starter Pack",
        description: "Perfect for new players to get started with their gaming journey",
        goldCoins: 10000,
        bonusSweepCoins: 5,
        price: 9.99,
        popular: false,
        bestValue: false,
        featured: false,
        active: true,
        icon: "🪙",
        color: "from-blue-500 to-blue-600",
        gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
        features: ["10,000 Gold Coins", "5 FREE Sweep Coins", "Instant delivery", "24/7 support"],
        category: "starter",
        tier: 1,
        salesCount: 521,
        revenue: 5209.79,
        conversionRate: 8.5,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-20"),
        tags: ["beginner", "value", "popular"],
        targetAudience: "New Players",
      },
      {
        id: "popular",
        name: "Popular Choice",
        description: "Most popular package with excellent value for money",
        goldCoins: 50000,
        bonusSweepCoins: 30,
        price: 39.99,
        originalPrice: 49.99,
        popular: true,
        bestValue: false,
        featured: true,
        active: true,
        icon: "⭐",
        color: "from-purple-500 to-purple-600",
        gradient: "bg-gradient-to-r from-purple-500 to-purple-600",
        features: ["50,000 Gold Coins", "30 FREE Sweep Coins", "20% bonus coins", "Priority support"],
        category: "premium",
        tier: 2,
        salesCount: 742,
        revenue: 29680.00,
        conversionRate: 15.2,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-18"),
        tags: ["popular", "best-seller", "bonus"],
        targetAudience: "Regular Players",
        promotionalText: "Save 20%",
      },
      {
        id: "premium",
        name: "Premium Pack",
        description: "Best value package for serious players who want maximum coins",
        goldCoins: 100000,
        bonusSweepCoins: 75,
        price: 69.99,
        originalPrice: 99.99,
        popular: false,
        bestValue: true,
        featured: true,
        active: true,
        icon: "👑",
        color: "from-gold to-yellow-600",
        gradient: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        features: ["100,000 Gold Coins", "75 FREE Sweep Coins", "50% bonus coins", "VIP support", "Exclusive rewards"],
        category: "premium",
        tier: 3,
        salesCount: 856,
        revenue: 59920.00,
        conversionRate: 22.1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-19"),
        tags: ["premium", "best-value", "vip"],
        targetAudience: "High-Value Players",
        promotionalText: "Best Value!",
      },
      {
        id: "mega",
        name: "Mega Package",
        description: "Ultimate package for high rollers with exclusive benefits",
        goldCoins: 250000,
        bonusSweepCoins: 200,
        price: 149.99,
        originalPrice: 199.99,
        popular: false,
        bestValue: false,
        featured: false,
        active: true,
        icon: "💎",
        color: "from-red-500 to-pink-600",
        gradient: "bg-gradient-to-r from-red-500 to-pink-600",
        features: ["250,000 Gold Coins", "200 FREE Sweep Coins", "100% bonus coins", "VIP treatment", "Personal account manager"],
        category: "vip",
        tier: 4,
        salesCount: 234,
        revenue: 35097.66,
        conversionRate: 18.7,
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-15"),
        tags: ["vip", "exclusive", "high-roller"],
        targetAudience: "VIP Players",
        maxPurchases: 1,
        promotionalText: "Limited Edition",
      },
      {
        id: "weekend-special",
        name: "Weekend Special",
        description: "Limited time weekend offer with bonus rewards",
        goldCoins: 25000,
        bonusSweepCoins: 15,
        price: 19.99,
        originalPrice: 24.99,
        popular: false,
        bestValue: false,
        featured: true,
        active: true,
        icon: "⚡",
        color: "from-green-500 to-green-600",
        gradient: "bg-gradient-to-r from-green-500 to-green-600",
        features: ["25,000 Gold Coins", "15 FREE Sweep Coins", "Weekend bonus", "Fast delivery"],
        category: "special",
        tier: 2,
        salesCount: 194,
        revenue: 3880.06,
        conversionRate: 25.3,
        createdAt: new Date("2024-01-19"),
        updatedAt: new Date("2024-01-20"),
        tags: ["weekend", "limited", "bonus"],
        targetAudience: "Weekend Players",
        maxPurchases: 2,
        validUntil: new Date("2024-01-28"),
        promotionalText: "Weekend Only!",
      },
    ];

    setPackages(mockPackages);
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || pkg.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "created_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "created_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price_desc":
        return b.price - a.price;
      case "price_asc":
        return a.price - b.price;
      case "sales_desc":
        return b.salesCount - a.salesCount;
      case "sales_asc":
        return a.salesCount - b.salesCount;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const createPackage = () => {
    const newPackage: GoldCoinPackage = {
      id: `pkg_${Date.now()}`,
      name: packageForm.name,
      description: packageForm.description,
      goldCoins: packageForm.goldCoins,
      bonusSweepCoins: packageForm.bonusSweepCoins,
      price: packageForm.price,
      originalPrice: packageForm.originalPrice || undefined,
      popular: packageForm.popular,
      bestValue: packageForm.bestValue,
      featured: packageForm.featured,
      active: packageForm.active,
      icon: packageForm.icon,
      color: packageForm.color,
      gradient: `bg-gradient-to-r ${packageForm.color}`,
      features: packageForm.features.filter(f => f.trim() !== ""),
      category: packageForm.category,
      tier: packageForm.tier,
      salesCount: 0,
      revenue: 0,
      conversionRate: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: packageForm.tags.filter(t => t.trim() !== ""),
      targetAudience: packageForm.targetAudience,
      maxPurchases: packageForm.maxPurchases,
      validUntil: packageForm.validUntil,
      promotionalText: packageForm.promotionalText || undefined,
    };

    setPackages([...packages, newPackage]);
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const updatePackage = () => {
    if (!selectedPackage) return;

    const updatedPackage: GoldCoinPackage = {
      ...selectedPackage,
      name: packageForm.name,
      description: packageForm.description,
      goldCoins: packageForm.goldCoins,
      bonusSweepCoins: packageForm.bonusSweepCoins,
      price: packageForm.price,
      originalPrice: packageForm.originalPrice || undefined,
      popular: packageForm.popular,
      bestValue: packageForm.bestValue,
      featured: packageForm.featured,
      active: packageForm.active,
      icon: packageForm.icon,
      color: packageForm.color,
      gradient: `bg-gradient-to-r ${packageForm.color}`,
      features: packageForm.features.filter(f => f.trim() !== ""),
      category: packageForm.category,
      tier: packageForm.tier,
      tags: packageForm.tags.filter(t => t.trim() !== ""),
      targetAudience: packageForm.targetAudience,
      maxPurchases: packageForm.maxPurchases,
      validUntil: packageForm.validUntil,
      promotionalText: packageForm.promotionalText || undefined,
      updatedAt: new Date(),
    };

    setPackages(packages.map(pkg => pkg.id === selectedPackage.id ? updatedPackage : pkg));
    setSelectedPackage(updatedPackage);
    resetForm();
    setIsEditDialogOpen(false);
  };

  const deletePackage = (packageId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages(packages.filter(pkg => pkg.id !== packageId));
      if (selectedPackage?.id === packageId) {
        setSelectedPackage(null);
      }
    }
  };

  const duplicatePackage = (pkg: GoldCoinPackage) => {
    const duplicated: GoldCoinPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`,
      name: `${pkg.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      salesCount: 0,
      revenue: 0,
      conversionRate: 0,
    };
    setPackages([...packages, duplicated]);
  };

  const togglePackageStatus = (packageId: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === packageId ? { ...pkg, active: !pkg.active, updatedAt: new Date() } : pkg
    ));
  };

  const resetForm = () => {
    setPackageForm({
      name: "",
      description: "",
      goldCoins: 10000,
      bonusSweepCoins: 5,
      price: 9.99,
      originalPrice: 0,
      popular: false,
      bestValue: false,
      featured: false,
      active: true,
      icon: "🪙",
      color: "from-blue-500 to-blue-600",
      features: [""],
      category: "starter",
      tier: 1,
      tags: [""],
      targetAudience: "New Players",
      maxPurchases: undefined,
      validUntil: undefined,
      promotionalText: "",
    });
  };

  const populateForm = (pkg: GoldCoinPackage) => {
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      goldCoins: pkg.goldCoins,
      bonusSweepCoins: pkg.bonusSweepCoins,
      price: pkg.price,
      originalPrice: pkg.originalPrice || 0,
      popular: pkg.popular,
      bestValue: pkg.bestValue,
      featured: pkg.featured,
      active: pkg.active,
      icon: pkg.icon,
      color: pkg.color,
      features: [...pkg.features, ""],
      category: pkg.category,
      tier: pkg.tier,
      tags: [...pkg.tags, ""],
      targetAudience: pkg.targetAudience,
      maxPurchases: pkg.maxPurchases,
      validUntil: pkg.validUntil,
      promotionalText: pkg.promotionalText || "",
    });
  };

  const addFeature = () => {
    setPackageForm({
      ...packageForm,
      features: [...packageForm.features, ""]
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...packageForm.features];
    newFeatures[index] = value;
    setPackageForm({
      ...packageForm,
      features: newFeatures
    });
  };

  const removeFeature = (index: number) => {
    setPackageForm({
      ...packageForm,
      features: packageForm.features.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    setPackageForm({
      ...packageForm,
      tags: [...packageForm.tags, ""]
    });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...packageForm.tags];
    newTags[index] = value;
    setPackageForm({
      ...packageForm,
      tags: newTags
    });
  };

  const removeTag = (index: number) => {
    setPackageForm({
      ...packageForm,
      tags: packageForm.tags.filter((_, i) => i !== index)
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "starter": return "text-blue-500 bg-blue-100";
      case "premium": return "text-purple-500 bg-purple-100";
      case "vip": return "text-gold bg-yellow-100";
      case "special": return "text-green-500 bg-green-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Package Manager
            </h2>
            <p className="text-muted-foreground">
              Create and manage Gold Coin packages for your store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
            <Button onClick={loadPackages} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-muted-foreground">Total Sales</div>
              <div className="text-2xl font-bold">{analytics.totalSales.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-2xl font-bold text-green-500">
                ${analytics.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-sm text-muted-foreground">Avg Order Value</div>
              <div className="text-2xl font-bold text-purple-500">
                ${analytics.avgOrderValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-2xl font-bold text-orange-500">
                {analytics.conversionRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Performing Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  Top Performing Packages
                </CardTitle>
                <CardDescription>
                  Best selling packages by revenue and sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPackages.map((pkg, index) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.sales} sales
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-500">
                          ${pkg.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoryPerformance.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="font-medium">{category.sales} sales ({category.percentage}%)</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Packages</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, description, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
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
                        <SelectItem value="price_desc">Price High-Low</SelectItem>
                        <SelectItem value="price_asc">Price Low-High</SelectItem>
                        <SelectItem value="sales_desc">Best Selling</SelectItem>
                        <SelectItem value="sales_asc">Least Selling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredPackages.length} of {packages.length} packages
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="overflow-hidden relative transition-all hover:shadow-lg">
                  {/* Package Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    {pkg.popular && (
                      <Badge className="bg-purple-500 text-white font-bold">
                        POPULAR
                      </Badge>
                    )}
                    {pkg.bestValue && (
                      <Badge className="bg-gold text-black font-bold">
                        BEST VALUE
                      </Badge>
                    )}
                    {pkg.featured && (
                      <Badge className="bg-green-500 text-white font-bold">
                        FEATURED
                      </Badge>
                    )}
                    {!pkg.active && (
                      <Badge className="bg-red-500 text-white">
                        INACTIVE
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full ${pkg.gradient} flex items-center justify-center text-3xl`}
                    >
                      {pkg.icon}
                    </div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="text-center">
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${pkg.originalPrice}
                        </div>
                      )}
                      <div className="text-3xl font-bold">${pkg.price}</div>
                      {pkg.promotionalText && (
                        <div className="text-sm text-green-600 font-medium">
                          {pkg.promotionalText}
                        </div>
                      )}
                    </div>

                    {/* Package Contents */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gold/10 rounded">
                        <span className="text-sm font-medium">Gold Coins</span>
                        <span className="font-bold text-gold">
                          {pkg.goldCoins.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-teal/10 rounded">
                        <span className="text-sm font-medium">Sweep Coins</span>
                        <span className="font-bold text-teal">
                          {pkg.bonusSweepCoins}
                        </span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">{pkg.salesCount}</div>
                        <div className="text-muted-foreground">Sales</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">${pkg.revenue.toFixed(0)}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="space-y-2">
                      <Badge className={getCategoryColor(pkg.category)} variant="outline">
                        {pkg.category.toUpperCase()}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {pkg.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPackage(pkg);
                              populateForm(pkg);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Package</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicatePackage(pkg)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate Package</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePackageStatus(pkg.id)}
                          >
                            {pkg.active ? 
                              <XCircle className="h-3 w-3" /> : 
                              <CheckCircle className="h-3 w-3" />
                            }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {pkg.active ? "Deactivate" : "Activate"} Package
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePackage(pkg.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Package</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Validity Information */}
                    {pkg.validUntil && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Valid until: {pkg.validUntil.toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Advanced Package Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Detailed analytics and insights about package performance would be available here
              </p>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Analytics Report
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Display Settings</CardTitle>
                <CardDescription>
                  Configure how packages are displayed in the store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Default Sort Order</h4>
                    <Select defaultValue="price_asc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Packages Per Page</h4>
                    <Select defaultValue="12">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 packages</SelectItem>
                        <SelectItem value="12">12 packages</SelectItem>
                        <SelectItem value="24">24 packages</SelectItem>
                        <SelectItem value="all">Show all</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Store Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show package comparisons</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable package reviews</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show purchase history</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable wishlist</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Button className="btn-primary">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Package Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
              <DialogDescription>
                Design a new Gold Coin package for your store
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                    placeholder="e.g., Premium Pack"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                    placeholder="Brief description of the package"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goldCoins">Gold Coins</Label>
                    <Input
                      id="goldCoins"
                      type="number"
                      value={packageForm.goldCoins}
                      onChange={(e) => setPackageForm({...packageForm, goldCoins: Number(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonusSweepCoins">Bonus Sweep Coins</Label>
                    <Input
                      id="bonusSweepCoins"
                      type="number"
                      value={packageForm.bonusSweepCoins}
                      onChange={(e) => setPackageForm({...packageForm, bonusSweepCoins: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({...packageForm, price: Number(e.target.value)})}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price ($ - Optional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({...packageForm, originalPrice: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                      placeholder="For discount display"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={packageForm.category}
                      onValueChange={(value) => setPackageForm({...packageForm, category: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tier">Tier Level</Label>
                    <Input
                      id="tier"
                      type="number"
                      value={packageForm.tier}
                      onChange={(e) => setPackageForm({...packageForm, tier: Number(e.target.value)})}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Design & Features */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="icon">Package Icon</Label>
                  <Input
                    id="icon"
                    value={packageForm.icon}
                    onChange={(e) => setPackageForm({...packageForm, icon: e.target.value})}
                    placeholder="🪙"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color Gradient</Label>
                  <Select
                    value={packageForm.color}
                    onValueChange={(value) => setPackageForm({...packageForm, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from-blue-500 to-blue-600">Blue</SelectItem>
                      <SelectItem value="from-purple-500 to-purple-600">Purple</SelectItem>
                      <SelectItem value="from-gold to-yellow-600">Gold</SelectItem>
                      <SelectItem value="from-green-500 to-green-600">Green</SelectItem>
                      <SelectItem value="from-red-500 to-pink-600">Red</SelectItem>
                      <SelectItem value="from-teal-500 to-cyan-600">Teal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Package Features</Label>
                  <div className="space-y-2">
                    {packageForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Feature description"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    {packageForm.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Tag name"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={packageForm.targetAudience}
                    onChange={(e) => setPackageForm({...packageForm, targetAudience: e.target.value})}
                    placeholder="e.g., New Players"
                  />
                </div>

                <div>
                  <Label htmlFor="promotionalText">Promotional Text (Optional)</Label>
                  <Input
                    id="promotionalText"
                    value={packageForm.promotionalText}
                    onChange={(e) => setPackageForm({...packageForm, promotionalText: e.target.value})}
                    placeholder="e.g., Limited Time, Best Value!"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Package Flags</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Popular Package</span>
                      <Switch
                        checked={packageForm.popular}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, popular: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Value</span>
                      <Switch
                        checked={packageForm.bestValue}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, bestValue: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Featured</span>
                      <Switch
                        checked={packageForm.featured}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, featured: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <Switch
                        checked={packageForm.active}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, active: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={createPackage} className="flex-1">
                <Package className="h-4 w-4 mr-2" />
                Create Package
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Package Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
              <DialogDescription>
                Update package details and settings
              </DialogDescription>
            </DialogHeader>
            
            {/* Same form content as create dialog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Package Name</Label>
                  <Input
                    id="edit-name"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                    placeholder="e.g., Premium Pack"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                    placeholder="Brief description of the package"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-goldCoins">Gold Coins</Label>
                    <Input
                      id="edit-goldCoins"
                      type="number"
                      value={packageForm.goldCoins}
                      onChange={(e) => setPackageForm({...packageForm, goldCoins: Number(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bonusSweepCoins">Bonus Sweep Coins</Label>
                    <Input
                      id="edit-bonusSweepCoins"
                      type="number"
                      value={packageForm.bonusSweepCoins}
                      onChange={(e) => setPackageForm({...packageForm, bonusSweepCoins: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({...packageForm, price: Number(e.target.value)})}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-originalPrice">Original Price ($ - Optional)</Label>
                    <Input
                      id="edit-originalPrice"
                      type="number"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({...packageForm, originalPrice: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                      placeholder="For discount display"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={packageForm.category}
                      onValueChange={(value) => setPackageForm({...packageForm, category: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-tier">Tier Level</Label>
                    <Input
                      id="edit-tier"
                      type="number"
                      value={packageForm.tier}
                      onChange={(e) => setPackageForm({...packageForm, tier: Number(e.target.value)})}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Design & Features */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-icon">Package Icon</Label>
                  <Input
                    id="edit-icon"
                    value={packageForm.icon}
                    onChange={(e) => setPackageForm({...packageForm, icon: e.target.value})}
                    placeholder="🪙"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-color">Color Gradient</Label>
                  <Select
                    value={packageForm.color}
                    onValueChange={(value) => setPackageForm({...packageForm, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from-blue-500 to-blue-600">Blue</SelectItem>
                      <SelectItem value="from-purple-500 to-purple-600">Purple</SelectItem>
                      <SelectItem value="from-gold to-yellow-600">Gold</SelectItem>
                      <SelectItem value="from-green-500 to-green-600">Green</SelectItem>
                      <SelectItem value="from-red-500 to-pink-600">Red</SelectItem>
                      <SelectItem value="from-teal-500 to-cyan-600">Teal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Package Features</Label>
                  <div className="space-y-2">
                    {packageForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Feature description"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    {packageForm.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Tag name"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-targetAudience">Target Audience</Label>
                  <Input
                    id="edit-targetAudience"
                    value={packageForm.targetAudience}
                    onChange={(e) => setPackageForm({...packageForm, targetAudience: e.target.value})}
                    placeholder="e.g., New Players"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-promotionalText">Promotional Text (Optional)</Label>
                  <Input
                    id="edit-promotionalText"
                    value={packageForm.promotionalText}
                    onChange={(e) => setPackageForm({...packageForm, promotionalText: e.target.value})}
                    placeholder="e.g., Limited Time, Best Value!"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Package Flags</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Popular Package</span>
                      <Switch
                        checked={packageForm.popular}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, popular: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Value</span>
                      <Switch
                        checked={packageForm.bestValue}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, bestValue: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Featured</span>
                      <Switch
                        checked={packageForm.featured}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, featured: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <Switch
                        checked={packageForm.active}
                        onCheckedChange={(checked) => setPackageForm({...packageForm, active: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={updatePackage} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
