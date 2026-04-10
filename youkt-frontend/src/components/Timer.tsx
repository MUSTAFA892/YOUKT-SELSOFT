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
    <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-neutral-900 border border-neutral-800">
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 ${
          isCritical ? 'text-rose-500 animate-pulse' :
          isWarning ? 'text-amber-500' :
          'text-indigo-400'
        }`} />
        <span className={`text-sm font-mono font-bold ${
          isCritical ? 'text-rose-400' :
          isWarning ? 'text-amber-400' :
          'text-neutral-200'
        }`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Visual progress bar */}
      <div className="w-24 h-2 rounded-full bg-neutral-700 overflow-hidden">
        <div
          className={`h-full transition-all ${
            isCritical ? 'bg-rose-500' :
            isWarning ? 'bg-amber-500' :
            'bg-emerald-500'
          }`}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {isCritical && (
        <div className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span className="text-xs text-rose-400 font-semibold">Time Low!</span>
        </div>
      )}
    </div>
  );
}
