
import { FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import api from "../../utils/axiosConfig";

const HelperForm = () => {
  const navigate = useNavigate()
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm();
  const { handleSubmit, reset, setValue } = methods;

  // Fetch helper data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchHelperData = async () => {
        try {
          const response = await api.get(
            `/helper/${id}`
          );
          const helperData = response.data.data;
          
          // Set form values with fetched data
          Object.keys(helperData).forEach(key => {
            setValue(key, helperData[key]);
          });
        } catch (error) {
          console.error("Error fetching helper data:", error);
          toast.error("Failed to load helper data");
        }
      };
      fetchHelperData();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }

      const url = isEditMode 
        ? `/helper/${id}`
        : `/helper`;

      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](url, formData);
      const resData = response.data;

      if (resData.success) {
        toast.success(
          `Helper ${isEditMode ? 'updated' : 'saved'} successfully`, 
          { position: "top-right" }
        );
        if (!isEditMode) reset();
        navigate("/tramessy/HelperList")
      } else {
        toast.error("Server issue: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-5 p-2">
      <Toaster />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold ">
        {isEditMode ? "Update Helper" : "Create Helper"}
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="helper_name" label="Helper Name" required />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="phone"
                  label="Helper Mobile"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Address & Salary */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="address" label="Address" required />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="salary"
                  label="Salary"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
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
              <div className="w-full"></div> {/* Empty div for layout */}
            </div>

            <div className="mt-6 text-left">
              <BtnSubmit>
                {isEditMode ? "Update Helper" : "Create Helper"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default HelperForm;