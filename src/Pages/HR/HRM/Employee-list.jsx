import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Shared/Pagination";
import api from "../../../../utils/axiosConfig";
import { tableFormatDate } from "../../../hooks/formatDate";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toNumber from "../../../hooks/toNumber";

const EmployeeList = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setViewModal(true);
  };
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  // const [searchTerm, setSearchTerm] = useState("");
  // Fetch trips data
  useEffect(() => {
    api
      .get(`/employee`)
      .then((response) => {
        if (response.data.success) {
          setEmployee(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/employee/${id}`);

      // Axios er jonno check
      if (response.status === 200) {
        // UI update
        setEmployee((prev) => prev.filter((item) => item.id !== id));
        toast.success("Employee deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsOpen(false);
        setSelectedEmployeeId(null);
      } else {
        throw new Error("Delete request failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // search
  const filteredEmployeeList = employee.filter((dt) => {
    const term = searchTerm.toLowerCase();

    // dt.full_name?.toLowerCase().includes(term) ||
    return dt.email?.toLowerCase().includes(term) ||
      dt.mobile?.toLowerCase().includes(term);
  });
  if (loading) return <p className="text-center mt-16">Loading employee...</p>;
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployee = filteredEmployeeList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployeeList.length / itemsPerPage);

  // excel
  const exportExcel = () => {
  if (!filteredEmployeeList || filteredEmployeeList.length === 0) {
    toast.error("No data to export!");
    return;
  }

  const data = filteredEmployeeList.map((dt, index) => ({
    SL: index + 1,
    FullName: dt.employee_name,
    Email: dt.email,
    JoinDate: tableFormatDate(dt.join_date),
    Designation: dt.designation,
    Mobile: dt.mobile,
    NID: dt.nid,
    Gender: dt.gender,
    "Blood Group" : dt.blood_group,
    "Basic Salary": toNumber(dt.basic),
    "House Rent": toNumber(dt.house_rent),
    "Alowance": dt.allowan,
    Conveance: toNumber(dt.conv),
    Medical: toNumber(dt.medical),
    Status: dt.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const file = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(file, `EmployeeList_${new Date().toISOString().slice(0,10)}.xlsx`);
};
  // print
  const printTable = () => {
  const filteredData = filteredEmployeeList; // all filtered employees

  if (!filteredData || filteredData.length === 0) {
    toast.error("No data to print!");
    return;
  }

  const tableHeader = `
    <thead>
      <tr>
        <th>SL.</th>
        <th>FullName</th>
        <th>Email</th>
        <th>JoinDate</th>
        <th>Designation</th>
        <th>Mobile</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

  const tableRows = filteredData
    .map(
      (dt, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${dt.employee_name}</td>
      <td>${dt.email}</td>
      <td>${tableFormatDate(dt.join_date)}</td>
      <td>${dt.designation}</td>
      <td>${dt.mobile}</td>
      <td>${dt.status}</td>
    </tr>`
    )
    .join("");

  const printContent = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse;">
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const WinPrint = window.open("", "", "width=900,height=650");
  WinPrint.document.write(`
    <html>
    <head>
      <title>-</title>
      <style>
        body { font-family: Arial, sans-serif; }

        .print-container {
          display: table;
          width: 100%;
        }

        .print-header {
          display: table-header-group;
        }

        .header {
          width: 100%;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; }
        thead th {
         
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>

    <body>
      <div class="print-container">

        <div class="print-header">
          <div class="header">
          <div></div>
            <div>
              <h2>M/S A J ENTERPRISE</h2>
              <div>Razzak Plaza, 11th Floor, Room J-12<br/>Moghbazar, Dhaka-1217</div>
            </div>
            <div></div>
          </div>
        </div>

        <div class="content">
          <h3 style="text-align:center;">Employee List</h3>
          ${printContent}
        </div>

      </div>
    </body>
    </html>
  `);
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
};


  return (
    <div className=" p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-2xl" />
            Employee Information
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/AddEmployee">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Employee
              </button>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            {/* <button
              onClick={exportPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
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
              placeholder="Search Employee..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-7 top-[6rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">SL.</th>
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">FullName</th>
                <th className="px-2 py-4">Email</th>
                <th className="px-2 py-4">JoinDate</th>
                <th className="px-2 py-4">Designation</th>
                <th className="px-2 py-4">Mobile</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 ">
              {
                currentEmployee.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
                      No Employee found
                    </td>
                  </tr>)
                  : (currentEmployee?.map((dt, index) => {
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-all border border-gray-200"
                      >
                        <td className="px-2 py-1 font-bold">
                          {indexOfFirstItem + index + 1}.
                        </td>
                        <td className="px-2 py-1">
                          <img
                            src={`https://ajenterprise.tramessy.com/backend/uploads/employee/${dt.image}`}
                            alt=""
                            className="w-20 h-20 rounded-full"
                          />
                        </td>
                        <td className="px-2 py-1">{dt.employee_name}</td>
                        <td className="px-2 py-1">{dt.email}</td>
                        <td className="px-2 py-1">{tableFormatDate(dt.join_date)}</td>
                        <td className="px-2 py-1">{dt.designation}</td>
                        <td className="px-2 py-1">{dt.mobile}</td>
                        <td className="px-2 py-1">{dt.status}</td>
                        <td className="px-2 action_column">
                          <div className="flex gap-1">
                            <Link to={`/tramessy/UpdateEmployeeForm/${dt.id}`}>
                              <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                                <FaPen className="text-[12px]" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleView(dt)}
                              className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                            >
                              <FaEye className="text-[12px]" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmployeeId(dt.id);
                                setIsOpen(true);
                              }}
                              className="text-red-500 hover:text-white hover:bg-red-500 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                            >
                              <FaTrashAlt className="text-[12px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentEmployee.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}

      </div>
      {/* Delete modal */}
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
                Do you want to delete the employee?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedEmployeeId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* view modal */}
      {viewModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-[700px] max-w-3xl border border-gray-300">
            <button
              onClick={() => setViewModal(false)}
              className="text-2xl absolute top-2 right-2 text-white bg-gray-200 hover:bg-red-700 cursor-pointer rounded-sm"
            >
              <IoMdClose />
            </button>

            <h2 className="text-xl font-bold text-center text-primary mb-4">
              Employee Details
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  selectedEmployee.image
                    ? `https://ajenterprise.tramessy.com/backend/uploads/employee/${selectedEmployee.image}`
                    : "https://i.ibb.co.com/CsSbwNvk/download.png"
                }
                // src="https://i.ibb.co.com/CsSbwNvk/download.png"
                alt={selectedEmployee.employee_name || "Employee"}
                className="w-24 h-24 rounded-full border"
              />
              <div>
                <p><span className="font-semibold">Name:</span> {selectedEmployee.employee_name}</p>
                <p><span className="font-semibold">Email:</span> {selectedEmployee.email}</p>
                <p><span className="font-semibold">Mobile:</span> {selectedEmployee.mobile}</p>
                <p><span className="font-semibold">Designation:</span> {selectedEmployee.designation}</p>
                <p><span className="font-semibold">Join Date:</span> {tableFormatDate(selectedEmployee.join_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* <p><span className="font-semibold">Branch:</span> {selectedEmployee.branch_name}</p> */}
              <p><span className="font-semibold">Gender:</span> {selectedEmployee.gender}</p>
              <p><span className="font-semibold">Blood Group:</span> {selectedEmployee.blood_group}</p>
              <p><span className="font-semibold">NID:</span> {selectedEmployee.nid}</p>
              <p><span className="font-semibold">Basic Salary:</span> {selectedEmployee.basic || "N/A"}</p>
              <p><span className="font-semibold">House Rent:</span> {selectedEmployee.house_rent || "N/A"}</p>
              <p><span className="font-semibold">Conveyance:</span> {selectedEmployee.conv || "N/A"}</p>
              <p><span className="font-semibold">Medical:</span> {selectedEmployee.medical || "N/A"}</p>
              <p><span className="font-semibold">Allowance:</span> {selectedEmployee.allowan || "N/A"}</p>
              <p><span className="font-semibold">Status:</span> {selectedEmployee.status}</p>
              <p><span className="font-semibold">Created By:</span> {selectedEmployee.created_by || "N/A"}</p>
              <p><span className="font-semibold">Created At:</span> {new Date(selectedEmployee.created_at).toLocaleString()}</p>
              <p><span className="font-semibold">Updated At:</span> {new Date(selectedEmployee.updated_at).toLocaleString()}</p>
            </div>

            <p className="mt-4"><span className="font-semibold">Address:</span> {selectedEmployee.address}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeList;
