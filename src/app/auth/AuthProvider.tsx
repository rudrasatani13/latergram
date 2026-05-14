import { useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authConfigAvailable, supabase } from "./authClient";
import { AuthContext, AuthContextType } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authConfigAvailable || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    authAvailable: authConfigAvailable,
    signIn: async (email, password) => {
      if (!supabase) return { error: "Auth not configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || "" });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
    signUp: async (email, password, metadata) => {
      if (!supabase) return { error: "Auth not configured", needsEmailConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || "",
        options: { data: metadata },
      });
      if (error) {
        return { error: error.message, needsEmailConfirmation: false };
      }
      return { 
        error: null, 
        needsEmailConfirmation: !data?.session
      };
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
    resetPassword: async (email) => {
      if (!supabase) return { error: "Auth not configured" };
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
