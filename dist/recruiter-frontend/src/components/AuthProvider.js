"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUMMY_USERS = void 0;
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = require("react");
exports.DUMMY_USERS = [
    { id: "recruiter1", name: "Recruiter Admin", role: "recruiter" },
    { id: "c1", name: "Alice Smith", role: "candidate" },
    { id: "c2", name: "Bob Jones", role: "candidate" },
    { id: "c3", name: "Charlie Brown", role: "candidate" },
    { id: "c4", name: "Dave Evans", role: "candidate" },
    { id: "c5", name: "Eve Miller", role: "candidate" },
];
const AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = (0, react_1.useState)(exports.DUMMY_USERS[0]);
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const saved = localStorage.getItem("youkt_current_user");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const match = exports.DUMMY_USERS.find(u => u.id === parsed.id);
                if (match)
                    setCurrentUser(match);
            }
            catch (e) { }
        }
        setMounted(true);
    }, []);
    const handleSetUser = (user) => {
        setCurrentUser(user);
        localStorage.setItem("youkt_current_user", JSON.stringify(user));
    };
    if (!mounted)
        return null;
    return (<AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>);
}
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
//# sourceMappingURL=AuthProvider.js.map