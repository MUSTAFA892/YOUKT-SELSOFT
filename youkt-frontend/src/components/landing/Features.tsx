"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Cpu, Globe, Rocket, Terminal } from "lucide-react";

const features = [
  {
    title: "Ultra-Fast Execution",
    description: "Our distributed engine executes code in milliseconds with dedicated sandboxed containers.",
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    className: "lg:col-span-2 lg:row-span-1",
    bg: "bg-amber-500/5",
  },
  {
    title: "Multi-Language Support",
    description: "C++, Python, Java, Rust, and Go. All with standard library support.",
    icon: <Globe className="w-6 h-6 text-indigo-400" />,
    className: "lg:col-span-1 lg:row-span-1",
    bg: "bg-indigo-500/5",
  },
  {
    title: "Secure Sandboxing",
    description: "Enterprise-grade isolation for your code submissions.",
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    className: "lg:col-span-1 lg:row-span-1",
    bg: "bg-emerald-500/5",
  },
  {
    title: "Advanced Analytics",
    description: "Deep dive into your time and space complexity with visual charts.",
    icon: <Cpu className="w-6 h-6 text-rose-400" />,
    className: "lg:col-span-2 lg:row-span-1",
    bg: "bg-rose-500/5",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold mb-4">Engineered for <span className="text-primary">Excellence</span></h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Everything you need to master competitive programming and technical interviews in one unified platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`
              ${feature.className} p-8 rounded-3xl border border-border 
              hover:border-primary/20 transition-all group overflow-hidden relative
              bg-surface/50 backdrop-blur-sm shadow-3d
            `}
          >
            <div className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className="mb-4 p-3 rounded-2xl bg-foreground/5 w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
