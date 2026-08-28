import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: "demo-user",
    name: "Ramesh",
    type: "B2C",
    companyApproved: false,
    role: "CUSTOMER",
    permissions: []
  });

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
