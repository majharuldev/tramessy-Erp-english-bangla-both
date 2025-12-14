
import React, { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import TextAreaField, { InputField, SelectField } from "../../../components/Form/FormFields";
import toast from "react-hot-toast";
import api from "../../../../utils/axiosConfig";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";

const RequisitionForm = () => {
  const [employees, setEmployees] = useState([]);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const methods = useForm({
  defaultValues: {
    status: "Pending",
  },
});
const { handleSubmit, reset, setValue } = methods;
  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get(`/employee`);
         if (res.data?.success){ const activeEmployee = res?.data?.data?.filter(
        (employee) => employee.status === "Active"
      );
          setEmployees(activeEmployee);}
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch existing requisition (edit mode)
  useEffect(() => {
    if (id) {
      const fetchRequisition = async () => {
        try {
          const res = await api.get(`/requestion/${id}`);
          const data = res.data?.data;
          if (data) {
            setValue("employee_id", data.employee_id);
            setValue("date", data.date);
            setValue("purpose", data.purpose);
            setValue("amount", data.amount);
            setValue("remarks", data.remarks);
            setValue("status", data.status);
          }
        } catch (err) {
          console.error("Error fetching requisition:", err);
          toast.error("Failed to load requisition info!");
        }
      };
      fetchRequisition();
    }
  }, [id, setValue]);

  // Submit handler
  const onSubmit = async (data) => {
    const payload = {
      user_id: user?.id,
      employee_id: data.employee_id,
      date: data.date,
      purpose: data.purpose,
      amount: data.amount,
      status: data.status,
      remarks: data.remarks,
    };

    try {
      const res = id
        ? await api.put(`/requestion/${id}`, payload)
        : await api.post(`/requestion`, payload);

      if (res.data?.success) {
        toast.success(
          id
            ? "Requisition Updated Successfully!"
            : "Requisition Added Successfully!"
        );
        reset();
        navigate("/tramessy/HR/advance-requisition");
      } else {
        toast.error(res?.data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error submitting requisition:", error);
      toast.error("Failed to submit requisition!");
    }
  };

  return (
    <div className="p-2">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 border-t-2 border-primary rounded-md shadow space-y-4 max-w-3xl bg-white"
        >
          <h3 className="pb-4 text-primary font-semibold text-lg">
            {id ? "Edit Requisition" : "Add Requisition"}
          </h3>

          {/* Employee + Date */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                {...methods.register("employee_id", {
                  required: "Employee is required",
                })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_name || emp.email}
                  </option>
                ))}
              </select>
              {methods.formState.errors.employee_id && (
                <p className="text-xs text-red-500 mt-1">
                  {methods.formState.errors.employee_id.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <InputField name="date" label="Date" type="date" required />
            </div>
          </div>

          {/* Purpose + Amount */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <SelectField
                name="status"
                label="Status"
                required={!id}
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Approved", label: "Approved" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField
                name="amount"
                label="Amount"
                type="number"
                required
              />
            </div>
          </div>
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="purpose" label="Purpose" required />
            </div>
            <div className="w-full">
              {/* Remarks */}
              <TextAreaField name="remarks" label="Remarks" rows={3} />
            </div>
          </div>



          {/* Submit */}
          <BtnSubmit>{id ? "Update" : "Submit"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default RequisitionForm;
