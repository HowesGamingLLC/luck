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
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number;
}

// Mock user - in real app this would come from auth context
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  balance: 1250.5,
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock auth state
  const location = useLocation();

  const navItems = [
    { label: "Games", href: "/games", icon: Coins },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Referrals", href: "/referrals", icon: Users },
    { label: "Help", href: "/help", icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

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
                  isActive(item.href) ? "text-purple" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Wallet Balance */}
              <div className="hidden sm:flex items-center space-x-2 bg-card px-3 py-1.5 rounded-lg border">
                <Wallet className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold text-gold">
                  ${mockUser.balance.toLocaleString()}
                </span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-purple text-white">
                        {mockUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{mockUser.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {mockUser.email}
                      </p>
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

              {isLoggedIn && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <Wallet className="h-4 w-4 text-gold" />
                    <span className="text-sm font-semibold text-gold">
                      Balance: ${mockUser.balance.toLocaleString()}
                    </span>
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
