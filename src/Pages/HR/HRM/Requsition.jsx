
import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { tableFormatDate } from "../../../hooks/formatDate";
import logo from "../../../assets/AJ_Logo.png"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Requisition = () => {
  const [requisition, setRequisition] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, empRes] = await Promise.all([
          api.get(`/requestion`),
          api.get(`/employee`),
        ]);
        if (reqRes.data?.success) setRequisition(reqRes.data.data);
        if (empRes.data?.success) {
          const activeEmployee = empRes?.data?.data?.filter(
            (employee) => employee.status?.toLowerCase() === "active"
          );
          setEmployee(activeEmployee);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/requestion/${id}`);
      setRequisition((prev) => prev.filter((item) => item.id !== id));
      toast.success("Requisition deleted successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to delete requisition!");
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  const filteredData = requisition.filter((item) => {
    const employeeName = getEmployeeName(item.employee_id)?.toLowerCase() || "";
    const purpose = item.purpose?.toLowerCase() || "";
    const amount = String(item.amount)?.toLowerCase() || "";

    return (
      employeeName.includes(searchTerm.toLowerCase()) ||
      purpose.includes(searchTerm.toLowerCase()) ||
      amount.includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // excel
  const exportExcel = () => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    const excelData = filteredData.map((item, index) => ({
      SL: index + 1,
      Date: tableFormatDate(item.date),
      Employee: getEmployeeName(item.employee_id),
      Purpose: item.purpose,
      Amount: Number(item.amount),
      Remarks: item.remarks,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requisition");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      file,
      `Requisition_List_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=600");

    const printContent = `
  <html>
    <head>
      <title>Requisition List</title>
      <style>
        @media print {
          @page {
            margin: 20mm;
          }

          body {
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Header repeat on every page */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
          }

          .header-space {
            height: 120px; /* Space for repeated header */
          }

          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .header-logo {
          width: 100px;
          text-align: left;
        }

        .header-logo img {
          width: 70px;
          height: auto;
        }

        .header-title {
          flex: 1;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 10px;
        }

        th, td {
          border: 1px solid #333;
          padding: 6px;
        }

        th {
          background: #f0f0f0;
        }
      </style>
    </head>

    <body>

      <!-- Repeatable Header -->
      <!-- Push Content Below Header -->
      <div class="header-space"></div>

      <h2 style="text-align:center; margin-top:0;">Requisition List</h2>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Employee</th>
            <th>Purpose</th>
            <th>Amount</th>
            <th>Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredData
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${getEmployeeName(item.employee_id)}</td>
              <td>${item.purpose}</td>
              <td>${item.amount}</td>
              <td>${item.remarks}</td>
              <td>${item.status}</td>
            </tr>
          `
        )
        .join("")}
        </tbody>
      </table>

    </body>
  </html>
  `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };



  return (
    <div className="p-2">
      <div className="overflow-x-auto bg-white shadow-lg rounded-md p-4 border border-gray-200 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            Requisition List
          </h1>
          <Link to="/tramessy/HR/advance-requisition-form">
            <button className="bg-gradient-to-r from-primary to-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow hover:scale-105 transition-all">
              <FaPlus /> Add Requisition
            </button>
          </Link>
        </div>
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            {/* <button
              onClick={exportPDF}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/*  */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Requisition..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-200 text-primary capitalize text-xs">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Date</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Remarks</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2">{indexOfFirst + index + 1}</td>
                  <td className="p-2">{tableFormatDate(item.date)}</td>
                  <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                  <td className="p-2">{item.purpose}</td>
                  <td className="p-2">{item.amount} ৳</td>
                  <td className="p-2">{item.remarks}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2 flex gap-2">
                    <div className="w-7">
                      {item.status === "Pending" && <Link to={`/tramessy/HR/update-advance-requisition/${item.id}`}>
                        <button className=" text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition bg-white shadow">
                          <FaPen size={12} />
                        </button>
                      </Link>}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setIsOpen(true);
                      }}
                      className=" text-red-500 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition bg-white shadow"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No requisition data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {currentItems.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000090] z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-72 relative">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-red-600"
            >
              <IoMdClose />
            </button>
            <div className="flex flex-col items-center text-center">
              <FaTrashAlt className="text-3xl text-red-500 mb-3" />
              <p className="mb-4">Are you sure you want to delete?</p>
              <div className="flex gap-3">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requisition;
