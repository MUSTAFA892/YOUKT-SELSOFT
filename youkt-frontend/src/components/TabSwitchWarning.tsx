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
    count <= 1 ? 'text-amber-400' :
    count <= 3 ? 'text-orange-500' :
    'text-red-500';

  const bgColor =
    count <= 1 ? 'bg-amber-500/10 border-amber-500/50' :
    count <= 3 ? 'bg-orange-500/10 border-orange-500/50' :
    'bg-red-500/10 border-red-500/50';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className={`${bgColor} border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center border animate-pulse`}>
            <AlertTriangle className={`w-8 h-8 ${warningLevelColor}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-white mb-3">
          {count === 1 && "⚠️ Security Alert"}
          {count === 2 && "⚠️ Violation Detected"}
          {count === 3 && "⚠️ Critical Warning"}
          {count === 4 && "🛑 Final Warning"}
          {count === 5 && "🚫 Test Terminated"}
        </h2>

        {/* Message */}
        <p className="text-center text-neutral-300 mb-6 leading-relaxed text-sm">
          {count === 1 &&
            "You've attempted to switch tabs or minimize the window. This action is logged and monitored."}
          {count === 2 &&
            "Multiple screen violations detected. Your progress is being scrutinized. Please stay within the test window."}
          {count === 3 &&
            "Warning: You are halfway through your allowed violations. Any further attempts to switch screens will be reported."}
          {count === 4 &&
            "THIS IS YOUR FINAL WARNING! One more violation and your test will be immediately terminated without saving progress."}
          {count === 5 &&
            "You've exceeded the maximum violations allowed (5/5). Your certification test has been terminated and reported for integrity breach."}
        </p>

        {/* Stats */}
        <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Integrity Violations:</span>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-xl ${count >= 4 ? 'text-red-500' : 'text-white'}`}>{count}/5</span>
            </div>
          </div>
          {/* Visual Progress Bar for violations */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${count >= 4 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${(count / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Warning Info */}
        {count < 5 && (
          <div className="bg-black/50 rounded-lg p-4 mb-6 border border-white/10">
            <p className="text-[10px] text-neutral-400 leading-relaxed flex items-start gap-2">
              <span className="text-primary mt-0.5">ℹ️</span>
              YOUKT Integrity Engine monitors all tab switches, window minimizations, and screen-sharing events during certification assessments.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {count < 5 ? (
            <button
              onClick={onClose}
              className="w-full bg-primary hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              I Understand, Continue Test
            </button>
          ) : null}

          {count === 5 ? (
            <button
              onClick={onExit}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Heart className="w-4 h-4" />
              Exit Abandoned Test
            </button>
          ) : (
            <button
              onClick={onExit}
              className="w-full py-2 text-neutral-500 hover:text-red-400 text-xs font-bold transition-colors"
            >
              Exit Test and Forfeit Attempt
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
