"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

type Direction = "up" | "down" | "left" | "right";

interface Options {
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  /** Kept for API compatibility; reveal fires on actual visibility. */
  start?: string;
  selector?: string; // animate children matching selector instead of direct children
  once?: boolean;
}

/**
 * Reveal-on-scroll for the direct children (or `selector` matches) of the
 * returned ref.
 *
 * Uses an IntersectionObserver rather than ScrollTrigger so it fires on *actual
 * visibility* — reliably even when the element is reached via an instant jump
 * (browser scroll restoration on reload, anchor links, fast flick scrolling)
 * where scroll-position-based triggers can miss and leave content stuck at
 * opacity 0. RTL-aware: swaps "left"/"right" under html[dir="rtl"].
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const {
    direction = "up",
    distance = 60,
    duration = 0.9,
    delay = 0,
    stagger = 0.12,
    selector,
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = selector
      ? Array.from(el.querySelectorAll<HTMLElement>(selector))
      : (Array.from(el.children) as HTMLElement[]);

    if (targets.length === 0) return;

    // Reduced motion: ensure content is simply visible, no animation.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const isRtl =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("dir") === "rtl";

    const fromVars: gsap.TweenVars = { opacity: 0 };
    let dir = direction;
    if (isRtl && dir === "left") dir = "right";
    else if (isRtl && dir === "right") dir = "left";
    if (dir === "up") fromVars.y = distance;
    if (dir === "down") fromVars.y = -distance;
    if (dir === "left") fromVars.x = -distance;
    if (dir === "right") fromVars.x = distance;

    // Hidden initial state.
    gsap.set(targets, fromVars);

    const reveal = () =>
      gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        ease: "power3.out",
        stagger,
        delay,
        overwrite: "auto",
      });

    const hide = () => gsap.to(targets, { ...fromVars, duration: 0.4, ease: "power2.in", overwrite: "auto" });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            if (once) io.disconnect();
          } else if (!once) {
            hide();
          }
        }
      },
      // Fire when the element is ~15% into the viewport (approx "top 85%").
      { threshold: 0.01, rootMargin: "0px 0px -12% 0px" }
    );

    io.observe(el);

    // Safety net: if the element is already within the viewport on mount
    // (e.g. short pages or a load already scrolled past it), reveal now.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
      if (once) io.disconnect();
    }

    return () => io.disconnect();
  }, [direction, distance, duration, delay, stagger, selector, once]);

  return ref;
}
