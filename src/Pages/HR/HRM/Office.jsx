import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { RiHomeOfficeLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Shared/Pagination";

const Office = () => {
  const [office, setOffice] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch office data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setOffice(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching office data:", error);
        setLoading(false);
      });
  }, []);
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/office/delete/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete office data");
      }
      // Remove office data from local list
      setOffice((prev) => prev.filter((office) => office.id !== id));
      toast.success("Office data deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedOfficeId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  if (loading) return <p className="text-center mt-16">Loading office...</p>;
  // search
  const filteredOfficeList = office.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return dt.branch_name?.toLowerCase().includes(term);
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = filteredOfficeList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(office.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };
  return (
    <div className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <RiHomeOfficeLine className="text-[#11375B] text-2xl" />
            Office
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/OfficeForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Office
              </button>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center">
          <div></div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Office..."
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
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Date</th>
                <th className="p-2">Branch</th>
                <th className="p-2">Address</th>
                 <th className="p-2">Opening Balance</th>
                <th className="p-2">Factory/CompanyName</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              { currentVehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No office found
                  </td>
                  </tr>)
              :(currentVehicles?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{dt.date}</td>
                  <td className="p-2">{dt.branch_name}</td>
                  <td className="p-2">{dt.address}</td>
                  <td className="p-2">{dt.opening_balance}</td>
                  <td className="p-2">{dt.factory_name}</td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/HR/HRM/UpdateOfficeForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedOfficeId(dt.id);
                          setIsOpen(true);
                        }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
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
        {currentVehicles.length > 0 && totalPages >= 1 && (
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
                Are you sure you want to delete this office?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedOfficeId)}
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

export default Office;
