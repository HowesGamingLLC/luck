import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  verified: boolean;
  kycStatus: "pending" | "approved" | "rejected" | "not_submitted";
  kycDocuments?: {
    idDocument?: string;
    proofOfAddress?: string;
    selfie?: string;
  };
  createdAt: Date;
  lastLoginAt: Date;
  totalLosses: number; // Track real money losses for admin panel
  jackpotOptIn: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateKYCStatus: (status: User["kycStatus"]) => void;
  updateJackpotOptIn: (optIn: boolean) => void;
  addLoss: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (in a real app, this would be handled by a backend)
const mockUsers: (User & { password: string })[] = [
  {
    id: "admin_1",
    email: "coinkrazy00@gmail.com",
    password: "Woot6969!",
    name: "Casino Admin",
    isAdmin: true,
    verified: true,
    kycStatus: "approved",
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date(),
    totalLosses: 0,
    jackpotOptIn: true,
  },
  {
    id: "user_1",
    email: "john@example.com",
    password: "user123",
    name: "John Doe",
    isAdmin: false,
    verified: false,
    kycStatus: "not_submitted",
    createdAt: new Date("2024-01-15"),
    lastLoginAt: new Date(),
    totalLosses: 125.5,
    jackpotOptIn: false,
  },
  {
    id: "user_2",
    email: "jane@example.com",
    password: "user123",
    name: "Jane Smith",
    isAdmin: false,
    verified: true,
    kycStatus: "approved",
    createdAt: new Date("2024-01-20"),
    lastLoginAt: new Date(),
    totalLosses: 89.25,
    jackpotOptIn: true,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem("coinkrazy_auth_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert date strings back to Date objects
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        parsedUser.lastLoginAt = new Date(parsedUser.lastLoginAt);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user session:", error);
        localStorage.removeItem("coinkrazy_auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Save user session whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("coinkrazy_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("coinkrazy_auth_user");
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      const loggedInUser = {
        ...userWithoutPassword,
        lastLoginAt: new Date(),
      };
      setUser(loggedInUser);
      setIsLoading(false);
      return true;
    } else {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }

    // Check password confirmation
    if (data.password !== data.confirmPassword) {
      setIsLoading(false);
      return false;
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: `user_${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      isAdmin: false,
      verified: false,
      kycStatus: "not_submitted",
      createdAt: new Date(),
      lastLoginAt: new Date(),
      totalLosses: 0,
      jackpotOptIn: false,
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Log user in
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coinkrazy_auth_user");
    localStorage.removeItem("coinkrazy_user"); // Also clear currency context data
    localStorage.removeItem("coinkrazy_transactions");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update in mock database
    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    }
  };

  const updateKYCStatus = (status: User["kycStatus"]) => {
    updateProfile({ kycStatus: status });
  };

  const updateJackpotOptIn = (optIn: boolean) => {
    updateProfile({ jackpotOptIn: optIn });
  };

  const addLoss = (amount: number) => {
    if (!user) return;
    updateProfile({ totalLosses: user.totalLosses + amount });
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    register,
    logout,
    updateProfile,
    updateKYCStatus,
    updateJackpotOptIn,
    addLoss,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to get all users (admin only)
export const getAllUsers = (): (User & { password?: never })[] => {
  return mockUsers.map(({ password, ...user }) => user);
};
