import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { MdShop } from "react-icons/md";
import { Link } from "react-router-dom";
import Pagination from "../../components/Shared/Pagination";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../hooks/formatDate";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SupplierList = () => {
  const [supply, setSupply] = useState([]);
  const [loading, setLoading] = useState(true);
  // search state
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplyId, setSelectedSupplyId] = useState(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // get single driver info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  useEffect(() => {
    api
      .get(`/supplier`)
      .then((response) => {
        if (response.data.success) {
          setSupply(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching payment data:", error);
        setLoading(false);
      });
  }, []);

  // filtered
  const filteredSupply = supply.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return (
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.phone?.toLowerCase().includes(term) ||
      dt.address?.toLowerCase().includes(term) ||
      dt.status?.toLowerCase().includes(term)
    );
  });

  // delete by id
  const handleDelete = async (id) => {
  try {
    const response = await api.delete(`/supplier/${id}`);

    // Remove driver from local list
    setSupply((prev) => prev.filter((driver) => driver.id !== id));
    toast.success("Supplier deleted successfully", {
      position: "top-right",
      autoClose: 3000,
    });

    setIsOpen(false);
    setSelectedSupplyId(null);
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
        `/supplier/${id}`
      );
      if (response.data.success) {
        setSelectedSupply(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Driver information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("There was a problem retrieving driver information.");
    }
  };

    // excel
   const exportExcel = () => {
  if (!filteredSupply || filteredSupply.length === 0) {
    toast.error("No data to export!");
    return;
  }

  const data = filteredSupply.map((dt, index) => ({
    "SL": index + 1,
    "Date": tableFormatDate(dt.created_at),
    "Supplier": dt.supplier_name,
    "Business Category": dt.business_category,
    "Phone": dt.phone,
    "Address": dt.address,
    "Opening Balance": dt.opening_balance,
    "Status": dt.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Suppliers");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(
    file,
    `Supplier_List_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
    // print
    const printTable = () => {
  if (!filteredSupply || filteredSupply.length === 0) {
    toast.error("No data to print!");
    return;
  }

  const tableHeader = `
    <thead>
      <tr>
        <th>SL</th>
        <th>Date</th>
        <th>Supplier</th>
        <th>Business Category</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Opening Balance</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

  const tableRows = filteredSupply
    .map(
      (dt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${tableFormatDate(dt.created_at)}</td>
        <td>${dt.supplier_name}</td>
        <td>${dt.business_category}</td>
        <td>${dt.phone}</td>
        <td>${dt.address}</td>
        <td>${dt.opening_balance}</td>
        <td>${dt.status}</td>
      </tr>
    `
    )
    .join("");

  const WinPrint = window.open("", "", "width=1000,height=650");

  WinPrint.document.write(`
    <html>
      <head>
        <title>Supplier List</title>
        <style>
          @media print {
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
          }

          body {
            font-family: Arial, sans-serif;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }

          th {
            background: #f2f2f2;
          }
        </style>
      </head>

      <body>
        <table>
          ${tableHeader}
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
};

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSupplier = filteredSupply.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSupply.length / itemsPerPage);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;
  return (
    <div className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <MdShop className="text-gray-800 text-2xl" />
            Supplier List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/Purchase/AddSupply">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Supplier
              </button>
            </Link>
          </div>
        </div>
        <div className="flex justify-between">
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
          <div className="mt-3 md:mt-0 ">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by  ..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-7 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Date</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Business Category</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Address</th>
                <th className="p-2">Opening Balance</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentSupplier.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No supplier found
                  </td>
                </tr>)
                : (currentSupplier?.map((dt, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">
                      {indexOfFirstItem + index + 1}.
                    </td>
                    <td className="p-2">{tableFormatDate(dt.created_at)}</td>
                    <td className="p-2">{dt.supplier_name}</td>
                    <td className="p-2">{dt.business_category}</td>
                    <td className="p-2">{dt.phone}</td>
                    <td className="p-2">{dt.address}</td>
                    <td className="p-2">{dt.opening_balance}</td>
                    <td className="p-2">{dt.status}</td>
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/UpdateSupplyForm/${dt.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleView(dt.id)}
                          className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                        >
                          <FaEye className="text-[12px]" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSupplyId(dt.id);
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
        {/* pagination */}
        {currentSupplier.length > 0 && totalPages >= 1 && (
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
                Are you sure you want to delete this supplier?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedSupplyId)}
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
      {viewModalOpen && selectedSupply && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
          <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
            <h3 className="text-primary font-semibold text-base">
              Supply Information
            </h3>
            <div className="mt-5">
              <ul className="flex border border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Supplier Name:</p>{" "}
                  <p>{selectedSupply?.supplier_name}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">Phone:</p> <p>{selectedSupply.phone}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Address:</p>{" "}
                  <p>{selectedSupply.address}</p>
                </li>
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2">
                  <p className="w-48">Status:</p> <p>{selectedSupply.status}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-gray-700 font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Business Category:</p>{" "}
                  <p>{selectedSupply.business_category}</p>
                </li>

              </ul>
              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
