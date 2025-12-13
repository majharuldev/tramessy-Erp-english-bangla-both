import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus, FaUserSecret } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Shared/Pagination";
import { tableFormatDate } from "../../hooks/formatDate";
import api from "../../../utils/axiosConfig";
import DatePicker from "react-datepicker";
import { IoMdClose } from "react-icons/io";
import toNumber from "../../hooks/toNumber";

const PurchaseList = () => {
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  // get single car info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setselectedPurchase] = useState(null);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficialProductId, setSelectedOfficialProductId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    api
      .get(`/purchase`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPurchase(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // state
  const [vehicleFilter, setVehicleFilter] = useState("");

  // Filter by date
  const filtered = purchase.filter((dt) => {
    const dtDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });

  // Vehicle filter apply
  const vehicleFiltered = filtered.filter((dt) => {
    if (vehicleFilter) {
      return dt.vehicle_no === vehicleFilter;
    }
    return true;
  });

  // Search (Product ID, Supplier, Vehicle, Driver)
  const filteredPurchase = vehicleFiltered.filter((dt) => {
    const category = dt.category?.toLowerCase()
    if (!(category === "engine_oil" || category === "parts" || category === "documents")) {
      return false
    }

    const term = searchTerm.toLowerCase()
    if (!term) {
      return true
    }

    const isNumeric = !isNaN(term) && term !== ""

    if (isNumeric) {
      return dt.id === Number(term)
    }
    return (
      // dt.id?.toString().toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term)
    );
  });

  // Vehicle No dropdown unique values
  const uniqueVehicles = [...new Set(purchase.map((p) => p.vehicle_no))];
  // view car by id
  const handleViewCar = async (id) => {
    try {
      const response = await api.get(
        `/purchase/${id}`
      );
      if (response.data.status === "Success") {
        setselectedPurchase(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Purchase Information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Purchase Information could not be loaded.");
    }
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/purchase/${id}`);

      // Remove driver from local list
      setPurchase((prev) => prev.filter((account) => account.id !== id));
      toast.success("Maintenance deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedOfficialProductId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) return <p className="text-center mt-16">Loading data...</p>;
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = filteredPurchase.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPurchase.length / itemsPerPage);

  // Excel Export Function
  // const exportExcel = () => {
  //   const dataToExport = filteredPurchase.map((item, index) => ({
  //     "SL No": index + 1,
  //     "Product ID": item.id,
  //     "Supplier Name": item.supplier_name,
  //     "Driver Name": item.driver_name !== "null" ? item.driver_name : "N/A",
  //     "Vehicle No": item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
  //     "Category": item.category,
  //     "Item Name": item.item_name,
  //     "Quantity": toNumber(item.quantity),
  //     "Unit Price": toNumber(item.unit_price),
  //     "Total": toNumber(item.purchase_amount),
  //     "Date": tableFormatDate(item.date),
  //     "Remarks": item.remarks || "N/A"
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List");

  //   // Generate Excel file
  //   XLSX.writeFile(workbook, "Purchase_List.xlsx");
  //   toast.success("Excel file downloaded successfully!");
  // };


  // // Print Function
  // const printTable = () => {
  //   // শুধু filtered data ব্যবহার
  //   const tableHeader = `
  //   <thead>
  //     <tr>
  //       <th>SL</th>
  //       <th>Product ID</th>
  //       <th>Supplier</th>
  //       <th>Driver</th>
  //       <th>Vehicle No</th>
  //       <th>Category</th>
  //       <th>Item</th>
  //       <th>Qty</th>
  //       <th>Unit Price</th>
  //       <th>Service Charge</th>
  //       <th>Total</th>
  //     </tr>
  //   </thead>
  // `;

  //   const tableRows = filteredPurchase
  //     .map(
  //       (item, index) =>{ 
  //         // Join items into a string separated by commas or line breaks
  //   const itemNames = item.items.map(i => i.item_name).join(", ");
  //   const quantities = item.items.map(i => i.quantity).join(", ");
  //   const unitPrices = item.items.map(i => i.unit_price).join(", ");
  //         return `
  //       <tr>
  //         <td>${index + 1}</td>
  //         <td>${item.id}</td>
  //         <td>${item.supplier_name}</td>
  //         <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
  //         <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
  //         <td>${item.category}</td>
  //         <td>${item.itemNames}</td>
  //         <td>${toNumber(item.quantities)}</td>
  //         <td>${toNumber(item.unitPrices)}</td>
  //                   <td>${item.service_charge}</td>
  //         <td>${item.purchase_amount}</td>
  //       </tr>
  //     `}
  //     )
  //     .join("");

  //   const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

  //   const printWindow = window.open("", "", "width=1000,height=700");
  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Purchase List</title>
  //       <style>
  //         body { font-family: Arial, sans-serif; margin: 20px; }
  //         h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
  //         table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
  //         thead tr {
  //           background: linear-gradient(to right, #11375B, #1e4a7c);
  //           color: white;
  //         }
  //         th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
  //         td { color: #11375B; }
  //         tr:nth-child(even) { background-color: #f9f9f9; }
  //         tr:hover { background-color: #f1f5f9; }
  //         .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
  //         @media print { body { margin: 0; } }
  //          thead th {
  //         color: #000000 !important;
  //         background-color: #ffffff !important;
  //         -webkit-print-color-adjust: exact !important;
  //         print-color-adjust: exact !important;
  //       }
  //       </style>
  //     </head>
  //     <body>
  //       <h2>Purchase List</h2>
  //       ${printContent}
  //       <div class="footer">
  //         Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  //       </div>
  //     </body>
  //   </html>
  // `);
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  //   printWindow.close();
  // };

   // Excel Export Function
  const exportExcel = () => {
    const dataToExport = []

    filteredPurchase.forEach((purchase, purchaseIndex) => {
      if (purchase.items && purchase.items.length > 0) {
        purchase.items.forEach((item, itemIndex) => {
          dataToExport.push({
            "SL No": dataToExport.length + 1,
            Date: tableFormatDate(purchase.date),
            "Product ID": purchase.id,
            "Supplier Name": purchase.supplier_name,
            "Branch Name": purchase.branch_name,
            "Driver Name": purchase.driver_name !== "null" ? purchase.driver_name : "N/A",
            "Vehicle No": purchase.vehicle_no !== "null" ? purchase.vehicle_no : "N/A",
            "Vehicle Category": purchase.vehicle_category !== "null" ? purchase.vehicle_category : "N/A",
            Category: purchase.category,
            "Item Name": item.item_name,
            Quantity: toNumber(item.quantity),
            "Unit Price": toNumber(item.unit_price),
            Total: toNumber(purchase.total),
          "Service Charge": toNumber(purchase.service_charge),
          "Purcahse Amount": toNumber(purchase.purchase_amount),
            "Service Date": tableFormatDate(purchase.service_date || "N/A"),
            "Next Service Date": tableFormatDate(purchase.next_service_date || "N/A"),
            "Last KM": purchase.last_km || "N/A",
            "Next KM": purchase.next_km || "N/A",
            Remarks: purchase.remarks || "N/A",
          })
        })
      } else {
        // If no items, still add the purchase record
        dataToExport.push({
          "SL No": dataToExport.length + 1,
          Date: tableFormatDate(purchase.date),
          "Product ID": purchase.id,
          "Supplier Name": purchase.supplier_name,
          "Driver Name": purchase.driver_name !== "null" ? purchase.driver_name : "N/A",
          "Vehicle No": purchase.vehicle_no !== "null" ? purchase.vehicle_no : "N/A",
          "Vehicle Category": purchase.vehicle_category !== "null" ? purchase.vehicle_category : "N/A",
          Category: purchase.category,
          "Item Name": "N/A",
          Quantity: 0,
          "Unit Price": 0,
          Total: toNumber(purchase.total),
          "Service Charge": purchase.service_charge,
          "Purcahse Amount": toNumber(purchase.purchase_amount),
          "Last KM": purchase.last_km || "N/A",
            "Next KM": purchase.next_km || "N/A",
          Remarks: purchase.remarks || "N/A",
        })
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List")

    XLSX.writeFile(workbook, "Purchase_List.xlsx")
    toast.success("Excel file downloaded successfully!")
  }

  // PDF Export Function
  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Purchase List", 14, 15)

    if (startDate || endDate) {
      doc.setFontSize(10)
      doc.text(`Date Range: ${startDate || "Start"} to ${endDate || "End"}`, 14, 22)
    }

    // শুধু Action বাদ দিয়ে table data তৈরি
    const tableData = filteredPurchase.map((item, index) => [
      index + 1,
      item.id,
      item.supplier_name,
      item.driver_name !== "null" ? item.driver_name : "N/A",
      item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      item.category,
      item.item_name,
      item.quantity,
      item.unit_price,
      item.purchase_amount,
    ])

    autoTable(doc, {
      head: [
        ["SL", "Product ID", "Supplier", "Driver", "Vehicle No", "Category", "Item", "Qty", "Unit Price", "Total"],
      ],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      margin: { top: 30 },
    })

    doc.save("Purchase_List.pdf")
    toast.success("PDF file downloaded successfully!")
  }

  // Print Function
  const printTable = () => {
    // শুধু filtered data ব্যবহার
    const tableHeader = `
    <thead>
      <tr>
        <th>SL</th>
        <th>Date</th>
        <th>Product ID</th>
        <th>Supplier</th>
        <th>Driver</th>
        <th>Vehicle No</th>
        <th>Vehicle Category</th>
        <th>Category</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
        <th>Service Charge</th>
        <th>Purchase Amount</th>
      </tr>
    </thead>
  `

    let rowIndex = 1
    const tableRows = filteredPurchase
      .map((item) => {
        // If purchase has items, create a row for each item
        if (item.items && item.items.length > 0) {
          return item.items
            .map(
              (subItem, i) => `
            <tr>
              <td>${rowIndex++}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${item.id}</td>
              <td>${item.supplier_name}</td>
              <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
              <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
              <td>${item.vehicle_category !== "null" ? item.vehicle_category : "N/A"}</td>
              <td>${item.category}</td>
              <td>${subItem.item_name}</td>
              <td>${toNumber(subItem.quantity)}</td>
              <td>${toNumber(subItem.unit_price)}</td>
              <td>${toNumber(subItem.total)}</td>
              <td>${item.service_charge}</td>
              <td>${toNumber(item.purchase_amount)}</td>
            </tr>
          `,
            )
            .join("")
        } else {
          // If no items, still show the purchase
          return `
            <tr>
              <td>${rowIndex++}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${item.id}</td>
              <td>${item.supplier_name}</td>
              <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
              <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
              <td>${item.vehicle_category !== "null" ? item.vehicle_category : "N/A"}</td>
              <td>${item.category}</td>
              <td>N/A</td>
              <td>0</td>
              <td>0</td>
              <td>${toNumber(item.service_charge)}</td>
              <td>${toNumber(item.purchase_amount)}</td>
            </tr>
          `
        }
      })
      .join("")

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`

    const printWindow = window.open("", "", "width=1200,height=700")
    printWindow.document.write(`
    <html>
      <head>
        <title>Purchase List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          thead tr {
            background: linear-gradient(to right, #11375B, #1e4a7c);
            color: white;
          }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          td { color: #11375B; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
          @media print { body { margin: 0; } }
          thead th {
            color: #000000 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <h2>Purchase List</h2>
        ${printContent}
        <div class="footer">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
  return (
    <div className=" p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-2xl" />
            Maintenance Information
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
            <Link to="/tramessy/Purchase/add-maintenance">
              <button className="bg-gradient-to-r from-primary to-[#115e15]  text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus />Maintentance
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
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
              placeholder="Search by Product ..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">All Vehicle No</option>
              {uniqueVehicles.map((v, index) => (
                <option key={index} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <div className="">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setVehicleFilter("");
                  setShowFilter(false);
                }}
                className="bg-primary text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}
        <div id="purchaseTable" className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs ">
              <tr>
                <th className="px-2 py-4">SL.</th>
                <th className="px-2 py-4">Date</th>
                <th className="px-2 py-4">Prod.ID</th>
                <th className="px-2 py-4">Supplier</th>
                {/* <th className="px-2 py-2">Driver </th> */}
                <th className="px-2 py-2">VehicleCategory</th>
                <th className="px-2 py-2">VehicleNo</th>
                <th className="px-2 py-4">Category</th>
                <th className="px-2 py-4">ItemName</th>
                <th className="px-2 py-4">Quantity</th>
                <th className="px-2 py-4">UnitPrice</th>
                <th className="px-2 py-4">ServiceCharge</th>
                <th className="px-2 py-4">Total</th>
                {/* <th className="px-2 py-4">Bill Image</th> */}
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentPurchase.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No purchase found
                  </td>
                </tr>)
                : (currentPurchase?.map((dt, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">
                      {indexOfFirstItem + index + 1}.
                    </td>
                    <td className="p-2">{tableFormatDate(dt.date)}</td>
                    <td className="p-2">{dt.id}</td>
                    <td className="p-2">{dt.supplier_name}</td>
                    {/* <td className="px-2 py-2">{dt.driver_name !== "null" ? dt.driver_name : "N/A"}</td> */}
                    <td className="px-2 py-2">{dt.vehicle_category !== "null" ? dt.vehicle_category : "N/A"}</td>
                    <td className="px-2 py-2">{dt.vehicle_no !== "null" ? dt.vehicle_no : "N/A"}</td>

                    <td className="p-2">{dt.category}</td>
                    <td className="p-2">{dt.items.map((item, i) => (
                      <div key={i}>{item.item_name}</div>
                    ))}</td>
                    <td className="p-2">{dt.items.map((item, i) => (
                      <div key={i}>{item.quantity}</div>
                    ))}</td>
                    <td className="p-2">{dt.items.map((item, i) => (
                      <div key={i}>{item.unit_price}</div>
                    ))}</td>
                    <td className="p-2">{dt.service_charge}</td>
                    <td className="p-2">{dt.purchase_amount}</td>
                    {/* <td className="p-2">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${dt.bill_image}`}
                      alt=""
                      className="w-20 h-20 rounded-xl"
                    />
                  </td> */}
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link
                          to={`/tramessy/Purchase/update-maintenance/${dt.id}`}
                        >
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleViewCar(dt.id)}
                          className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                        >
                          <FaEye className="text-[12px]" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOfficialProductId(dt.id);
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

        {currentPurchase.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
      {/* view modal */}
      {viewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                Purchase Details
              </h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-10">

              {/* Image Preview */}
              {/* {selectedPurchase.image && (
                <div className="flex justify-center">
                  <img
                    src={selectedPurchase.image}
                    alt="Purchase"
                    className="w-60 h-60 object-cover rounded-xl border shadow-md"
                  />
                </div>
              )} */}

              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">Date:</span> {tableFormatDate(selectedPurchase.date)}</p>
                  <p><span className="font-medium text-gray-600">Supplier Name:</span> {selectedPurchase.supplier_name}</p>
                  <p><span className="font-medium text-gray-600">Category:</span> {selectedPurchase.category}</p>
                  <p><span className="font-medium text-gray-600">Purchase Amount:</span> {selectedPurchase.purchase_amount}</p>
                  <p><span className="font-medium text-gray-600">Service Charge:</span> {selectedPurchase.service_charge || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">Remarks:</span> {selectedPurchase.remarks}</p>
                  <p><span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${selectedPurchase.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedPurchase.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {selectedPurchase.status}
                    </span>
                  </p>
                </div>
              </section>

              {/* Vehicle Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">Driver Name:</span> {selectedPurchase.driver_name}</p>
                  <p><span className="font-medium text-gray-600">Branch Name:</span> {selectedPurchase.branch_name}</p>
                  <p><span className="font-medium text-gray-600">Vehicle No:</span> {selectedPurchase.vehicle_no}</p>
                  <p><span className="font-medium text-gray-600">Vehicle Category:</span> {selectedPurchase.vehicle_category}</p>
                </div>
              </section>

              {/* Service Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  Service Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">Service Date:</span> {selectedPurchase.service_date || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">Next Service Date:</span> {selectedPurchase.next_service_date || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">Last KM:</span> {selectedPurchase.last_km || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">Next KM:</span> {selectedPurchase.next_km || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">Priority:</span> {selectedPurchase.priority}</p>
                  <p><span className="font-medium text-gray-600">Validity:</span> {selectedPurchase.validity || "N/A"}</p>
                </div>
              </section>

              {/* Creator Info */}
              {/* <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  System Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">Created By:</span> {selectedPurchase.created_by}</p>
                  <div className="flex flex-col items-start ">
                    <span className="font-medium mb-2">Bill Image:</span>
                    <img
                      src={`https://ajenterprise.tramessy.com/backend/uploads/purchase/${selectedPurchase.image}`}
                      alt="Bill"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              </section> */}

              <section>
  <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
    System Info
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
    <p>
      <span className="font-medium text-gray-600">Created By:</span>{" "}
      {selectedPurchase.created_by}
    </p>
    <div className="flex flex-col items-start">
      <span className="font-medium mb-2">Bill Document:</span>
      {selectedPurchase.image ? (
        <div>
          {/* Check if file is PDF or Image */}
          {selectedPurchase.image.toLowerCase().endsWith(".pdf") ||
          selectedPurchase.image.includes("pdf") ? (
            // PDF Preview
            <div className="border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600 font-bold">PDF</span>
                <span className="text-sm text-gray-600">
                  {selectedPurchase.image}
                </span>
              </div>
              <a
                href={`https://ajenterprise.tramessy.com/backend/uploads/purchase/${selectedPurchase.image}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View PDF
              </a>
              {/* Optional: Embed PDF preview */}
              {/* <iframe
                src={`https://ajenterprise.tramessy.com/backend/uploads/purchase/${selectedPurchase.image}`}
                className="w-full h-48 mt-2 border rounded"
                title="PDF Preview"
              /> */}
            </div>
          ) : (
            // Image Preview
            <img
              src={`https://ajenterprise.tramessy.com/backend/uploads/purchase/${selectedPurchase.image}`}
              alt="Bill"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={(e) => {
                // If image fails to load, show placeholder
                e.target.onerror = null;
                e.target.src = "/placeholder-image.png";
                e.target.className = "w-32 h-32 object-contain rounded-lg border p-2";
              }}
            />
          )}
          {/* Download link for both */}
          <a
            href={`https://ajenterprise.tramessy.com/backend/uploads/purchase/${selectedPurchase.image}`}
            download
            className="block mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Download File
          </a>
        </div>
      ) : (
        <span className="text-gray-500 italic">No bill image uploaded</span>
      )}
    </div>
  </div>
</section>

              {/* Purchase Items */}
              {(
                <section>
                  <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                    Purchased Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm md:text-base">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3 text-left">Item Name</th>
                          <th className="p-3 text-center">Quantity</th>
                          <th className="p-3 text-center">Unit Price</th>
                          <th className="p-3 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPurchase?.items?.map((item, index) => (
                          <tr key={item.id} className=" hover:bg-gray-50">
                            <td className="p-3">{item.item_name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-center">{item.unit_price}</td>
                            <td className="p-3 text-center font-medium text-gray-800">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white flex justify-end p-2">
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Close
              </button>
            </div>
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
                  onClick={() => handleDelete(selectedOfficialProductId)}
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

export default PurchaseList;
