import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import { listAccountLategrams, createAccountLategram, removeAccountLategram } from "./privateLategrams";
import type { DbPrivateLategram } from "./types";

export function useAccountLategrams() {
  const { authAvailable, session } = useAuth();
  const userId = session?.user?.id;
  const [data, setData] = useState<DbPrivateLategram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!authAvailable || !userId) {
      setData([]);
      setError(null);
      setLoading(false);
      return { error: null };
    }

    setLoading(true);
    const { data: latestData, error: err } = await listAccountLategrams();
    if (err) {
      setError(err);
    } else {
      setData(latestData);
      setError(null);
    }
    setLoading(false);
    return { error: err };
  }, [authAvailable, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (input: Omit<DbPrivateLategram, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">) => {
    const { data: newLategram, error: err } = await createAccountLategram(input);
    if (!err && newLategram) {
      setData((prev) => [newLategram, ...prev]);
    }
    return { data: newLategram, error: err };
  };

  const remove = async (id: string) => {
    const { success, error: err } = await removeAccountLategram(id);
    if (success) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
    return { success, error: err };
  };

  return { data, loading, error, refresh, create, remove };
}
