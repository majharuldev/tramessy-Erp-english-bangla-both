
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const useAdmin = () => {
  const { user } = useContext(AuthContext);
  return user?.role === "admin"; 
};

export default useAdmin;
