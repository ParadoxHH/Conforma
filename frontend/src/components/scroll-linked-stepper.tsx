"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HowItWorksStepper } from "./how-it-works-stepper";

export function ScrollLinkedStepper() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const activeStep = useTransform(scrollYProgress, [0, 1], [0, 4]);

  return (
    <div ref={targetRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-xl shadow-slate-900/10 backdrop-blur">
          <HowItWorksStepper activeStep={activeStep} />
        </div>
      </div>
    </div>
  );
}
