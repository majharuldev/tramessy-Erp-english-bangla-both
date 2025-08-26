import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const PurchaseForm = () => {
  const navigate = useNavigate()
  const methods = useForm();
  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);

  const selectedCategory = watch("category");
  // calculate Total Expense
  const quantity = parseFloat(watch("quantity") || 0);
  const unitPrice = parseFloat(watch("unit_price") || 0);
  const totalPrice = quantity * unitPrice;
  useEffect(() => {
    const totalPrice = quantity * unitPrice;
    setValue("purchase_amount", totalPrice);
  }, [quantity, unitPrice, setValue]);
  // preview image
  const [previewImage, setPreviewImage] = useState(null);

  // select driver from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);
  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));
  // select Vehicle No. from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);

  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  }));
  // select branch from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);
  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));
  // select supplier from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => response.json())
      .then((data) => setSupplier(data.data))
      .catch((error) => console.error("Error fetching supply data:", error));
  }, []);
  const supplyOptions = supplier.map((supply) => ({
    value: supply.business_name,
    label: supply.business_name,
  }));
  // post data on server
  const onSubmit = async (data) => {
    try {
      const purchaseFormData = new FormData();
      for (const key in data) {
        purchaseFormData.append(key, data[key]);
      }
      // purchaseFormData.append("status", "Unpaid");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/purchase/create`,
        purchaseFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Purchase submitted successfully!", {
        position: "top-right",
      });
      reset();
      navigate("/tramessy/Purchase/PurchaseList")
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 md:p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Purchase Information
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6  rounded-md shadow space-y-4"
        >
          <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
              {selectedCategory=== "fuel"
                ? "Fuel Purchase": selectedCategory === "engine_oil" || selectedCategory === "parts"? "Maintenance": "Office Purchase"}
            </h5>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="date"
                label="Purchase Date"
                type="date"
                required
                inputRef={(e) => {
                  register("date").ref(e);
                  purChaseDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => purChaseDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <SelectField
                name="category"
                label="Category"
                required
                options={[
                  { value: "fuel", label: "Fuel" },
                  { value: "engine_oil", label: "Engine Oil" },
                  { value: "parts", label: "Parts" },
                  { value: "It item", label: "It item" },
                  { value: "Stationary", label: "Stationary" },
                  { value: "Snacks", label: "Snacks" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "Furniture", label: "Furniture" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField name="item_name" label="Item Name"  />
            </div>
          </div>
          {/* Engine Oil category */}
          {(selectedCategory === "fuel" || selectedCategory === "parts") && (
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="driver_name"
                  label="Driver Name"
                  required={true}
                  options={driverOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="vehicle_no"
                  label="Vehicle No."
                  required={true}
                  options={vehicleOptions}
                  control={control}
                />
              </div>
            </div>
          )}

          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <SelectField
                name="branch_name"
                label="Branch Name"
                required={true}
                options={branchOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="supplier_name"
                label="Supplier Name"
                required={true}
                options={supplyOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField
                name="quantity"
                label="Quantity"
                type="number"
                required
              />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="unit_price"
                label="Unit Price"
                type="number"
                required
              />
            </div>
            <div className="w-full">
              <InputField
                name="purchase_amount"
                label="Total"
                readOnly
                defaultValue={totalPrice}
                value={totalPrice}
                required
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
              <label className="text-primary text-sm font-semibold">
                Bill Image
              </label>
              <Controller
                name="bill_image"
                control={control}
                rules={{ required: "This field is required" }}
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
                  </div>
                )}
              />
            </div>
          </div>
          {/* Preview */}
          {previewImage && (
            <div className="mt-3 relative flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  document.getElementById("bill_image").value = "";
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="Remove image"
              >
                <IoMdClose />
              </button>
              <img
                src={previewImage}
                alt="License Preview"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}
          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default PurchaseForm;


