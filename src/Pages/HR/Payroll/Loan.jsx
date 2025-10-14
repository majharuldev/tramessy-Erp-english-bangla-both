
import React, { useEffect, useState, useContext, useRef } from "react";
import { FaPen, FaPlus, FaUserSecret } from "react-icons/fa";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { tableFormatDate } from "../../../hooks/formatDate";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import toast from "react-hot-toast";
import { AuthContext } from "../../../providers/AuthProvider";

const Loan = () => {
  const [loanData, setLoanData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
const loanDateRef = useRef(null);
  const { user } = useContext(AuthContext);

  const methods = useForm();
  const { handleSubmit, reset, control, setValue, register } = methods;

  // Fetch loan & employee data
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get(`/loan`);
        if (res.data?.status === "Success") {
          setLoanData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching loan data:", error);
      }
    };

    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee`);
        if (res.data?.success) {
          setEmployee(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    

    fetchLoans();
    fetchEmployee();
  }, [user?.id]);

  // data reset
  useEffect(() => {
    if (isModalOpen) {
      if (selectedLoan) {
        reset(selectedLoan); // Edit mode
      } else {
        reset({ employee_id: "", amount: "", monthly_deduction: "", status: "Due" }); // Add mode
      }
    }
  }, [isModalOpen, selectedLoan, reset]);

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = loanData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(loanData.length / itemsPerPage);

  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  // Handle modal open for add/edit
  const handleEdit = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
    if (loan) {
      setValue("employee_id", loan.employee_id);
      setValue("amount", loan.amount);
      setValue("monthly_deduction", loan.monthly_deduction);
      setValue("status", loan.status);
    } else {
      reset();
    }
  };

  // Submit handler
  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id,
      amount: data.amount,
      monthly_deduction: data.monthly_deduction,
      status: data.status,
      created_by: user.name,
    };

    try {
      const res = selectedLoan
        ? await api.put(`/loan/${selectedLoan.id}`, payload)
        : await api.post(`/loan`, payload);

      if (res?.data?.status === "Success") {
        toast.success(
          selectedLoan ? "Loan Updated Successfully!" : "Loan Added Successfully!"
        );
        setIsModalOpen(false);
        reset();
        window.location.reload();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("Error submitting loan:", err);
      toast.error("Failed to save loan!");
    }
  };

  return (
    <div className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            Loan
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => handleEdit(null)}
              className="bg-gradient-to-r from-primary to-[#075e13] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaPlus /> Loan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Employee Name</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Monthly Deduction</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created By</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirst + index + 1}</td>
                    <td className="p-2">{tableFormatDate(item.created_at)}</td>
                    <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                    <td className="p-2">{item.amount} ৳</td>
                    <td className="p-2">{item.monthly_deduction}</td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">{item.created_by}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaPen className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          </div>
        )}
      </div>

      {/* Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto">
          <div className="bg-white w-full max-w-2xl rounded-md shadow-lg p-6 relative">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {selectedLoan ? "Edit Loan" : "Add Loan"}
            </h3>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="w-full">
                    <InputField
                      name="date"
                      label="Loan Date"
                      type="date"
                      required={!selectedLoan}
                      inputRef={(e) => {
                        register("date").ref(e);
                        loanDateRef.current = e;
                      }}

                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      Select Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("employee_id", { required: "Employee is required" })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Employee</option>
                      {employee.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employee_name || emp.name || emp.email}
                        </option>
                      ))}
                    </select>
                    {methods.formState.errors.employee_id && (
                      <p className="text-xs text-red-500 mt-1">
                        {methods.formState.errors.employee_id.message}
                      </p>
                    )}
                  </div>
                  <InputField
                    name="amount"
                    label="Loan Amount"
                    type="number"
                    required
                  />
                  <InputField
                    name="monthly_deduction"
                    label="Month Deduction"
                    placeholder="Amount"
                    required
                  />
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("status", { required: "Status is required" })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Status</option>
                      <option value="Due">Due</option>
                      <option value="Completed">Completed</option>
                    </select>
                    {methods.formState.errors.status && (
                      <p className="text-xs text-red-500 mt-1">
                        {methods.formState.errors.status.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <BtnSubmit>{selectedLoan ? "Update" : "Submit"}</BtnSubmit>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loan;


