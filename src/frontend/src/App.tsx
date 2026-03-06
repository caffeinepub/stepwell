import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { DashboardPage } from "./pages/DashboardPage";
import { HydrationPage } from "./pages/HydrationPage";
import { StepsPage } from "./pages/StepsPage";
import { WellbeingPage } from "./pages/WellbeingPage";

type Tab = "dashboard" | "steps" | "wellbeing" | "hydration";

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "steps", label: "Steps", icon: "🏃" },
  { id: "wellbeing", label: "Wellbeing", icon: "✨" },
  { id: "hydration", label: "Water", icon: "💧" },
];

function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.82 0.22 130), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.15 200), transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm text-center space-y-8 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-glow">
            <img
              src="/assets/generated/stepwell-logo-transparent.dim_200x200.png"
              alt="StepWell"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary">StepWell</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your fitness & wellbeing companion
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {[
            { icon: "🏃", text: "Track your daily steps & goals" },
            { icon: "💧", text: "Monitor hydration throughout the day" },
            { icon: "✨", text: "Check in on mood & energy levels" },
            { icon: "📈", text: "See your weekly progress trends" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 text-left"
            >
              <span className="text-xl flex-shrink-0">{feature.icon}</span>
              <span className="text-sm text-foreground">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-14 rounded-2xl font-bold text-base text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow disabled:opacity-60"
            style={{ background: "oklch(0.82 0.22 130)" }}
          >
            {isInitializing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Loading...
              </span>
            ) : isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              "Get Started →"
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Secure login — your data stays private
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 relative transition-all"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                className="text-xl"
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {icon}
              </motion.span>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-glow animate-pulse">
            <img
              src="/assets/generated/stepwell-logo-transparent.dim_200x200.png"
              alt="StepWell"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img
              src="/assets/generated/stepwell-logo-transparent.dim_200x200.png"
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>
          <span className="font-bold text-lg text-primary tracking-tight">
            StepWell
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Decentralized health
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Secure
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="min-h-[calc(100vh-56px)]">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardPage onNavigate={(tab) => setActiveTab(tab as Tab)} />
            </motion.div>
          )}
          {activeTab === "steps" && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <StepsPage />
            </motion.div>
          )}
          {activeTab === "wellbeing" && (
            <motion.div
              key="wellbeing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <WellbeingPage />
            </motion.div>
          )}
          {activeTab === "hydration" && (
            <motion.div
              key="hydration"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <HydrationPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.01 240)",
            border: "1px solid oklch(0.25 0.015 240)",
            color: "oklch(0.95 0.01 100)",
          },
        }}
      />
    </div>
  );
}
