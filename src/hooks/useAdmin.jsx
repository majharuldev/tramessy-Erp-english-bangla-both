import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const useAdmin = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.data?.user?.role === "Admin";
  //   console.log("isAdmin", isAdmin);

  return isAdmin;
};

export default useAdmin;
