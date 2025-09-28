// import axios from "axios";
// import { useRef } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import { FiCalendar } from "react-icons/fi";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/axiosConfig";

// const AddVendorForm = () => {
//   const methods = useForm();
//   const { handleSubmit, register, reset } = methods;
//   const dateRef = useRef(null);
//   const navigate = useNavigate()

//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       const response = await api.post(
//         `/vendor`,
//         formData
//       );
//       const resData = response.data;
//       if (resData.success) {
//         toast.success("Vendor saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//          navigate("/tramessy/VendorList")
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
//     <div className="mt-5 p-2">
      
//       <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
//         <h3 className="pt-1 pb-4 text-primary  font-semibold rounded-t-md">
//         Vendor Form
//       </h3>
//         <FormProvider {...methods} className="">
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Toaster position="top-center" reverseOrder={false} />
//             {/*  */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full relative">
//                 <InputField name="vendor_name" label="Vendor Name" required />
//               </div>
//               <div className="mt-3 md:mt-0 w-full relative">
//                 <InputField
//                   name="mobile"
//                   label="Mobile"
//                   type="number"
//                   required
//                 />
//               </div>
//             </div>
//             {/*  */}
//             <div className="mt-1 md:flex justify-between gap-3">
//               <div className="mt-3 md:mt-0 w-full relative">
//                 <InputField name="email" label="Email" />
//               </div>
//               <div className="mt-3 md:mt-0 w-full relative">
//                 <SelectField
//                   name="rent_category"
//                   label="Rent Category"
//                   required
//                   options={[
//                     { value: "", label: "Select Transport Rent..." },
//                     { value: "Pickup", label: "Pickup" },
//                     { value: "Covered Van", label: "Covered Van" },
//                   ]}
//                 />
//               </div>
//             </div>
//             {/*  */}
//             <div className="mt-1 md:flex justify-between gap-3">
              
//               <div className="w-full relative">
//                 <InputField name="work_area" label="Work Area" />
//               </div>
//               <div className="w-full relative">
//                 <InputField type="number" name="opening_balance" label="Opening Balance" />
//               </div>
//             </div>
//             {/*  */}
//             <div className="mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField
//                   name="date"
//                   label="Date"
//                   type="date"
//                   required
//                   inputRef={(e) => {
//                     register("date").ref(e);
//                     dateRef.current = e;
//                   }}
                  
//                 />
//               </div>

//               <div className="w-full relative">
//                 <SelectField
//                   name="status"
//                   label="Status"
//                   required
//                   options={[
//                     { value: "", label: "Select Status..." },
//                     { value: "Active", label: "Active" },
//                     { value: "Inactive", label: "Inactive" },
//                   ]}
//                 />
//               </div>
//             </div>
//             {/*  */}

//             {/* Submit Button */}
//             <div className="text-left">
//               <BtnSubmit>Submit</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default AddVendorForm;

import axios from "axios";
import { useRef, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import api from "../../utils/axiosConfig";

const AddVendorForm = () => {
  const { id } = useParams(); // ID প্যারামিটার
  const isUpdateMode = !!id; // Update mode চেক
  const navigate = useNavigate();
  const dateRef = useRef(null);

  const methods = useForm({
    defaultValues: {
      vendor_name: "",
      mobile: "",
      email: "",
      rent_category: "",
      work_area: "",
      opening_balance: "",
      date: "",
      status: "",
    },
  });

  const { handleSubmit, register, reset, setValue } = methods;
  const [loading, setLoading] = useState(false);

  // Update mode হলে ডেটা লোড
  useEffect(() => {
    if (isUpdateMode) {
      const fetchVendorData = async () => {
        try {
          const response = await api.get(`/vendor/${id}`);
          const data = response.data.data;
          if (data) {
            reset({
              vendor_name: data.vendor_name,
              mobile: data.mobile,
              email: data.email,
              rent_category: data.rent_category,
              work_area: data.work_area,
              opening_balance: data.opening_balance,
              date: data.date,
              status: data.status,
            });
          } else {
            toast.error("ভেন্ডরের তথ্য পাওয়া যায়নি।");
            navigate("/tramessy/VendorList");
          }
        } catch (error) {
          console.error("ভেন্ডর ডেটা লোড করতে সমস্যা:", error);
          toast.error("ডেটা লোড করতে সমস্যা হয়েছে।");
          navigate("/tramessy/VendorList");
        }
      };
      fetchVendorData();
    }
  }, [id, isUpdateMode, reset, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));

      let response;
      if (isUpdateMode) {
        formData.append("_method", "PUT");
        response = await api.post(`/vendor/${id}`, formData);
      } else {
        response = await api.post(`/vendor`, formData);
      }

      if (response.data.success) {
        toast.success(isUpdateMode ? "ভেন্ডর সফলভাবে আপডেট হয়েছে!" : "ভেন্ডর সফলভাবে যোগ হয়েছে!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/VendorList");
      } else {
        toast.error("সার্ভার সমস্যা: " + (response.data.message || "অজানা সমস্যা"));
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার সমস্যা: " + msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 p-2">
      <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
        <h3 className="pt-1 pb-4 text-primary font-semibold rounded-t-md">
          {isUpdateMode ? "ভেন্ডর আপডেট করুন" : "নতুন ভেন্ডর যোগ করুন"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Toaster position="top-center" reverseOrder={false} />
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="vendor_name" label="ভেন্ডরের নাম" required />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="mobile" label="মোবাইল" type="number" required />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-3 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="email" label="ইমেইল" />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="rent_category"
                  label="ভাড়া ক্যাটেগরি"
                  required
                  options={[
                    { value: "", label: "ভাড়া ক্যাটেগরি নির্বাচন করুন..." },
                    { value: "Pickup", label: "পিকআপ" },
                    { value: "Covered Van", label: "কভার্ড ভ্যান" },
                  ]}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="mt-3 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="work_area" label="কাজের এলাকা" />
              </div>
              <div className="w-full relative">
                <InputField type="number" name="opening_balance" label="ওপেনিং ব্যালেন্স" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="mt-3 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="তারিখ"
                  type="date"
                  required
                  inputRef={(e) => {
                    register("date").ref(e);
                    dateRef.current = e;
                  }}
                />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required
                  options={[
                    { value: "", label: "অবস্থা নির্বাচন করুন..." },
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-left mt-4">
              <BtnSubmit loading={loading}>{isUpdateMode ? "আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddVendorForm;

