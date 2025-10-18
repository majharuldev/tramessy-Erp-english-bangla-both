import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaEye, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Pagination from "../components/Shared/Pagination";
import api from "../../utils/axiosConfig";
import { tableFormatDate } from "../hooks/formatDate";
const CarList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // get single driver info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    api
      .get(`/driver`)
      .then((response) => {
          setDrivers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading drivers...</p>;

  // delete by id
  const handleDelete = async (id) => {
  try {
    const response = await api.delete(`/driver/${id}`);

    // Remove driver from local list
    setDrivers((prev) => prev.filter((driver) => driver.id !== id));
    toast.success("Driver deleted successfully", {
      position: "top-right",
      autoClose: 3000,
    });

    setIsOpen(false);
    setSelectedDriverId(null);
  } catch (error) {
    console.error("Delete error:", error.response || error);
    toast.error("There was a problem deleting!", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};
  // view driver by id
  const handleView = async (id) => {
    try {
      const response = await api.get(
        `/driver/${id}`
      );
     
        setSelectedDriver(response.data);
        setViewModalOpen(true);
    } catch (error) {
      console.error("View error:", error);
      toast.error("There was a problem retrieving driver information.");
    }
  };
  // export functionality
  const exportDriversToExcel = () => {
    const tableData = filteredDriver.map((driver, index) => ({
      "SL.": indexOfFirstItem + index + 1,
      Name: driver.driver_name,
      Mobile: driver.driver_mobile,
      Address: driver.address,
      Emergency: driver.emergency_contact,
      License: driver.lincense,
      Expired: driver.expire_date,
      Status: driver.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "drivers_data.xlsx");
  };
  const exportDriversToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Name",
      "Mobile",
      "Address",
      "Emergency",
      "License",
      "Expired",
      "Status",
    ];

    const tableRows = filteredDriver.map((driver, index) => [
      indexOfFirstItem + index + 1,
      driver.driver_name,
      driver.driver_mobile,
      driver.address,
      driver.emergency_contact,
      driver.lincense,
      driver.expire_date,
      driver.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("drivers_data.pdf");
  };
 
  const printDriversTable = () => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  let printContent = `
    <html>
      <head>
        <title>Driver Report</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Driver Report</h2>
        <table>
          <thead>
            <tr>
                <th>Name</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Emergency Contact</th>
              <th>License</th>
              <th>License Expire Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDriver.map(d => `
              <tr>
               <td>${d.driver_name || ""}</td>
                  <td>${d.driver_mobile || ""}</td>
                  <td>${d.address || ""}</td>
                  <td>${d.emergency_contact || ""}</td>
                  <td>${d.lincense || ""}</td>
                  <td>${d.expire_date || ""}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};


  const filteredDriver = drivers.filter((driver) => {
    const term = searchTerm.toLowerCase();
    return (
      driver.driver_name?.toLowerCase().includes(term) ||
      driver.driver_mobile?.toLowerCase().includes(term) ||
      driver.nid?.toLowerCase().includes(term) ||
      driver.emergency_contact?.toLowerCase().includes(term) ||
      driver.address?.toLowerCase().includes(term) ||
      driver.lincense?.toLowerCase().includes(term) ||
      driver.status?.toLowerCase().includes(term)
    );
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = filteredDriver.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDriver.length / itemsPerPage);

  return (
    <main className=" p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-2xl" />
            Driver Information
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddDriverForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Add Driver
              </button>
            </Link>
          </div>
        </div>

        {/* Export */}
        <div className="md:flex justify-between mb-4">
          <div className="flex gap-1 text-gray-700 md:gap-3 flex-wrap">
            <button
              onClick={exportDriversToExcel}
              className="py-1 px-5 bg-white shadow font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Excel
            </button>

            {/* <button
              onClick={exportDriversToPDF}
              className="py-1 px-5 bg-white shadow  font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              PDF
            </button> */}

            <button
              onClick={printDriversTable}
              className="py-1 px-5 bg-white shadow font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Print
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
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

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">SL.</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Mobile</th>
                <th className="px-2 py-4 w-40 ">Address</th>
                {/* <th className="p-2">OpeningBalance</th> */}
                <th className="px-2 py-4">License</th>
                <th className="px-2 py-4">Expired</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 ">
              { currentDrivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No Driver found
                  </td>
                  </tr>)
              :(currentDrivers?.map((driver, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{driver.driver_name}</td>
                  <td className="p-2">{driver.driver_mobile}</td>
                  <td className="p-2 ">{driver.address}</td>
                  {/* <td className="p-2">{driver.opening_balance}</td> */}
                  <td className="p-2">{driver.lincense}</td>
                  <td className="p-2">{tableFormatDate(driver.expire_date)}</td>
                  <td className="p-2">
                    <span className="text-green-700 bg-green-50 px-3 py-1 rounded-md text-xs font-medium">
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/UpdateDriverForm/${driver.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleView(driver.id)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaEye className="text-[12px]" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDriverId(driver.id);
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
          </table>
        </div>
        {/* Pagination */}
      {currentDrivers.length > 0 && totalPages >= 1 && (
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
                Are you sure you want to delete this driver?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedDriverId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Driver Info Modal */}
      {viewModalOpen && selectedDriver && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">
          <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
            <h3 className="text-primary font-semibold text-base">
              Driver Information
            </h3>
            <div className="mt-5">
              <ul className="flex border border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Name:</p>{" "}
                  <p>{selectedDriver.driver_name||"N/A"}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">Mobile:</p>{" "}
                  <p>{selectedDriver.driver_mobile||"N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Emergency Contact:</p>{" "}
                  <p>{selectedDriver.emergency_contact?selectedDriver.emergency_contact:"N/A"}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">Address:</p>{" "}
                  <p>{selectedDriver.address||"N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">NID:</p> <p>{selectedDriver.nid||"N/A"}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">License:</p>{" "}
                  <p>{selectedDriver.lincense||"N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">License Expiry:</p>{" "}
                  <p>{tableFormatDate(selectedDriver.expire_date||"N/A")}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">Note:</p>{" "}
                  <p>{selectedDriver.note || "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Opening Balance:</p> <p>{selectedDriver.opening_balance? selectedDriver.opening_balance: 0}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Status:</p> <p>{selectedDriver.status||"N/A"}</p>
                </li>
              </ul>
              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-primary/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CarList;
