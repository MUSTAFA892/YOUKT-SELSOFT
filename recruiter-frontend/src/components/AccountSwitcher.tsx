"use client";

import { useAuth, DUMMY_USERS } from "./AuthProvider";
import { UserCircle } from "lucide-react";
import { useState } from "react";

export function AccountSwitcher() {
  const { currentUser, setCurrentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 transition-colors"
      >
        <UserCircle className="w-4 h-4 text-neutral-400" />
        <span className="text-xs font-semibold">{currentUser.name}</span>
        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 rounded">
          {currentUser.role}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-950">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Switch Account</span>
          </div>
          <div className="p-1">
            {DUMMY_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  setIsOpen(false);
                }}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded text-sm font-medium ${
                  currentUser.id === u.id ? "bg-indigo-500/20 text-indigo-300" : "hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                {u.name}
                <span className="text-[10px] opacity-50 uppercase">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
