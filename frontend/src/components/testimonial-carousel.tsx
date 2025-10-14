"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  { quote: "Conforma made our kitchen remodel so much less stressful. Knowing the money was safe in escrow gave us peace of mind.", author: "- The Johnsons, Austin, TX" },
  { quote: "As a contractor, getting paid on time is crucial. Conforma ensures I get my money as soon as the client approves the work.", author: "- David, Dallas, TX" },
  { quote: "The milestone system is brilliant. It kept the project on track and we always knew what we were paying for.", author: "- Maria, Houston, TX" },
];

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto text-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(event, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
              } else if (swipe > 10000) {
                setIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
              }
            }}
          >
            <p className="italic">"{testimonials[index].quote}"</p>
            <p className="mt-4 font-bold">{testimonials[index].author}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center mt-6 gap-3">
        <button 
          onClick={() => setIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)}
          className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-foreground/40"
        >
          Prev
        </button>
        <button 
          onClick={() => setIndex((prevIndex) => (prevIndex + 1) % testimonials.length)}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}
