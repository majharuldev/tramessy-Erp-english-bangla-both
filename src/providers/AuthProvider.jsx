
// AuthProvider.jsx
import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../../utils/axiosConfig";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//   const token = Cookies.get("auth_token");
//   const savedUser = Cookies.get("auth_user");

//   if (token && savedUser) {
//     setUser(JSON.parse(savedUser));
//     setIsAuthenticated(true);
//      setLoading(false);

//   //  প্রতি 1 মিনিট পর স্ট্যাটাস চেক
//     const interval = setInterval(async () => {
//       try {
//         const res = await api.get("/user");
//         const updatedUser = res.data;

//         // যদি user inactive হয়ে যায়
//         if (updatedUser.status !== "Active") {
//           logout();
//         } else {
//           Cookies.set("auth_user", JSON.stringify(updatedUser));
//           setUser(updatedUser);
//         }
//       } catch (error) {
//         console.error("User status check failed:", error);
//       }
//     }, 60000); // প্রতি 60 সেকেন্ডে চেক করবে

//     return () => clearInterval(interval);
//   }
// }, []);

useEffect(() => {
  const checkAuth = async () => {
    const token = Cookies.get("auth_token");
    const savedUser = Cookies.get("auth_user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    // initial loading শেষ
    setLoading(false);
  };

  checkAuth();

  //  Background user status check every 24 h
  // const interval = setInterval(async () => {
  //   try {
  //     const res = await api.get("/user");
  //     const updatedUser = res.data;

  //     if (updatedUser.status !== "Active") {
  //       logout();
  //     } else {
  //       Cookies.set("auth_user", JSON.stringify(updatedUser));
  //       setUser(updatedUser);
  //     }
  //   } catch (error) {
  //     console.error("User status check failed:", error);
  //   }
  // }, 24 * 60 * 60 * 1000);

  return () => clearInterval(interval);
}, []);


  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      const { token, user } = res.data;
          //  যদি ইউজারের স্ট্যাটাস inactive হয় তাহলে লগইন ব্লক করে দাও
    if (user.status !== "Active") {
      return {
        success: false,
        message: "Your account is inactive. Please contact admin.",
      };
    }

      Cookies.set("auth_token", token, { expires: 1 });
       Cookies.set("auth_user", JSON.stringify(user), { expires: 1 });

      // login এর পরে user details আনো
      // const userRes = await api.get("/user");
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("auth_user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/tramessy/Login";
  };

  if (loading) return <div>Loading authentication...</div>;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

