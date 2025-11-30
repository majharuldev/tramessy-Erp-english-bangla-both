// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   FaTruck,
//   FaPlus,
//   FaFilter,
//   FaEye,
//   FaTrashAlt,
//   FaPen,
// } from "react-icons/fa";
// import { IoIosRemoveCircle, IoMdClose } from "react-icons/io";
// import { Link } from "react-router-dom";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import Pagination from "../components/Shared/Pagination";
// import { BiPrinter } from "react-icons/bi";
// import useAdmin from "../hooks/useAdmin";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import ChallanInvoicePrint from "../components/modal/ChallanInvoicePrint";
// import { useReactToPrint } from "react-to-print";
// import api from "../../utils/axiosConfig";
// import { formatDate } from "../hooks/formatDate";
// import DatePicker from "react-datepicker";
// import { FiFilter } from "react-icons/fi";
// const TripList = () => {
//   const [trip, setTrip] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showFilter, setShowFilter] = useState(false);
//   const isAdmin = useAdmin()
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const printRef = useRef();
//   // delete modal
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedTripId, setselectedTripId] = useState(null);
//   const toggleModal = () => setIsOpen(!isOpen);
//   // Date filter state
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   // get single trip info by id
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedTrip, setselectedTrip] = useState(null);
//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   // search
//   const [searchTerm, setSearchTerm] = useState("");

//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState("");

//   // Inside your component, modify the state and refs
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [showApproveConfirm, setShowApproveConfirm] = useState(false);
//   const [tripToApprove, setTripToApprove] = useState(null);
//   const dropdownRefs = useRef({});
//   // Transport type filter
//   const [transportType, setTransportType] = useState("");

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Check if click is inside any dropdown
//       const dropdownElements = document.querySelectorAll('.dropdown-menu');
//       let isInsideDropdown = false;

//       dropdownElements.forEach(element => {
//         if (element.contains(event.target)) {
//           isInsideDropdown = true;
//         }
//       });

//       // Check if click is on a toggle button
//       const isToggleButton = event.target.closest('button') &&
//         (event.target.closest('button').textContent === '•••' ||
//           event.target.closest('button').querySelector('svg'));

//       if (!isInsideDropdown && !isToggleButton) {
//         setOpenDropdown(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Toggle dropdown function
//   const toggleDropdown = (index) => {
//     setOpenDropdown(openDropdown === index ? null : index);
//   };

//  // Handle approve confirmation
//   const handleApproveClick = (trip) => {
//     console.log("Approve button clicked for trip:", trip.id)
//     setTripToApprove(trip)
//     setShowApproveConfirm(true)
//     setOpenDropdown(null)
//   }

//     const confirmApprove = async () => {
//   if (!tripToApprove) return toast.error("No trip selected for approval");

//   setIsApproving(true);

//   try {
//     // Spread all existing trip data and override status
//     const payload = {
//       ...tripToApprove,
//       status: "Approved",
//       user_id: tripToApprove.user_id || null,
//     };

//     const response = await api.put(`/trip/${tripToApprove.id}`, payload);

//     if (response.data.success) {
//       setTrip((prevTrips) =>
//         prevTrips.map((t) => (t.id === tripToApprove.id ? { ...t, status: "Approved" } : t))
//       );
//       toast.success(`Trip #${tripToApprove.id} approved successfully!`);
//     } else {
//       toast.error(response.data.message || "Failed to approve trip");
//     }
//   } catch (error) {
//     console.error("Approve error:", error);
//     toast.error(error.response?.data?.message || "Something went wrong");
//   } finally {
//     setIsApproving(false);
//     setShowApproveConfirm(false);
//     setTripToApprove(null);
//   }
// };

//   // Cancel approve
//   const cancelApprove = () => {
//     setShowApproveConfirm(false)
//     setTripToApprove(null)
//     setIsApproving(false)
//   }


//   useEffect(() => {
//     // Fetch customers data
//     api
//       .get(`/customer`)
//       .then((response) => {
//         // if (response.data.success) {
//         setCustomers(response.data);
//         // }
//       })
//       .catch((error) => {
//         console.error("Error fetching customers:", error);
//       });
//   }, []);

//   // challan print func
//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: "Invoice Print",
//     onAfterPrint: () => {
//       console.log("Print completed")
//       setSelectedInvoice(null)
//     },
//     onPrintError: (error) => {
//       console.error("Print error:", error)
//     },
//   })

//   const handlePrintClick = (tripData) => {
//     const formatted = {
//       voucherNo: tripData.id,
//       receiver: tripData.customer,
//       address: tripData.unload_point,
//       truckNo: tripData.vehicle_no,
//       dln: tripData.date,
//       driverName: tripData.driver_name,
//       loadingPoint: tripData.load_point,
//       unloadingPoint: tripData.unload_point,
//       rent: tripData.total_rent,
//       loadingDemurrage: tripData.labor,
//       inTime: tripData.start_date,
//       outTime: tripData.end_date,
//       totalDemurrage: tripData.labor,
//       others: tripData.remarks || "N/A",
//       productDetails: tripData?.product_details
//     }

//     setSelectedInvoice(formatted)

//     // Use setTimeout to ensure the component is rendered before printing
//     setTimeout(() => {
//       handlePrint()
//     }, 100)
//   }

//   // Fetch trips data
//   useEffect(() => {
//     api
//       .get(`/trip`)
//       .then((response) => {
//         // if (response.data.status === "Success") {
//         setTrip(response.data);
//         // }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching trip data:", error);
//         setLoading(false);
//       });
//   }, []);
//   if (loading) return <p className="text-center mt-16">Loading trip...</p>;

//   // excel
//   const exportTripsToExcel = () => {
//     const tableData = filteredTrips.map((dt, index) => ({
//       "SL.": index + 1,
//       Date: dt.date,
//       "Driver Name": dt.driver_name || "N/A",
//       "Driver Mobile": dt.driver_mobile || "N/A",
//       Commission: dt.driver_commission || "0",
//       "Load Point": dt.load_point,
//       "Unload Point": dt.unload_point,
//       "Trip Cost": dt.total_exp || 0,
//       "Trip Fare": dt.total_rent || 0,
//       "Total Profit":
//         parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(tableData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });

//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, "trip_report.xlsx");
//   };
//   // pdf
//   const exportTripsToPDF = () => {
//     const doc = new jsPDF("landscape");

//     const tableColumn = [
//       "SL.",
//       "Date",
//       "Driver Name",
//       "Mobile",
//       "Commission",
//       "Load Point",
//       "Unload Point",
//       "Trip Cost",
//       "Trip Rent",
//       "Profit",
//     ];

//     const tableRows = filteredTrips.map((dt, index) => [
//       index + 1,
//       dt.date,
//       dt.driver_name || "N/A",
//       dt.driver_mobile || "N/A",
//       dt.driver_commission || "0",
//       dt.load_point,
//       dt.unload_point,
//       dt.total_exp || "0",
//       dt.total_rent || "0",
//       parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
//     ]);

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//       styles: {
//         fontSize: 10,
//       },
//       headStyles: {
//         fillColor: [17, 55, 91],
//         textColor: [255, 255, 255],
//       },
//       alternateRowStyles: {
//         fillColor: [240, 240, 240],
//       },
//       theme: "grid",
//     });

//     doc.save("trip_report.pdf");
//   };
//   // print
//   const printTripsTable = () => {
//     // Hide action column for printing
//     const actionColumns = document.querySelectorAll(".action_column");
//     actionColumns.forEach((col) => (col.style.display = "none"));

//     let tableHTML = `
//     <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
//       <thead style="background:#11375B; color:white;">
//         <tr>
//           <th>SL.</th>
//           <th>StartDate</th>
//           <th>EndDate</th>
//           <th>customer</th>
//           <th>Driver</th>
//           <th>VehicleNo</th>
//           <th>Commiss.</th>
//           <th>LoadPoint</th>
//           <th>UnloadPoint</th>
//           <th>TripCost</th>
//           <th>TripRent</th>
//           <th>Profit</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${filteredTrips.map((dt, index) => `
//           <tr>
//             <td>${index + 1}</td>
//             <td>${dt.start_date}</td>
//             <td>${dt.end_date}</td>
//             <td>${(dt.customer || "N/A") + " " + (dt.transport_type || "")}</td>
//             <td>${dt.driver_name || "N/A"}</td>
//             <td>${dt.vehicle_no || "N/A"}</td>
//             <td>${dt.driver_commission || "0"}</td>
//             <td>${dt.load_point}</td>
//             <td>${dt.unload_point}</td>
//             <td>${dt.total_exp || 0}</td>
//             <td>${dt.total_rent || 0}</td>
//             <td>${parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0)}</td>
//           </tr>
//         `).join("")}
//       </tbody>
//     </table>
//   `;

//     const WinPrint = window.open("", "", "width=900,height=650");
//     WinPrint.document.write(`
//     <html>
//       <head>
//         <title>Print Trip Report</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           table { width: 100%; border-collapse: collapse; }
//           th, td { border: 1px solid #000; padding: 5px; text-align: left; }
//         </style>
//       </head>
//       <body>
//         <h3>Trip Report</h3>
//         ${tableHTML}
//       </body>
//     </html>
//   `);

//     WinPrint.document.close();
//     WinPrint.focus();
//     WinPrint.print();
//     WinPrint.close();

//     // Restore action columns
//     actionColumns.forEach((col) => (col.style.display = ""));
//   };


//   // delete by id
//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BASE_URL}/trip/delete/${id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete driver");
//       }
//       // Remove trip from local list
//       setTrip((prev) => prev.filter((trip) => trip.id !== id));
//       toast.success("Trip deleted successfully", {
//         position: "top-right",
//         autoClose: 3000,
//       });

//       setIsOpen(false);
//       setselectedTripId(null);
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error("There was a problem deleting!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     }
//   };
//   // view trip by id
//   const handleView = async (id) => {
//     try {
//       const response = await api.get(
//         `/trip/${id}`
//       );
//       setselectedTrip(response.data);
//       setViewModalOpen(true);
//     } catch (error) {
//       console.error("View error:", error);
//       toast.error("Can't get trip details");
//     }
//   };

//   // Sort trips by date descending (latest first)
//   const sortedTrips = [...trip].sort((a, b) => new Date(b.date) - new Date(a.date));

//   const filteredTrips = sortedTrips.filter((trip) => {
//     const tripDate = new Date(trip.date);
//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;

//     const matchesDate =
//       (start && end && tripDate >= start && tripDate <= end) ||
//       (start && tripDate.toDateString() === start.toDateString()) ||
//       (!start && !end);

//     const matchesCustomer =
//       !selectedCustomer || trip.customer?.toLowerCase() === selectedCustomer.toLowerCase();
//     const matchesTransportType =
//       !transportType || trip.transport_type === transportType;

//     return matchesDate && matchesCustomer && matchesTransportType;
//   });

//   // search
//   const filteredTripList = filteredTrips.filter((dt) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       dt.customer?.toLowerCase().includes(term) ||
//       dt.date?.toLowerCase().includes(term) ||
//       (dt.id !== undefined && dt.id !== null && dt.id.toString() === term) ||
//       dt.driver_name?.toLowerCase().includes(term) ||
//       dt.transport_type?.replace("_", " ").toLowerCase().includes(term) ||
//       dt.driver_mobile?.toLowerCase().includes(term) ||
//       dt.registration_number?.toLowerCase().includes(term) ||
//       dt.registration_serial?.toLowerCase().includes(term) ||
//       dt.registration_zone?.toLowerCase().includes(term) ||
//       dt.registration_date?.toLowerCase().includes(term) ||
//       dt.text_date?.toLowerCase().includes(term) ||
//       dt.road_permit_date?.toLowerCase().includes(term) ||
//       dt.fitness_date?.toLowerCase().includes(term)
//     );
//   });

//   // pagination
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentTrip = filteredTripList.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredTripList.length / itemsPerPage);

//   return (
//     <main className="p-2">
//       <Toaster />
//       <div className="w-sm md:w-full overflow-hidden overflow-x-auto mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 md:p-4 py-10  border border-gray-200">
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
//             <FaTruck className="text-gray-800 text-2xl" />
//             Trip Records
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="border border-primary   text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//             <Link to="/tramessy/AddTripForm">
//               <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
//                 <FaPlus /> Trip
//               </button>
//             </Link>
//           </div>
//         </div>
//         {/* export and search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
//             <button
//               onClick={exportTripsToExcel}
//               className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
//             >
//               Excel
//             </button>
//             <button
//               onClick={exportTripsToPDF}
//               className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
//             >
//               PDF
//             </button>
//             <button
//               onClick={printTripsTable}
//               className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
//             >
//               Print
//             </button>
//           </div>
//           {/* search */}
//           <div className="mt-3 md:mt-0">
//             {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
//             <input
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               type="text"
//               placeholder="Search trip..."
//               className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
//             />
//             {/*  Clear button */}
//             {searchTerm && (
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setCurrentPage(1);
//                 }}
//                 className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
//               >
//                 ✕
//               </button>
//             )}
//           </div>
//         </div>
//         {/* Conditional Filter Section */}
//         {/* {showFilter && (
//           <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>
//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>
//             <select
//               value={selectedCustomer}
//               onChange={(e) => {
//                 setSelectedCustomer(e.target.value)
//                 setCurrentPage(1);
//               }}
//               className="flex-1 min-w-0 text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
//             >
//               <option value="">Select Customer</option>
//               {customers.map((c) => (
//                 <option key={c.id} value={c.customer_name}>
//                   {c.customer_name}
//                 </option>
//               ))}
//             </select>

//             <div className="">
//               <button
//                 onClick={() => {
//                   setStartDate("");
//                   setEndDate("");
//                   setSelectedCustomer("");
//                   setShowFilter(false);
//                 }}
//                 className="bg-primary text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//         )} */}

//         {showFilter && (
//           <div className="md:flex gap-4 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300">
//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>

//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>
//             {/* customer select */}
//             <select
//               value={selectedCustomer}
//               onChange={(e) => {
//                 setSelectedCustomer(e.target.value)
//                 setCurrentPage(1);
//               }}
//               className=" flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//             >
//               <option value="">Select Customer</option>
//               {customers.map((c) => (
//                 <option key={c.id} value={c.customer_name}>
//                   {c.customer_name}
//                 </option>
//               ))}
//             </select>

//             {/* transport select */}
//             <select
//               value={transportType}
//               onChange={(e) => {
//                 setTransportType(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//             >
//               <option value="">All Transport</option>
//               <option value="own_transport">Own Transport</option>
//               <option value="vendor_transport">Vendor Transport</option>
//             </select>

//             <div className="flex-gap-2">
//               <button
//                 onClick={() => {
//                   setStartDate(null);
//                   setEndDate(null);
//                   setSelectedCustomer("");
//                   setTransportType("");
//                   setShowFilter(false);
//                 }}
//                 className="w-full bg-gradient-to-r from-primary to-[#077a20]  text-white px-2 py-2 rounded-md shadow flex items-center justify-center gap-2 transition-all duration-300"
//               >
//                 <FiFilter /> Clear
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="mt-5 overflow-x-auto rounded-md z-50">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-gray-200 text-primary capitalize text-xs">
//               <tr>
//                 <th className="px-2 py-4">SL.</th>
//                 <th className="px-2 py-4">StartDate</th>
//                 {/*  */}
//                 <th className="px-2 py-4">EndDate</th>
//                 <th className="px-2 py-4">TripId</th>
//                 <th className="px-2 py-4">Customer</th>
//                 <th className="px-2 py-4">Driver/vehicle</th>
//                 <th className="px-2 py-4">Trip&Destination</th>
//                 <th className="px-2 py-4">TripRent</th>
//                 <th className="px-2 py-4">TripExpense</th>
//                 <th className="p-2">Profit</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2 action_column">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-700">
//               {
//                 currentTrip.length === 0 ? (
//                   <tr>
//                     <td colSpan="10" className="text-center p-4 text-gray-500 ">
//                       No trip found
//                     </td>
//                   </tr>)
//                   : (currentTrip?.map((dt, index) => {
//                     const rowIndex = indexOfFirstItem + index + 1;
//                     const isOpen = openDropdown === rowIndex;
//                     return (
//                       <tr
//                         key={index}
//                         className="hover:bg-gray-50 transition-all border-b border-gray-300"
//                       >
//                         <td className="p-2 font-bold">
//                           {indexOfFirstItem + index + 1}
//                         </td>
//                         <td className="p-2">{formatDate(dt?.start_date)}</td>
//                         <td className="p-2">{formatDate(dt?.end_date)}</td>
//                         <td className="p-2">{dt?.id}</td>
//                         <td className="p-2">
//                           <p><span className="">name:</span> {dt.customer}</p>
//                           <p><span className="">Type:</span> {dt?.transport_type?.replace("_", " ")}</p>
//                         </td>
//                         <td className="p-2">
//                           <p><span className="">name:</span> {dt.driver_name}</p>
//                           <p><span className="">vehicle:</span> {dt.vehicle_no}</p>
//                         </td>
//                         <td className="p-2">
//                           <p>Load: {dt.load_point}</p>
//                           <p>Unload: {dt.unload_point}</p>
//                         </td>

//                         <td className="p-2">{dt.total_rent}</td>
//                         <td className="p-2">{dt.total_exp}</td>
//                         <td className="p-2">
//                           {parseFloat(dt.total_rent || 0) -
//                             parseFloat(dt.total_exp || 0)}
//                         </td>
//                         <td className="p-2">{dt?.status}</td>
//                         {/* <td className="p-2 action_column">
//                           <div className="flex gap-1">
//                             <Link to={`/tramessy/UpdateTripForm/${dt.id}`}>
//                               <button className="text-primary hover:bg-primary hover:text-white px-2 py-1.5 rounded shadow-md transition-all cursor-pointer">
//                                 <FaPen className="text-[12px]" />
//                               </button>
//                             </Link>
//                             <button
//                               onClick={() => handleView(dt.id)}
//                               className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                             >
//                               <FaEye className="text-[12px]" />
//                             </button>
//                             <button
//                               onClick={() => handlePrintClick(dt)}
//                               className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                             >
//                               <BiPrinter className="h-4 w-4" />
//                             </button>
//                            {isAdmin && <button
//                               // onClick={() => handleStatus(dt)}
//                               className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                             >
//                               Approved
//                             </button>}
//                           </div>
//                         </td> */}
//                         <td className="p-2 action_column relative">
//                           <div className="flex gap-1">
//                             {/* Dropdown toggle button */}
//                             <button
//                               onClick={() => toggleDropdown(rowIndex)}
//                               className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                             >
//                               {/* ••• */}
//                               <BsThreeDotsVertical />
//                             </button>

//                           </div>
//                         </td>
//                         {/* Dropdown menu */}
//                         {isOpen && (
//                           <div
//                             ref={el => dropdownRefs.current[rowIndex] = el}
//                             style={{ position: "absolute" }}
//                             className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-[9999] border border-gray-200"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <div className="py-1">
//                               <Link
//                                 to={`/tramessy/UpdateTripForm/${dt.id}`}
//                                 onClick={() => setOpenDropdown(null)}
//                               >
//                                 <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                                   <FaPen className="mr-2 text-[12px]" />
//                                   Edit
//                                 </button>
//                               </Link>
//                               <button
//                                 onClick={() => {
//                                   handleView(dt.id);
//                                   setOpenDropdown(null);
//                                 }}
//                                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                               >
//                                 <FaEye className="mr-2 text-[12px]" />
//                                 View
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setSelectedInvoice(dt);
//                                   handlePrintClick(dt);
//                                   setOpenDropdown(null);
//                                 }}
//                                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                               >
//                                 <BiPrinter className="mr-2 h-4 w-4" />
//                                 Challan
//                               </button>
//                               {isAdmin && dt.status !== "Approved" && (
//                                 <button
//                                  onClick={(e) => {
//                                       e.preventDefault()
//                                       e.stopPropagation()
//                                       console.log("[v0] Approve button clicked for trip:", dt.id)
//                                       handleApproveClick(dt)
//                                     }}
//                                   className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                 >
//                                   Approved
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </tr>
//                     );
//                   }))}
//             </tbody>
//           </table>
//         </div>
//         {/* pagination */}
//         {currentTrip.length > 0 && totalPages >= 1 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={(page) => setCurrentPage(page)}
//             maxVisible={8}
//           />
//         )}
//       </div>
//       {/* Hidden Component for Printing */}
//       <div style={{ display: "none" }} >
//         {selectedInvoice && <ChallanInvoicePrint ref={printRef} data={selectedInvoice} />}
//       </div>

//       {/* Delete Modal */}
//       <div className="flex justify-center items-center">
//         {isOpen && (
//           <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
//             <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
//               <button
//                 onClick={toggleModal}
//                 className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
//               >
//                 <IoMdClose />
//               </button>
//               <div className="flex justify-center mb-4 text-red-500 text-4xl">
//                 <FaTrashAlt />
//               </div>
//               <p className="text-center text-gray-700 font-medium mb-6">
//                 Are you sure you want to delete this trip?
//               </p>
//               <div className="flex justify-center space-x-4">
//                 <button
//                   onClick={toggleModal}
//                   className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
//                 >
//                   No
//                 </button>
//                 <button
//                   onClick={() => handleDelete(selectedTripId)}
//                   className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
//                 >
//                   Yes
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* get trip information by id */}
//       {viewModalOpen && selectedTrip && (
//         <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
//           <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
//             <h3 className="text-gray-700 font-semibold">Trip Info</h3>
//             <div className="mt-5">
//               <ul className="flex border border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Customer</p>{" "}
//                   <p>{selectedTrip.customer}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2">
//                   <p className="w-48">Trip Date</p> <p>{selectedTrip.date}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Load Point</p>{" "}
//                   <p>{selectedTrip.load_point}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2">
//                   <p className="w-48">Unload Point</p>{" "}
//                   <p>{selectedTrip.unload_point}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Trip type</p> <p>{selectedTrip.trip_type}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Additional Load</p> <p>{selectedTrip.additional_load}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Driver Name</p>{" "}
//                   <p>{selectedTrip.driver_name}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2">
//                   <p className="w-48">Driver Mobile</p>{" "}
//                   <p>{selectedTrip.driver_mobile}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Driver Commission</p>{" "}
//                   <p>{selectedTrip.driver_commission}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Fuel Cost</p>{" "}
//                   <p>{selectedTrip.fuel_cost}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Callan cost</p>{" "}
//                   <p>{selectedTrip.callan_cost}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Others Cost</p>{" "}
//                   <p>{selectedTrip.others_cost}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">TransportType</p>{" "}
//                   <p>{selectedTrip.transport_type}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Vehicle Number</p>{" "}
//                   <p>{selectedTrip.vehicle_no}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Model No</p>{" "}
//                   <p>{selectedTrip.model_no}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Unload Charge</p>{" "}
//                   <p>{selectedTrip.unload_charge} </p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Total Rent/Bill Amount</p>{" "}
//                   <p>{selectedTrip.total_rent}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Distribution Name</p>{" "}
//                   <p>{selectedTrip.distribution_name}</p>
//                 </li>
//               </ul>
//               <ul className="flex border-b border-r border-l border-gray-300">
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Additional Cost</p> <p>{selectedTrip.additional_cost}</p>
//                 </li>
//                 <li className="w-[428px] flex text-gray-700 text-sm font-semibold px-3 py-2 border-r border-gray-300">
//                   <p className="w-48">Advance</p> <p>{selectedTrip.advance}</p>
//                 </li>
//               </ul>
//               <div className="flex justify-end mt-10">
//                 <button
//                   onClick={() => setViewModalOpen(false)}
//                   className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-secondary"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//      {/* Approve Confirmation Modal */}
//        {showApproveConfirm && (
//         <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Approval</h2>
//             <p className="text-gray-600 mb-6">Are you sure you want to approve Trip #{tripToApprove?.id}?</p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={cancelApprove}
//                 disabled={isApproving}
//                 className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmApprove}
//                 disabled={isApproving}
//                 className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 {isApproving ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Approving...
//                   </>
//                 ) : (
//                   "Confirm"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </main>
//   );
// };

// export default TripList;



import { useEffect, useRef, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { FaTruck, FaPlus, FaFilter, FaEye, FaTrashAlt, FaPen } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { Link } from "react-router-dom"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Pagination from "../components/Shared/Pagination"
import { BiPrinter } from "react-icons/bi"
import useAdmin from "../hooks/useAdmin"
import { BsThreeDotsVertical } from "react-icons/bs"
import ChallanInvoicePrint from "../components/modal/ChallanInvoicePrint"
import { useReactToPrint } from "react-to-print"
import api from "../../utils/axiosConfig"
import { formatDate, tableFormatDate } from "../hooks/formatDate"
import DatePicker from "react-datepicker"
import { FiFilter } from "react-icons/fi"
import { FcApproval } from "react-icons/fc";
import logo from "../assets/AJ_Logo.png"
const TripList = () => {
  const [trip, setTrip] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const isAdmin = useAdmin()
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const printRef = useRef()
  const printViewRef = useRef();
  // delete modal
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTripId, setselectedTripId] = useState(null)
  const toggleModal = () => setIsOpen(!isOpen)
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // get single trip info by id
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTrip, setselectedTrip] = useState(null)
  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  // search
  const [searchTerm, setSearchTerm] = useState("")

  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")

  // Inside your component, modify the state and refs
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [tripToApprove, setTripToApprove] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const dropdownRefs = useRef({})
  // Transport type filter
  const [transportType, setTransportType] = useState("")

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown
      const dropdownElements = document.querySelectorAll(".dropdown-menu")
      let isInsideDropdown = false

      dropdownElements.forEach((element) => {
        if (element.contains(event.target)) {
          isInsideDropdown = true
        }
      })

      // Check if click is on a toggle button
      const isToggleButton =
        event.target.closest("button") &&
        (event.target.closest("button").textContent === "•••" || event.target.closest("button").querySelector("svg"))

      if (!isInsideDropdown && !isToggleButton) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle dropdown function
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index)
  }

  // Handle approve confirmation
  const handleApproveClick = (trip) => {
    console.log("[v0] Approve button clicked for trip:", trip.id)
    setTripToApprove(trip)
    setShowApproveConfirm(true)
    setOpenDropdown(null)
  }

  // const confirmApprove = async () => {
  //   if (!tripToApprove) {
  //     toast.error("No trip selected for approval")
  //     return
  //   }

  //   console.log("[v0] Starting approve process for trip:", tripToApprove.id)
  //   setIsApproving(true)

  //   try {
  //     console.log("[v0] Sending approve request for trip ID:", tripToApprove.id)

  //     const response = await api.put(`/trip/${tripToApprove.id}`, { status: "Approved" })

  //     console.log("[v0] API Response:", response.data)

  //     if (response.data.success || response.status === 200) {
  //       // Update local state
  //       setTrip((prevTrips) => prevTrips.map((t) => (t.id === tripToApprove.id ? { ...t, status: "Approved" } : t)))

  //       toast.success(`Trip #${tripToApprove.id} approved successfully!`)
  //       console.log("[v0] Trip approved successfully")
  //     } else {
  //       console.error("[v0] API returned unsuccessful response:", response.data)
  //       toast.error(response.data.message || "Failed to approve trip")
  //     }
  //   } catch (error) {
  //     console.error("[v0] Approve error:", error)

  //     // More detailed error handling
  //     if (error.response) {
  //       // Server responded with error status
  //       const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
  //       toast.error(errorMessage)
  //       console.error("[v0] Server error:", error.response.data)
  //     } else if (error.request) {
  //       // Request was made but no response received
  //       toast.error("Network error: Unable to connect to server")
  //       console.error("[v0] Network error:", error.request)
  //     } else {
  //       // Something else happened
  //       toast.error("Error approving trip: " + error.message)
  //       console.error("[v0] General error:", error.message)
  //     }
  //   } finally {
  //     setIsApproving(false)
  //     setShowApproveConfirm(false)
  //     setTripToApprove(null)
  //   }
  // }

  // Cancel approve



  const confirmApprove = async () => {
    if (!tripToApprove) return toast.error("No trip selected for approval");

    setIsApproving(true);

    try {
      // Spread all existing trip data and override status
      const payload = {
        ...tripToApprove,
        status: "Approved",
        user_id: tripToApprove.user_id || null,
      };

      const response = await api.put(`/trip/${tripToApprove.id}`, payload);

      if (response.data.success) {
        setTrip((prevTrips) =>
          prevTrips.map((t) => (t.id === tripToApprove.id ? { ...t, status: "Approved" } : t))
        );
        toast.success(`Trip #${tripToApprove.id} approved successfully!`);
      } else {
        toast.error(response.data.message || "Failed to approve trip");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsApproving(false);
      setShowApproveConfirm(false);
      setTripToApprove(null);
    }
  };

  const cancelApprove = () => {
    console.log("[v0] Approve cancelled")
    setShowApproveConfirm(false)
    setTripToApprove(null)
    setIsApproving(false)
  }

  useEffect(() => {
    // Fetch customers data
    api
      .get(`/customer`)
      .then((response) => {
        // if (response.data.success) {
        setCustomers(response.data)
        // }
      })
      .catch((error) => {
        console.error("Error fetching customers:", error)
      })
  }, [])

  // challan print func
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Invoice Print",
    onAfterPrint: () => {
      console.log("Print completed")
      setSelectedInvoice(null)
    },
    onPrintError: (error) => {
      console.error("Print error:", error)
    },
  })

  const handlePrintClick = async (tripData) => {
    let licenseNo = "N/A";

    // If license is not in trip data, fetch from driver API
    if (!tripData.lincense && tripData.driver_name) {
      const driverResponse = await api.get('/driver');
      const drivers = driverResponse.data;
      const driver = drivers.find(d =>
        d.driver_name === tripData.driver_name ||
        d.driver_mobile === tripData.driver_mobile
      );
      licenseNo = driver?.lincense || "N/A";
    } else {
      licenseNo = tripData.lincense || "N/A";
    }
    const formatted = {
      voucherNo: tripData.id,
      receiver: tripData.customer,
      address: tripData.unload_point,
      truckNo: tripData.vehicle_no,
      dln: tripData.date,
      licenseNo: licenseNo || "N/A",
      driverName: tripData.driver_name,
      loadingPoint: tripData.load_point,
      unloadingPoint: tripData.unload_point,
      rent: tripData.total_rent,
      loadingDemurrage: tripData.labor,
      inTime: tripData.start_date,
      outTime: tripData.end_date,
      totalDemurrage: tripData.labor,
      others: tripData.remarks || "N/A",
      productDetails: tripData?.product_details,
    }

    setSelectedInvoice(formatted)

    // Use setTimeout to ensure the component is rendered before printing
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  // Fetch trips data
  useEffect(() => {
    api
      .get(`/trip`)
      .then((response) => {
        // if (response.data.status === "Success") {
        setTrip(response.data)
        // }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error)
        setLoading(false)
      })
  }, [])


  // excel
//   const exportTripsToExcel = async () => {
//   try {
//     // Filtered trip list use করবে (no API call)
//     let filteredData = filteredTripList;

//     // Non-admin হলে total_rent field বাদ দেবে
//     if (!isAdmin) {
//       filteredData = filteredData.map(({ total_rent, ...rest }) => rest);
//     }

//     // যদি filtered data না থাকে
//     if (!filteredData || filteredData.length === 0) {
//       toast.error("No filtered trip data found!");
//       return;
//     }

//     // Excel sheet বানানো (auto header = object keys)
//     const worksheet = XLSX.utils.json_to_sheet(filteredData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Trips");

//     // Excel buffer তৈরি
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });

//     // File save
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, "filtered_trip_report.xlsx");
//     toast.success("Filtered trip data downloaded successfully!");
//   } catch (error) {
//     console.error("Excel export error:", error);
//     toast.error("Failed to download Excel file!");
//   }
// };

const exportTripsToExcel = async () => {
  try {
    let filteredData = filteredTripList;

    if (!isAdmin) {
      filteredData = filteredData.map(({ total_rent, ...rest }) => rest);
    }

    if (!filteredData || filteredData.length === 0) {
      toast.error("No filtered trip data found!");
      return;
    }

    // 🔹 Excel-export-ready data
    const excelData = filteredData.map((item) => {
      const newItem = {};
      Object.keys(item).forEach((key) => {
        // number string → number
        if (!isNaN(item[key]) && item[key] !== "" && item[key] !== null) {
          newItem[key] = Number(item[key]);
        } else {
          newItem[key] = item[key];
        }
      });
      return newItem;
    });

    // 🔹 Total row calculation
    const totalRow = {};
    const numericKeys = Object.keys(excelData[0]).filter((key) =>
      excelData.some((item) => typeof item[key] === "number")
    );
    numericKeys.forEach((key) => {
      totalRow[key] = excelData.reduce(
        (sum, row) => sum + (row[key] || 0),
        0
      );
    });
    totalRow["customer"] = "TOTAL"; // যেকোনো text field এ total label

    // final data with total row
    excelData.push(totalRow);

    // 🔹 Excel sheet generate
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Trips");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), "filtered_trip_report.xlsx");
    toast.success("Filtered trip data downloaded successfully!");
  } catch (error) {
    console.error("Excel export error:", error);
    toast.error("Failed to download Excel file!");
  }
};



  // pdf
  const exportTripsToPDF = () => {
    const doc = new jsPDF("landscape")

    const tableColumn = [
      "SL.",
      "Date",
      "Driver Name",
      "Mobile",
      "Commission",
      "Load Point",
      "Unload Point",
      "Trip Cost",
      "Trip Rent",
      "Profit",
    ]

    const tableRows = trip.map((dt, index) => [
      index + 1,
      dt.date,
      dt.driver_name || "N/A",
      dt.driver_mobile || "N/A",
      dt.driver_commission || "0",
      dt.load_point,
      dt.unload_point,
      dt.total_exp || "0",
      dt.total_rent || "0",
      Number.parseFloat(dt.total_rent || 0) - Number.parseFloat(dt.total_exp || 0),
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    })

    doc.save("trip_report.pdf")
  }

  // print
  const printTripsTable = () => {
    // Hide action column for printing
    const actionColumns = document.querySelectorAll(".action_column")
    actionColumns.forEach((col) => (col.style.display = "none"))

    const tableHTML = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
      <thead style="background:#11375B; color:white;">
        <tr>
          <th>SL.</th>
          <th>StartDate</th>
          <th>EndDate</th>
          <th>customer</th>
          <th>Driver</th>
          <th>VehicleNo</th>
          <th>LoadPoint</th>
          <th>UnloadPoint</th>
          <th>TripRent</th>
          <th>TripCost</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        ${trip
        .map(
          (dt, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${dt.start_date}</td>
            <td>${dt.end_date}</td>
            <td>${(dt.customer || "N/A") + " " + (dt.transport_type || "")}</td>
            <td>${dt.driver_name || "N/A"}</td>
            <td>${dt.vehicle_no || "N/A"}</td>
            <td>${dt.load_point}</td>
            <td>${dt.unload_point}</td>
             <td>${isAdmin ? (dt.total_rent || 0) : "hide"}</td>
            <td>${dt.total_exp || 0}</td>
            <td>${isAdmin ? (Number.parseFloat(dt.total_rent || 0) - Number.parseFloat(dt.total_exp || 0)) : "hide"}</td>
          </tr>
        `,
        )
        .join("")}
      </tbody>
    </table>
  `

    const WinPrint = window.open("", "", "width=900,height=650")
    WinPrint.document.write(`
    <html>
      <head>
        <title>Print Trip Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>Trip Report</h3>
        ${tableHTML}
      </body>
    </html>
  `)

    WinPrint.document.close()
    WinPrint.focus()
    WinPrint.print()
    WinPrint.close()

    // Restore action columns
    actionColumns.forEach((col) => (col.style.display = ""))
  }

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/trip/${id}`);

      // Axios er jonno check
      if (response.status === 200) {
        // UI update
        setTrip((prev) => prev.filter((item) => item.id !== id));
        toast.success("Trip deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsOpen(false);
        setselectedTripId(null);
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
  // view trip by id
  const handleView = async (id) => {
    try {
      const response = await api.get(`/trip/${id}`)
      setselectedTrip(response.data)
      setViewModalOpen(true)
    } catch (error) {
      console.error("View error:", error)
      toast.error("Can't get trip details")
    }
  }
  // view print
  // const handleViewPrint = useReactToPrint({
  //   contentRef: printViewRef,
  //   documentTitle: `Trip-${trip?.id}-Details`,
  // });

  const handleViewPrint = () => {
    const printContent = document.getElementById("printArea");
    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(btn => (btn.style.display = 'none'));
    const WindowPrint = window.open("", "", "width=900,height=650");
    WindowPrint.document.write(`
    <html>
      <head>
        <title>Trip Details</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .grid div {
          border-top: 1px solid #ddd;
            padding: 5px;
            border-radius: 8px;
            background: #f9f9f9;
          }
          strong {
            color: #333;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
    WindowPrint.document.close();
    WindowPrint.print();
    //  Re-show buttons after printing
    setTimeout(() => {
      buttons.forEach(btn => (btn.style.display = ''));
    }, 500);
  };

  // Sort trips by date descending (latest first)
  const sortedTrips = [...trip].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredTrips = sortedTrips.filter((trip) => {
    const tripDate = new Date(trip.start_date)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const matchesDate =
      (start && end && tripDate >= start && tripDate <= end) ||
      (start && tripDate.toDateString() === start.toDateString()) ||
      (!start && !end)

    const matchesCustomer = !selectedCustomer || trip.customer?.toLowerCase() === selectedCustomer.toLowerCase()
    const matchesTransportType = !transportType || trip.transport_type === transportType

    return matchesDate && matchesCustomer && matchesTransportType
  })

  // search
  const filteredTripList = filteredTrips.filter((dt) => {
    const term = searchTerm.toLowerCase()
    return (
      dt.customer?.toLowerCase().includes(term) ||
      dt.date?.toLowerCase().includes(term) ||
      (dt.id !== undefined && dt.id !== null && dt.id.toString() === term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.transport_type?.replace("_", " ").toLowerCase().includes(term) ||
      dt.driver_mobile?.toLowerCase().includes(term) ||
      dt.registration_number?.toLowerCase().includes(term) ||
      dt.registration_serial?.toLowerCase().includes(term) ||
      dt.registration_zone?.toLowerCase().includes(term) ||
      dt.registration_date?.toLowerCase().includes(term) ||
      dt.text_date?.toLowerCase().includes(term) ||
      dt.road_permit_date?.toLowerCase().includes(term) ||
      dt.fitness_date?.toLowerCase().includes(term)
    )
  })

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrip = filteredTripList.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTripList.length / itemsPerPage)
  if (loading) return <p className="text-center mt-16">Loading trip...</p>

  return (
    <main className="p-2">
      <Toaster />
      <div className="relative w-sm md:w-full  overflow-x-auto mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 md:p-4 py-10  border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-2xl" />
            Trip Records
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary   text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
            <Link to="/tramessy/AddTripForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Trip
              </button>
            </Link>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            {/* <button
              onClick={exportTripsToPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTripsTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              type="text"
              placeholder="Search trip..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setCurrentPage(1)
                }}
                className="absolute right-5 top-[5.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-4 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300">
            <div className="flex-1 min-w-0">
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
            </div>

            <div className="flex-1 min-w-0">
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
            </div>
            {/* customer select */}
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value)
                setCurrentPage(1)
              }}
              className=" flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customer_name}>
                  {c.customer_name}
                </option>
              ))}
            </select>

            {/* transport select */}
            <select
              value={transportType}
              onChange={(e) => {
                setTransportType(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">All Transport</option>
              <option value="own_transport">Own Transport</option>
              <option value="vendor_transport">Vendor Transport</option>
            </select>

            <div className="flex-gap-2">
              <button
                onClick={() => {
                  setStartDate(null)
                  setEndDate(null)
                  setSelectedCustomer("")
                  setTransportType("")
                  setShowFilter(false)
                }}
                className="w-full bg-gradient-to-r from-primary to-[#077a20]  text-white px-2 py-2 rounded-md shadow flex items-center justify-center gap-2 transition-all duration-300"
              >
                <FiFilter /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md z-50">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">SL.</th>
                <th className="px-2 py-4">StartDate</th>
                {/*  */}
                <th className="px-2 py-4">EndDate</th>
                <th className="px-2 py-4">TripId</th>
                <th className="px-2 py-4">Customer</th>
                <th className="px-2 py-4">Driver/vehicle</th>
                <th className="px-2 py-4">Trip&Destination</th>
                <th className="px-2 py-4">TripRent</th>
                <th className="px-2 py-4">TripExpense</th>
                <th className="p-2">Profit</th>
                <th className="p-2">Status</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentTrip.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500 ">
                    No trip found
                  </td>
                </tr>
              ) : (
                currentTrip?.map((dt, index) => {
                  const rowIndex = indexOfFirstItem + index + 1
                  const isOpen = openDropdown === rowIndex
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-all border-b border-gray-300"
                      data-row={rowIndex}
                    >
                      <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                      <td className="p-2">{formatDate(dt?.start_date)}</td>
                      <td className="p-2">{formatDate(dt?.end_date)}</td>
                      <td className="p-2">{dt?.id}</td>
                      <td className="p-2">
                        <p>
                          <strong className="">name:</strong> {dt.customer}
                        </p>
                        <p>
                          <strong className="">Type:</strong> {dt?.transport_type?.replace("_", " ")}
                        </p>
                      </td>
                      <td className="p-2">
                        <p>
                          <strong className="">name:</strong> {dt.driver_name}
                        </p>
                        <p>
                          <strong className="">vehicle:</strong> {dt.vehicle_no}
                        </p>
                      </td>
                      <td className="p-2">
                        <p><strong>Load:</strong> {dt.load_point}</p>
                        <p><strong>Unload:</strong> {dt.unload_point}</p>
                      </td>

                      <td className="p-2">{isAdmin ? (dt.total_rent) : "hide"}</td>
                      <td className="p-2">{dt.total_exp}</td>
                      <td className="p-2">
                        {isAdmin ? (Number.parseFloat(dt.total_rent || 0) - Number.parseFloat(dt.total_exp || 0)) : "hide"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold
            ${dt.status === "Approved"
                              ? "bg-green-50 text-green-700  border-green-300"
                              : dt.status === "Pending"
                                ? "bg-yellow-50 text-yellow-700  border-yellow-300"
                                : dt.status === "Rejected"
                                  ? "bg-red-50 text-red-700  border-red-300"
                                  : "bg-gray-50 text-gray-700  border-gray-300"
                            }`}
                        >
                          {dt.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-2 action_column relative">
                        <div className="flex gap-1">
                          {/* Dropdown toggle button */}
                          <button
                            onClick={() => {
                              toggleDropdown(rowIndex)
                            }}
                            className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {isOpen && <div className="fixed inset-0 z-[9999]" onClick={() => setOpenDropdown(null)} />}

                          {isOpen && (
                            <div
                              ref={(el) => (dropdownRefs.current[rowIndex] = el)}
                              // style={{position: "absolute"}}
                              className="fixed right-0 w-40 bg-white rounded-md shadow-lg !z-[9999] border border-gray-200 dropdown-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                {(dt.status === "Pending" || dt.status === "Rejected") && (<Link to={`/tramessy/UpdateTripForm/${dt.id}`} onClick={() => setOpenDropdown(null)}>
                                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaPen className="mr-2 text-[12px]" />
                                    Edit
                                  </button>
                                </Link>)}
                                <button
                                  onClick={() => {
                                    handleView(dt.id)
                                    setOpenDropdown(null)
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaEye className="mr-2 text-[12px]" />
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(dt)
                                    handlePrintClick(dt)
                                    setOpenDropdown(null)
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <BiPrinter className="mr-2 h-4 w-4" />
                                  Challan
                                </button>
                                {/* {isAdmin && dt.status !== "Approved" && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      console.log("[v0] Approve button clicked for trip:", dt.id)
                                      handleApproveClick(dt)
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    disabled={isApproving}
                                  >
                                    <FcApproval className="mr-2 h-4 w-4" />{isApproving ? "Approving..." : "Approved"}
                                  </button>
                                )} */}
                                <button
                                  onClick={() => {
                                    setselectedTripId(dt.id);
                                    setIsOpen(true);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"                                >
                                  <FaTrashAlt className="mr-2 h-4 w-3 text-red-500" /> Delete  </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentTrip.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
      {/* Hidden Component for Printing */}
      <div style={{ display: "none" }}>
        {selectedInvoice && <ChallanInvoicePrint ref={printRef} data={selectedInvoice} />}
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
              <p className="text-center text-gray-700 font-medium mb-6">Are you sure you want to delete this trip?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedTripId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* get trip information by id */}
      {viewModalOpen && selectedTrip && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">

          <div className="bg-white w-[90%] md:w-[800px] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div id="printArea" ref={printViewRef} className="print:p-0">
              <div className="flex items-center justify-between p-4 ">
                <div className="">
                  {/* Logo */}
                  <img src={logo} alt="" />
                  <div className="text-xs text-secondary">
                    <div className="font-bold">M/S A J ENTERPRISE</div>
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-secondary mb-2">M/S AJ Enterprise</h1>
                  <div className="text-xs text-gray-700">
                    <div>Razzak Plaza, 11th Floor, Room No: J-12,</div>
                    <div>2 Sahid Tajuddin Sarani, Moghbazar, Dhaka-1217, Bangladesh</div>
                  </div>
                </div>
                <div className="w-16">
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="text-primary hover:text-gray-300 transition no-print"
                  >
                    <IoMdClose size={24} />
                  </button></div>
              </div>

              {/* Body */}
              <div className="p-6 text-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold border-b pb-2">Trip Information</h3>
                  <p className="text-sm text-gray-500">
                    Created By: <span className="font-semibold">{selectedTrip.created_by || "N/A"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>Trip ID:</strong> {selectedTrip.id}</div>
                  <div><strong>Trip Type:</strong> {selectedTrip.trip_type || "N/A"}</div>
                  <div><strong>Customer:</strong> {selectedTrip.customer || "N/A"}</div>
                  <div><strong>Trip Start Date:</strong> {selectedTrip.start_date || "N/A"}</div>
                  <div><strong>Trip End Date:</strong> {selectedTrip.end_date || "N/A"}</div>
                  <div><strong>Load Point:</strong> {selectedTrip.load_point || "N/A"}</div>
                  <div><strong>Unload Point:</strong> {selectedTrip.unload_point || "N/A"}</div>
                  <div><strong>Additional Load:</strong> {selectedTrip.additional_load || "N/A"}</div>
                  <div><strong>Branch:</strong> {selectedTrip.branch_name || "N/A"}</div>
                  <div><strong>Transport Type:</strong> {selectedTrip.transport_type || "N/A"}</div>
                  <div><strong>Vehicle No:</strong> {selectedTrip.vehicle_no || "N/A"}</div>
                  <div><strong>Vendor Name:</strong> {selectedTrip.vendor_name || "N/A"}</div>
                  <div><strong>Driver Name:</strong> {selectedTrip.driver_name || "N/A"}</div>
                   <div><strong>Driver Mobile:</strong> {selectedTrip.driver_mobile || "N/A"}</div>
                  <div><strong>Product Details:</strong> {selectedTrip.product_details || "N/A"}</div>
                  <div><strong>Invoice No:</strong> {selectedTrip.invoice_no || 0}</div>
                  <div><strong>Buyar Name:</strong> {selectedTrip.buyar_name || "N/A"}</div>
                  <div><strong>Challan No:</strong> {selectedTrip.challan || "N/A"}</div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-3 border-b pb-1">
                  Expense Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>Labor Cost:</strong> {selectedTrip.labor || 0}</div>
                  <div><strong>Toll Cost:</strong> {selectedTrip.toll_cost || 0}</div>
                  <div><strong>Driver Advance:</strong> {selectedTrip.driver_adv || 0}</div>
                  <div><strong>Fuel Cost:</strong> {selectedTrip.fuel_cost || 0}</div>
                  <div><strong>Parking Cost:</strong> {selectedTrip.parking_cost || 0}</div>
                  <div><strong>Night Guard Cost:</strong> {selectedTrip.night_guard || 0}</div>
                  <div><strong>Callan Cost:</strong> {selectedTrip.callan_cost || 0}</div>
                  <div><strong>Others Cost:</strong> {selectedTrip.others_cost || 0}</div>
                  <div><strong>Feri Cost:</strong> {selectedTrip.feri_cost || 0}</div>
                  <div><strong>Police Cost:</strong> {selectedTrip.police_cost || 0}</div>
                  <div><strong>Chada Cost:</strong> {selectedTrip.chada || 0}</div>
                  <div><strong>Food Cost:</strong> {selectedTrip.food_cost || 0}</div>
                  <div><strong>Additional Cost:</strong> {selectedTrip.additional_cost || 0}</div>
                  <div><strong>Total Expense:</strong> {selectedTrip.total_exp || 0}</div>
                  <div>{selectedTrip.transport_type === "vendor_transport" &&(<><strong>Vendor Rent:</strong>{selectedTrip.total_exp || 0}</>)}</div>
                  
                </div>

                <h3 className="text-lg font-bold mt-4 border-b pb-1">
                  Financial Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>Total Rent:</strong> {isAdmin ? selectedTrip.total_rent || 0 : "N/A"}</div>
                  <div><strong>Demurrage Days:</strong> {selectedTrip.d_day || 0}</div>
                  <div><strong>Demurrage Amount:</strong> {selectedTrip.d_amount || 0}</div>
                  <div><strong>Demurrage Total:</strong> {selectedTrip.d_total || 0}</div>
                  <div><strong>Profit:</strong>
                    {isAdmin ? (selectedTrip.total_rent && selectedTrip.total_exp ? ((selectedTrip.total_rent + selectedTrip.d_total) - selectedTrip.total_exp) : 0) : "N/A"}</div>
                  <div><strong>Status:</strong>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-white text-xs 
                ${selectedTrip.status === "Approved"
                          ? "bg-green-600"
                          : selectedTrip.status === "Rejected"
                            ? "bg-red-600"
                            : "bg-yellow-500"}`}
                    >
                      {selectedTrip.status}
                    </span>
                  </div>
                  <div className="">
                    <strong>Remarks:</strong>
                    <p className="bg-gray-100 rounded-md p-2 mt-1 text-sm">{selectedTrip.remarks || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 pb-2 no-print">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-1 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleViewPrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-green-600 text-white px-4 py-1 rounded-md shadow hover:opacity-90 transition"
                >
                  <BiPrinter size={18} /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Approval</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to approve Trip #{tripToApprove?.id}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelApprove}
                disabled={isApproving}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={isApproving}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Approving...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TripList

