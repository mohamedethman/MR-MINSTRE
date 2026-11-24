/**
 * Keeps the admin login across page refreshes.
 *
 * The JWT is stored in localStorage and restored on startup, but only while it
 * is still valid: its `exp` claim (set by the backend, 24h by default) is
 * checked on load and before reuse, so an expired token is never sent.
 */
const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export interface StoredUser {
  username: string;
  email?: string;
}

interface JwtPayload {
  sub?: string;
  exp?: number; // seconds since epoch
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Milliseconds until the token expires (0 if expired or unreadable). */
export const msUntilExpiry = (token: string): number => {
  const exp = decodeJwt(token)?.exp;
  if (!exp) return 0;
  return Math.max(0, exp * 1000 - Date.now());
};

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: StoredUser) => {
  const storage = safeStorage();
  storage?.setItem(TOKEN_KEY, token);
  storage?.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  const storage = safeStorage();
  storage?.removeItem(TOKEN_KEY);
  storage?.removeItem(USER_KEY);
  // Keys used by older versions of the app.
  storage?.removeItem("token");
  storage?.removeItem("user");
};

/** The stored session if its token is still valid; otherwise clears it and returns null. */
export const loadSession = (): { token: string; user: StoredUser } | null => {
  const storage = safeStorage();
  const token = storage?.getItem(TOKEN_KEY);
  if (!token || msUntilExpiry(token) <= 0) {
    clearSession();
    return null;
  }
  let user: StoredUser = { username: decodeJwt(token)?.sub || "" };
  try {
    const raw = storage?.getItem(USER_KEY);
    if (raw) user = { ...user, ...JSON.parse(raw) };
  } catch {
    // keep the username from the token
  }
  return { token, user };
};
