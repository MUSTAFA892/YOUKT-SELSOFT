"use client";

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { Users, Code, Trophy, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Active Users", value: 10, suffix: "K+", icon: <Users className="w-5 h-5" /> },
  { label: "Problems Solved", value: 250, suffix: "K+", icon: <Code className="w-5 h-5" /> },
  { label: "Weekly Contests", value: 4, suffix: "", icon: <Trophy className="w-5 h-5" /> },
  { label: "Uptime", value: 99.9, suffix: "%", icon: <Activity className="w-5 h-5" /> },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      count.set(0); // Reset count when entering view
      const controls = animate(count, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (value % 1 !== 0) {
            setDisplayValue(latest.toFixed(1));
          } else {
            setDisplayValue(Math.round(latest).toString());
          }
        }
      });
      return controls.stop;
    }
  }, [value, count, isInView]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <div className="w-full border-y border-border bg-surface/30 backdrop-blur-sm py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-2 text-primary/60">{stat.icon}</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              <Counter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
