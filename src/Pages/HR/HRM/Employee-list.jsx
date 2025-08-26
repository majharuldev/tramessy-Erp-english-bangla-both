import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Shared/Pagination";

const EmployeeList = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
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
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => {
        if (response.data.status === "Success") {
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
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/employee/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      // Remove employee from local list
      setEmployee((prev) => prev.filter((dt) => dt.id !== id));
      toast.success("Employee deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsOpen(false);
      setSelectedEmployeeId(null);
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
    return dt.full_name?.toLowerCase().includes(term);
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
  const totalPages = Math.ceil(employee.length / itemsPerPage);
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
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Employee List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/AddEmployee">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Employee
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
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="px-2 py-1">SL.</th>
                <th className="px-2 py-1">Image</th>
                <th className="px-2 py-1">FullName</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">JoinDate</th>
                <th className="px-2 py-1">Designation</th>
                <th className="px-2 py-1">Mobile</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              {
                currentEmployee.length === 0 ? (
                  <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No Employee found
                  </td>
                  </tr>)
              :(currentEmployee?.map((dt, index) => {
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
                        src={`${import.meta.env.VITE_BASE_URL}/public/uploads/employee/${dt.image}`}
                        alt=""
                        className="w-20 h-20 rounded-full"
                      />
                    </td>
                    <td className="px-2 py-1">{dt.full_name}</td>
                    <td className="px-2 py-1">{dt.email}</td>
                    <td className="px-2 py-1">{dt.join_date}</td>
                    <td className="px-2 py-1">{dt.designation}</td>
                    <td className="px-2 py-1">{dt.mobile}</td>
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/UpdateEmployeeForm/${dt.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                          // onClick={() => handleView(driver.id)}
                          className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                        >
                          <FaEye className="text-[12px]" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployeeId(dt.id);
                            setIsOpen(true);
                          }}
                          className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
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
    </div>
  );
};

export default EmployeeList;
