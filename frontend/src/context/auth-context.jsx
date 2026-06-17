import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const res = await api.get("/user/verify");

      setUser(res.data.user);

      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  // AuthContext
  useEffect(() => {
    checkAuth();

    const interval = setInterval(checkAuth, 60000);

    const handleFocus = () => checkAuth();

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        checkAuth,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
