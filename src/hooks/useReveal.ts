import { useEffect, useRef, useState } from "react";

/**
 * Reveal + count-up helpers for the homepage.
 *
 * Both respect `prefers-reduced-motion`: a user who has asked for less motion
 * gets the final state immediately rather than an animation.
 */

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Returns a ref to attach to an element, plus whether it has entered the
 * viewport. Fires once and then disconnects.
 */
export const useInView = <T extends HTMLElement = HTMLDivElement>(
  rootMargin = "0px 0px -12% 0px"
) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    // No IntersectionObserver (older browsers, jsdom) — show content rather
    // than leaving it permanently hidden.
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
};

/**
 * Counts from 0 to `target` once `active` becomes true.
 * `decimals` keeps fractional figures (e.g. a 4.8 rating) intact.
 */
export const useCountUp = (target: number, active: boolean, durationMs = 1400) => {
  const decimals = Number.isInteger(target) ? 0 : 1;
  const [value, setValue] = useState(() => (active ? target : 0));

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      // easeOutExpo — fast start, gentle settle.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Number((target * eased).toFixed(decimals)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs, decimals]);

  return decimals === 0 ? Math.round(value).toLocaleString("en-IN") : value.toFixed(decimals);
};
