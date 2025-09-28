// import axios from "axios";
// import { FormProvider, useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import useRefId from "../hooks/useRef";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/axiosConfig";

// const AddRentVehicleForm = () => {
//   const navigate = useNavigate();
//   const methods = useForm();
//   const { handleSubmit, reset, watch } = methods;
// const selectedCategory = watch("vehicle_category");
// const vehicleSizes = {
//   pickup: ["1 Ton", "2 Ton", "3 Ton", "7 Feet", "9 Feet"],
//   covered_van: ["12 Feet", "14 Feet", "16 Feet", "18 Feet", "20 Feet", "23 Feet"],
//   open_truck: ["3 Ton", "5 Ton", "10 Ton", "15 Ton", "30 Ton"],
//   trailer: ["20 Feet", "23 Feet", "40 Feet", "30 Ton"],
//   freezer_van: ["1 Ton", "3 Ton", "5 Ton", "10 Ton"],
//   car: ["4 Seater", "7 Seater"],
//   micro_bus: ["12 Seater", "14 Seater"],
//   bus: ["30 Seater", "40 Seater", "50 Seater"],
// };
// // সিলেক্ট করা ক্যাটাগরির জন্য সাইজ লিস্ট বানানো
//   const sizeOptions =
//     selectedCategory && vehicleSizes[selectedCategory]
//       ? vehicleSizes[selectedCategory].map((size) => ({
//           value: size.toLowerCase().replace(" ", "_"),
//           label: size,
//         }))
//       : [];
//   const generateRefId = useRefId();
//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await api.post(
//         `/rentVehicle`,
//         formData
//       );
//       const resData = response.data;
//       console.log("resData", resData);
//       if (resData.success) {
//         toast.success("Rent vehicle saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/RentList")
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
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="mx-auto p-6  rounded-md shadow border-t-2 border-primary">
//           <h3 className="pb-4 text-primary font-semibold ">
//         Rent Vehicle Information
//       </h3>
//         <FormProvider {...methods} className="">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
//             {/* Trip & Destination Section */}
//             <div className="border border-gray-300 p-3 md:p-5 rounded-md">
//               <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//                 <div className="mt-2 md:mt-0 w-full relative">
//                   <InputField
//                     name="vehicle_name_model"
//                     label="Vehicle Name/Model"
//                     required
//                   />
//                 </div>
//                 <div className="mt-2 md:mt-0 w-full relative">
//                   <InputField
//                     name="vendor_name"
//                     label="Vendor Name/Driver Name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="md:flex justify-between gap-3">
//                  <div className="w-full relative">
//               <SelectField
//                 name="vehicle_category"
//                 label="Vehicle Category"
//                 required
//                 options={[
//                   // { value: "", label: "Select Vehicle category..." },
//                   { value: "pickup", label: "Pickup" },
//                   { value: "covered_van", label: "Covered Van" },
//                   { value: "open_truck", label: "Open Truck" },
//                   { value: "trailer", label: "Trailer" },
//                   { value: "freezer_van", label: "Freezer Van" },
//                 ]}
           
//               />
//             </div>
//             <div className="relative w-full">
//         <SelectField
//           name="vehicle_size_capacity"
//           label="Vehicle Size/Capacity"
//           required
//           options={[
//             { value: "", label: "Select Vehicle size..." },
//             ...sizeOptions,
//           ]}
//         />
//       </div>
//               </div>
//             </div>

//             {/* Vehicle and Driver Info */}
//             <div className="border border-gray-300 p-5 rounded-md">
//               <h5 className="text-primary font-semibold text-center pb-5">
//                 <span className="py-2 border-b-2 border-primary">
//                   Transport Registration Number
//                 </span>
//               </h5>
//               <div className="md:flex justify-between gap-3">
//                 <div className="relative w-full">
//                   <InputField
//                     name="registration_number"
//                     label="Registration Number"
//                     required
//                   />
//                 </div>
//                 <div className="relative mt-2 md:mt-0 w-full">
//                   <SelectField
//                     name="registration_serial"
//                     label="Registration Serial"
//                     required
//                     options={[
//                       { value: "Ta", label: "Ta" },
//                       { value: "Tha", label: "Tha" },
//                       { value: "Da", label: "Da" },
//                       { value: "Dha", label: "Dha" },
//                       { value: "Na", label: "Na" },
//                       { value: "M", label: "M" },
//                       { value: "Sh", label: "Sh" },
//                     ]}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <SelectField
//                     name="registration_zone"
//                     label="Registration Zone"
//                     required
//                     options={[
//                       { value: "", label: "Select zone..." },
//                       { value: "Dhaka Metro", label: "Dhaka Metro" },
//                       { value: "Chatto Metro", label: "Chatto Metro" },
//                       { value: "Sylhet Metro", label: "Sylhet Metro" },
//                       { value: "Rajshahi Metro", label: "Rajshahi Metro" },
//                       { value: "Khulna Metro", label: "Khulna Metro" },
//                       { value: "Rangpur Metro", label: "Rangpur Metro" },
//                       { value: "Barisal Metro", label: "Barisal Metro" },
//                       { value: "Dhaka", label: "Dhaka" },
//                       { value: "Narayanganj", label: "Narayanganj" },
//                       { value: "Gazipur", label: "Gazipur" },
//                       { value: "Tangail", label: "Tangail" },
//                       { value: "Manikgonj", label: "Manikgonj" },
//                       { value: "Munshigonj", label: "Munshigonj" },
//                       { value: "Faridpur", label: "Faridpur" },
//                       { value: "Rajbari", label: "Rajbari" },
//                       { value: "Narsingdi", label: "Narsingdi" },
//                       { value: "Kishorgonj", label: "Kishorgonj" },
//                       { value: "Shariatpur", label: "Shariatpur" },
//                       { value: "Gopalgonj", label: "Gopalgonj" },
//                       { value: "Madaripur", label: "Madaripur" },
//                       { value: "Chattogram", label: "Chattogram" },
//                       { value: "Cumilla", label: "Cumilla" },
//                       { value: "Feni", label: "Feni" },
//                       { value: "Brahmanbaria", label: "Brahmanbaria" },
//                       { value: "Noakhali", label: "Noakhali" },
//                       { value: "Chandpur", label: "Chandpur" },
//                       { value: "Lokkhipur", label: "Lokkhipur" },
//                       { value: "Bandarban", label: "Bandarban" },
//                       { value: "Rangamati", label: "Rangamati" },
//                       { value: "CoxsBazar", label: "CoxsBazar" },
//                       { value: "Khagrasori", label: "Khagrasori" },
//                       { value: "Barisal", label: "Barisal" },
//                       { value: "Barguna", label: "Barguna" },
//                       { value: "Bhola", label: "Bhola" },
//                       { value: "Patuakhali", label: "Patuakhali" },
//                       { value: "Pirojpur", label: "Pirojpur" },
//                       { value: "Jhalokati", label: "Jhalokati" },
//                       { value: "Khulna", label: "Khulna" },
//                       { value: "Kustia", label: "Kustia" },
//                       { value: "Jashore", label: "Jashore" },
//                       { value: "Chuadanga", label: "Chuadanga" },
//                       { value: "Satkhira", label: "Satkhira" },
//                       { value: "Bagerhat", label: "Bagerhat" },
//                       { value: "Meherpur", label: "Meherpur" },
//                       { value: "Jhenaidah", label: "Jhenaidah" },
//                       { value: "Norail", label: "Norail" },
//                       { value: "Magura", label: "Magura" },
//                       { value: "Rangpur", label: "Rangpur" },
//                       { value: "Ponchogor", label: "Ponchogor" },
//                       { value: "Thakurgaon", label: "Thakurgaon" },
//                       { value: "Kurigram", label: "Kurigram" },
//                       { value: "Dinajpur", label: "Dinajpur" },
//                       { value: "Nilfamari", label: "Nilfamari" },
//                       { value: "Lalmonirhat", label: "Lalmonirhat" },
//                       { value: "Gaibandha", label: "Gaibandha" },
//                       { value: "Rajshahi", label: "Rajshahi" },
//                       { value: "Pabna", label: "Pabna" },
//                       { value: "Bagura", label: "Bagura" },
//                       { value: "Joypurhat", label: "Joypurhat" },
//                       { value: "Nouga", label: "Nouga" },
//                       { value: "Natore", label: "Natore" },
//                       { value: "Sirajgonj", label: "Sirajgonj" },
//                       { value: "Chapainawabganj", label: "Chapainawabganj" },
//                       { value: "Sylhet", label: "Sylhet" },
//                       { value: "Habiganj", label: "Habiganj" },
//                       { value: "Moulvibazar", label: "Moulvibazar" },
//                       { value: "Sunamgonj", label: "Sunamgonj" },
//                       { value: "Mymensingh", label: "Mymensingh" },
//                       { value: "Netrokona", label: "Netrokona" },
//                       { value: "Jamalpur", label: "Jamalpur" },
//                       { value: "Sherpur", label: "Sherpur" },
//                     ]}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="w-[50%]">
//               <SelectField
//                 name="status"
//                 label="Status"
//                 required
//                 options={[
//                   { value: "Active", label: "Active" },
//                   { value: "Inactive", label: "Inactive" },
//                 ]}
//               />
//             </div>
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

// export default AddRentVehicleForm;


import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import useRefId from "../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useEffect } from "react";

const AddRentVehicleForm = () => {
  const { id } = useParams(); // id for update
  const navigate = useNavigate();
  const methods = useForm();
  const { handleSubmit, reset, watch, setValue } = methods;

  const selectedCategory = watch("vehicle_category");
  const generateRefId = useRefId();

  const vehicleSizes = {
    pickup: ["1 Ton", "2 Ton", "3 Ton", "7 Feet", "9 Feet"],
    covered_van: ["12 Feet", "14 Feet", "16 Feet", "18 Feet", "20 Feet", "23 Feet"],
    open_truck: ["3 Ton", "5 Ton", "10 Ton", "15 Ton", "30 Ton"],
    trailer: ["20 Feet", "23 Feet", "40 Feet", "30 Ton"],
    freezer_van: ["1 Ton", "3 Ton", "5 Ton", "10 Ton"],
    car: ["4 Seater", "7 Seater"],
    micro_bus: ["12 Seater", "14 Seater"],
    bus: ["30 Seater", "40 Seater", "50 Seater"],
  };

  const sizeOptions =
    selectedCategory && vehicleSizes[selectedCategory]
      ? vehicleSizes[selectedCategory].map((size) => ({
          value: size.toLowerCase().replace(" ", "_"),
          label: size,
        }))
      : [];

  // Fetch existing vehicle for update
  useEffect(() => {
    if (id) {
      api
        .get(`/rentVehicle/${id}`)
        .then((res) => {
          if (res.data.success) {
            const data = res.data.data;
            for (const key in data) {
              setValue(key, data[key]);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load vehicle data");
        });
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      if (!id) formData.append("ref_id", generateRefId());

      const response = id
        ? await api.put(`/rentVehicle/${id}`, formData)
        : await api.post(`/rentVehicle`, formData);

      const resData = response.data;

      if (resData.success) {
        toast.success(`Rent vehicle ${id ? "updated" : "added"} successfully!`);
        reset();
        navigate("/tramessy/RentList");
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
    <div className="mt-5 p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
        <h3 className="pb-4 text-primary font-semibold ">
          {id ? "Update Rent Vehicle" : "Add Rent Vehicle"}
        </h3>
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Vehicle Info */}
            <div className="border border-gray-300 p-3 md:p-5 rounded-md">
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="mt-2 md:mt-0 w-full relative">
                  <InputField
                    name="vehicle_name_model"
                    label="Vehicle Name/Model"
                    required
                  />
                </div>
                <div className="mt-2 md:mt-0 w-full relative">
                  <InputField
                    name="vendor_name"
                    label="Vendor Name/Driver Name"
                    required
                  />
                </div>
              </div>

              <div className="md:flex justify-between gap-3">
                <div className="w-full relative">
                  <SelectField
                    name="vehicle_category"
                    label="Vehicle Category"
                    required
                    options={[
                      { value: "pickup", label: "Pickup" },
                      { value: "covered_van", label: "Covered Van" },
                      { value: "open_truck", label: "Open Truck" },
                      { value: "trailer", label: "Trailer" },
                      { value: "freezer_van", label: "Freezer Van" },
                    ]}
                  />
                </div>
                <div className="relative w-full">
                  <SelectField
                    name="vehicle_size_capacity"
                    label="Vehicle Size/Capacity"
                    required
                    options={[
                      { value: "", label: "Select Vehicle size..." },
                      ...sizeOptions,
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="border border-gray-300 p-5 rounded-md">
              <h5 className="text-primary font-semibold text-center pb-5">
                <span className="py-2 border-b-2 border-primary">
                  Transport Registration Number
                </span>
              </h5>
              <div className="md:flex justify-between gap-3">
                <div className="relative w-full">
                  <InputField
                    name="registration_number"
                    label="Registration Number"
                    required
                  />
                </div>
                <div className="relative mt-2 md:mt-0 w-full">
                  <SelectField
                    name="registration_serial"
                    label="Registration Serial"
                    required
                    options={[
                      { value: "Ta", label: "Ta" },
                      { value: "Tha", label: "Tha" },
                      { value: "Da", label: "Da" },
                      { value: "Dha", label: "Dha" },
                      { value: "Na", label: "Na" },
                      { value: "M", label: "M" },
                      { value: "Sh", label: "Sh" },
                    ]}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="registration_zone"
                    label="Registration Zone"
                    required
                    options={[
                      { value: "", label: "Select zone..." },
                      { value: "Dhaka Metro", label: "Dhaka Metro" },
                      { value: "Chatto Metro", label: "Chatto Metro" },
                      { value: "Sylhet Metro", label: "Sylhet Metro" },
                      // ... rest zones
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="w-[50%]">
              <SelectField
                name="status"
                label="Status"
                required
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit>{id ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddRentVehicleForm;
