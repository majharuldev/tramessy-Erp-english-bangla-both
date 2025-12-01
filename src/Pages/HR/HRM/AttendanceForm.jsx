
import React, { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import toast from "react-hot-toast";
import api from "../../../../utils/axiosConfig";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";

const AdvanceSalaryForm = () => {
  const methods = useForm();
  const { handleSubmit, reset, control, setValue } = methods;
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { id } = useParams();
  const navigate = useNavigate()

  // Fetch employees & user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, userRes] = await Promise.all([
          api.get(`/employee`),
          api.get(`/user/${userId}`),
        ]);

        if (empRes.data?.success) {
          //  active employee filter
          const activeEmployees = empRes.data.data.filter(
            (employee) => employee.status?.toLowerCase() === "active"
          );
          setEmployees(activeEmployees);
        }
        if (userRes.data?.name) setUserName(userRes.data.name);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [userId]);

     // month yeayr options
    const currentYear = new Date().getFullYear();
const months = [
  { num: "01", name: "January" },
  { num: "02", name: "February" },
  { num: "03", name: "March" },
  { num: "04", name: "April" },
  { num: "05", name: "May" },
  { num: "06", name: "Jun" },
  { num: "07", name: "July" },
  { num: "08", name: "August" },
  { num: "09", name: "September" },
  { num: "10", name: "October" },
  { num: "11", name: "November" },
  { num: "12", name: "December" },
];
    const monthYearOptions = [];

    for (let y = currentYear; y <= currentYear + 10; y++) {
        months.forEach((m) => {
            monthYearOptions.push({
                value: `${y}-${m.num}`,
                label: `${y}-${m.name}`
            });
        });
    }

  useEffect(() => {
    if (id && employees.length > 0) {
      api.get(`/attendence/${id}`).then((res) => {
        const data = res.data?.data;
        if (data) {
          setValue("employee_id", data.employee_id);
          setValue("working_day", data.working_day);
          setValue("month", data.month);
          setValue("created_by", data.created_by);
        }
      }).catch(() => toast.error("Failed to load attendance info!"));
    }
  }, [id, employees, setValue]);

  // Submit handler (Add or Update)
  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id,
      working_day: data.working_day,
      month: data.month,
      created_by: userName,
    };

    try {
      const res = id
        ? await api.put(`/attendence/${id}`, payload)
        : await api.post(`/attendence`, payload)

      // Success check
      if (res?.data?.status === "Success") {
        toast.success(
          id
            ? "Attendence Updated Successfully!"
            : "Attendence Added Successfully!"
        );
        reset();
        navigate("/tramessy/HR/Payroll/Attendance");
        return;
      }

      // API returned something other than success
      toast.error(res?.data?.message || "Something went wrong!");
    } catch (err) {
      // Prevent duplicate toast if response exists
      if (!err.response) {
        toast.error("Failed to submit attendence!");
      }
      console.error("Error submitting form:", err);
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
            {id
              ? "Update Atttendence Information"
              : "Add Attendence Information"}
          </h3>

          {/* Employee + Amount */}
          <div className="md:flex justify-between gap-3">
            {/* <div className="w-full">
              <SelectField
                name="employee_id"
                label="Select Employee"
                required
                options={employees.map((emp) => ({
                  label: emp.employee_name || emp.email,
                  value: emp.id,
                }))}
                control={control}
              />
            </div> */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                {...methods.register("employee_id", { required: "Employee is required" })}
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
              <InputField
                name="working_day"
                label="Working day"
                type="number"
                required
              />
            </div>
          </div>

          {/* Salary Month + Status */}
          <div className="md:flex justify-between gap-3">
            <div className="w-[50%]">
              <SelectField
               name="month"
                label="Month(YYYY-MM)"
                placeholder="2025-January"
                required
                options={monthYearOptions}
              />
            </div>
          </div>

          {/* Created By (auto-filled) */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full hidden">
              <InputField
                name="created_by"
                label="Created By"
                value={userName}
                readOnly
              />
            </div>
          </div>

          {/* Submit */}
          <BtnSubmit> {id ? "Update" : "Submit"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AdvanceSalaryForm;
