"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export type User = {
  id: string;
  name: string;
  role: "candidate" | "recruiter";
};

export const DUMMY_USERS: User[] = [
  { id: "c1", name: "Alice Smith",   role: "candidate" },
  { id: "c2", name: "Bob Jones",     role: "candidate" },
  { id: "c3", name: "Charlie Brown", role: "candidate" },
  { id: "c4", name: "Dave Evans",    role: "candidate" },
  { id: "c5", name: "Eve Miller",    role: "candidate" },
];

const CUSTOM_CANDIDATES_KEY = "youkt_custom_candidates";

function loadCustomCandidates(): User[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CANDIDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomCandidates(users: User[]) {
  try {
    localStorage.setItem(CUSTOM_CANDIDATES_KEY, JSON.stringify(users));
  } catch {}
}

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  registerCandidate: (id: string, name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(DUMMY_USERS[0]);
  const [customCandidates, setCustomCandidates] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const custom = loadCustomCandidates();
    setCustomCandidates(custom);

    const saved = localStorage.getItem("youkt_current_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check both dummy users and custom candidates
        const allKnown = [...DUMMY_USERS, ...custom];
        const match = allKnown.find(u => u.id === parsed.id);
        if (match) setCurrentUserState(match);
        else if (parsed.id && parsed.name) setCurrentUserState(parsed); // restore custom even if not in lists yet
      } catch {}
    }
    setMounted(true);
  }, []);

  const allUsers: User[] = [
    ...DUMMY_USERS,
    ...customCandidates.filter(c => !DUMMY_USERS.some(d => d.id === c.id)),
  ];

  const handleSetUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem("youkt_current_user", JSON.stringify(user));
  };

  const registerCandidate = useCallback((id: string, name: string) => {
    // Don't add if already a known dummy user or already registered
    if (DUMMY_USERS.some(u => u.id === id)) return;
    setCustomCandidates(prev => {
      if (prev.some(u => u.id === id)) return prev; // already registered
      const newUser: User = { id, name: name || id, role: "candidate" };
      const updated = [...prev, newUser];
      saveCustomCandidates(updated);
      return updated;
    });
  }, []);

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, setCurrentUser: handleSetUser, registerCandidate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
