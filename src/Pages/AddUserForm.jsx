
import { useForm, FormProvider } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BtnSubmit from "../components/Button/BtnSubmit";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { InputField, SelectField } from "../components/Form/FormFields";
import api from "../../utils/axiosConfig";

const AddUserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm();
  const { handleSubmit, reset, setValue, watch } = methods;
  const password = watch("password");

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchUserData = async () => {
        try {
          const response = await api.get(
            `/user/${id}`
          );
          const userData = response.data;
          
          // Set form values with fetched data
          Object.keys(userData).forEach(key => {
            if (key !== 'confirmPassword') { // Don't set confirmPassword
              setValue(key, userData[key]);
            }
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
        }
      };
      fetchUserData();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = data;

      const url = isEditMode 
        ? `/user/${id}`
        : `/register`;

      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](url, submitData);
      const resData = response.data;

      if (resData.data.success) {
        toast.success(
          `User ${isEditMode ? 'updated' : 'created'} successfully!`, 
          { position: "top-right" }
        );
        if (!isEditMode) reset();
        navigate("/tramessy/AllUsers")
      } else {
        toast.error("Server error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server error: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 md:p-2">
      <Toaster />
      
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold rounded-t-md">
        {isEditMode ? "Update User" : "Add User"}
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="name" label="Name" required={!isEditMode} />
              </div>
              {/* <div className="w-full">
                <InputField name="phone" label="Phone" type="number" required={!isEditMode} />
              </div> */}
              <div className="w-full">
                <InputField name="email" label="Email" type="email" required={!isEditMode} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="md:flex justify-between gap-3">
              
                  <div className="w-full">
                    <InputField
                      name="password"
                      label="Password"
                      type="password"
                      // required={!isEditMode}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="password_confirmation"
                      label="Confirm Password"
                      type="password"
                      // required={!isEditMode}
                      required
                      validate={(value) =>
                        !password || value === password || "Passwords do not match"
                      }
                    />
                  </div>
            </div>

            {/* Row 3 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <SelectField
                  name="role"
                  label="User Type"
                  required={!isEditMode}
                  options={[
                    { value: "", label: "Select User Type..." },
                    { value: "User", label: "User" },
                    { value: "Admin", label: "Admin" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="Status"
                  required={!isEditMode}
                  options={[
                    { value: "", label: "Select Status..." },
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <BtnSubmit>
                {isEditMode ? "Update User" : "Add User"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddUserForm;