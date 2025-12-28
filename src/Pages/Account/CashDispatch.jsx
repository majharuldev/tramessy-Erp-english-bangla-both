import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEye, FaFileExcel, FaFilter, FaPen, FaPrint, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import Pagination from "../../components/Shared/Pagination";
import api from "../../../utils/axiosConfig";
import DatePicker from "react-datepicker";
import { tableFormatDate } from "../../hooks/formatDate";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import toNumber from "../../hooks/toNumber";
import { useTranslation } from "react-i18next";

const CashDispatch = () => {
  const { t } = useTranslation();
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef();

  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFundTransferId, setSelectedFundTransferId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch office data
  useEffect(() => {
    api
      .get(`/fundTransfer`)
      .then((response) => {
        if (response.data.status = "Success") {
          const data = response.data.data;
          setAccount(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching account data:", error);
        setLoading(false);
      });
  }, []);

  // filtered search by date
  // const filteredAccounts = useMemo(() => {
  //   return account.filter((item) => {
  //     if (!item.date) return false;
  //     // Convert API date string safely to Date
  //     const itemDate = new Date(item.date);
  //     if (isNaN(itemDate)) return false;

  //     // If only startDate is set
  //     if (startDate && !endDate) {
  //       return (
  //         itemDate.toDateString() === startDate.toDateString()
  //       );
  //     }

  //     // If only endDate is set
  //     if (!startDate && endDate) {
  //       return (
  //         itemDate.toDateString() === endDate.toDateString()
  //       );
  //     }

  //     // If both are set (range)
  //     if (startDate && endDate) {
  //       return (
  //         (isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) &&
  //         (isBefore(itemDate, endDate) || isEqual(itemDate, endDate))
  //       );
  //     }

  //     // No filter → include all
  //     return true;
  //   });
  // }, [account, startDate, endDate]);
  const filteredAccounts = useMemo(() => {
    return account.filter((item) => {
      const itemDate = new Date(item.date);
      if (isNaN(itemDate)) return false;

      // Date filtering
      if (startDate && !endDate) {
        if (itemDate.toDateString() !== startDate.toDateString()) return false;
      }
      if (!startDate && endDate) {
        if (itemDate.toDateString() !== endDate.toDateString()) return false;
      }
      if (startDate && endDate) {
        if (
          !(isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) ||
          !(isBefore(itemDate, endDate) || isEqual(itemDate, endDate))
        ) {
          return false;
        }
      }

      // Text search (by name, branch, type, etc.)
      const search = searchTerm.toLowerCase();
      if (search) {
        return (
          item?.person_name?.toLowerCase().includes(search) ||
          item?.branch_name?.toLowerCase().includes(search) ||
          item?.type?.toLowerCase().includes(search) ||
          item?.bank_name?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [account, startDate, endDate, searchTerm]);

  // Excel export (filtered data only)
const exportExcel = async () => {
  try {
    if (!filteredAccounts.length) {
      toast.error("No data available to export!");
      return;
    }

    // Dynamically import XLSX (no need to import globally)
    const XLSX = await import("xlsx");

    // Map filtered data to a clean format for Excel
    const excelData = filteredAccounts.map((item, index) => ({
      SL: index + 1,
      Date: item.date ? format(new Date(item.date), "dd/MM/yyyy") : "",
      Branch: item.branch_name || "",
      PersonName: item.person_name || "",
      Type: item.type || "",
      Amount: toNumber(item.amount) || "",
      BankName: item.bank_name || "",
    }));

    // Create worksheet & workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FundTransfer");

    // Add total row at bottom
    const total = filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalRow = [
      { SL: "", Date: "", Branch: "", PersonName: "", Type: "Total", Amount: total, BankName: "" },
    ];
    XLSX.utils.sheet_add_json(ws, totalRow, { skipHeader: true, origin: -1 });

    // Auto-fit column widths
    const colWidths = Object.keys(excelData[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...excelData.map((item) => String(item[key] || "").length),
        10
      ),
    }));
    ws["!cols"] = colWidths;

    // Save file
    XLSX.writeFile(wb, "FundTransfer_Report.xlsx");
    toast.success("Excel file exported successfully!");
  } catch (error) {
    console.error("Excel export failed:", error);
    toast.error("Failed to export Excel file!");
  }
};


  // handle print
  const handlePrint = () => {
    // Use the filteredAccounts (all filtered data, not currentCash page)
    const rowsHtml = filteredAccounts.map((dt, idx) => {
      // safe date formatting
      let dateStr = "";
      try {
        const d = new Date(dt.date);
        if (!isNaN(d)) {
          // using date-fns format if available in scope; otherwise fallback
          // you have `format` imported already at top of file
          dateStr = format(d, "dd/MM/yyyy");
        }
      } catch (e) {
        dateStr = "";
      }

      return `
      <tr style="border:1px solid #e5e7eb;">
        <td style="padding:8px; font-weight:600;">${idx + 1}</td>
        <td style="padding:8px;">${dateStr}</td>
        <td style="padding:8px;">${dt.branch_name ?? ""}</td>
        <td style="padding:8px;">${dt.person_name ?? ""}</td>
        <td style="padding:8px;">${dt.type ?? ""}</td>
        <td style="padding:8px; text-align:right;">${dt.amount ?? ""}</td>
        <td style="padding:8px;">${dt.bank_name ?? ""}</td>
        <!-- Action column intentionally omitted -->
      </tr>
    `;
    }).join("");

    const totalFiltered = filteredAccounts.reduce((s, it) => s + Number(it.amount || 0), 0);

    const tableHtml = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("SL.")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Date")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Branch")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Person Name")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Type")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Amount")}</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">${t("Bank Name")}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="7" style="padding:12px; text-align:center; color:#6b7280;">No data</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="padding:10px; text-align:right; font-weight:700;">Total:</td>
          <td style="padding:10px; text-align:right; font-weight:700;">${totalFiltered}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <!-- Tailwind CDN (keeps the look similar). If you use a custom build, include that instead -->
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; color:#111827; }
          table { border-collapse: collapse; width: 100%; }
          th { background:#f3f4f6; color:#047857; text-transform: capitalize; }
          @media print {
            /* hide anything you don't want in print by adding .no-print class in your app */
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <h1 style="font-size:18px; margin-bottom:8px;">${t("Fund Transfer")} ${t("Report")}</h1>
        <div style="margin-bottom:10px; color:#374151;">Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}</div>
        ${tableHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();

    // wait a tick for resources to load then print
    setTimeout(() => {
      printWindow.print();
      // optionally close window after printing:
      // printWindow.close();
    }, 300);
  };

  // total amount calculation
  const totalAmount = useMemo(() => {
    return filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredAccounts]);

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/fundTransfer/${id}`);

      // Remove driver from local list
      setAccount((prev) => prev.filter((account) => account.id !== id));
      toast.success("Fund Transfer deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedFundTransferId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCash = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  if (loading) return <p className="text-center mt-16">Loading...</p>;
  return (
    <div className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-gray-800 text-2xl" />
            {t("Fund Transfer")}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="md:mt-0 flex gap-2">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> {t("Filter")}
              </button>
            </div>
            <Link to="/tramessy/account/CashDispatchForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> {t("Dispatch")}
              </button>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center">
         <div className="flex items-center gap-5">
           <button
            onClick={exportExcel}
            className="py-1 px-5 bg-white shadow rounded hover:bg-primary hover:text-white flex items-center gap-2"
          >
            <FaFileExcel /> {t("Excel")}
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
              placeholder={`${t("search")}...`}
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
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 space-y-2 md:space-y-0">
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


            <div className=" ">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-primary to-primary text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter /> {t("Clear")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-md">
          <table ref={printRef} className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">{t("SL.")}</th>
                <th className="px-2 py-4">{t("Date")}</th>
                <th className="px-2 py-4">{t("Branch")}</th>
                <th className="px-2 py-4">{t("Person Name")}</th>
                <th className="px-2 py-4">{t("Type")}</th>
                <th className="px-2 py-4">{t("Amount")}</th>
                <th className="px-2 py-4">{t("Bank Name")}</th>
                {/* <th className="p-2">Ref</th> */}
                <th className="p-2">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentCash.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    {t("No cash found")}
                  </td>
                </tr>
              )
                : (currentCash?.map((dt, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirstItem + i + 1}</td>
                    {tableFormatDate(dt.date)}
                    <td className="p-2">{dt.branch_name}</td>
                    <td className="p-2">{dt.person_name}</td>
                    <td className="p-2">{dt.type}</td>
                    <td className="p-2">{dt.amount}</td>
                    <td className="p-2">{dt.bank_name}</td>
                    {/* <td className="p-2">{dt.ref}</td> */}
                    <td className="p-2 action_column">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/account/update-CashDispatch/${dt.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        {/* <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaEye className="text-[12px]" />
                      </button>*/}
                        <button
                          onClick={() => {
                            setSelectedFundTransferId(dt.id);
                            setIsOpen(true);
                          }}
                          className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                        >
                          <FaTrashAlt className="text-[12px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))
              }
            </tbody>
            {currentCash.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="5" className="p-2 text-right">{t("Total")}:</td>
                  <td className="p-2">{totalAmount}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* pagination */}
        {currentCash.length > 0 && totalPages >= 1 && (
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
                  onClick={() => handleDelete(selectedFundTransferId)}
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

export default CashDispatch;
