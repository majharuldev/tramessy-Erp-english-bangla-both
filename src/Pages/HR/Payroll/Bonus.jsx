import React, { useContext, useEffect, useRef, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { tableFormatDate } from "../../../hooks/formatDate";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { AuthContext } from "../../../providers/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import toNumber from "../../../hooks/toNumber";

const Bonus = () => {
  const [advanceSalary, setAdvanceSalary] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBonous, setSelectedBonous] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBonusId, setSelectedBonusId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  const { user } = useContext(AuthContext);
  const bonousDateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, control, setValue, register } = methods;
  // salary advance fetch
  useEffect(() => {
    const fetchSalaryAdvance = async () => {
      try {
        const res = await api.get(`/bonous`);
        if (res.data?.status === "Success") {
          setAdvanceSalary(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching advance salary:", error);
      }
    };

    // employee fetch
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee`);
        if (res.data?.success) {
          const activeEmployees = res.data.data.filter(
            (employee) => employee.status?.toLowerCase() === "active"
          );
          setEmployee(activeEmployees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchSalaryAdvance();
    fetchEmployee();
  }, []);

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/bonous/${id}`);

      // Remove driver from local list
      setAdvanceSalary((prev) => prev.filter((account) => account.id !== id));
      toast.success("Bonous deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedBonusId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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
  // Handle modal open for add/edit
  const handleEdit = (bonous) => {
    setSelectedBonous(bonous);
    setIsModalOpen(true);
    if (bonous) {
      // setValue("employee_id", bonous.employee_id);
      setValue("employee_id", bonous.employee_id);
      setValue("amount", bonous.amount);
      setValue("month_of", bonous.month_of);
      setValue("status", bonous.status);
    } else {
      reset();
    }
  };

  // Submit handler
  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id,
      amount: data.amount,
      month_of: data.month_of,
      status: data.status,
      created_by: user.name,
    };

    try {
      const res = selectedBonous
        ? await api.put(`/bonous/${selectedBonous.id}`, payload)
        : await api.post(`/bonous`, payload);

      if (res?.data?.status === "Success") {
        toast.success(
          selectedBonous ? "Bonous Updated Successfully!" : "Bonous Added Successfully!"
        );
        setIsModalOpen(false);
        reset();
        // Option 1: Update local table state
        if (!selectedBonous) {
          setAdvanceSalary((prev) => [res.data.data, ...prev]);
        } else {
          setAdvanceSalary((prev) =>
            prev.map((item) =>
              item.id === selectedBonous.id ? res.data.data : item
            )
          );
        }
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("Error submitting loan:", err);
      toast.error("Failed to save loan!");
    }
  };

  // helper to get employee name
  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };
  // Pagination & Search
  const filteredItems = advanceSalary.filter(
    (item) =>
      getEmployeeName(item.employee_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.amount.toString().includes(searchTerm) ||
      item.month_of.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Export Excel
  const exportExcel = () => {
    const data = filteredItems.map((item, index) => ({
      SL: index + 1,
      Date: tableFormatDate(item.created_at),
      "Employee Name": getEmployeeName(item.employee_id),
      Amount: toNumber(item.amount),
      "Salary Month": item.month_of,
      Status: item.status,
      "Created By": item.created_by
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bonus");
    XLSX.writeFile(wb, "bonus.xlsx");
  };

  // Print table
  const printTable = () => {
    const printContent = document.getElementById("bonus-table").innerHTML;
    const newWindow = window.open("", "", "width=900,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Bonus Report</title>
          <style>
            table, th, td { border: 1px solid black; border-collapse: collapse; }
            th, td { padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };
  return (
    <div className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            Bonus
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link >
              <button onClick={() => handleEdit(null)} className="bg-gradient-to-r from-primary to-[#075e13] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Bonus
              </button>
            </Link>
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
                <th className="p-2">Salary Month</th>
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
                    <td className="p-2 font-bold">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="p-2">{tableFormatDate(item.created_at)}</td>
                    <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                    <td className="p-2">{item.amount} ৳</td>
                    <td className="p-2">
                      {item.month_of}
                    </td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">
                      {(item.created_by)}
                    </td>
                    <td className="p-2 flex gap-2 items-center">
                      <Link >
                        <button onClick={() => handleEdit(item)} className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedBonusId(item.id);
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
                  <td colSpan="6" className="text-center p-4 text-gray-500">
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
      {/* bonous Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto">
          <div className="bg-white w-full max-w-2xl rounded-md shadow-lg p-6 relative">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {selectedBonous ? "Edit Bonous" : "Add Bonous"}
            </h3>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* <div className="w-full">
                    <InputField
                      name="date"
                      label="Bonous Date"
                      type="date"
                      required={!selectedBonous}
                      inputRef={(e) => {
                        register("date").ref(e);
                        bonousDateRef.current = e;
                      }}

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
                    label="Bonous Amount"
                    type="number"
                    required={selectedBonous ? false : true}
                  />
                  {/* <InputField
                    name="month_of"
                    label="Monthly Bonous"
                    placeholder="2025-05(Year-Month)"
                    required={selectedBonous ? false : true}
                  /> */}
                  <div className="">
                    <label className="block text-sm font-medium mb-1">Month Bonus</label>

                    <select
                      {...methods.register("month_of", { required: "Month is required" })}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="">Select Month</option>

                      {monthYearOptions.map((opt, index) => (
                        <option key={index} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  <BtnSubmit>{selectedBonous ? "Update" : "Submit"}</BtnSubmit>
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
                  onClick={() => handleDelete(selectedBonusId)}
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

export default Bonus;
