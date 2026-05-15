import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import {
  cancelLateLetter,
  createLateLetter,
  listLateLetters,
  reportLateLetter,
  type CreateLateLetterInput,
  type ReportLateLetterInput,
  type LateLetterRecord,
} from "./lateLetters";

export function useLateLetters() {
  const { authAvailable, session } = useAuth();
  const userId = session?.user?.id;
  const [data, setData] = useState<LateLetterRecord[]>([]);
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
    const { data: latestData, error: err } = await listLateLetters();

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

  const create = async (input: CreateLateLetterInput) => {
    const { data: newLetter, error: err } = await createLateLetter(input);

    if (!err && newLetter) {
      setData((prev) => [...prev, newLetter].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()));
      setError(null);
    }

    return { data: newLetter, error: err };
  };

  const cancel = async (id: string) => {
    const { data: cancelledLetter, error: err } = await cancelLateLetter(id);

    if (!err && cancelledLetter) {
      setData((prev) => prev.map((item) => (item.id === id ? cancelledLetter : item)));
      setError(null);
    }

    return { data: cancelledLetter, error: err };
  };

  const report = async (input: ReportLateLetterInput) => {
    const { data: reportResult, error: err } = await reportLateLetter(input);

    if (!err && reportResult) {
      setError(null);
    }

    return { data: reportResult, error: err };
  };

  return { data, loading, error, refresh, create, cancel, report };
}
