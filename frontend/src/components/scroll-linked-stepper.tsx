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
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <HowItWorksStepper activeStep={activeStep} />
      </div>
    </div>
  );
}
