import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const authConfigAvailable = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = authConfigAvailable 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
