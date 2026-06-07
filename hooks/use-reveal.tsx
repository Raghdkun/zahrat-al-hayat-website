"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Direction = "up" | "down" | "left" | "right";

interface Options {
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  selector?: string; // animate children matching selector instead of direct children
  once?: boolean;
}

/**
 * Animates direct children of the returned ref on scroll-into-view.
 * RTL-aware: swaps "left"/"right" when html[dir="rtl"].
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
    start = "top 80%",
    selector,
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const isRtl =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("dir") === "rtl";

    const targets = selector
      ? Array.from(el.querySelectorAll<HTMLElement>(selector))
      : (Array.from(el.children) as HTMLElement[]);

    if (targets.length === 0) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    let dir = direction;
    if (isRtl && dir === "left") dir = "right";
    else if (isRtl && dir === "right") dir = "left";

    if (dir === "up") fromVars.y = distance;
    if (dir === "down") fromVars.y = -distance;
    if (dir === "left") fromVars.x = -distance;
    if (dir === "right") fromVars.x = distance;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        fromVars,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          ease: "power3.out",
          stagger,
          delay,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [direction, distance, duration, delay, stagger, start, selector, once]);

  return ref;
}
