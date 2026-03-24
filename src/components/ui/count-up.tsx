'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  /** Animation duration in milliseconds */
  duration?: number;
  suffix?: string;
  formatter?: (n: number) => string;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({ to, duration = 800, suffix = '', formatter }: Props) {
  const [value, setValue] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const prevToRef = useRef(to);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Reset if `to` changes
    if (prevToRef.current !== to) {
      prevToRef.current = to;
      startedRef.current = false;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.round(easeOutCubic(progress) * to));
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
  }, [to, duration]);

  const display = formatter ? formatter(value) : value.toLocaleString('vi-VN');

  return (
    <span ref={containerRef}>
      {display}
      {suffix}
    </span>
  );
}
