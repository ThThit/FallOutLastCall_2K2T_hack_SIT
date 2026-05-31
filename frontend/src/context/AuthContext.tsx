import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser, logoutUser, getMe } from "../api/client";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isModerator: boolean;
  // True while we're checking the cookie on first load (before we know
  // whether there's a valid session). Lets the UI avoid flashing the login.
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    sector?: number,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize the various API shapes into our User.
function toUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    role: raw.role ?? "USER",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate the session from the httpOnly token cookie on boot. The token
  // itself is never readable by JS, so we ask the server who we are.
  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        if (res?.user) setUser(toUser(res.user));
      } catch {
        // No valid cookie — stay logged out.
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(username, password);
      setUser(toUser(response.user));
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    password: string,
    sector?: number,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(username, password, sector);
      setUser(toUser(response.user));
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Server clears the httpOnly cookie.
      await logoutUser();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isModerator: !!isModerator,
        isInitializing,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
