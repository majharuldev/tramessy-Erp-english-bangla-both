import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

    const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // check expiration (24h = 86400000ms)
  useEffect(() => {
    if (user?.loginTime) {
      const now = Date.now();
      const diff = now - user.loginTime;

      if (diff > 24 * 60 * 60 * 1000) {
        logout();
      } else {
        // auto logout timer set করে দিচ্ছি
        const remaining = 24 * 60 * 60 * 1000 - diff;
        const timer = setTimeout(() => {
          logout();
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
         const loginData = {
          ...data,
          loginTime: Date.now(),
        };
        setUser(loginData);
        localStorage.setItem("user", JSON.stringify(loginData));
        return { success: true };
      } else {
        return { success: false, message: data?.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
