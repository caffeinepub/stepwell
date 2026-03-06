import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, type Variants, motion } from "motion/react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  useHydrationGoal,
  useLast7DaysHydration,
  useLogHydration,
  useSetHydrationGoal,
  useTodayHydration,
} from "../hooks/useQueries";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0, 0, 1] },
  },
};

function WaterBottle({ glasses, goal }: { glasses: number; goal: number }) {
  const percent = Math.min(glasses / goal, 1);
  const fillHeight = percent * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative overflow-hidden rounded-b-3xl rounded-t-xl border-2 border-hydration"
        style={{
          width: 80,
          height: 160,
          boxShadow: "0 0 20px oklch(0.72 0.15 200 / 0.3)",
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-secondary" />
        {/* Water fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.72 0.15 200 / 0.8) 0%, oklch(0.65 0.18 200) 100%)",
          }}
          initial={{ height: 0 }}
          animate={{ height: `${fillHeight}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Wave effect */}
          <div
            className="absolute -top-2 left-0 right-0 h-4 opacity-60"
            style={{
              background: "oklch(0.72 0.15 200 / 0.5)",
              borderRadius: "50%",
            }}
          />
        </motion.div>
        {/* Glass markers */}
        {Array.from({ length: goal }, (_, i) => {
          const pct = Math.round(((i + 1) / goal) * 1000);
          return (
            <div
              key={`m${pct}`}
              className="absolute left-0 right-0 border-t border-white/10"
              style={{ bottom: `${((i + 1) / goal) * 100}%` }}
            />
          );
        })}
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-md">
            {Math.round(percent * 100)}%
          </span>
        </div>
      </div>
      <p className="text-2xl font-bold text-hydration">
        {glasses}
        <span className="text-base font-normal text-muted-foreground">
          /{goal}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">glasses today</p>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-bold" style={{ color: "oklch(0.72 0.15 200)" }}>
        {payload[0].value} glasses
      </p>
    </div>
  );
}

export function HydrationPage() {
  const { data: hydration, isLoading: hydLoading } = useTodayHydration();
  const { data: history, isLoading: historyLoading } = useLast7DaysHydration();
  const { data: goal, isLoading: goalLoading } = useHydrationGoal();
  const logHydration = useLogHydration();
  const setGoal = useSetHydrationGoal();

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const hydVal = hydration ?? 0;
  const goalVal = goal ?? 8;
  const goalMet = hydVal >= goalVal;

  const handleAdd = async () => {
    if (hydVal >= goalVal * 2) {
      toast.error("That's a lot of water! Are you sure?");
    }
    const newVal = hydVal + 1;
    await logHydration.mutateAsync(newVal);
    if (newVal >= goalVal && hydVal < goalVal) {
      toast.success("🎉 Hydration goal reached!");
    }
  };

  const handleRemove = async () => {
    if (hydVal <= 0) return;
    await logHydration.mutateAsync(hydVal - 1);
  };

  const handleSetGoal = async () => {
    const val = Number.parseInt(newGoal, 10);
    if (Number.isNaN(val) || val < 1 || val > 30) {
      toast.error("Please enter a goal between 1 and 30 glasses");
      return;
    }
    await setGoal.mutateAsync(val);
    setGoalDialogOpen(false);
    setNewGoal("");
    toast.success(`Hydration goal updated to ${val} glasses`);
  };

  const chartData = [...(history ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      day: new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      glasses: Number(entry.glasses),
      isToday: entry.date === new Date().toISOString().split("T")[0],
    }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="px-4 py-6 space-y-6 pb-28"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hydration</h1>
          <p className="text-sm text-muted-foreground">
            Track your water intake
          </p>
        </div>
        <Button
          data-ocid="hydration.goal.edit_button"
          variant="outline"
          size="sm"
          onClick={() => {
            setNewGoal(String(goalVal));
            setGoalDialogOpen(true);
          }}
          className="rounded-xl text-xs border-border hover:border-hydration hover:text-hydration"
        >
          Edit Goal
        </Button>
      </motion.div>

      {/* Water Bottle + Controls */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-6"
      >
        {hydLoading || goalLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-20 h-40 rounded-3xl" />
            <div className="flex gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="w-14 h-14 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence>
              {goalMet && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <span className="bg-hydration/20 text-hydration text-xs font-bold px-4 py-2 rounded-full border border-hydration/40">
                    💧 Daily Goal Reached!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <WaterBottle glasses={hydVal} goal={goalVal} />

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                data-ocid="hydration.remove.button"
                onClick={handleRemove}
                disabled={hydVal <= 0 || logHydration.isPending}
                className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95 disabled:opacity-40"
                aria-label="Remove a glass"
              >
                −
              </button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tap to</p>
                <p className="text-xs text-muted-foreground">add/remove</p>
              </div>
              <button
                type="button"
                data-ocid="hydration.add.button"
                onClick={handleAdd}
                disabled={logHydration.isPending}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-95 hover:scale-110"
                style={{
                  background: "oklch(0.72 0.15 200)",
                  color: "oklch(0.12 0.01 240)",
                  boxShadow: "0 0 20px oklch(0.72 0.15 200 / 0.4)",
                }}
                aria-label="Add a glass of water"
              >
                +
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Glasses grid */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5"
      >
        <p className="text-sm font-semibold text-foreground mb-4">
          Today's glasses
        </p>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: Math.max(goalVal, hydVal) }, (_, i) => {
            const glassNum = i + 1;
            return (
              <motion.div
                key={glassNum}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="aspect-square flex items-center justify-center rounded-lg text-lg"
                style={{
                  background:
                    i < hydVal
                      ? "oklch(0.72 0.15 200 / 0.3)"
                      : "oklch(0.2 0.01 240)",
                  border:
                    i < hydVal
                      ? "1px solid oklch(0.72 0.15 200 / 0.5)"
                      : "1px solid oklch(0.25 0.015 240)",
                }}
              >
                {i < hydVal ? "💧" : "○"}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* History Chart */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5"
      >
        <p className="text-sm font-semibold text-foreground mb-4">
          Last 7 Days
        </p>
        {historyLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div
            data-ocid="hydration.empty_state"
            className="h-40 flex items-center justify-center text-muted-foreground text-sm"
          >
            No history yet. Start tracking your hydration!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.55 0.02 240)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="glasses" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.day}`}
                    fill={
                      entry.isToday
                        ? "oklch(0.72 0.15 200)"
                        : entry.glasses >= goalVal
                          ? "oklch(0.72 0.15 200 / 0.6)"
                          : "oklch(0.25 0.015 240)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Goal Edit Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent
          data-ocid="hydration.dialog"
          className="bg-card border-border rounded-2xl max-w-sm mx-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Hydration Goal
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="number"
              min="1"
              max="30"
              placeholder="e.g. 8"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetGoal()}
              className="bg-secondary border-border rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 8 glasses per day
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="hydration.cancel_button"
              variant="outline"
              onClick={() => setGoalDialogOpen(false)}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="hydration.confirm_button"
              onClick={handleSetGoal}
              disabled={setGoal.isPending}
              className="rounded-xl flex-1"
              style={{
                background: "oklch(0.72 0.15 200)",
                color: "oklch(0.12 0.01 240)",
              }}
            >
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
