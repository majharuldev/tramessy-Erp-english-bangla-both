// import React, { useRef } from "react";

// import { FormProvider, useForm } from "react-hook-form";
// import { InputField } from "../../../components/Form/FormFields";
// import BtnSubmit from "../../../components/Button/BtnSubmit";
// import { FiCalendar } from "react-icons/fi";
// import toast, { Toaster } from "react-hot-toast";
// import useRefId from "../../../hooks/useRef";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import api from "../../../../utils/axiosConfig";

// const OfficeForm = () => {
//   const navigate = useNavigate()
//   const methods = useForm();
//   const { handleSubmit, register, reset } = methods;
//   const dateRef = useRef(null);
//   const generateRefId = useRefId();
//   const onSubmit = async (data) => {
//     console.log("add fuel data", data);
//     try {
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await api.post(
//         `/office`,
//         formData
//       );
//       const resData = response.data;
//       console.log("resData", resData);
//       if (resData.success) {
//         toast.success("Office info saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/HR/HRM/Office")
//       } else {
//         toast.error("Server Error: " + (resData.message || "Unknown issue"));
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server Error: " + errorMessage);
//     }
//   };
//   return (
//     <div className="mt-10 p-2">
//       <Toaster position="top-center" reverseOrder={false} />
     
//       <div className="mx-auto p-6 border-t-2 border-primary  rounded-md shadow">
//          <h3 className=" pb-4  text-primary font-semibold ">
//         Office Form
//       </h3>
//         <FormProvider {...methods} className="">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="space-y-3 mx-auto rounded-md shadow"
//         >
//           {/* Trip & Destination Section */}
//           <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               {/* <div className="w-full">
//                 <InputField
//                   name="date"
//                   label="Date"
//                   type="date"
//                   required
//                   inputRef={(e) => {
//                     register("date").ref(e);
//                     dateRef.current = e;
//                   }}
//                   icon={
//                     <span
//                       className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2  rounded-r"
//                       onClick={() => dateRef.current?.showPicker?.()}
//                     >
//                       <FiCalendar className="text-gray-700 cursor-pointer" />
//                     </span>
//                   }
//                 />
//               </div> */}
//               <div className="w-full">
//                 <InputField name="branch_name" label="Branch Name" required />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="factory_name"
//                   label="Factory / Company Name"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField type="number" name="opening_balance" label="Opening Balance" required />
//               </div>
//               <div className="w-full">
//                 <InputField name="address" label="Address" required />
//               </div>
//             </div>
//             {/* Submit Button */}
//             <div className="text-left p-5">
//               <BtnSubmit>Submit</BtnSubmit>
//             </div>
//           </div>
//         </form>
//       </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default OfficeForm;


import React, { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/axiosConfig";

const OfficeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL params থেকে id নেয়া
  const isEditMode = Boolean(id);

  const methods = useForm();
  const { handleSubmit, register, reset } = methods;
  const generateRefId = useRefId();

  // যদি edit mode হয় তাহলে data load করে form-এ বসানো
  useEffect(() => {
    if (isEditMode) {
      const fetchOffice = async () => {
        try {
          const res = await api.get(`/office/${id}`);
          if (res.data.success) {
            reset(res.data.data); // form এর মধ্যে পুরাতন ডেটা বসানো
          } else {
            toast.error("Office not found!");
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to load office data");
        }
      };
      fetchOffice();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      if (!isEditMode) {
        formData.append("ref_id", generateRefId()); // শুধু Add করার সময় Ref Id দেবে
      }

      let response;
      if (isEditMode) {
        response = await api.put(`/office/${id}`, formData);
      } else {
        response = await api.post(`/office`, formData);
      }

      if (response.data.success) {
        toast.success(
          isEditMode
            ? "Office updated successfully!"
            : "Office info saved successfully!",
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/HR/HRM/Office");
      } else {
        toast.error("Server Error: " + (response.data.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold">
          {isEditMode ? "Edit Office" : "Add New Office"}
        </h3>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 mx-auto rounded-md shadow"
          >
            <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="branch_name" label="Branch Name" required />
                </div>
                <div className="w-full">
                  <InputField
                    name="factory_name"
                    label="Factory / Company Name"
                    required
                  />
                </div>
              </div>
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    type="number"
                    name="opening_balance"
                    label="Opening Balance"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField name="address" label="Address" required />
                </div>
              </div>
              <div className="text-left p-5">
                <BtnSubmit>{isEditMode ? "Update" : "Submit"}</BtnSubmit>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default OfficeForm;