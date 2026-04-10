"use client";

import { AlertTriangle, Copy, CheckCircle2, Heart } from "lucide-react";

interface TabSwitchWarningProps {
  isOpen: boolean;
  count: number; // Current count (1-3)
  onClose: () => void;
  onExit: () => void;
}

export default function TabSwitchWarning({ isOpen, count, onClose, onExit }: TabSwitchWarningProps) {
  if (!isOpen) return null;

  const warningLevelColor = 
    count === 1 ? 'text-amber-500' :
    count === 2 ? 'text-orange-500' :
    'text-red-500';

  const bgColor =
    count === 1 ? 'bg-amber-500/10 border-amber-500/50' :
    count === 2 ? 'bg-orange-500/10 border-orange-500/50' :
    'bg-red-500/10 border-red-500/50';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${bgColor} border rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center border`}>
            <AlertTriangle className={`w-8 h-8 ${warningLevelColor}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-white mb-3">
          {count === 1 && "⚠️ Assignment Locked"}
          {count === 2 && "⚠️ Final Warning"}
          {count === 3 && "🚫 Assignment Terminated"}
        </h2>

        {/* Message */}
        <p className="text-center text-neutral-300 mb-6 leading-relaxed">
          {count === 1 &&
            "You've attempted to switch tabs or split screen. Your assignment is locked. Any further violations will result in immediate termination."}
          {count === 2 &&
            "This is your final warning! One more violation will automatically exit the assignment and report this breach."}
          {count === 3 &&
            "You've exceeded the maximum violations allowed. The assignment is being terminated and reported."}
        </p>

        {/* Stats */}
        <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Integrity Violations Detected:</span>
            <span className="text-white font-bold text-lg">{count}/3</span>
          </div>
        </div>

        {/* Warning Info */}
        {count < 3 && (
          <div className="bg-black/50 rounded-lg p-4 mb-6 border border-white/10">
            <p className="text-xs text-neutral-400 leading-relaxed">
              <Copy className="w-3 h-3 inline mr-2" />
              All attempts to switch tabs or split screen are monitored and reported to your recruiter.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {count < 3 ? (
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Continue Assignment
            </button>
          ) : null}

          {count === 3 ? (
            <button
              onClick={onExit}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Exit Assignment
            </button>
          ) : (
            <button
              onClick={onExit}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-colors border border-red-600/50"
            >
              Exit Now
            </button>
          )}
        </div>

        {/* Footer Note */}
        {count === 3 && (
          <p className="text-center text-xs text-neutral-500 mt-4">
            This incident has been recorded and reported.
          </p>
        )}
      </div>
    </div>
  );
}
