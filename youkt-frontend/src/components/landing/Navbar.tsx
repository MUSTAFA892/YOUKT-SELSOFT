"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Terminal, Menu, X, Rocket, Command, Zap, Trophy, MessageSquare, Sun, Moon } from "lucide-react";
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
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Discuss", href: "/discuss", icon: MessageSquare },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-6">
        <motion.div 
          initial={false}
          animate={{ 
            width: scrolled ? "auto" : "90%",
            maxWidth: scrolled ? "850px" : "1200px",
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
            <div className="flex items-center gap-1 md:gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-3 md:px-5 py-2 text-xs md:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-all duration-300 rounded-full"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {scrolled && <link.icon className="w-3.5 h-3.5" />}
                    {link.name}
                  </span>
                  
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
            <div className="flex items-center gap-2 md:gap-4 ml-4 border-l border-black/10 dark:border-white/10 pl-4 md:pl-6">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-foreground relative w-10 h-10 flex items-center justify-center overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={resolvedTheme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute"
                  >
                    {mounted && (resolvedTheme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />)}
                  </motion.div>
                </AnimatePresence>
              </button>

              <AccountSwitcher />
              {!scrolled && (
                <Link 
                  href="/signup" 
                  className="hidden md:flex px-5 py-2 bg-primary text-white text-xs font-black rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2" 
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-background/90 backdrop-blur-3xl flex items-center justify-center p-12"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-5xl font-black text-neutral-500 hover:text-foreground transition-all flex items-center gap-6 group"
                  >
                    <link.icon className="w-10 h-10 group-hover:text-primary transition-colors" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="mt-12 flex flex-col gap-4"
              >
                <Link href="/signup" className="text-2xl font-bold py-4 bg-foreground text-background rounded-2xl px-12">Get Started</Link>
                <button onClick={() => setIsOpen(false)} className="text-neutral-500 font-bold">Close Menu</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
