"use client";

import { useAuth } from "./AuthProvider";
import { UserCircle, Users, ChevronDown, Trophy, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AccountSwitcher() {
  const { currentUser, allUsers, setCurrentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const dummyUsers = allUsers.filter(u => ["c1","c2","c3","c4","c5"].includes(u.id));
  const customUsers = allUsers.filter(u => !["c1","c2","c3","c4","c5"].includes(u.id));

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md"
      >
        <div className="w-full h-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10">
          <span className="text-xs font-black text-primary">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-[101]">


          <div className="p-1 max-h-72 overflow-y-auto">
            <div className="px-2 py-1.5">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Switch Account</span>
            </div>
            {/* Standard test accounts */}
            <div className="px-2 py-1">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Test Accounts</span>
            </div>
            {dummyUsers.map(u => (
              <button
                key={u.id}
                onClick={() => { setCurrentUser(u); setIsOpen(false); }}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded text-sm font-medium ${
                  currentUser.id === u.id ? "bg-primary/20 text-primary" : "hover:bg-surface text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {u.name}
                <span className="text-[10px] opacity-50 uppercase">{u.role}</span>
              </button>
            ))}

            {/* Custom / externally assigned candidates */}
            {customUsers.length > 0 && (
              <>
                <div className="px-2 py-1 mt-1 border-t border-neutral-800">
                  <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" /> External Candidates
                  </span>
                </div>
                {customUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setCurrentUser(u); setIsOpen(false); }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded text-sm font-medium ${
                      currentUser.id === u.id ? "bg-amber-500/20 text-amber-500" : "hover:bg-surface text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{u.id}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
