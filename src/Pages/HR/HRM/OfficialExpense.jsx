import { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import dayjs from "dayjs"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTrashAlt, FaTruck } from "react-icons/fa"
import toast, { Toaster } from "react-hot-toast"
import { FaPlus } from "react-icons/fa6"
import BtnSubmit from "../../../components/Button/BtnSubmit"
import { FiFileText, FiX } from "react-icons/fi"
import { BiEdit } from "react-icons/bi"
import Pagination from "../../../components/Shared/Pagination"
import api from "../../../../utils/axiosConfig"
import DatePicker from "react-datepicker"
import { IoMdClose } from "react-icons/io"
import toNumber from "../../../hooks/toNumber"
import { tableFormatDate } from "../../../hooks/formatDate"


const OfficialExpense = () => {
  const [expenses, setExpenses] = useState([])
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const printRef = useRef()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    date: "",
    paid_to: "",
    amount: "",
    payment_category: "",
    branch_name: "",
    particulars: "",
    status: "",
  })
  const [errors, setErrors] = useState({})
  // Date filter state
    const [selectedExpenseId, setSelectedExpenseId] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const salaryCategories = [
    "Utility",
  ];
  const statusOptions = ["Paid", "Unpaid"];

  //   branch api
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get(`/office`);
        if (response?.data?.success) {
          setBranches(response?.data?.data);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
        toast.error("Failed to load branch list");
      }
    };

    fetchBranches();
  }, []);

  // modal show handler
  const showModal = async (record = null) => {
    if (record) {
      try {
        const res = await api.get(`/expense/${record.id}`)
        const data = res.data
        setFormData({
          date: data?.date || "",
          paid_to: data?.paid_to || "",
          amount: data?.amount || "",
          payment_category: data?.payment_category || "",
          branch_name: data?.branch_name || "",
          particulars: data?.particulars || "",
          status: data?.status || "",
        })
        setEditingId(record.id)
      } catch (err) {
        // showToast("ডেটা লোড করতে সমস্যা হয়েছে", "error")
        console.log("error show modal")
      }
    } else {
      setFormData({
        date: "",
        paid_to: "",
        amount: "",
        payment_category: "",
        branch_name: "",
        particulars: "",
        status: "",
      })
      setEditingId(null)
    }
    setIsModalVisible(true)
  }

  // modal cancle
  const handleCancel = () => {
    setFormData({
      date: "",
      paid_to: "",
      amount: "",
      payment_category: "",
      branch_name: "",
      particulars: "",
      status: "",
    })
    setEditingId(null)
    setIsModalVisible(false)
    setErrors({})
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  //   expense
  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expense`)
      const allExpenses = response.data || [];
      const utilityExpenses = allExpenses.filter(expense =>
        expense.payment_category === 'Utility'
      );

      setExpenses(utilityExpenses);
      setLoading(false)
    } catch (err) {
      console.log("Data feching issue", "error")
      setLoading(false)
    }
  }

  // form validation
  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.paid_to) newErrors.paid_to = "Recipient is required"
    if (!formData.amount) newErrors.amount = "Amount is required"
    if (!formData.branch_name) newErrors.branch_name = "Branch name is required"
    if (!formData.payment_category) newErrors.payment_category = "Category is required"
    if (!formData.particulars) newErrors.particulars = "Particulars is required"
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // delete by id
    const handleDelete = async (id) => {
      try {
        const response = await api.delete(`/expense/${id}`);
  
        // Remove driver from local list
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
        toast.success("Salary Expense deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });
  
        setIsOpen(false);
        setSelectedExpenseId(null);
      } catch (error) {
        console.error("Delete error:", error.response || error);
        toast.error("There was a problem deleting!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
// form data submit handler func
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: dayjs(formData.date).format("YYYY-MM-DD"),
      }

      if (editingId) {
        await api.put(`/expense/${editingId}`, payload)
        toast.success("Expense Data Update successful")
      } else {
        await api.post(`/expense`, payload)
        toast.success("Epense Added successful")
      }

      handleCancel()
      fetchExpenses()
    } catch (err) {
      console.error(err)
      toast.error("Operation failed", "error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredData = expenses.filter((item) => {
    const itemDate = dayjs(item.date).format("YYYY-MM-DD");

    const matchesSearch = [item.paid_to, item.amount, item.payment_category, item.particulars, item.branch_name, item.status,]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Date filter logic
    let matchesDate = true;
    if (startDate && !endDate) {
      // only start date dile oi ekta tarikh er data
      matchesDate = itemDate === dayjs(startDate).format("YYYY-MM-DD");
    } else if (startDate && endDate) {
      // start + end dile range filter
      matchesDate =
        itemDate >= dayjs(startDate).format("YYYY-MM-DD") &&
        itemDate <= dayjs(endDate).format("YYYY-MM-DD");
    }

    return matchesSearch && matchesDate;
  })
  // csv
  const exportCSV = () => {
    const csvContent = [
      ["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"],
      ...filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.pay_amount,
        item.payment_category,
        item.particulars,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "general_expense.csv")
  }
  // excel
  const exportExcel = () => {
    const data = filteredData.map((item, i) => ({
      SL: i + 1,
      Date: item.date,
      PaidTo: item.paid_to,
      Amount: item.amount,
      Category: item.payment_category,
      Notes: item.particulars,
      Status: item.status,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "General Expense")
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), "general_expense.xlsx")
  }
  // pdf
  const exportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"]],
      body: filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.amount,
        item.payment_category,
        item.particulars,
        item.status,
      ]),
    })
    doc.save("general_expense.pdf")
  }
  // print

  const printTable = () => {
    const tableHeader = `
    <thead>
      <tr>
        <th>SL</th>
        <th>Date</th>
        <th>Branch</th>
        <th>Paid To</th>
        <th>Amount</th>
        <th>Category</th>
        <th>Remarks</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

    const tableRows = filteredData
      .map(
        (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.date || ""}</td>
          <td>${item.branch_name || ""}</td>
          <td>${item.paid_to || ""}</td>
          <td>${toNumber(item.amount) || ""}</td>
          <td>${item.payment_category || ""}</td>
          <td>${item.particulars || ""}</td>
           <td>${item.status || ""}</td>
        </tr>
      `
      )
      .join("");

    const printContent = `
    <table>
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

    const win = window.open("", "", "width=900,height=650");
    win.document.write(`
    <html>
      <head>
        <title>Salary Expense</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h3 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
          thead { background-color: #11375B; color: white; }
          tbody tr:nth-child(odd) { background-color: #f9f9f9; }
          thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>Salary Expense List</h3>
        ${printContent}
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredExpense = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


  return (
    <div className="p-2 ">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-xl" />
            Daily Office Expense
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <Link to="/tramessy/AddSallaryExpenseForm"> */}
            <button onClick={() => showModal()} className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> Add
            </button>
            {/* </Link> */}
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4">
          <div className="flex flex-wrap gap-2">

            {/* <button
              onClick={exportCSV}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FiFileText size={16} />
              CSV
            </button> */}
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow   hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>

            {/* <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow   hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button> */}

            <button
              onClick={printTable}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* <span className="text-sm font-medium text-gray-700">Search:</span> */}
            <input
              type="text"
              className="lg:w-60 px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-12 top-[6.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setStartDate("")
                  setEndDate("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200" ref={printRef}>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr className="">
                <th className="px-3 py-3 text-left text-sm font-semibold w-16">SL</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Branch Name</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Paid To</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">Remarks</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-3 text-left text-sm font-semibold w-24 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredExpense.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No Expense data found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpense.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">{index + 1}</td>
                    <td className="px-3 py-3 text-sm">{tableFormatDate(item.date)}</td>
                    <td className="px-3 py-3 text-sm">{item.branch_name}</td>
                    <td className="px-3 py-3 text-sm">{item.paid_to}</td>
                    <td className="px-3 py-3 text-sm">{item.amount}</td>
                    <td className="px-3 py-3 text-sm">{item.payment_category}</td>
                    <td className="px-3 py-3 text-sm">{item.particulars}</td>
                    <td
                      className={`px-3 py-2 font-semibold ${item.status === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                        }`}
                    >
                      {item.status}
                    </td>
                    <td className="px-3 py-3 text-sm action_column flex gap-2 items-center">
                      <button
                        onClick={() => showModal(item)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                      >
                        <BiEdit size={12} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExpenseId(item.id);
                          setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {filteredExpense.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">
          <div className="relative bg-white rounded-lg shadow-lg p-6  max-w-2xl border border-gray-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 ">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Update Daily Expense" : "Add Daily Expense"}</h2>
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid To <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Paid To"
                      value={formData.paid_to}
                      onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                    />
                    {errors.paid_to && <p className="text-red-500 text-xs mt-1">{errors.paid_to}</p>}
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.payment_category}
                      onChange={(e) => setFormData({ ...formData, payment_category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {salaryCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.payment_category && <p className="text-red-500 text-xs mt-1">{errors.payment_category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name  <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.branch_name}
                      onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </select>
                    {errors.branch_name && <p className="text-red-500 text-xs mt-1">{errors.branch_name}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Remarks"
                      value={formData.particulars}
                      onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                    />
                    {errors.particulars && <p className="text-red-500 text-xs mt-1">{errors.particulars}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select status</option>
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-xs text-red-500">{errors.status}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3  ">
                <button
                  type="button"
                  onClick={handleCancel}
                  className=" mt-5 px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <BtnSubmit
                  loading={isSubmitting}
                >
                  Submit
                </BtnSubmit>
              </div>
            </form>
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
                  onClick={() => handleDelete(selectedExpenseId)}
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
  )
}

export default OfficialExpense