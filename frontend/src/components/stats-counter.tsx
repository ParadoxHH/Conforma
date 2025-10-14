"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

type StatsCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
};

export function StatsCounter({ value, prefix = "", suffix = "" }: StatsCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 2,
      onUpdate(value) {
        node.textContent = prefix + Math.round(value).toLocaleString() + suffix;
      },
    });

    return () => controls.stop();
  }, [value, prefix, suffix]);

  return <span ref={nodeRef} />;
}
