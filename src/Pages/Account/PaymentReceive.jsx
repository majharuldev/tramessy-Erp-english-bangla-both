
import axios from "axios";
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { FaFileExcel, FaFilter, FaPen, FaPlus, FaPrint, FaTrashAlt } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { Link } from "react-router-dom";
import Pagination from "../../components/Shared/Pagination";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../hooks/formatDate";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import toNumber from "../../hooks/toNumber";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";

const PaymentReceive = () => {
  const { t } = useTranslation();
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filteredPayment, setFilteredPayment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  // Fetch payment data
  useEffect(() => {
    api
      .get(`/payment-recieve`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
          setFilteredPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  // filter logic
  // useEffect(() => {
  //   if (!startDate && !endDate) {
  //     setFilteredPayment(payment);
  //     return;
  //   }

  //   const result = payment.filter((item) => {
  //     if (!item.date) return false;

  //     // Convert API string to Date
  //     const itemDate = new Date(item.date);
  //     if (isNaN(itemDate)) return false;

  //     if (startDate && endDate) {
  //       return (
  //         (isEqual(itemDate, startDate) || isAfter(itemDate, startDate)) &&
  //         (isEqual(itemDate, endDate) || isBefore(itemDate, endDate))
  //       );
  //     } else if (startDate) {
  //       return isEqual(itemDate, startDate) || isAfter(itemDate, startDate);
  //     } else if (endDate) {
  //       return isEqual(itemDate, endDate) || isBefore(itemDate, endDate);
  //     }

  //     return true;
  //   });

  //   setFilteredPayment(result);
  // }, [startDate, endDate, payment]);

  useEffect(() => {
    const result = payment.filter((item) => {
      const match =
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bill_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cash_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.created_by?.toLowerCase().includes(searchTerm.toLowerCase());

      // apply date filter + search together
      const itemDate = new Date(item.date);
      let withinRange = true;
      if (startDate && endDate) {
        withinRange =
          (isEqual(itemDate, startDate) || isAfter(itemDate, startDate)) &&
          (isEqual(itemDate, endDate) || isBefore(itemDate, endDate));
      }

      return match && withinRange;
    });
    setFilteredPayment(result);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, payment]);


  // total amount footer
  const totalAmount = filteredPayment.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/payment-recieve/${id}`);

      // Remove driver from local list
      setPayment((prev) => prev.filter((account) => account.id !== id));
      toast.success("Payment deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Excel Export Function
const exportToExcel = () => {
  if (!filteredPayment || filteredPayment.length === 0) {
    toast.error("No data available to export!");
    return;
  }

  const exportData = filteredPayment.map((dt, idx) => ({
    SL: idx + 1,
    Date: dt.date ? format(new Date(dt.date), "dd/MM/yyyy") : "",
    Customer: dt.customer_name || "",
    Branch: dt.branch_name || "",
    Bill_Ref: dt.bill_ref || "",
    Amount: toNumber(dt.amount) || 0,
    Cash_Type: dt.cash_type || "",
    Note: dt.remarks || "",
    Created_By: dt.created_by || "",
    Status: dt.status || "",
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Receive");

  // Set column width for better readability
  const colWidths = [
    { wch: 5 },  // SL
    { wch: 12 }, // Date
    { wch: 20 }, // Customer
    { wch: 18 }, // Branch
    { wch: 15 }, // Bill Ref
    { wch: 12 }, // Amount
    { wch: 12 }, // Cash Type
    { wch: 25 }, // Note
    { wch: 15 }, // Created By
    { wch: 10 }, // Status
  ];
  worksheet["!cols"] = colWidths;

  // Convert to Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Payment_Receive_Report_${format(new Date(), "ddMMyyyy_HHmm")}.xlsx`);
};


  // Print Function
  const handlePrint = () => {
    const rowsHtml = filteredPayment.map((dt, idx) => {
      const dateStr = dt.date ? format(new Date(dt.date), "dd/MM/yyyy") : "";
      return `
      <tr style="border:1px solid #e5e7eb;">
        <td style="padding:6px;">${idx + 1}</td>
        <td style="padding:6px;">${dateStr}</td>
        <td style="padding:6px;">${dt.customer_name || ""}</td>
        <td style="padding:6px;">${dt.branch_name || ""}</td>
        <td style="padding:6px;">${dt.bill_ref || ""}</td>
        <td style="padding:6px; text-align:right;">${dt.amount || 0}</td>
        <td style="padding:6px;">${dt.cash_type || ""}</td>
        <td style="padding:6px;">${dt.remarks || ""}</td>
        <td style="padding:6px;">${dt.created_by || ""}</td>
        <td style="padding:6px;">${dt.status || ""}</td>
      </tr>
    `;
    }).join("");

    const totalAmount = filteredPayment.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const tableHtml = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f3f4f6; color:#047857;">
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("SL.")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Date")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Customer")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Branch")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Bill Ref")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Amount")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Cash Type")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Note")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Created By")}</th>
          <th style="padding:8px; border:1px solid #e5e7eb;">${t("Status")}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="10" style="padding:10px;text-align:center;color:#6b7280;">No data found</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right; font-weight:600; padding:8px;">Total:</td>
          <td style="text-align:right; font-weight:600; padding:8px;">${totalAmount}</td>
          <td colspan="4"></td>
        </tr>
      </tfoot>
    </table>
  `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto; padding:20px; color:#111827; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; }
          tr:nth-child(even){ background-color: #f9fafb; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">${t("Payment Receive")} ${t("Report")}</h2>
          <p class="text-gray-600 text-sm">Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
        ${tableHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };


  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayment.length / itemsPerPage);

  // filter clear func
  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowFilter(false);
    setFilteredPayment(payment);
    setCurrentPage(1);
  };

  if (loading) return <p className="text-center mt-16">{t("Loading")}...</p>;

  return (
    <div className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-3">
            {t("Payment Receive")}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className=" md:mt-0 flex gap-2">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> {t("Filter")}
              </button>
            </div>
            <Link to="/tramessy/account/PaymentReceiveForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> {t("Receive")}
              </button>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              {t("Excel")}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-4 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              {t("Print")}
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
              }}
              placeholder={`${t("search")} ${t("list")}...`}
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* filter */}
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className="w-sm ">
              <button
                onClick={handleClearFilter}
                className="bg-primary text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter /> {t("Clear")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-sm">
              <tr>
                <th className="p-2">{t("SL.")}</th>
                <th className="p-2">{t("Date")}</th>
                <th className="p-2">{t("Customer")} {t("Name")}</th>
                <th className="p-2">{t("Branch")} {t("Name")}</th>
                <th className="p-2">{t("Bill Ref")}</th>
                <th className="p-2">{t("Amount")}</th>
                <th className="p-2">{t("Cash Type")}</th>
                <th className="p-2">{t("Note")}</th>
                <th className="p-2">{t("Created By")}</th>
                <th className="p-2">{t("Status")}</th>
                <th className="p-2">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {
                currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-gray-500 italic">
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
                        {t("No payment receive data found")}
                      </div>
                    </td>
                  </tr>
                )
                  :
                  (currentPayments?.map((dt, index) => (
                    <tr key={dt.id} className="hover:bg-gray-50 transition-all border border-gray-200">
                      <td className="px-2 py-1 font-bold">{indexOfFirstItem + index + 1}.</td>
                      <td className="px-2 py-1">{dt.date ? tableFormatDate(dt.date) : ""}</td>
                      <td className="px-2 py-1">{dt.customer_name}</td>
                      <td className="px-2 py-1">{dt.branch_name}</td>
                      <td className="px-2 py-1">{dt.bill_ref}</td>
                      <td className="px-2 py-1">{dt.amount}</td>
                      <td className="px-2 py-1">{dt.cash_type}</td>
                      <td className="px-2 py-1">{dt.remarks}</td>
                      <td className="px-2 py-1">{dt.created_by}</td>
                      <td className="px-2 py-1">{dt.status}</td>
                      <td className="px-2 action_column">
                        <div className="flex gap-1">
                          <Link to={`/tramessy/account/update-PaymentReceiveForm/${dt.id}`}>
                            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                              <FaPen className="text-[12px]" />
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPaymentId(dt.id);
                              setIsOpen(true);
                            }}
                            className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                          >
                            <FaTrashAlt className="text-[12px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
            </tbody>
            {/*  মোট যোগফল row */}
            {currentPayments.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="5" className="text-right p-2">{t("Total")}:</td>
                  <td className="p-2">{totalAmount}</td>
                  <td colSpan="5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* pagination */}
        {currentPayments.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
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
                {t("Are you sure you want to delete?")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  {t("No")}
                </button>
                <button
                  onClick={() => handleDelete(selectedPaymentId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  {t("Yes")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReceive;