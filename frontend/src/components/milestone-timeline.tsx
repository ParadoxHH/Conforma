"use client";

import { motion } from "framer-motion";

const milestones = [
  { title: "Milestone 1: Foundation", details: "Lay the groundwork for the project." },
  { title: "Milestone 2: Framing", details: "Build the structure of the house." },
  { title: "Milestone 3: Rough-in", details: "Install plumbing, electrical, and HVAC." },
  { title: "Milestone 4: Drywall and Paint", details: "Hang and finish drywall, and apply paint." },
  { title: "Milestone 5: Finishing", details: "Apply the final touches." },
];

const popupVariants = {
  hidden: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export function MilestoneTimeline() {
  return (
    <motion.div 
      className="relative w-full max-w-xs mx-auto py-12"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200" />
      {milestones.map((milestone, index) => (
        <motion.div 
          key={index} 
          className="relative mb-16"
          initial="hidden"
          whileHover="visible"
          style={{ top: `${index * 5}rem` }}
        >
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white"
          />
          <motion.div
            className="absolute left-full ml-8 p-4 bg-white border rounded-lg shadow-lg w-64"
            variants={popupVariants}
          >
            <h4 className="font-bold text-lg">{milestone.title}</h4>
            <p className="text-sm text-slate-600">{milestone.details}</p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}