"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id: string;
  name: string;
  role: "candidate" | "recruiter";
};

export const DUMMY_USERS: User[] = [
  { id: "recruiter1", name: "Recruiter Admin", role: "recruiter" },
  { id: "c1", name: "Alice Smith", role: "candidate" },
  { id: "c2", name: "Bob Jones", role: "candidate" },
  { id: "c3", name: "Charlie Brown", role: "candidate" },
  { id: "c4", name: "Dave Evans", role: "candidate" },
  { id: "c5", name: "Eve Miller", role: "candidate" },
];

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DUMMY_USERS[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("youkt_current_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = DUMMY_USERS.find(u => u.id === parsed.id);
        if (match) setCurrentUser(match);
      } catch(e) {}
    }
    setMounted(true);
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("youkt_current_user", JSON.stringify(user));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
