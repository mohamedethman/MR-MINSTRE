import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { login as authLogin } from "../services/auth";
import { setAuthToken, setUnauthorizedHandler } from "../services/api";
import { clearSession, decodeJwt, loadSession, msUntilExpiry, saveSession, StoredUser } from "../services/session";

type User = StoredUser;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Restore the session before the first render, so a refresh on an /admin page
// does not bounce to the login screen.
const initialSession = loadSession();
if (initialSession) setAuthToken(initialSession.token);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(initialSession?.token ?? null);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);

  const logout = useCallback(() => {
    clearSession();
    setAuthToken("");
    setToken(null);
    setUser(null);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authLogin(username, password);
    const nextUser: User = {
      username: response.username || decodeJwt(response.token)?.sub || username,
      email: response.email,
    };
    setAuthToken(response.token);
    saveSession(response.token, nextUser);
    setToken(response.token);
    setUser(nextUser);
  };

  // Log out automatically when the token expires while the page is open.
  useEffect(() => {
    if (!token) return;
    const remaining = msUntilExpiry(token);
    if (remaining <= 0) {
      logout();
      return;
    }
    // setTimeout cannot wait longer than ~24.8 days; JWTs here last 24h.
    const timer = window.setTimeout(logout, Math.min(remaining, 2_147_000_000));
    return () => window.clearTimeout(timer);
  }, [token, logout]);

  // Log out when the backend rejects the token (expired, revoked, secret changed).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (token) logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [token, logout]);

  // Keep several open tabs in sync (logging out in one logs out the others).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "authToken") return;
      const session = loadSession();
      if (session) {
        setAuthToken(session.token);
        setToken(session.token);
        setUser(session.user);
      } else {
        setAuthToken("");
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(token), user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
