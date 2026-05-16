import { useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authConfigAvailable, supabase } from "./authClient";
import { AuthContext, AuthContextType } from "./useAuth";
import { upsertOwnProfile } from "../db/profiles";
import { connectionActionMessage, isOffline } from "../utils/reliability";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authConfigAvailable || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          upsertOwnProfile();
        }
      })
      .catch((error) => {
        console.error("getSession failed", {
          message: error instanceof Error ? error.message : "Unknown auth error",
        });
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          upsertOwnProfile();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    authAvailable: authConfigAvailable,
    signIn: async (email, password) => {
      if (!supabase) return { error: "Accounts are not connected in this environment." };

      try {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password: password || "" }),
          10000
        );
        if (error) {
          return { error: "That sign-in did not work. Check your email and password." };
        }
      } catch {
        return {
          error: isOffline()
            ? "You appear to be offline. Sign in was not completed."
            : "Sign in could not connect right now. Try again in a moment.",
        };
      }

      return { error: null };
    },
    signUp: async (email, password, metadata) => {
      if (!supabase) return { error: "Accounts are not connected in this environment.", needsEmailConfirmation: false };

      try {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password: password || "",
            options: { data: metadata },
          }),
          10000
        );
        if (error) {
          return { error: "Account creation did not complete. Try signing in if this email already has an account.", needsEmailConfirmation: false };
        }
        return {
          error: null,
          needsEmailConfirmation: !data?.session
        };
      } catch {
        return {
          error: connectionActionMessage("Account creation was not completed."),
          needsEmailConfirmation: false,
        };
      }
    },
    signOut: async () => {
      if (!supabase) return;
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("signOut failed", {
          message: error instanceof Error ? error.message : "Unknown auth error",
        });
      }
    },
    resetPassword: async (email) => {
      if (!supabase) return { error: "Accounts are not connected in this environment." };

      try {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, { redirectTo }),
          10000
        );
        if (error) {
          return { error: "Password reset could not be sent right now." };
        }
      } catch {
        return { error: connectionActionMessage("Password reset was not sent.") };
      }

      return { error: null };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
