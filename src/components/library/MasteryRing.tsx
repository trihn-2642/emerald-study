'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function getRingColor(mastery: number): string {
  if (mastery >= 80) return 'stroke-emerald-600';
  if (mastery >= 60) return 'stroke-emerald-500';
  if (mastery >= 40) return 'stroke-blue-500';
  return 'stroke-orange-400';
}

type Props = {
  mastery: number;
  duration?: number;
};

export function MasteryRing({ mastery, duration = 900 }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const prevMasteryRef = useRef(mastery);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prevMasteryRef.current !== mastery) {
      prevMasteryRef.current = mastery;
      startedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayed(0);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setDisplayed(Math.round(easeOutCubic(progress) * mastery));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mastery, duration]);

  const ringColor = getRingColor(mastery);
  const strokeOffset = 100 - displayed;

  return (
    <div
      ref={containerRef}
      className="relative flex h-12 w-12 items-center justify-center"
    >
      <svg viewBox="0 0 36 36" className="-rotate-90" width="48" height="48">
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-100"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={strokeOffset}
          className={cn(ringColor)}
        />
      </svg>
      <span className="text-on-surface absolute text-xs font-bold">
        {displayed}%
      </span>
    </div>
  );
}
