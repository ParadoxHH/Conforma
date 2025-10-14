"use client";

import { motion, AnimatePresence, MotionValue, useTransform, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const steps = [
  { title: "Create & Invite", description: "Contractor creates the job and invites the homeowner." },
  { title: "Fund Securely", description: "Homeowner funds the project securely into an escrow account." },
  { title: "Submit Proof", description: "Contractor submits proof of work for each milestone." },
  { title: "Approve or Dispute", description: "Homeowner approves the work or raises a dispute within 3-5 days." },
  { title: "Get Paid", description: "Funds are released to the contractor upon approval." },
];

export function HowItWorksStepper({ activeStep }: { activeStep: MotionValue<number> }) {
  const roundedActiveStep = useTransform(activeStep, (latest) => Math.round(latest));
  const [currentStep, setCurrentStep] = useState(0);

  useMotionValueEvent(roundedActiveStep, "change", (latest) => {
    setCurrentStep(latest);
  });

  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200" />
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 bg-primary"
          style={{ width: useTransform(activeStep, (latest) => `${(latest / (steps.length - 1)) * 100}%`) }}
        />
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center z-10">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                animate={{ backgroundColor: index <= currentStep ? "var(--primary)" : "#cbd5e1" }}
              >
                {index + 1}
              </motion.div>
              <div className="text-sm mt-2 text-center">{step.title}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold mb-2">{steps[currentStep]?.title}</h3>
            <p>{steps[currentStep]?.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}