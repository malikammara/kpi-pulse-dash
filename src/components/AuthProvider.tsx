import { createContext, useContext } from "react";

interface DemoUser {
  email: string;
}

interface AuthContextType {
  user: DemoUser | null;
  session: null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const value: AuthContextType = {
    user: { email: "demo@kpi-pulse.app" },
    session: null,
    isAdmin: true,
    loading: false,
    signInWithGoogle: async () => Promise.resolve(),
    signOut: async () => Promise.resolve(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
