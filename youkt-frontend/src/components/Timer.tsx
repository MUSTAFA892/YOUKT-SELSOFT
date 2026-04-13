"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface TimerProps {
  timeLimit: number; // in seconds
  isActive: boolean;
  onTimeout?: () => void;
}

export default function Timer({ timeLimit, isActive, onTimeout }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Defer the callback to the next event loop to avoid setState during render
          if (onTimeout) {
            setTimeout(onTimeout, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const timePercentage = (timeRemaining / timeLimit) * 100;
  const isWarning = timeRemaining < timeLimit * 0.25; // Warning at 25% time remaining
  const isCritical = timeRemaining < timeLimit * 0.1; // Critical at 10% time remaining

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 rounded-xl bg-foreground/[0.03] border border-border transition-all">
      <div className="flex items-center gap-2.5">
        <Clock className={`w-4 h-4 ${
          isCritical ? 'text-rose-500 animate-pulse' :
          isWarning ? 'text-amber-500' :
          'text-primary'
        }`} />
        <span className={`text-xs font-mono font-black ${
          isCritical ? 'text-rose-500' :
          isWarning ? 'text-amber-500' :
          'text-foreground'
        }`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Visual progress bar */}
      <div className="w-20 h-1.5 rounded-full bg-foreground/10 overflow-hidden hidden sm:block">
        <div
          className={`h-full transition-all duration-1000 ${
            isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
            isWarning ? 'bg-amber-500' :
            'bg-emerald-500'
          }`}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {isCritical && (
        <div className="flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-right-2 duration-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] text-rose-500 font-black uppercase tracking-wider">Low!</span>
        </div>
      )}
    </div>
  );
}
