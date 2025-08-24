import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { useCurrency, CurrencyType, formatCurrency, getCurrencyColor, getCurrencyIcon } from "@/contexts/CurrencyContext";
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
} from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock auth state
  const location = useLocation();
  
  const { 
    user, 
    selectedCurrency, 
    setSelectedCurrency 
  } = useCurrency();

  const navItems = [
    { label: "Games", href: "/games", icon: Coins },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Referrals", href: "/referrals", icon: Users },
    { label: "Help", href: "/help", icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getCurrentBalance = () => {
    if (!user) return 0;
    return selectedCurrency === CurrencyType.GC 
      ? user.balance.goldCoins 
      : user.balance.sweepCoins;
  };

  const toggleCurrency = () => {
    setSelectedCurrency(
      selectedCurrency === CurrencyType.GC 
        ? CurrencyType.SC 
        : CurrencyType.GC
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple to-gold">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-xl font-display font-bold gradient-text">
            McLuck
          </span>
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
                  isActive(item.href)
                    ? "text-purple"
                    : "text-muted-foreground"
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
          {isLoggedIn && user ? (
            <>
              {/* Currency Toggle */}
              <div className="hidden lg:flex items-center space-x-3 bg-card px-4 py-2 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Currency:</span>
                  <div className="flex items-center space-x-2">
                    <Coins className={`h-4 w-4 ${selectedCurrency === CurrencyType.GC ? 'text-gold' : 'text-muted-foreground'}`} />
                    <Switch
                      checked={selectedCurrency === CurrencyType.SC}
                      onCheckedChange={toggleCurrency}
                      className="data-[state=checked]:bg-teal"
                    />
                    <Gem className={`h-4 w-4 ${selectedCurrency === CurrencyType.SC ? 'text-teal' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>

              {/* Current Balance Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-card px-3 py-1.5 rounded-lg border">
                <span className="text-lg">
                  {getCurrencyIcon(selectedCurrency)}
                </span>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getCurrencyColor(selectedCurrency)}`}>
                    {formatCurrency(getCurrentBalance(), selectedCurrency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCurrency === CurrencyType.GC ? 'Fun Play' : 'Real Money'}
                  </div>
                </div>
              </div>

              {/* Quick Currency Toggle (Mobile) */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCurrency}
                  className="flex items-center space-x-1"
                >
                  <span className="text-lg">
                    {getCurrencyIcon(selectedCurrency)}
                  </span>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-purple text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
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
                        {formatCurrency(user.balance.goldCoins, CurrencyType.GC)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-teal" />
                        Sweep Coins
                      </span>
                      <span className="font-semibold text-teal">
                        {formatCurrency(user.balance.sweepCoins, CurrencyType.SC)}
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
                      {user.balance.sweepCoins >= 100 && (
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsLoggedIn(false)}
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
              <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>
                Sign In
              </Button>
              <Button className="btn-primary">Sign Up</Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              {isLoggedIn && user && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Coins className="h-4 w-4 text-gold" />
                      Gold Coins
                    </span>
                    <span className="text-sm font-semibold text-gold">
                      {formatCurrency(user.balance.goldCoins, CurrencyType.GC)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Gem className="h-4 w-4 text-teal" />
                      Sweep Coins
                    </span>
                    <span className="text-sm font-semibold text-teal">
                      {formatCurrency(user.balance.sweepCoins, CurrencyType.SC)}
                    </span>
                  </div>
                  
                  {/* Mobile Currency Toggle */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Active Currency:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleCurrency}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">
                        {getCurrencyIcon(selectedCurrency)}
                      </span>
                      <span className={getCurrencyColor(selectedCurrency)}>
                        {selectedCurrency}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
