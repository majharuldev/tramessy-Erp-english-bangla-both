

import { useContext, useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import useAdmin from "../../hooks/useAdmin";
import { AuthContext } from "../../providers/AuthProvider";

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isAdmin = useAdmin();
  const { user } = useContext(AuthContext)
  const methods = useForm({
    defaultValues: {
      sms_sent: "yes",
      items: [{ item_name: "", quantity: 0, unit_price: 0, total: 0 }],
    },
  });

  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingImage, setExistingImage] = useState(null);

  const selectedCategory = watch("category");
  const selectedVehicle = watch("vehicle_no");
  // Calculate Total Expense
  const quantity = parseFloat(watch("quantity") || 0);
  const unitPrice = parseFloat(watch("unit_price") || 0);
  const totalPrice = quantity * unitPrice;

  // Dynamic item fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  // Update purchase_amount when quantity or unit_price changes
  useEffect(() => {
    const totalPrice = quantity * unitPrice;
    setValue("purchase_amount", totalPrice);
  }, [quantity, unitPrice, setValue]);

  // Set vehicle category when vehicle is selected
  //  useEffect(() => {
  //   if (selectedVehicle) {
  //     const selectedVehicleData = vehicle.find(
  //       (v) =>
  //         `${v.reg_zone} ${v.reg_serial} ${v.reg_no}`.trim() ===
  //         selectedVehicle.trim()
  //     );
  //     if (selectedVehicleData) {
  //       console.log("Setting vehicle_category:", selectedVehicleData.vehicle_category); // Debug
  //       setValue("vehicle_category", selectedVehicleData.vehicle_category, {
  //         shouldValidate: true,
  //         shouldDirty: true,
  //       });
  //     } else {
  //       console.log("No vehicle data found, setting vehicle_category to empty"); // Debug
  //       setValue("vehicle_category", "");
  //     }
  //   } else {
  //     console.log("No vehicle selected, setting vehicle_category to empty"); // Debug
  //     setValue("vehicle_category", "");
  //   }
  // }, [selectedVehicle, vehicle, setValue]);
  // Vehicle select করলে auto Driver Name update হবে
  useEffect(() => {
    if (selectedVehicle) {
      const selectedVehicleData = vehicle.find(
        (v) =>
          `${v.reg_zone} ${v.reg_serial} ${v.reg_no}`.trim() ===
          selectedVehicle.trim()
      );

      if (selectedVehicleData) {
        // Vehicle category বসাও
        setValue("vehicle_category", selectedVehicleData.vehicle_category || "", {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Driver Name auto বসাও
        setValue("driver_name", selectedVehicleData.driver_name || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        setValue("vehicle_category", "");
        setValue("driver_name", "");
      }
    } else {
      setValue("vehicle_category", "");
      setValue("driver_name", "");
    }
  }, [selectedVehicle, vehicle, setValue]);

  // Preview image
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    // Fetch drivers
    api.get(`/driver`)
      .then((res) => setDrivers(res.data))
      .catch((error) => console.error("Error fetching driver data:", error));

    // Fetch vehicles
    api.get(`/vehicle`)
      .then((res) => setVehicle(res.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));

    // Fetch branches
    api.get(`/office`)
      .then((res) => setBranch(res.data.data))
      .catch((error) => console.error("Error fetching branch data:", error));

    // Fetch suppliers
    api.get(`/supplier`)
      .then((res) => setSupplier(res.data.data))
      .catch((error) => console.error("Error fetching supply data:", error));
  }, []);

  // Fetch purchase data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPurchaseData = async () => {
        try {
          const response = await api.get(
            `/purchase/${id}`
          );
          const purchaseData = response.data.data;
          console.log("Fetched purchase data:", purchaseData);

          // Set form values
          setValue("date", purchaseData.date);
          setValue("category", purchaseData.category);
          setValue("item_name", purchaseData.item_name);
          setValue("driver_name", purchaseData.driver_name);
          setValue("vehicle_category", purchaseData.vehicle_category);
          setValue("vehicle_no", purchaseData.vehicle_no);
          setValue("branch_name", purchaseData.branch_name);
          setValue("supplier_name", purchaseData.supplier_name);
          setValue("quantity", purchaseData.quantity);
          setValue("service_date", purchaseData.service_date);
          setValue("next_service_date", purchaseData.next_service_date);
          setValue("unit_price", purchaseData.unit_price);
          setValue("last_km", purchaseData.last_km);
          setValue("next_km", purchaseData.next_km);
          setValue("purchase_amount", purchaseData.purchase_amount);
          setValue("remarks", purchaseData.remarks);
          setValue("priority", purchaseData.priority);
          setValue("created_by", purchaseData.created_by);

          // Set image preview if exists
          // if (purchaseData.bill_image) {
          //   const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/${purchaseData.bill_image}`;
          //   setPreviewImage(imageUrl);
          //   setExistingImage(purchaseData.bill_image); // existing image নাম সংরক্ষণ করুন
          // }

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching purchase data:", error);
          toast.error("Failed to load purchase data");
          setIsLoading(false);
        }
      };

      fetchPurchaseData();
    }
  }, [id, isEditMode, setValue]);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no} `,
    label: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no} `,
  }));

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const supplyOptions = supplier.map((supply) => ({
    value: supply.supplier_name,
    label: supply.supplier_name,
  }));

  //   const formData = new FormData();
  // Object.entries(data).forEach(([key, value]) => {
  //   formData.append(key, value);
  // });

  // await api.post("/purchase", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });


  // Handle form submission for both add and update
  // const onSubmit = async (data) => {
  //   try {

  //     // date format local 
  //     ["date", "service_date", "next_service_date"].forEach((field) => {
  //       if (data[field]) {
  //         const d = new Date(data[field]);
  //         d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  //         data[field] = d.toISOString().split("T")[0];
  //       }
  //     });
  //     // created_by ঠিকভাবে সেট করা
  //     let createdByValue = "Unknown";
  //     if (user?.name) createdByValue = user.name;
  //     else if (user?.email) createdByValue = user.email;

  //     // যদি Edit mode হয়, তাহলে আগেরটা রেখে দাও
  //     if (isEditMode && data.created_by) {
  //       createdByValue = data.created_by;
  //     }

  //     const payload = {
  //       ...data,
  //       created_by: createdByValue,
  //     };

  //     const response = isEditMode
  //       ? await api.put(`/purchase/${id}`, payload)   // JSON
  //       : await api.post(`/purchase`, payload);

  //     if (response.data.success) {
  //       toast.success(isEditMode ? "Purchase updated!" : "Purchase submitted!");
  //       //  Only send SMS if it's a new trip and sms_sent = "yes"
  //       if (!id && !isAdmin && data.sms_sent === "yes") {
  //         const purchase = response.data.data; // Assuming your backend returns created trip data
  //         const purchaseId = purchase.id;
  //         const purchaseDate = purchase.date || "";
  //         const supplierName = purchase.supplier_name || "";
  //         const userName = user.name || "";
  //         const purchaseCategory = purchase?.category || "";
  //         const vehicleNo = purchase?.vehicle_no || "";

  //         // Build message content
  //         const messageContent = `Dear Sir, A new Maintenance created by ${userName}.\nPurchase Id: ${purchaseId}\nPurchase Date: ${purchaseDate}\nSupplier: ${supplierName}\nVehicle: ${vehicleNo}\nPurchase Name: ${purchaseCategory}`;

  //         // SMS Config
  //         const adminNumber = "01872121862"; // or multiple separated by commas
  //         const API_KEY = "3b82495582b99be5";
  //         const SECRET_KEY = "ae771458";
  //         const CALLER_ID = "1234";

  //         // Correct URL (same structure as your given example)
  //         const smsUrl = `http://smpp.revesms.com:7788/sendtext?apikey=${API_KEY}&secretkey=${SECRET_KEY}&callerID=${CALLER_ID}&toUser=${adminNumber}&messageContent=${encodeURIComponent(messageContent)}`;
  //         try {
  //           await fetch(smsUrl);
  //           toast.success("SMS sent to admin!");
  //         } catch (smsError) {
  //           // console.error("SMS sending failed:", smsError);
  //           // toast.error("Trip saved, but SMS failed to send.");
  //         }
  //       }
  //       navigate("/tramessy/Purchase/maintenance");
  //       reset();
  //     } else {
  //       throw new Error(isEditMode ? "Failed to update Purchase" : "Failed to create Purchase");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.response?.data?.message || "Server error");
  //   }
  // };


  const onSubmit = async (data) => {
    try {
      // 🔹 Date fields localize করা
      ["date", "service_date", "next_service_date"].forEach((field) => {
        if (data[field]) {
          const d = new Date(data[field]);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          data[field] = d.toISOString().split("T")[0];
        }
      });

      // 🔹 created_by
      let createdByValue = user?.name || user?.email || "Unknown";
      if (isEditMode && data.created_by) {
        createdByValue = data.created_by;
      }

      // 🔹 items array থেকে আলাদা আলাদা array বানানো
      const item_name = data.items.map((item) => item.item_name);
      const quantity = data.items.map((item) => Number(item.quantity));
      const unit_price = data.items.map((item) => Number(item.unit_price));
      const total = data.items.map((item) => Number(item.total));

      // 🔹 purchase_amount হিসাব করা (সব total এর যোগফল)
      const purchase_amount =
        total.reduce((sum, value) => sum + value, 0) + Number(data.service_charge || 0);

      // 🔹 payload তৈরি
      const payload = {
        date: data.date,
        supplier_name: data.supplier_name,
        category: data.category,
        purchase_amount: purchase_amount,
        service_charge: Number(data.service_charge) || 0,
        remarks: data.remarks || "",
        driver_name: data.driver_name || "",
        branch_name: data.branch_name,
        vehicle_no: data.vehicle_no || "",
        vehicle_category: data.vehicle_category || "",
        priority: data.priority || "",
        validity: data.validity || "",
        next_service_date: data.next_service_date,
        service_date: data.service_date,
        last_km: Number(data.last_km) || 0,
        next_km: Number(data.next_km) || 0,
        created_by: createdByValue,
        item_name,
        quantity,
        unit_price,
        total,
      };

      // 🔹 Submit request
      const response = isEditMode
        ? await api.put(`/purchase/${id}`, payload)
        : await api.post(`/purchase`, payload);

      if (response.data.success) {
        toast.success(isEditMode ? "Purchase updated!" : "Purchase submitted!");
        navigate("/tramessy/Purchase/maintenance");
        reset();
      } else {
        throw new Error("Failed to save purchase");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Server error");
    }
  };




  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading purchase data...</div>;
  }

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6 border-t-2 border-primary  rounded-md shadow">
        <h3 className=" pb-4 text-primary font-semibold">
          {isEditMode ? "Update Maintenance Purchase " : "Add Maintenance Purchase"}
        </h3>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto p-6 space-y-4"
          >
            <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
              {selectedCategory === "fuel"
                ? "Fuel Purchase"
                : selectedCategory === "engine_oil" || selectedCategory === "parts"
                  ? "Maintenance"
                  : ""}
            </h5>

            {/* Form fields */}
            <div className="flex flex-col lg:flex-row justify-between gap-x-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Purchase Date"
                  type="date"
                  required={!isEditMode}
                  inputRef={(e) => {
                    register("date").ref(e);
                    purChaseDateRef.current = e;
                  }}

                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="Branch Name"
                  required={!isEditMode}
                  options={branchOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="supplier_name"
                  label="Supplier Name"
                  required={!isEditMode}
                  options={supplyOptions}
                  control={control}
                />
              </div>
            </div>

            <div className="md:flex justify-between gap-x-3">
              <div className="w-full">
                <SelectField
                  name="vehicle_no"
                  label="Vehicle No."
                  required={!isEditMode}
                  options={vehicleOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="category"
                  label="Category"
                  required={!isEditMode}
                  options={[
                    { value: "engine_oil", label: "Engine Oil" },
                    { value: "parts", label: "Parts" },
                    { value: "documents", label: "Documents" },
                  ]}
                />
              </div>
              {/* {selectedCategory === "parts" || selectedCategory==="documents" && (
                <div className="w-full">
                  <InputField name="item_name" label="Item Name" required={!isEditMode} />
                </div>
              )} */}
              <div className="w-full">
                <InputField
                  name="service_charge"
                  label="Service Charge"
                  type="number"
                  required={!isEditMode}
                />
              </div>

              <div className="w-full hidden">
                <InputField
                  name="driver_name"
                  label="Driver Name"
                  required={!isEditMode}
                  // options={driverOptions}
                  control={control}
                />
              </div>
              {/* Hidden field for vehicle category */}
              <div className="w-full hidden">
                <InputField
                  name="vehicle_category"
                  label="Vehicle Category"
                  value={watch("vehicle_category") || ""}
                  readOnly
                  {...register("vehicle_category")}
                />
              </div>

              {/* {selectedCategory==="engine_oil"&&(<div className="w-full">
              <InputField
                name="quantity"
                label="Quantity"
                type="number"
                required={!isEditMode}
              />
            </div>)} */}
            </div>
            <div>
              {/* 🔹 Dynamic Item Fields */}
              {(<div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">Items</h4>

                {fields.map((field, index) => {
                  const quantity = watch(`items.${index}.quantity`) || 0;
                  const unitPrice = parseFloat(watch(`items.${index}.unit_price`)) || 0;
                  const total = quantity * unitPrice;
                  setValue(`items.${index}.total`, total);

                  return (
                    <div key={field.id} className="flex flex-col md:flex-row gap-3 border border-gray-300 p-3 rounded-md relative">
                      <InputField name={`items.${index}.item_name`} label="Item Name" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.quantity`} label="Quantity" type="number" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.unit_price`} label="Unit Price" type="number" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.total`} label="Total" readOnly value={total} className="!salw-full" />

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => append({ item_name: "", quantity: 0, unit_price: 0, total: 0 })}
                  className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/80"
                >
                  + Add Item
                </button>
              </div>)}
            </div>

            <div className="flex flex-col lg:flex-row  gap-x-3">
              {/* {selectedCategory=== "engine_oil" &&(<div className="flex flex-col lg:flex-row  gap-x-3 w-full">
                <div className="w-full">
                  <InputField
                    name="unit_price"
                    label="Unit Price"
                    type="number"
                    required={!isEditMode}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="purchase_amount"
                    label="Total"
                    readOnly
                    value={totalPrice}
                    required={!isEditMode}
                  />
                </div>
              </div>)} */}
              <div className="w-full">
                  <InputField
                    name="purchase_amount"
                    label="Total"
                    readOnly
                    value={totalPrice}
                    required={!isEditMode}
                  />
                </div>
              {selectedCategory !== "documents" && (<div className="flex gap-x-3 flex-col lg:flex-row w-full">
                <div className="w-full">
                  <InputField
                    name="service_date"
                    label="Service Date"
                    type="date"
                    required={!isEditMode}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="next_service_date"
                    label="Next Service Date"
                    type="date"
                    required={!isEditMode}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
              </div>)}
              {selectedCategory === "documents" && (<div className="flex flex-col lg:flex-row gap-x-3 w-full">

                <div className="w-full">
                  <InputField
                    name="service_date"
                    label="Document Renew Date"
                    type="date"
                    required={!isEditMode}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="next_service_date"
                    label="Document Next Expire Date"
                    type="date"
                    required={!isEditMode}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
              </div>)}

            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-3">
              {selectedCategory !== "documents" && (<div className="w-full">
                <InputField
                  name="last_km"
                  label="Last KM"
                  required={false}
                  type="number"
                />
              </div>)}
              {selectedCategory !== "documents" && (<div className="w-full">
                <InputField
                  name="next_km"
                  label="Next KM"
                  required={false}
                  type="number"
                />
              </div>)}
              <div className="w-full">
                <InputField name="remarks" label="Remark" />
              </div>
              <div className="w-full">
                <InputField name="priority" label="priority" />
              </div>
            </div>
            {!isAdmin && <div className="mt-4">
              <h3 className="text-secondary font-medium mb-2">SMS Sent</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="yes"
                    {...methods.register("sms_sent", { required: true })}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="no"
                    {...methods.register("sms_sent", { required: true })}
                  />
                  No
                </label>
              </div>
            </div>}

            {/* <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-gray-700 text-sm font-semibold">
                Bill Image {!isEditMode && "(Required)"}
              </label>
              <Controller
                name="bill_image"
                control={control}
                rules={isEditMode ? {} : { required: "This field is required" }}
                render={({
                  field: { onChange, ref },
                  fieldState: { error },
                }) => (
                  <div className="relative">
                    <label
                      htmlFor="bill_image"
                      className="border p-2 rounded w-[50%] block bg-white text-gray-300 text-sm cursor-pointer"
                    >
                      {previewImage ? "Image selected" : "Choose image"}
                    </label>
                    <input
                      id="bill_image"
                      type="file"
                      accept="image/*"
                      ref={ref}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setPreviewImage(url);
                          onChange(file);
                        } else {
                          setPreviewImage(null);
                          onChange(null);
                        }
                      }}
                    />
                    {error && (
                      <span className="text-red-600 text-sm">
                        {error.message}
                      </span>
                    )}
                    {isEditMode && existingImage && (
                      <span className="text-green-600 text-sm">
                        Current image: {existingImage}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div> */}

            {/* Preview */}
            {/* {previewImage && (
            <div className="mt-2 relative flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setValue("bill_image", null);
                  const fileInput = document.getElementById("bill_image");
                  if (fileInput) fileInput.value = "";
                  
                  if (!isEditMode) {
                    setExistingImage(null);
                  }
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="Remove image"
              >
                <IoMdClose />
              </button>
              <img
                src={previewImage}
                alt="Bill Preview"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}
           */}
            <BtnSubmit>{isEditMode ? "Update Purchase" : "Submit"}</BtnSubmit>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default PurchaseForm;


