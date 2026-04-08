import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { api } from "@/lib/api";
import { CreateHabitPayload, Habit } from "@/types/app";
import { useAuth } from "@/providers/AuthProvider";

type HabitsContextValue = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  refreshHabits: () => Promise<void>;
  createHabit: (payload: CreateHabitPayload) => Promise<Habit>;
};

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export const HabitsProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHabits = async () => {
    if (!isAuthenticated) {
      setHabits([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ habits: Habit[] }>("/habit");
      setHabits(response.data.habits ?? []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error ?? error.message);
      } else {
        setError("Unable to load habits right now.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshHabits();
  }, [isAuthenticated]);

  const createHabit = async (payload: CreateHabitPayload) => {
    try {
      const response = await api.post<{ habit: Habit }>("/habit", payload);
      await refreshHabits();
      return response.data.habit;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error ?? error.message);
      }

      throw error;
    }
  };

  const value = useMemo(
    () => ({
      habits,
      isLoading,
      error,
      refreshHabits,
      createHabit,
    }),
    [error, habits, isLoading],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

export const useHabits = () => {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }

  return context;
};
