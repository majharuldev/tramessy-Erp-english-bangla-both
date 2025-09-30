// import BtnSubmit from "../../components/Button/BtnSubmit";
// import { FormProvider, useForm } from "react-hook-form";
// import { InputField, SelectField } from "../../components/Form/FormFields";
// import { useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import useRefId from "../../hooks/useRef";
// import { FiCalendar } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import api from "../../../utils/axiosConfig";

// const AddSupply = () => {
//   const navigate = useNavigate()
//   const methods = useForm();
//   const dateRef = useRef(null);
//   const { handleSubmit, reset, register } = methods;
//   const generateRefId = useRefId();
//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await api.post(
//         `/supplier`,
//         formData
//       );
//       const resData = response.data;
//       if (resData.success) {
//         toast.success("Supply information saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/Purchase/SupplierList")
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
//     <div className="mt-5 md:p-2">
//       <Toaster />
//      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
//        <h3 className="pb-4 text-primary font-semibold ">
//         Supply Information Setup
//       </h3>
//       <FormProvider {...methods} className="">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="mx-auto space-y-4"
//         >
//           {/*  */}
//           <div className="md:flex justify-between gap-3">
//             <div className="w-full">
//               <InputField
//                 name="date"
//                 label="Date"
//                 type="date"
//                 required
//                 inputRef={(e) => {
//                   register("date").ref(e);
//                   dateRef.current = e;
//                 }}
//                 icon={
//                   <span
//                     className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 rounded-r"
//                     onClick={() => dateRef.current?.showPicker?.()}
//                   >
//                     <FiCalendar className="text-gray-700 cursor-pointer" />
//                   </span>
//                 }
//               />
//             </div>
//             <div className="w-full">
//               <InputField name="supplier_name" label="Supplier Name" required />
//             </div>
//              <div className="w-full">
//               <InputField name="business_category" label="Business Category" required />
//             </div>
//             <div className="w-full">
//               <InputField name="phone" label="Phone" type="number" required />
//             </div>
//           </div>
//           {/*  */}
//           <div className="md:flex justify-between gap-3">
//             <div className="w-full">
//               <InputField name="address" label="Address" required />
//             </div>
//             <div className="w-full">
//               <InputField
//                 name="due_amount"
//                 label="Opening Balance"
//                 type="number"
//                 required
//               />
//             </div>
//             <div className="w-full">
//               <InputField
//                 name="contact_person_name"
//                 label="Contact Person"
//                 required
//               />
//             </div>
//             <div className="relative w-full">
//               <SelectField
//                 name="status"
//                 label="Status"
//                 required
//                 options={[
//                   { value: "", label: "Select Status..." },
//                   { value: "Active", label: "Active" },
//                   { value: "Inactive", label: "Inactive" },
//                 ]}
//               />
//             </div>
//           </div>

//           <BtnSubmit>Submit</BtnSubmit>
//         </form>
//       </FormProvider>
//      </div>
//     </div>
//   );
// };

// export default AddSupply;


import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import useRefId from "../../hooks/useRef";

const SupplyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id from params
  const methods = useForm();
  const { handleSubmit, reset, register, setValue } = methods;
  const dateRef = useRef(null);
  const generateRefId = useRefId();
  const [loading, setLoading] = useState(false);

  // fetch supply data if update mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/supplier/${id}`)
        .then((res) => {
          if (res.data.success) {
            const supply = res.data.data;
            Object.keys(supply).forEach((key) => {
              if (supply[key] !== null && supply[key] !== undefined) {
                setValue(key, supply[key]);
              }
            });
          } else {
            toast.error("Failed to fetch supplier info!");
          }
        })
        .catch((err) => {
          toast.error("Error: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  // submit handler
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      if (!id) {
        formData.append("ref_id", generateRefId()); // only add when new
      }

      const response = id
        ? await api.put(`/supplier/${id}`, formData)
        : await api.post(`/supplier`, formData);

      const resData = response.data;
      if (resData.success) {
        toast.success(
          id
            ? "Supply information updated successfully!"
            : "Supply information saved successfully!",
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/Purchase/SupplierList");
      } else {
        toast.error("Server Error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    }
  };

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold ">
          {id ? "Update Supply Information" : "Add Supply Information"}
        </h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-4">
              {/* row 1 */}
              <div className="md:flex justify-between gap-3">
                {/* <div className="w-full">
                  <InputField
                    name="date"
                    label="Date"
                    type="date"
                    required
                    inputRef={(e) => {
                      register("date").ref(e);
                      dateRef.current = e;
                    }}
                    icon={
                      <span
                        className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 rounded-r"
                        onClick={() => dateRef.current?.showPicker?.()}
                      >
                        <FiCalendar className="text-gray-700 cursor-pointer" />
                      </span>
                    }
                  />
                </div> */}
                <div className="w-full">
                  <InputField
                    name="supplier_name"
                    label="Supplier Name"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="business_category"
                    label="Business Category"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField name="phone" label="Phone" type="number" required />
                </div>
              </div>
              {/* row 2 */}
              <div className="md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="address" label="Address" required />
                </div>
                <div className="w-full">
                  <InputField
                    name="due_amount"
                    label="Opening Balance"
                    type="number"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="contact_person_name"
                    label="Contact Person"
                    required
                  />
                </div>
                <div className="relative w-full">
                  <SelectField
                    name="status"
                    label="Status"
                    required
                    options={[
                      { value: "", label: "Select Status..." },
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" },
                    ]}
                  />
                </div>
              </div>

              <BtnSubmit>{id ? "Update" : "Submit"}</BtnSubmit>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default SupplyForm;
