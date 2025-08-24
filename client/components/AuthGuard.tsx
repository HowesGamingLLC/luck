import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireKYC?: boolean;
}

export function AuthGuard({ children, requireAdmin = false, requireKYC = false }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to dashboard if user is not admin
    return <Navigate to="/dashboard" replace />;
  }

  if (requireKYC && user?.kycStatus !== "approved") {
    // Redirect to KYC page if verification is required
    return <Navigate to="/kyc" replace />;
  }

  return <>{children}</>;
}

// Higher-order component for protecting routes
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAdmin?: boolean; requireKYC?: boolean }
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requireAdmin={options?.requireAdmin} requireKYC={options?.requireKYC}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Component for when authentication is loading
export function AuthLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto border-4 border-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Authenticating...</p>
        <p className="text-muted-foreground">Please wait while we verify your session</p>
      </div>
    </div>
  );
}
