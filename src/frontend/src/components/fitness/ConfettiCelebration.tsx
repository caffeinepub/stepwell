import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const COLORS = [
  "oklch(0.82 0.22 130)",
  "oklch(0.7 0.18 28)",
  "oklch(0.72 0.15 200)",
  "oklch(0.78 0.18 70)",
  "oklch(0.75 0.2 55)",
];

export function ConfettiCelebration({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.4,
        size: 6 + Math.random() * 6,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!particles.length) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-8px",
            width: p.size,
            height: p.size,
            borderRadius: "2px",
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
