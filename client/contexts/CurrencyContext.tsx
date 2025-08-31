import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getSupabase, hasSupabaseConfig } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export enum CurrencyType {
  GC = "GC", // Gold Coins (fun play)
  SC = "SC", // Sweep Coins (real money)
}

export interface UserBalance {
  goldCoins: number;
  sweepCoins: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  balance: UserBalance;
  isNewUser: boolean;
  lastDailySpinClaim: Date | null;
  totalWagered: {
    goldCoins: number;
    sweepCoins: number;
  };
  totalWon: {
    goldCoins: number;
    sweepCoins: number;
  };
  verified: boolean;
  level: number;
}

export interface Transaction {
  id: string;
  type: "win" | "wager" | "bonus" | "deposit" | "withdrawal";
  currency: CurrencyType;
  amount: number;
  description: string;
  timestamp: Date;
  gameType?: string;
}

interface CurrencyContextType {
  user: UserProfile | null;
  selectedCurrency: CurrencyType;
  setSelectedCurrency: (currency: CurrencyType) => void;
  updateBalance: (
    currency: CurrencyType,
    amount: number,
    description: string,
    type?: "win" | "wager" | "bonus",
  ) => void;
  canAffordWager: (currency: CurrencyType, amount: number) => boolean;
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void;
  getTransactionHistory: () => Transaction[];
  claimWelcomeBonus: () => void;
  canClaimDailySpin: () => boolean;
  claimDailySpin: () => void;
  initializeUser: (userData: Partial<UserProfile>) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

// Local fallback user data when Supabase isn't configured
const createInitialUser = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: overrides?.id || "local-user",
  email: overrides?.email || "user@example.com",
  name: overrides?.name || "Player",
  balance: {
    goldCoins: overrides?.balance?.goldCoins ?? 0,
    sweepCoins: overrides?.balance?.sweepCoins ?? 0,
  },
  isNewUser: true,
  lastDailySpinClaim: null,
  totalWagered: {
    goldCoins: 0,
    sweepCoins: 0,
  },
  totalWon: {
    goldCoins: 0,
    sweepCoins: 0,
  },
  verified: true,
  level: 1,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    CurrencyType.GC,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize from Supabase profile if available; fallback to local storage
  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem("coinkrazy_user");

      if (hasSupabaseConfig && authUser) {
        try {
          const client = getSupabase();
          const { data, error } = await client
            .from("profiles")
            .select("id,email,name,gold_coins,sweep_coins")
            .eq("id", authUser.id)
            .maybeSingle();
          if (!error && data) {
            const profile: UserProfile = createInitialUser({
              id: data.id,
              email: data.email,
              name: data.name || authUser.email,
              balance: {
                goldCoins: Number((data as any).gold_coins || 0),
                sweepCoins: Number((data as any).sweep_coins || 0),
              },
            });
            setUser(profile);
            localStorage.setItem("coinkrazy_user", JSON.stringify(profile));
          } else if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser(
              createInitialUser({ id: authUser.id, email: authUser.email }),
            );
          }

          // Realtime balance updates
          const channel = client
            .channel("profiles-balance-" + authUser.id)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${authUser.id}`,
              },
              (payload: any) => {
                const newRow = payload.new as any;
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        balance: {
                          goldCoins: Number(newRow.gold_coins || 0),
                          sweepCoins: Number(newRow.sweep_coins || 0),
                        },
                      }
                    : prev,
                );
              },
            )
            .subscribe();

          return () => {
            client.removeChannel(channel);
          };
        } catch (e) {
          console.error("Supabase balance init error", e);
          if (savedUser) setUser(JSON.parse(savedUser));
          else setUser(createInitialUser());
        }
      } else {
        if (savedUser) setUser(JSON.parse(savedUser));
        else setUser(createInitialUser());
      }

      const savedTransactions = localStorage.getItem("coinkrazy_transactions");
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions).map(
            (t: any) => ({ ...t, timestamp: new Date(t.timestamp) }),
          );
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error("Error parsing saved transactions:", error);
        }
      }
    };
    init();
  }, [authUser]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("coinkrazy_user", JSON.stringify(user));
    }
  }, [user]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "coinkrazy_transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  const initializeUser = (userData: Partial<UserProfile>) => {
    const newUser = { ...createInitialUser(), ...userData };
    setUser(newUser);
  };

  const updateBalance = async (
    currency: CurrencyType,
    amount: number,
    description: string,
    type: "win" | "wager" | "bonus" = "win",
  ) => {
    if (!user) return;

    // Persist to Supabase when available
    if (hasSupabaseConfig && authUser) {
      try {
        const client = getSupabase();
        const goldDelta = currency === CurrencyType.GC ? amount : 0;
        const sweepDelta = currency === CurrencyType.SC ? amount : 0;
        await client.rpc("increment_profile_balances", {
          p_user_id: authUser.id,
          p_gold_delta: goldDelta,
          p_sweep_delta: sweepDelta,
        });
        await client.from("transactions").insert({
          user_id: authUser.id,
          currency,
          amount,
          type,
          description,
        });
      } catch (e) {
        console.error("Supabase updateBalance error", e);
      }
    }

    // Local optimistic update
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser };
      if (currency === CurrencyType.GC) {
        updatedUser.balance.goldCoins = Math.max(
          0,
          updatedUser.balance.goldCoins + amount,
        );
        if (type === "win")
          updatedUser.totalWon.goldCoins += Math.max(0, amount);
        else if (type === "wager")
          updatedUser.totalWagered.goldCoins += Math.abs(amount);
      } else {
        updatedUser.balance.sweepCoins = Math.max(
          0,
          updatedUser.balance.sweepCoins + amount,
        );
        if (type === "win")
          updatedUser.totalWon.sweepCoins += Math.max(0, amount);
        else if (type === "wager")
          updatedUser.totalWagered.sweepCoins += Math.abs(amount);
      }
      return updatedUser;
    });

    addTransaction({ type, currency, amount, description });
  };

  const canAffordWager = (currency: CurrencyType, amount: number): boolean => {
    if (!user) return false;

    if (currency === CurrencyType.GC) {
      return user.balance.goldCoins >= amount;
    } else {
      return user.balance.sweepCoins >= amount;
    }
  };

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "timestamp">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev].slice(0, 100)); // Keep last 100 transactions
  };

  const getTransactionHistory = (): Transaction[] => {
    return transactions;
  };

  const claimWelcomeBonus = () => {
    if (!user || !user.isNewUser) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        isNewUser: false,
        balance: {
          goldCoins: prevUser.balance.goldCoins + 10000,
          sweepCoins: prevUser.balance.sweepCoins + 10,
        },
      };
    });

    // Add welcome bonus transactions
    addTransaction({
      type: "bonus",
      currency: CurrencyType.GC,
      amount: 10000,
      description: "Welcome Bonus - Gold Coins",
    });

    addTransaction({
      type: "bonus",
      currency: CurrencyType.SC,
      amount: 10,
      description: "Welcome Bonus - Sweep Coins",
    });
  };

  const canClaimDailySpin = (): boolean => {
    if (!user) return false;

    if (!user.lastDailySpinClaim) return true;

    const now = new Date();
    const lastClaim = new Date(user.lastDailySpinClaim);
    const timeDiff = now.getTime() - lastClaim.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    return hoursDiff >= 24;
  };

  const claimDailySpin = () => {
    if (!user || !canClaimDailySpin()) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        lastDailySpinClaim: new Date(),
      };
    });
  };

  const contextValue: CurrencyContextType = {
    user,
    selectedCurrency,
    setSelectedCurrency,
    updateBalance,
    canAffordWager,
    addTransaction,
    getTransactionHistory,
    claimWelcomeBonus,
    canClaimDailySpin,
    claimDailySpin,
    initializeUser,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Utility functions
export const formatCurrency = (
  amount: number,
  currency: CurrencyType,
): string => {
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: currency === CurrencyType.SC ? 2 : 0,
    maximumFractionDigits: currency === CurrencyType.SC ? 2 : 0,
  });

  return `${formatted} ${currency}`;
};

export const getCurrencyColor = (currency: CurrencyType): string => {
  return currency === CurrencyType.GC ? "text-gold" : "text-teal";
};

export const getCurrencyIcon = (currency: CurrencyType): string => {
  return currency === CurrencyType.GC ? "🪙" : "💎";
};
