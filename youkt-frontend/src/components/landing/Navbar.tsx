"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Terminal, Menu, X, Rocket, Command, Zap, MessageSquare, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AccountSwitcher } from "@/components/AccountSwitcher";

/**
 * A "Dynamic Dock" style Navbar. 
 * High performance, floating island architectural design.
 * Moves away from standard bars into a "Professional Tool" aesthetic.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Problems", href: "/problems", icon: Zap },
    { name: "Interviews", href: "/interviews", icon: Command },
    { name: "Custom IDE", href: "/ide", icon: Terminal },
    { name: "Discuss", href: "/discuss", icon: MessageSquare },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-6">
        <motion.div 
          initial={false}
          animate={{ 
            width: scrolled ? "auto" : "90%",
            maxWidth: scrolled ? "950px" : "1200px",
            y: scrolled ? 0 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-auto group/nav relative"
        >
          {/* Main Floating Dock */}
          <div className="relative glass border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-full px-4 py-2 md:px-8 md:py-3 flex items-center justify-between transition-all duration-500 hover:border-primary/20">
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2 group mr-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Terminal className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              {!scrolled && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-black tracking-tighter text-foreground"
                >
                  YOUKT
                </motion.span>
              )}
            </Link>

            {/* Central Nav Links */}
            <div className="hidden lg:flex items-center gap-1 md:gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-3 md:px-5 py-2 text-xs md:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-all duration-300 rounded-full"
                >
                  <motion.span 
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 flex items-center gap-2 whitespace-nowrap"
                  >
                    {scrolled && <link.icon className="w-3.5 h-3.5 shrink-0" />}
                    {link.name}
                  </motion.span>
                  
                  {hoveredLink === link.name && (
                    <motion.div 
                      layoutId="dock-hover"
                      className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Action Group */}
            <div className="flex items-center flex-nowrap gap-2 md:gap-4 ml-4 border-l border-black/10 dark:border-white/10 pl-2 md:pl-6 leading-none">
              
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
                    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
                      (document as any).startViewTransition(() => {
                        setTheme(nextTheme);
                      });
                    } else {
                      setTheme(nextTheme);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-foreground relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden shrink-0"
                  aria-label="Toggle theme"
                >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={resolvedTheme}
                    initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    className="absolute"
                  >
                    {mounted && (resolvedTheme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />)}
                  </motion.div>
                </AnimatePresence>
                </motion.button>

              <div className="hidden sm:block">
                <AccountSwitcher />
              </div>
              
              {!scrolled && (
                <motion.div
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/signup" 
                    className="hidden xl:flex px-5 py-2 bg-primary text-white text-xs font-black rounded-full hover:brightness-110 transition-all shadow-lg shadow-primary/20 whitespace-nowrap shrink-0"
                  >
                    Get Started
                  </Link>
                </motion.div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </div>

          {/* Scroll Progress Sub-Indicator */}
          {scrolled && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute -bottom-1 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 rounded-full origin-center"
            />
          )}
        </motion.div>
      </nav>

      {/* Modern Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[150] bg-background flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tighter text-foreground">YOUKT</span>
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-black text-neutral-500 hover:text-foreground transition-all flex items-center gap-4 py-2"
                  >
                    <link.icon className="w-8 h-8 text-primary/50" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-border flex flex-col gap-4">
              <Link 
                href="/signup" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-primary text-white text-center font-black rounded-2xl shadow-lg shadow-primary/20"
              >
                Get Started
              </Link>
              <p className="text-center text-xs font-bold text-neutral-500 uppercase tracking-widest">YOUKT Professional v2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
