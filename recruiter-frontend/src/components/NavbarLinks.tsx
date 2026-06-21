"use client";

import { useAuth } from "./AuthProvider";
import { AccountSwitcher } from "./AccountSwitcher";
import { Zap, Trophy, ClipboardList, Users } from "lucide-react";

export default function NavbarLinks() {
  const { unreadHelpRequests } = useAuth();
  const hasUnread = unreadHelpRequests && unreadHelpRequests.length > 0;

  return (
    <nav className="flex items-center gap-1">
      <a
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
      >
        <Zap className="w-4 h-4" /> Build Assessment
      </a>
      <a
        href="/reports"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
      >
        <Trophy className="w-4 h-4" /> Reports
      </a>
      <a
        href="/pipeline"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
      >
        <ClipboardList className="w-4 h-4" /> Pipeline
      </a>
      <a
        href="/candidates"
        className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
      >
        <Users className="w-4 h-4" /> Candidates
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black text-white items-center justify-center border border-neutral-950">
              !
            </span>
          </span>
        )}
      </a>
      <div className="ml-3 pl-3 border-l border-white/10">
        <AccountSwitcher />
      </div>
    </nav>
  );
}
