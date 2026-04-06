import { ReactNode } from "react";
export type User = {
    id: string;
    name: string;
    role: "candidate" | "recruiter";
};
export declare const DUMMY_USERS: User[];
interface AuthContextType {
    currentUser: User;
    setCurrentUser: (user: User) => void;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
