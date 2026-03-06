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
import React, { useState, useEffect } from "react";
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
import { CircularProgress } from "../components/fitness/CircularProgress";
import { ConfettiCelebration } from "../components/fitness/ConfettiCelebration";
import {
  useLast7DaysSteps,
  useLogSteps,
  useSetStepGoal,
  useStepGoal,
  useTodaySteps,
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

function CustomTooltip({
  active,
  payload,
  label,
}: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="text-primary font-bold">
        {payload[0].value.toLocaleString()} steps
      </p>
    </div>
  );
}

export function StepsPage() {
  const { data: steps, isLoading: stepsLoading } = useTodaySteps();
  const { data: history, isLoading: historyLoading } = useLast7DaysSteps();
  const { data: stepGoal, isLoading: goalLoading } = useStepGoal();
  const logSteps = useLogSteps();
  const setGoal = useSetStepGoal();

  const [inputValue, setInputValue] = useState("");
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [prevSteps, setPrevSteps] = useState(0);
  const [celebrateActive, setCelebrateActive] = useState(false);

  const stepsVal = steps ?? 0;
  const goalVal = stepGoal ?? 10000;
  const goalMet = stepsVal >= goalVal;

  useEffect(() => {
    if (!goalMet && prevSteps < goalVal && stepsVal >= goalVal) {
      setCelebrateActive(true);
      setTimeout(() => setCelebrateActive(false), 2000);
    }
    setPrevSteps(stepsVal);
  }, [stepsVal, goalVal, goalMet, prevSteps]);

  const chartData = (history ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      day: new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      steps: Number(entry.steps),
      isToday: entry.date === new Date().toISOString().split("T")[0],
    }));

  const handleLogSteps = async () => {
    const val = Number.parseInt(inputValue, 10);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Please enter a valid step count");
      return;
    }
    await logSteps.mutateAsync(val);
    setInputValue("");
    toast.success(`Logged ${val.toLocaleString()} steps!`);
  };

  const handleSetGoal = async () => {
    const val = Number.parseInt(newGoal, 10);
    if (Number.isNaN(val) || val < 100) {
      toast.error("Goal must be at least 100 steps");
      return;
    }
    await setGoal.mutateAsync(val);
    setGoalDialogOpen(false);
    setNewGoal("");
    toast.success(`Step goal updated to ${val.toLocaleString()}`);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Steps</h1>
          <p className="text-sm text-muted-foreground">Today's progress</p>
        </div>
        <Button
          data-ocid="steps.goal.edit_button"
          variant="outline"
          size="sm"
          onClick={() => {
            setNewGoal(String(goalVal));
            setGoalDialogOpen(true);
          }}
          className="rounded-xl text-xs border-border hover:border-primary hover:text-primary"
        >
          Edit Goal
        </Button>
      </motion.div>

      {/* Circular Progress */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center relative"
      >
        <div className="relative">
          <ConfettiCelebration active={celebrateActive} />
          {stepsLoading || goalLoading ? (
            <Skeleton className="w-52 h-52 rounded-full" />
          ) : (
            <CircularProgress
              value={stepsVal}
              max={goalVal}
              size={220}
              strokeWidth={16}
              color={goalMet ? "oklch(0.82 0.22 130)" : "oklch(0.82 0.22 130)"}
              label={stepsVal.toLocaleString()}
              sublabel={`/ ${goalVal.toLocaleString()} steps`}
            />
          )}
        </div>

        <AnimatePresence>
          {goalMet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-0 right-0 animate-pulse-glow"
            >
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-glow">
                🎉 Goal Met!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Log Steps Input */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5"
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          Log Today's Steps
        </p>
        <div className="flex gap-2">
          <Input
            data-ocid="steps.log.input"
            type="number"
            min="0"
            placeholder="Enter step count..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogSteps()}
            className="flex-1 bg-secondary border-border text-foreground rounded-xl focus:border-primary"
          />
          <Button
            data-ocid="steps.log.submit_button"
            onClick={handleLogSteps}
            disabled={logSteps.isPending || !inputValue}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
          >
            {logSteps.isPending ? "Saving..." : "Log"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This will replace today's step count
        </p>
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
            data-ocid="steps.empty_state"
            className="h-40 flex items-center justify-center text-muted-foreground text-sm"
          >
            No history yet. Start logging your steps!
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
              <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.day}`}
                    fill={
                      entry.isToday
                        ? "oklch(0.82 0.22 130)"
                        : entry.steps >= goalVal
                          ? "oklch(0.82 0.22 130 / 0.6)"
                          : "oklch(0.25 0.015 240)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {/* Goal line indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <span className="text-xs text-muted-foreground">Goal reached</span>
          <div className="w-3 h-3 rounded-sm bg-secondary ml-3" />
          <span className="text-xs text-muted-foreground">Below goal</span>
        </div>
      </motion.div>

      {/* Goal Edit Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent
          data-ocid="steps.dialog"
          className="bg-card border-border rounded-2xl max-w-sm mx-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Step Goal
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="number"
              min="100"
              placeholder="e.g. 10000"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetGoal()}
              className="bg-secondary border-border rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="steps.cancel_button"
              variant="outline"
              onClick={() => setGoalDialogOpen(false)}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="steps.confirm_button"
              onClick={handleSetGoal}
              disabled={setGoal.isPending}
              className="rounded-xl flex-1 bg-primary text-primary-foreground"
            >
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
