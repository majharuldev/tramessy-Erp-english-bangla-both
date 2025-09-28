
// AuthProvider.jsx
import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../../utils/axiosConfig";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const token = Cookies.get("auth_token");
  //   if (token) {
  //     api.get("/user")   //  এর /api/user endpoint
  //       .then((res) => {
  //         setUser(res.data); // user এর মধ্যে role থাকবে
  //         setIsAuthenticated(true);
  //       })
  //       .catch(() => {
  //         setUser(null);
  //         setIsAuthenticated(false);
  //       })
  //       .finally(() => setLoading(false));
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);

  useEffect(() => {
  const token = Cookies.get("auth_token");
  const savedUser = Cookies.get("auth_user");

  if (token && savedUser) {
    setUser(JSON.parse(savedUser));
    setIsAuthenticated(true);
  }
  setLoading(false);
}, []);


  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      const { token, user } = res.data;
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

