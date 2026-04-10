"use client";

import { useAuth } from "./AuthProvider";
import { UserCircle, Users } from "lucide-react";
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 transition-colors"
      >
        <UserCircle className="w-4 h-4 text-neutral-400" />
        <span className="text-xs font-semibold">{currentUser.name}</span>
        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 rounded">
          {currentUser.role}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-950">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Switch Account</span>
          </div>
          <div className="p-1 max-h-72 overflow-y-auto">
            {/* Standard test accounts */}
            <div className="px-2 py-1">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Test Accounts</span>
            </div>
            {dummyUsers.map(u => (
              <button
                key={u.id}
                onClick={() => { setCurrentUser(u); setIsOpen(false); }}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded text-sm font-medium ${
                  currentUser.id === u.id ? "bg-indigo-500/20 text-indigo-300" : "hover:bg-neutral-800 text-neutral-300"
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
                      currentUser.id === u.id ? "bg-amber-500/20 text-amber-300" : "hover:bg-neutral-800 text-neutral-300"
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
