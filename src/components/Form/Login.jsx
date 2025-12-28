import { useContext, useState } from "react";
import bgImage from "../../assets/aj-e.jpeg"
import { FaEnvelope, FaLock } from "react-icons/fa";
import ReusableForm from "./ReusableForm";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Login = () => {
  const {t} = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
    const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // const handleLogin = async (data) => {
  //   const { email, password } = data;
  //   const result = await login(email, password);

  //   if (result.success) {
  //     navigate("/tramessy");
  //   } else {
  //     alert(result.message || "Login failed");
  //   }
  // };

  const handleLogin = async (data) => {
    const { email, password } = data;
    setError("")
    setIsLoading(true)

     try {
    const res = await login(email, password); 
    console.log(res)
if (res.success) {
      // লগইন সফল, Active ইউজার
      toast.success("Login successful!");
      navigate("/tramessy");
    } else {
      // লগইন ব্যর্থ বা Inactive
      toast.error(res.message || "Login failed");
      setError(res.message || "Login failed");
    }
  } catch (err) {
    toast.error(err.message || "Login failed");
    setError(err.message || "Login failed");
  }

    // const result = await login(email, password)

    //   navigate("/tramessy")
    //   setError(result.message || "Invalid credentials")

    setIsLoading(false)
  }

  return (
    <div className="md:px-40 h-screen flex items-center justify-center">
      <Toaster/>
      <div className="md:border-2 border-primary rounded-xl md:flex justify-between">
        {/* img */}
        <div className="hidden md:block md:w-1/2 mt-10 md:mt-0">
          <img
            src={bgImage}
            alt=""
            className="rounded-lg md:rounded-l-lg w-full h-full"
          />
        </div>
        {/* form */}
        <div className="flex items-center justify-center md:w-1/2 bg-white rounded-xl py-7 md:p-8">
          <div className="bg-white shadow-lg p-5 md:p-7 rounded-md border md:border-none border-gray-200">
            <h2 className="text-3xl font-semibold text-center text-[#11375B] mb-1">
              {t("Tramessy")}
            </h2>
            <p className="text-sm text-center text-primary mb-6">
              {t("Please Login")}!
            </p>

            <ReusableForm onSubmit={handleLogin}>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
                  required
                />
                <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
                  <FaEnvelope />
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
                  required
                />
                <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
                  <FaLock />
                </span>
              </div>
            </ReusableForm>

            {/* <div className="mt-4 text-center">
              <Link to="/tramessy/ResetPass">
                <span className="text-sm text-[#11375B] underline hover:text-red-500 transition-all duration-700">
                  Forget password?
                </span>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



// import React, { useContext, useState } from "react";
// import bgImage from "../../assets/bannerImg.jpeg";
// import { FaEnvelope, FaLock } from "react-icons/fa";
// import ReusableForm from "./ReusableForm";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../providers/AuthProvider";

// const Login = () => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const { login } = useContext(AuthContext)
//   const navigate = useNavigate()

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setError("")
//     setIsLoading(true)

//     const result = await login(email, password)

//     if (result.success) {
//       navigate("/tramessy")
//     } else {
//       setError(result.message || "Invalid credentials")
//     }
//     setIsLoading(false)
//   }

//   return (
//     <div className="md:px-40 h-screen flex items-center justify-center">
//       <div className="md:border-2 border-primary rounded-xl md:flex justify-between">
//         {/* img */}
//         <div className="hidden md:block md:w-1/2 mt-10 md:mt-0">
//           <img
//             src={bgImage}
//             alt=""
//             className="rounded-lg md:rounded-l-lg w-full h-full"
//           />
//         </div>
//         {/* form */}
//         <div className="flex items-center justify-center md:w-1/2 bg-white rounded-xl py-7 md:p-8">
//           <div className="bg-white shadow-lg p-5 md:p-7 rounded-md border md:border-none border-gray-200">
//             <h2 className="text-3xl font-semibold text-center text-[#11375B] mb-1">
//               Tramessy
//             </h2>
//             <p className="text-sm text-center text-primary mb-6">
//               Please Login!
//             </p>

//             <ReusableForm onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Email"
//                   className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
//                   required
//                 />
//                 <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
//                   <FaEnvelope />
//                 </span>
//               </div>
//               <div className="relative">
//                 <input
//                   type="password"
//                   name="password"
//                   value={password}
//   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Password"
//                   className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
//                   required
//                 />
//                 <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
//                   <FaLock />
//                 </span>
//               </div>
//             </ReusableForm>

//             <div className="mt-4 text-center">
//               <Link to="/tramessy/ResetPass">
//                 <span className="text-sm text-[#11375B] underline hover:text-red-500 transition-all duration-700">
//                   Forget password?
//                 </span>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
