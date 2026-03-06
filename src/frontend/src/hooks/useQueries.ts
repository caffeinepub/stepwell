import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HydrationEntry, StepEntry, WellbeingEntry } from "../backend.d";
import { useActor } from "./useActor";

const today = () => new Date().toISOString().split("T")[0];

// ─── Step Queries ────────────────────────────────────────────────────────────

export function useTodaySteps() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["todaySteps", today()],
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.getTodaySteps(today());
      return Number(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLast7DaysSteps() {
  const { actor, isFetching } = useActor();
  return useQuery<StepEntry[]>({
    queryKey: ["last7DaysSteps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast7DaysSteps();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStepGoal() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["stepGoal"],
    queryFn: async () => {
      if (!actor) return 10000;
      const result = await actor.getStepGoal();
      return Number(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogSteps() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (steps: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.logSteps(today(), BigInt(steps));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todaySteps"] });
      void queryClient.invalidateQueries({ queryKey: ["last7DaysSteps"] });
    },
  });
}

export function useSetStepGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.setStepGoal(BigInt(goal));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stepGoal"] });
    },
  });
}

// ─── Wellbeing Queries ───────────────────────────────────────────────────────

export function useTodayWellbeing() {
  const { actor, isFetching } = useActor();
  return useQuery<WellbeingEntry | null>({
    queryKey: ["todayWellbeing", today()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTodayWellbeing(today());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLast7DaysWellbeing() {
  const { actor, isFetching } = useActor();
  return useQuery<WellbeingEntry[]>({
    queryKey: ["last7DaysWellbeing"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast7DaysWellbeing();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogWellbeing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      moodScore,
      energyScore,
    }: {
      moodScore: number;
      energyScore: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.logWellbeing(today(), BigInt(moodScore), BigInt(energyScore));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todayWellbeing"] });
      void queryClient.invalidateQueries({ queryKey: ["last7DaysWellbeing"] });
    },
  });
}

// ─── Hydration Queries ───────────────────────────────────────────────────────

export function useTodayHydration() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["todayHydration", today()],
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.getTodayHydration(today());
      return Number(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLast7DaysHydration() {
  const { actor, isFetching } = useActor();
  return useQuery<HydrationEntry[]>({
    queryKey: ["last7DaysHydration"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast7DaysHydration();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHydrationGoal() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["hydrationGoal"],
    queryFn: async () => {
      if (!actor) return 8;
      const result = await actor.getHydrationGoal();
      return Number(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogHydration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (glasses: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.logHydration(today(), BigInt(glasses));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todayHydration"] });
      void queryClient.invalidateQueries({ queryKey: ["last7DaysHydration"] });
    },
  });
}

export function useSetHydrationGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.setHydrationGoal(BigInt(goal));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hydrationGoal"] });
    },
  });
}
