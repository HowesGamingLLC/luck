import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoldCoinPackage } from "./Store";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Coins,
  Gem,
  Star,
  Crown,
  Zap,
  Save,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminPackages() {
  const [packages, setPackages] = useState<GoldCoinPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/packages");
        const data = await res.json();
        if (!res.ok || !data?.success)
          throw new Error(data?.error || "Failed to load");
        const mapped = (data.packages || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          goldCoins: Number(p.gc || 0),
          bonusSweepCoins: Number(p.bonus_sc || 0),
          price: Number((p.price_cents || 0) / 100),
          popular: false,
          bestValue: false,
          icon: Coins,
          color: p.color || "from-blue-500 to-blue-600",
          description: p.description || "",
          features: [],
        }));
        setPackages(mapped);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [editingPackage, setEditingPackage] = useState<GoldCoinPackage | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<GoldCoinPackage>>({
    name: "",
    goldCoins: 0,
    bonusSweepCoins: 0,
    price: 0,
    originalPrice: 0,
    popular: false,
    bestValue: false,
    description: "",
    features: [],
    color: "from-blue-500 to-blue-600",
  });

  const iconOptions = [
    { name: "Coins", icon: Coins, value: "Coins" },
    { name: "Star", icon: Star, value: "Star" },
    { name: "Crown", icon: Crown, value: "Crown" },
    { name: "Gem", icon: Gem, value: "Gem" },
    { name: "Zap", icon: Zap, value: "Zap" },
  ];

  const colorOptions = [
    { name: "Blue", value: "from-blue-500 to-blue-600" },
    { name: "Purple", value: "from-purple-500 to-purple-600" },
    { name: "Gold", value: "from-gold to-yellow-600" },
    { name: "Green", value: "from-green-500 to-green-600" },
    { name: "Red", value: "from-red-500 to-pink-600" },
    { name: "Teal", value: "from-teal-500 to-teal-600" },
  ];

  const handleEdit = (pkg: GoldCoinPackage) => {
    setEditingPackage(pkg);
    setFormData({
      ...pkg,
      features: [...pkg.features],
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      goldCoins: 0,
      bonusSweepCoins: 0,
      price: 0,
      originalPrice: 0,
      popular: false,
      bestValue: false,
      description: "",
      features: [],
      color: "from-blue-500 to-blue-600",
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.goldCoins || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    const packageData: GoldCoinPackage = {
      id: editingPackage?.id || `pkg_${Date.now()}`,
      name: formData.name!,
      goldCoins: formData.goldCoins!,
      bonusSweepCoins: formData.bonusSweepCoins!,
      price: formData.price!,
      originalPrice: formData.originalPrice,
      popular: formData.popular!,
      bestValue: formData.bestValue!,
      icon:
        iconOptions.find((icon) => icon.value === formData.icon)?.icon || Coins,
      color: formData.color!,
      description: formData.description!,
      features: formData.features!,
      savings:
        formData.originalPrice && formData.originalPrice > formData.price!
          ? Math.round(
              ((formData.originalPrice - formData.price!) /
                formData.originalPrice) *
                100,
            )
          : undefined,
    };

    if (editingPackage) {
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === editingPackage.id ? packageData : pkg)),
      );
    } else {
      setPackages((prev) => [...prev, packageData]);
    }

    setIsCreateDialogOpen(false);
    setEditingPackage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.price * 100, 0); // Assume 100 sales each for demo
  const totalPackagesSold = packages.length * 100; // Mock data

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text flex items-center gap-2">
              <Package className="h-8 w-8" />
              Package Management
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Create and manage Gold Coin packages for the store
            </p>
          </div>
          <Button onClick={handleCreate} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Active Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
              <p className="text-xs text-muted-foreground">
                Available for purchase
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From package sales
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Packages Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPackagesSold}</div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {(
                  packages.reduce((sum, pkg) => sum + pkg.price, 0) /
                  packages.length
                ).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Per package</p>
            </CardContent>
          </Card>
        </div>

        {/* Package List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Gold Coin Packages</CardTitle>
            <CardDescription>
              Manage your store's Gold Coin packages and their bonus Sweep Coins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Gold Coins</TableHead>
                    <TableHead>Bonus SC</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center`}
                          >
                            <pkg.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{pkg.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gold">
                          {pkg.goldCoins.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-teal">
                          {pkg.bonusSweepCoins}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${pkg.price}</div>
                          {pkg.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              ${pkg.originalPrice}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pkg.popular && (
                            <Badge className="bg-purple text-white text-xs">
                              Popular
                            </Badge>
                          )}
                          {pkg.bestValue && (
                            <Badge className="bg-gold text-black text-xs">
                              Best Value
                            </Badge>
                          )}
                          {pkg.savings && (
                            <Badge variant="outline" className="text-xs">
                              {pkg.savings}% OFF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(pkg.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Package Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Edit Package" : "Create New Package"}
              </DialogTitle>
              <DialogDescription>
                Configure the package details, pricing, and bonus rewards
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Starter Pack"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description"
                  />
                </div>
              </div>

              {/* Coins and Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goldCoins">Gold Coins *</Label>
                  <Input
                    id="goldCoins"
                    type="number"
                    value={formData.goldCoins || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        goldCoins: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="bonusSweepCoins">Bonus Sweep Coins *</Label>
                  <Input
                    id="bonusSweepCoins"
                    type="number"
                    value={formData.bonusSweepCoins || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonusSweepCoins: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        originalPrice: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    placeholder="12.99"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if no discount
                  </p>
                </div>
              </div>

              {/* Visual Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={formData.icon || "Coins"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        icon: e.target.value as any,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <select
                    id="color"
                    value={formData.color || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={formData.popular || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, popular: checked }))
                    }
                  />
                  <Label htmlFor="popular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bestValue"
                    checked={formData.bestValue || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, bestValue: checked }))
                    }
                  />
                  <Label htmlFor="bestValue">Mark as Best Value</Label>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Package Features</Label>
                <div className="space-y-2 mt-2">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        placeholder="Feature description"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
