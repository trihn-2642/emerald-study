'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Props = {
  value: number;
  duration?: number;
  className?: string;
  indicatorClassName?: string;
};

export function AnimatedProgress({
  value,
  duration = 800,
  className,
  indicatorClassName,
}: Props) {
  const [displayed, setDisplayed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
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
            setDisplayed(Math.round(easeOutCubic(progress) * value));
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
  }, [value, duration]);

  return (
    <div
      ref={containerRef}
      data-slot="progress"
      className={cn(
        'bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full',
        className,
      )}
    >
      <div
        data-slot="progress-indicator"
        className={cn('size-full flex-1 transition-none', indicatorClassName)}
        style={{ transform: `translateX(-${100 - displayed}%)` }}
      />
    </div>
  );
}
