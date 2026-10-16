import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "../services/apiClient";
import { isRole, type LoginMode, type Session } from "./roles";

interface CivicAuth {
  session: Session | null;
  signIn(email: string, password: string, mode: LoginMode): Promise<Session>;
  register(name: string, email: string, password: string): Promise<Session>;
  signOut(): void;
}
const AuthContext = createContext<CivicAuth | null>(null);

function validateSession(raw: Session): Session {
  if (!raw || typeof raw.token !== "string" || !raw.token ||
      !raw.user || typeof raw.user.id !== "string" ||
      typeof raw.user.name !== "string" || typeof raw.user.email !== "string" ||
      !isRole(raw.user.role)) {
    throw new Error("The authentication server returned an invalid account response.");
  }
  return raw;
}

/** Sessions are intentionally memory-only. Reloading the browser requires login again. */
export function AuthProvider({ children, initialSession = null }: {
  children: ReactNode;
  /** Useful for isolated route/component tests. Never supply a fabricated role in production. */
  initialSession?: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);

  const auth = useMemo<CivicAuth>(() => ({
    session,
    async signIn(email, password, mode) {
      const result = validateSession(await apiRequest<Session>("/api/auth/login", {
        method: "POST", body: { email: email.trim(), password },
      }));
      // Login mode is only a UI choice; the authenticated backend role is authoritative.
      if (mode === "requester" && result.user.role !== "REQUESTER") {
        throw new Error("Use Login as Staff/Management for this account.");
      }
      if (mode === "staff" && result.user.role === "REQUESTER") {
        throw new Error("This account is not authorised for staff operations.");
      }
      setSession(result);
      return result;
    },
    async register(name, email, password) {
      const result = validateSession(await apiRequest<Session>("/api/auth/register", {
        method: "POST", body: { name: name.trim(), email: email.trim(), password },
      }));
      if (result.user.role !== "REQUESTER") {
        throw new Error("Requester registration returned an unexpected role.");
      }
      setSession(result);
      return result;
    },
    signOut() { setSession(null); },
  }), [session]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): CivicAuth {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required for protected routes.");
  return value;
}

/** Existing isolated component tests and demo components may render without a provider. */
export function useOptionalAuth(): CivicAuth | null { return useContext(AuthContext); }
