import { useContext, useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import { AuthContext } from "../../providers/AuthProvider";
import useAdmin from "../../hooks/useAdmin";
import FormSkeleton from "../../components/Form/FormSkeleton";

const OfficialProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useContext(AuthContext)
  const methods = useForm({
    defaultValues: {
      sms_sent: "yes",
    },
  });
  const isAdmin = useAdmin();
  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingImage, setExistingImage] = useState(null);
// Dynamic item fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedCategory = watch("category");

  // সব items এবং service charge এর হিসাব করার জন্য
    const items = useWatch({ control, name: "items" });
    const serviceCharge = useWatch({ control, name: "service_charge" });
  
    useEffect(() => {
      const totalItemsAmount = (items || []).reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return sum + quantity * unitPrice;
      }, 0);
  
      const grandTotal = totalItemsAmount + (parseFloat(serviceCharge) || 0);
      setValue("purchase_amount", grandTotal);
    }, [items, serviceCharge, setValue]);

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
          const response = await api.get(`/purchase/${id}`)
          const purchaseData = response.data.data
          const formValues = {
            date: purchaseData.date,
            category: purchaseData.category,
            item_name: purchaseData.item_name,
            branch_name: purchaseData.branch_name,
            supplier_name: purchaseData.supplier_name,
            // service_date: purchaseData.service_date,
            // next_service_date: purchaseData.next_service_date,
            purchase_amount: purchaseData.purchase_amount,
            remarks: purchaseData.remarks,
            priority: purchaseData.priority,
            created_by: purchaseData.created_by,
            service_charge: purchaseData.service_charge,
            items:
              purchaseData.items && purchaseData.items.length > 0
                ? purchaseData.items
                : [{ item_name: "", quantity: 0, unit_price: 0, total: 0 }],
          }

          reset(formValues)

          if (purchaseData.image) {
            const imageUrl = `https://ajenterprise.tramessy.com/backend/uploads/purchase/${purchaseData.image}`
            setPreviewImage(imageUrl)
            setExistingImage(purchaseData.image)
          }

          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching purchase data:", error)
          toast.error("Failed to load purchase data")
          setIsLoading(false)
        }
      }

      fetchPurchaseData()
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
  //       ? await api.put(`/purchase/${id}`, payload)
  //       : await api.post(`/purchase`, payload);

  //     if (response.data.success) {
  //       toast.success(isEditMode ? "Official Products Purchase updated!" : "Official Products Purchase submitted!");
  //       //  Only send SMS if it's a new trip and sms_sent = "yes"
  //       if (!id && !isAdmin && data.sms_sent === "yes") {
  //         const purchase = response.data.data;
  //         const purchaseId = purchase.id;
  //         const purchaseDate = purchase.date || "";
  //         const supplierName = purchase.supplier_name || "";
  //         const userName = user.name || "";
  //         const purchaseItem = purchase?.item_name || "";

  //         // Build message content
  //         const messageContent = `Dear Sir, A new Official Product created by ${userName}.\nPurchase Id: ${purchaseId}\nPurchase Date: ${purchaseDate}\nSupplier: ${supplierName}\nPurchase Name: ${purchaseItem}`;

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
  //       navigate("/tramessy/Purchase/official-product");
  //       reset();
  //     } else {
  //       throw new Error(isEditMode ? "Failed to update Purchase" : "Failed to create Purchase");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.response?.data?.message || "Server error");
  //   }
  // };

   // Handle form submission for both add and update
    const onSubmit = async (data) => {
      try {
        //  Date fields localize করা
        ["date", "service_date", "next_service_date"].forEach((field) => {
          if (data[field]) {
            const d = new Date(data[field]);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            data[field] = d.toISOString().split("T")[0];
          }
        });
  
        //  created_by
        // let createdByValue = user?.name || user?.email || "Unknown";
        // if (isEditMode && data.created_by) {
        //   createdByValue = data.created_by;
        // }
         const createdByValue = user?.name || user?.email || "Unknown";
        //  items array আলাদা করে নেওয়া
        const item_name = data.items.map((item) => item.item_name);
        const quantity = data.items.map((item) => Number(item.quantity));
        const unit_price = data.items.map((item) => Number(item.unit_price));
        const total = data.items.map((item) => Number(item.quantity) * Number(item.unit_price));
  
        //  purchase_amount হিসাব করা
        const purchase_amount =
          total.reduce((sum, val) => sum + val, 0) + Number(data.service_charge || 0);
  
        //  FormData তৈরি
        const formData = new FormData();
  
        formData.append("date", data.date || "");
        formData.append("supplier_name", data.supplier_name || "");
        formData.append("category", data.category || "");
        formData.append("purchase_amount", purchase_amount);
        formData.append("service_charge", data.service_charge || 0);
        formData.append("remarks", data.remarks || "");
        // formData.append("driver_name", data.driver_name || "");
        formData.append("branch_name", data.branch_name || "");
        // formData.append("vehicle_no", data.vehicle_no || "");
        // formData.append("vehicle_category", data.vehicle_category || "");
        formData.append("priority", data.priority || "");
        // formData.append("validity", data.validity || "");
        // formData.append("next_service_date", data.next_service_date || "");
        // formData.append("service_date", data.service_date || "");
        // formData.append("last_km", data.last_km || 0);
        // formData.append("next_km", data.next_km || 0);
        formData.append("created_by", createdByValue);
  
        //  items গুলো আলাদা array হিসেবে append করা
        item_name.forEach((name, i) => formData.append("item_name[]", name));
        quantity.forEach((q, i) => formData.append("quantity[]", q));
        unit_price.forEach((u, i) => formData.append("unit_price[]", u));
        total.forEach((t, i) => formData.append("total[]", t));
  
        if (data.bill_image instanceof File) {
          formData.append("image", data.bill_image);
        } else if (isEditMode && existingImage) {
          formData.append("existing_image", existingImage);
        }
  
  
        //  API Call
        const response = isEditMode
          ? await api.post(`/purchase/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          : await api.post(`/purchase`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
  
         if (response.data.success) {
        toast.success(isEditMode ? "Official Products Purchase updated!" : "Official Products Purchase submitted!");
        //  Only send SMS if it's a new trip and sms_sent = "yes"
        if (!id && !isAdmin && data.sms_sent === "yes") {
          const purchase = response.data.data;
          const purchaseId = purchase.id;
          const purchaseDate = purchase.date || "";
          const supplierName = purchase.supplier_name || "";
          const userName = user.name || "";
          const purchaseItem = purchase?.item_name || "";

          // Build message content
          const messageContent = `Dear Sir, A new Official Product created by ${userName}.\nPurchase Id: ${purchaseId}\nPurchase Date: ${purchaseDate}\nSupplier: ${supplierName}\nPurchase Name: ${purchaseItem}`;

          // SMS Config
          const adminNumber = "01872121862"; // or multiple separated by commas
          const API_KEY = "3b82495582b99be5";
          const SECRET_KEY = "ae771458";
          const CALLER_ID = "1234";

          // Correct URL (same structure as your given example)
          const smsUrl = `https://smpp.revesms.com:7790/sendtext?apikey=${API_KEY}&secretkey=${SECRET_KEY}&callerID=${CALLER_ID}&toUser=${adminNumber}&messageContent=${encodeURIComponent(
        messageContent
      )}`;
          try {
             await axios.post(smsUrl);
            toast.success("SMS sent to admin!");
          } catch (smsError) {
            console.error("SMS sending failed:", smsError);
            // toast.error("Trip saved, but SMS failed to send.");
          }
        }
        navigate("/tramessy/Purchase/official-product");
        reset();
      } else {
        throw new Error(isEditMode ? "Failed to update Purchase" : "Failed to create Purchase");
      }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Server error");
      }
    };


  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className=" pb-4 text-primary font-semibold ">
          {isEditMode ? "Update Official Purchase " : "Add Official Purchase"}
        </h3>
        <FormProvider {...methods}>
          {isLoading  ? (
                      <div className="p-4 bg-white rounded-md shadow border-t-2 border-primary">
                        <FormSkeleton />
                      </div>
                    ) : (<form
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
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2  rounded-r"
                      onClick={() => purChaseDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-gray-700 cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="category"
                  label="Category"
                  required={!isEditMode}
                  options={[
                    { value: "It Product", label: "It Product" },
                    { value: "Electrical", label: "Electrical" },
                    { value: "Stationary", label: "Stationary" },

                  ]}
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
            <div>
              {/*  Dynamic Item Fields */}
              {(<div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">Items</h4>

                {fields.map((field, index) => {
                  const quantity = watch(`items.${index}.quantity`) || 0;
                  const unitPrice = parseFloat(watch(`items.${index}.unit_price`)) || 0;
                  const total = quantity * unitPrice;

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
                  onClick={() => append({ item_name: "", quantity: "", unit_price: "", total: 0 })}
                  className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/80"
                >
                  + Add Item
                </button>
              </div>)}
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="service_charge"
                  label="Service Charge"
                  type="number"
                  required={false}
                />
              </div>
              <div className="w-full">
                <InputField
                  name="purchase_amount"
                  label="Total Purchase Amount"
                  readOnly
                 value={watch("purchase_amount") || 0}
                  required={!isEditMode}
                />
              </div>
              <div className="w-full">
                <InputField name="remarks" label="Remark" />
              </div>
              <div className="w-full">
                <InputField name="priority" label="priority" />
              </div>
            </div>

            <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-gray-700 text-sm font-semibold">
                Bill Image {!isEditMode && "(Required)"}
              </label>
              <Controller
                name="bill_image"
                control={control}
                rules={isEditMode ? false : { required: "This field is required" }}
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
          </div>

            {/* Preview */}
            {previewImage && (
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

            <BtnSubmit>{isEditMode ? "Update Purchase" : "Submit"}</BtnSubmit>
          </form>)}
        </FormProvider>
      </div>
    </div>
  );
};

export default OfficialProductForm;