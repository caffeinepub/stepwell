import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, type Variants, motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useLast7DaysWellbeing,
  useLogWellbeing,
  useTodayWellbeing,
} from "../hooks/useQueries";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const ENERGY_OPTIONS = [
  { value: 1, emoji: "😴", label: "Exhausted" },
  { value: 2, emoji: "🥱", label: "Tired" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "⚡", label: "Energized" },
  { value: 5, emoji: "🚀", label: "On Fire" },
];

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

function EmojiSelector({
  options,
  selected,
  onSelect,
  ocidPrefix,
}: {
  options: { value: number; emoji: string; label: string }[];
  selected: number;
  onSelect: (v: number) => void;
  ocidPrefix: string;
}) {
  return (
    <div className="flex gap-2 justify-between">
      {options.map((opt, i) => (
        <button
          type="button"
          key={opt.value}
          data-ocid={`${ocidPrefix}.${i + 1}`}
          onClick={() => onSelect(opt.value)}
          className={`flex-1 flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all duration-200 ${
            selected === opt.value
              ? "bg-primary/20 ring-2 ring-primary scale-105"
              : "bg-secondary hover:bg-secondary/80 hover:scale-105"
          }`}
          title={opt.label}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function HistoryCard({
  date,
  moodScore,
  energyScore,
}: {
  date: string;
  moodScore: number;
  energyScore: number;
}) {
  const moodOption = MOOD_OPTIONS[moodScore - 1];
  const energyOption = ENERGY_OPTIONS[energyScore - 1];
  const displayDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{displayDate}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{moodOption?.emoji ?? "–"}</span>
          <div>
            <p className="text-xs font-medium text-foreground">
              {moodOption?.label ?? "–"}
            </p>
            <p className="text-xs text-muted-foreground">Mood</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{energyOption?.emoji ?? "–"}</span>
          <div>
            <p className="text-xs font-medium text-foreground">
              {energyOption?.label ?? "–"}
            </p>
            <p className="text-xs text-muted-foreground">Energy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WellbeingPage() {
  const { data: todayWellbeing, isLoading: todayLoading } = useTodayWellbeing();
  const { data: history, isLoading: historyLoading } = useLast7DaysWellbeing();
  const logWellbeing = useLogWellbeing();

  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedEnergy, setSelectedEnergy] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const hasLoggedToday = !!todayWellbeing;

  useEffect(() => {
    if (todayWellbeing) {
      setSelectedMood(Number(todayWellbeing.moodScore));
      setSelectedEnergy(Number(todayWellbeing.energyScore));
    }
  }, [todayWellbeing]);

  const handleSubmit = async () => {
    if (!selectedMood || !selectedEnergy) {
      toast.error("Please select both mood and energy levels");
      return;
    }
    await logWellbeing.mutateAsync({
      moodScore: selectedMood,
      energyScore: selectedEnergy,
    });
    setSubmitted(true);
    toast.success("Wellbeing check-in logged! 🌟");
  };

  const sortedHistory = [...(history ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="px-4 py-6 space-y-6 pb-28"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Wellbeing</h1>
        <p className="text-sm text-muted-foreground">
          Daily mood & energy check-in
        </p>
      </motion.div>

      {/* Check-in Card */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        <AnimatePresence mode="wait">
          {todayLoading ? (
            <motion.div key="loading" className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </motion.div>
          ) : hasLoggedToday || submitted ? (
            <motion.div
              key="logged"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <span className="text-4xl block mb-3">🌟</span>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Check-in complete!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You've logged your wellbeing for today.
              </p>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <span className="text-3xl block">
                    {MOOD_OPTIONS[selectedMood - 1]?.emoji ?? "–"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {MOOD_OPTIONS[selectedMood - 1]?.label ?? "–"}
                  </p>
                  <p className="text-xs text-muted-foreground">Mood</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <span className="text-3xl block">
                    {ENERGY_OPTIONS[selectedEnergy - 1]?.emoji ?? "–"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ENERGY_OPTIONS[selectedEnergy - 1]?.label ?? "–"}
                  </p>
                  <p className="text-xs text-muted-foreground">Energy</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-muted-foreground"
                onClick={() => setSubmitted(false)}
              >
                Update check-in
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">😊</span>
                  <p className="text-sm font-semibold text-foreground">
                    How's your mood?
                  </p>
                </div>
                <EmojiSelector
                  options={MOOD_OPTIONS}
                  selected={selectedMood}
                  onSelect={setSelectedMood}
                  ocidPrefix="wellbeing.mood"
                />
              </div>

              <div className="w-full h-px bg-border" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚡</span>
                  <p className="text-sm font-semibold text-foreground">
                    Energy level?
                  </p>
                </div>
                <EmojiSelector
                  options={ENERGY_OPTIONS}
                  selected={selectedEnergy}
                  onSelect={setSelectedEnergy}
                  ocidPrefix="wellbeing.energy"
                />
              </div>

              <Button
                data-ocid="wellbeing.submit_button"
                onClick={handleSubmit}
                disabled={
                  logWellbeing.isPending || !selectedMood || !selectedEnergy
                }
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12"
              >
                {logWellbeing.isPending ? "Saving..." : "Submit Check-in 🌟"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* History */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Last 7 Days
        </p>
        <div className="space-y-2">
          {historyLoading ? (
            (["a", "b", "c"] as const).map((k) => (
              <Skeleton key={k} className="h-16 w-full rounded-xl" />
            ))
          ) : sortedHistory.length === 0 ? (
            <div
              data-ocid="wellbeing.empty_state"
              className="glass-card rounded-xl p-8 text-center text-muted-foreground text-sm"
            >
              No history yet. Complete your first check-in above!
            </div>
          ) : (
            sortedHistory.map((entry, i) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <HistoryCard
                  date={entry.date}
                  moodScore={Number(entry.moodScore)}
                  energyScore={Number(entry.energyScore)}
                />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
