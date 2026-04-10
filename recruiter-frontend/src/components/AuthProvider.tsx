"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";

export type User = {
  id: string;
  name: string;
  role: "candidate" | "recruiter";
  recruiterId?: string; // Which recruiter owns this candidate
};

// Recruiter accounts
export const RECRUITER_USERS: User[] = [
  { id: "recruiter1", name: "Recruiter 1", role: "recruiter" },
  { id: "recruiter2", name: "Recruiter 2", role: "recruiter" },
  { id: "recruiter3", name: "Recruiter 3", role: "recruiter" },
];

// Candidates assigned to each recruiter
export const CANDIDATE_USERS: User[] = [
  // Recruiter 1's candidates
  { id: "c1", name: "Alice Smith", role: "candidate", recruiterId: "recruiter1" },
  { id: "c2", name: "Bob Jones", role: "candidate", recruiterId: "recruiter1" },
  { id: "c3", name: "Charlie Brown", role: "candidate", recruiterId: "recruiter1" },
  // Recruiter 2's candidates
  { id: "c4", name: "Dave Evans", role: "candidate", recruiterId: "recruiter2" },
  { id: "c5", name: "Eve Miller", role: "candidate", recruiterId: "recruiter2" },
  { id: "c6", name: "Frank Wilson", role: "candidate", recruiterId: "recruiter2" },
  // Recruiter 3's candidates
  { id: "c7", name: "Grace Lee", role: "candidate", recruiterId: "recruiter3" },
  { id: "c8", name: "Henry Martinez", role: "candidate", recruiterId: "recruiter3" },
  { id: "c9", name: "Ivy Thompson", role: "candidate", recruiterId: "recruiter3" },
];

export const DUMMY_USERS: User[] = [...RECRUITER_USERS, ...CANDIDATE_USERS];

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allCandidates: User[];
  registerCandidate: (id: string, name: string) => void;
  getRecruiterCandidates: (recruiterId: string) => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(RECRUITER_USERS[0]);
  const [allCandidates, setAllCandidates] = useState<User[]>(CANDIDATE_USERS);
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
    
    // Load external candidates from localStorage
    const externalCandidates = localStorage.getItem("youkt_external_candidates");
    if (externalCandidates) {
      try {
        const parsed = JSON.parse(externalCandidates) as User[];
        setAllCandidates(prev => {
          const existing = new Set(prev.map(c => c.id));
          const newCandidates = parsed.filter(c => !existing.has(c.id));
          return [...prev, ...newCandidates];
        });
      } catch(e) {}
    }
    
    setMounted(true);
  }, []);

  const handleSetUser = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem("youkt_current_user", JSON.stringify(user));
  }, []);

  const getRecruiterCandidates = useCallback((recruiterId: string): User[] => {
    // Get all candidates assigned to this recruiter
    return allCandidates.filter(c => c.role === "candidate" && c.recruiterId === recruiterId);
  }, [allCandidates]);

  const registerCandidate = useCallback((id: string, name: string) => {
    // Only allow recruiter to add candidates
    if (currentUser.role !== "recruiter") return;

    setAllCandidates(prevCandidates => {
      // Check if candidate already exists in current state
      if (prevCandidates.some(c => c.id === id)) {
        return prevCandidates;
      }
      
      const newCandidate: User = { 
        id, 
        name, 
        role: "candidate",
        recruiterId: currentUser.id // Assign to current recruiter
      };
      const updated = [...prevCandidates, newCandidate];
      
      // Persist only external candidates (not CANDIDATE_USERS) to localStorage
      const externalOnly = updated.filter(c => !CANDIDATE_USERS.find(u => u.id === c.id));
      localStorage.setItem("youkt_external_candidates", JSON.stringify(externalOnly));
      
      return updated;
    });
  }, [currentUser]);

  const contextValue = useMemo(() => ({
    currentUser,
    setCurrentUser: handleSetUser,
    allCandidates,
    registerCandidate,
    getRecruiterCandidates
  }), [currentUser, handleSetUser, allCandidates, registerCandidate, getRecruiterCandidates]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
