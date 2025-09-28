import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";

const AddCustomer = () => {
  const navigate = useNavigate()
  const {id} = useParams();
  const dateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, register } = methods;
  const generateRefId = useRefId();

  // single customer set value for update customer
  useEffect(() => {
    if ( id) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customer/${id}`);
          const customerData = res.data;
          reset(customerData)
        } catch (error) {
          console.error(error);
          toast.error("Failed to load customer data");
        }
      };
      fetchCustomer();
    }
  }, [ id, reset]);

  // Add & update handler function
   const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }

      let response;
      if (id) {
        // Update
        response = await api.put(`/customer/${id}`, formData);
      } else {
        // Create
        formData.append("ref_id", generateRefId());
        response = await api.post(`/customer`, formData);
      }

      toast.success(
        !id ? "Customer added successfully" : "Customer updated successfully",
        { position: "top-right" }
      );

      reset();
      navigate("/tramessy/Customer");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold rounded-t-md">
        {!id ? "Create Customer" : "Update Customer"}
      </h3>
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              {/* <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required={!id}
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
              <div className="w-full relative">
                <InputField
                  name="customer_name"
                  label="Customer Name"
                  required={!id}
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="mobile"
                  label="Mobile"
                  type="number"
                  required={!id}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="Email" />
              </div>
              <div className="w-full relative">
                <InputField name="address" label="Address" required={!id} />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="rate"
                  label="Rate status"
                  required={!id}
                  options={[
                    { value: "Fixed", label: "Fixed" },
                    { value: "Unfixed", label: "Unfixed" },
                  ]}
                />
              </div>
              <div className="w-full relative">
                <InputField
                  name="opening_balance"
                  label="Opening Balance"
                  type="number"
                  required={!id}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="Status"
                  required={!id}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddCustomer;
