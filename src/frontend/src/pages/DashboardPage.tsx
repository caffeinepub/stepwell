import { Skeleton } from "@/components/ui/skeleton";
import { type Variants, motion } from "motion/react";
import React, { useMemo } from "react";
import {
  useHydrationGoal,
  useStepGoal,
  useTodayHydration,
  useTodaySteps,
  useTodayWellbeing,
} from "../hooks/useQueries";

const WELLNESS_TIPS = [
  "Walking 10,000 steps a day reduces risk of cardiovascular disease by up to 30%.",
  "Drinking 8 glasses of water daily boosts metabolism and improves focus.",
  "A 20-minute walk in nature lowers cortisol levels significantly.",
  "Tracking your mood daily helps identify patterns and triggers.",
  "Taking the stairs instead of the elevator adds up to 500+ extra steps per day.",
  "Staying well-hydrated improves physical performance by up to 25%.",
  "Even a 5-minute movement break every hour improves circulation and energy.",
  "Sleep and movement are deeply connected — more steps often means better sleep.",
  "Celebrating small wins rewires your brain to seek more healthy habits.",
  "A positive mood before exercise can increase workout duration by 12%.",
];

const MOOD_EMOJIS = ["😞", "😕", "😐", "🙂", "😄"];

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0, 0, 1] },
  },
};

function StatCard({
  title,
  value,
  subtext,
  color,
  icon,
  loading,
  onClick,
  ocid,
}: {
  title: string;
  value: string;
  subtext: string;
  color: string;
  icon: string;
  loading: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <motion.button
      data-ocid={ocid}
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card rounded-2xl p-5 text-left w-full cursor-pointer group transition-all duration-200 hover:shadow-card-lift"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            background: `${color}22`,
            color: color,
          }}
        >
          Today
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
        {title}
      </p>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold leading-none mb-1" style={{ color }}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </>
      )}
    </motion.button>
  );
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data: steps, isLoading: stepsLoading } = useTodaySteps();
  const { data: stepGoal, isLoading: goalLoading } = useStepGoal();
  const { data: hydration, isLoading: hydLoading } = useTodayHydration();
  const { data: hydGoal, isLoading: hydGoalLoading } = useHydrationGoal();
  const { data: wellbeing, isLoading: wellbeingLoading } = useTodayWellbeing();

  const tip = useMemo(
    () =>
      WELLNESS_TIPS[
        Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % WELLNESS_TIPS.length
      ],
    [],
  );

  const hourOfDay = new Date().getHours();
  const greeting =
    hourOfDay < 12
      ? "Good morning"
      : hourOfDay < 17
        ? "Good afternoon"
        : "Good evening";

  const stepsVal = steps ?? 0;
  const stepGoalVal = stepGoal ?? 10000;
  const hydVal = hydration ?? 0;
  const hydGoalVal = hydGoal ?? 8;

  const moodScore = wellbeing ? Number(wellbeing.moodScore) : null;
  const moodEmoji =
    moodScore !== null ? (MOOD_EMOJIS[moodScore - 1] ?? "–") : "–";
  const moodLabel =
    moodScore !== null
      ? ["Very Low", "Low", "Okay", "Good", "Great"][moodScore - 1]
      : "Not logged";

  const stepPercent = Math.min(Math.round((stepsVal / stepGoalVal) * 100), 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="px-4 py-6 space-y-6 pb-28"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          {todayStr}
        </p>
        <h1 className="text-3xl font-bold text-foreground">
          {greeting} <span className="wave-emoji">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's your wellness snapshot
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          ocid="dashboard.steps.card"
          title="Steps"
          value={stepsVal.toLocaleString()}
          subtext={`${stepPercent}% of ${stepGoalVal.toLocaleString()} goal`}
          color="oklch(0.82 0.22 130)"
          icon="🏃"
          loading={stepsLoading || goalLoading}
          onClick={() => onNavigate("steps")}
        />
        <StatCard
          ocid="dashboard.hydration.card"
          title="Hydration"
          value={`${hydVal} glasses`}
          subtext={`${hydVal} of ${hydGoalVal} glasses today`}
          color="oklch(0.72 0.15 200)"
          icon="💧"
          loading={hydLoading || hydGoalLoading}
          onClick={() => onNavigate("hydration")}
        />
        <StatCard
          ocid="dashboard.mood.card"
          title="Mood"
          value={`${moodEmoji} ${moodLabel}`}
          subtext={
            moodScore !== null
              ? `Energy: ${["Very Low", "Low", "Okay", "High", "Max"][Number(wellbeing?.energyScore ?? 3) - 1] ?? "–"}`
              : "Tap to log your mood"
          }
          color="oklch(0.75 0.2 55)"
          icon="✨"
          loading={wellbeingLoading}
          onClick={() => onNavigate("wellbeing")}
        />
      </div>

      {/* Wellness Tip */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Tip of the Day
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{tip}</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Quick Log
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Log Steps",
              icon: "🏃",
              tab: "steps",
              color: "oklch(0.82 0.22 130)",
            },
            {
              label: "Add Water",
              icon: "💧",
              tab: "hydration",
              color: "oklch(0.72 0.15 200)",
            },
            {
              label: "Check In",
              icon: "🌟",
              tab: "wellbeing",
              color: "oklch(0.75 0.2 55)",
            },
          ].map(({ label, icon, tab, color }) => (
            <button
              type="button"
              key={tab}
              onClick={() => onNavigate(tab)}
              className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: `${color}44` }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Attribution */}
      <motion.footer variants={itemVariants} className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </motion.footer>
    </motion.div>
  );
}
