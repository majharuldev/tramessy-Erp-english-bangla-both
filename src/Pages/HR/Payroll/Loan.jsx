
import React, { useEffect, useState, useContext, useRef } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { formatDate, tableFormatDate } from "../../../hooks/formatDate";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import toast from "react-hot-toast";
import { AuthContext } from "../../../providers/AuthProvider";
import { IoMdClose } from "react-icons/io";
import * as XLSX from "xlsx";
import toNumber from "../../../hooks/toNumber";
import dayjs from "dayjs";

const Loan = () => {
  const [loanData, setLoanData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const loanDateRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  const methods = useForm();
  const { handleSubmit, reset, control, setValue, register, watch } = methods;
  
useEffect(() => {
  fetchLoans();
  fetchEmployee();
}, [user?.id]);

  // Fetch loan & employee data

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

    // fetch employee
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee`);
        if (res.data?.success) {
          const activeEmployees = res?.data?.data.filter(
          (employee) => employee.status?.toLowerCase() === "active"
        );
        setEmployee(activeEmployees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/loan/${id}`);

      // Remove driver from local list
      setLoanData((prev) => prev.filter((account) => account.id !== id));
      toast.success("Loan deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedLoanId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // data reset
  useEffect(() => {
    if (isModalOpen) {
      if (selectedLoan) {
        reset(selectedLoan); // Edit mode
      } else {
        reset({ date: "", employee_id: "", amount: "", monthly_deduction: "", status: "Due" }); // Add mode
      }
    }
  }, [isModalOpen, selectedLoan, reset]);

  // employee name fetch
    const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  // filter data based on search term
  const filteredData = loanData.filter((item) => {
  const empName = getEmployeeName(item.employee_id)?.toLowerCase() || "";
  const status = item.status?.toLowerCase() || "";
  const createdBy = item.created_by?.toLowerCase() || "";
  const search = searchTerm.toLowerCase();
  return (
    empName.includes(search) ||
    status.includes(search) ||
    createdBy.includes(search) ||
    item.amount?.toString().includes(search)
  );
});

// excel export function 
const exportExcel = () => {
  const exportData = filteredData.map((item, index) => ({
    SL: index + 1,
    Date: tableFormatDate(item.created_at),
    "Employee Name": getEmployeeName(item.employee_id),
    Amount: toNumber(item.amount),
    "Monthly Deduction": toNumber(item.monthly_deduction),
    "After Adjustment": toNumber(item.adjustment),
    Status: item.status,
    "Created By": item.created_by,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loan List");
  XLSX.writeFile(workbook, "Loan_List.xlsx");
};

// Print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    const tableHTML = `
      <html>
        <head>
          <title></title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Loan Report</h2>
          <table>
            <thead>
              <tr>
              <th>"SL"</th>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Amount</th>
              <th>Monthly Deduction</th>
              <th>After Adjustment</th>
              <th>Status</th>
              <th>Created By</th>
            </tr>
            </thead>
            <tbody>
              ${filteredData
        .map(
          (item, index) => `
                <tr>
        <td>${index + 1}</td>
        <td>${tableFormatDate(item.created_at)}</td>
        <td>${getEmployeeName(item.employee_id)}</td>
        <td>${item.amount} ৳</td>
        <td>${item.monthly_deduction}</td>
        <td>${item.adjustment} ৳</td>
        <td>${item.status}</td>
        <td>${item.created_by}</td>
      </tr>`
        )
        .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


// Add Mode: amount দিলে adjustment auto-fill হবে
const amountValue = watch("amount");

useEffect(() => {
  if (!selectedLoan && amountValue > 0) {
    setValue("adjustment", Number(amountValue));
  }
}, [amountValue, selectedLoan, setValue]);

// Update Mode: paid_amount দিলে adjustment থেকে কমে যাবে
const paidAmount = watch("paid_amount");

useEffect(() => {
  if (selectedLoan && paidAmount !== undefined) {
    const currentAdjustment = Number(selectedLoan.adjustment) || 0;
    const newAdjustment = currentAdjustment - Number(paidAmount || 0);
    if (!isNaN(newAdjustment) && newAdjustment >= 0) {
      setValue("adjustment", newAdjustment);
    }
  }
}, [paidAmount, selectedLoan, setValue]);


  // Handle modal open for add/edit
  const handleEdit = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
    if (loan) {
      setValue("date", loan.date);
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
    date: dayjs(data.date).format("YYYY-MM-DD"),
    employee_id: data.employee_id,
    amount: Number(data.amount) || 0,
    monthly_deduction: Number(data.monthly_deduction) || 0,
    adjustment: Number(data.adjustment) || 0,
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
      await fetchLoans(); // fetch updated list
      reset();             // reset form
      setIsModalOpen(false);
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
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Product ..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
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
                <th className="p-2">After Adjustment</th>
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
                    <td className="p-2">{tableFormatDate(item.date)}</td>
                    <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                    <td className="p-2">{item.amount} ৳</td>
                    <td className="p-2">{item.monthly_deduction}</td>
                    <td className="p-2">{item.adjustment}</td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">{item.created_by}</td>
                    <td className="p-2 flex gap-2 items-center">
                     { item.adjustment !== 0 && <button
                        onClick={() => handleEdit(item)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaPen className="text-[12px]" />
                      </button>}
                      <button
                        onClick={() => {
                          setSelectedLoanId(item.id);
                          setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto scroll-hidden">
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
                    required={!selectedLoan}
                  />
                  <InputField
                    name="monthly_deduction"
                    label="Month Deduction"
                    placeholder="Monthly Amount"
                    required={!selectedLoan}
                  />
                  {selectedLoan && (
                    <>
                      <InputField
                        name="paid_amount"
                        label="Pay Deduction"
                        placeholder="Monthly paid deduction"
                        required={!selectedLoan}
                      />
                      <InputField
                        name="adjustment"
                        label="After Adjustment Amount"
                        placeholder="Monthly Amount"
                        required={!selectedLoan}
                        readOnly
                      />
                    </>
                  )}
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
      {/* Delete Modal */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>
              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                Are you sure you want to delete this Customer?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedLoanId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loan;


