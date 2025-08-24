import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { JackpotProvider } from "@/contexts/JackpotContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Leaderboard from "./pages/Leaderboard";
import Referrals from "./pages/Referrals";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AdminPackages from "./pages/AdminPackages";
import KYC from "./pages/KYC";
import Withdraw from "./pages/Withdraw";
import Store from "./pages/Store";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <JackpotProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/dashboard"
                      element={
                        <AuthGuard>
                          <Dashboard />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/games"
                      element={
                        <AuthGuard>
                          <Games />
                        </AuthGuard>
                      }
                    />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/help" element={<Help />} />
                    <Route
                      path="/profile"
                      element={
                        <AuthGuard>
                          <Profile />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/wallet"
                      element={
                        <AuthGuard>
                          <WalletPage />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <AuthGuard>
                          <SettingsPage />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard requireAdmin={true}>
                          <AdminPanel />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/*"
                      element={
                        <AuthGuard requireAdmin={true}>
                          <AdminPanel />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/kyc"
                      element={
                        <AuthGuard>
                          <KYC />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/withdraw"
                      element={
                        <AuthGuard>
                          <Withdraw />
                        </AuthGuard>
                      }
                    />
                    <Route path="/store" element={<Store />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </TooltipProvider>
          </JackpotProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
