import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import { listAccountCounters, createAccountCounter, removeAccountCounter } from "./timeSinceCounters";
import type { DbTimeSinceCounter } from "./types";

export function useAccountCounters() {
  const { authAvailable, session } = useAuth();
  const [data, setData] = useState<DbTimeSinceCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!authAvailable || !session?.user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: latestData, error: err } = await listAccountCounters();
    if (err) {
      setError(err);
    } else {
      setData(latestData);
      setError(null);
    }
    setLoading(false);
  }, [authAvailable, session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (input: Omit<DbTimeSinceCounter, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">) => {
    const { data: newCounter, error: err } = await createAccountCounter(input);
    if (!err && newCounter) {
      setData((prev) => [newCounter, ...prev]);
    }
    return { data: newCounter, error: err };
  };

  const remove = async (id: string) => {
    const { success, error: err } = await removeAccountCounter(id);
    if (success) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
    return { success, error: err };
  };

  return { data, loading, error, refresh, create, remove };
}
