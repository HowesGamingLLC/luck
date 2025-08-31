import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuckyAiLogo } from "./LuckyAiLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrency,
  CurrencyType,
  formatCurrency,
  getCurrencyColor,
  getCurrencyIcon,
} from "@/contexts/CurrencyContext";
import {
  Menu,
  X,
  User,
  Wallet,
  Settings,
  Trophy,
  Users,
  HelpCircle,
  LogOut,
  Coins,
  Gem,
  RotateCcw,
  Shield,
  BarChart3,
  DollarSign,
  Crown,
  Home,
  ShoppingCart,
} from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { user: currencyUser } = useCurrency();

  const navItems = isAuthenticated
    ? [
        { label: "Dashboard", href: "/dashboard", icon: Home },
        { label: "Games", href: "/games", icon: Coins },
        { label: "Store", href: "/store", icon: ShoppingCart },
        { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { label: "Referrals", href: "/referrals", icon: Users },
        { label: "Help", href: "/help", icon: HelpCircle },
      ]
    : [
        { label: "Store", href: "/store", icon: ShoppingCart },
        { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { label: "Help", href: "/help", icon: HelpCircle },
      ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <LuckyAiLogo size={32} showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-1 transition-colors hover:text-purple ${
                  isActive(item.href) ? "text-purple" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Currency and Auth Section */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && currencyUser ? (
            <>
              {/* Balances */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border">
                  <Coins className="h-4 w-4 text-gold" />
                  <span className="text-xs text-muted-foreground">Gold</span>
                  <span className="text-sm font-semibold text-gold">
                    {formatCurrency(
                      currencyUser.balance.goldCoins,
                      CurrencyType.GC,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border">
                  <Gem className="h-4 w-4 text-teal" />
                  <span className="text-xs text-muted-foreground">Sweep</span>
                  <span className="text-sm font-semibold text-teal">
                    {formatCurrency(
                      currencyUser.balance.sweepCoins,
                      CurrencyType.SC,
                    )}
                  </span>
                </div>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple text-white">
                        {authUser?.name.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-gold" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{authUser?.name}</p>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {authUser?.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Balance Display in Menu */}
                  <div className="p-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-gold" />
                        Gold Coins
                      </span>
                      <span className="font-semibold text-gold">
                        {formatCurrency(
                          currencyUser.balance.goldCoins,
                          CurrencyType.GC,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-teal" />
                        Sweep Coins
                      </span>
                      <span className="font-semibold text-teal">
                        {formatCurrency(
                          currencyUser.balance.sweepCoins,
                          CurrencyType.SC,
                        )}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                      {currencyUser.balance.sweepCoins >= 100 && (
                        <Badge className="ml-auto bg-success text-white text-xs">
                          Withdraw Ready
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Only Section */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/players" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Player Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/packages"
                          className="flex items-center"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>Manage Packages</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="btn-primary">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="container py-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-purple/10 text-purple"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Balance Display */}
              {isAuthenticated && currencyUser && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Coins className="h-4 w-4 text-gold" />
                      Gold Coins
                    </span>
                    <span className="text-sm font-semibold text-gold">
                      {formatCurrency(
                        currencyUser.balance.goldCoins,
                        CurrencyType.GC,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Gem className="h-4 w-4 text-teal" />
                      Sweep Coins
                    </span>
                    <span className="text-sm font-semibold text-teal">
                      {formatCurrency(
                        currencyUser.balance.sweepCoins,
                        CurrencyType.SC,
                      )}
                    </span>
                  </div>

                  {/* Mobile Auth Actions */}
                  {!isAuthenticated && (
                    <div className="flex flex-col space-y-2 px-3 py-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button asChild className="w-full btn-primary">
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
