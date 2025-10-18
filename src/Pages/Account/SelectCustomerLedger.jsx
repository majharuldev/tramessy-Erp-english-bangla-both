
import { useEffect, useState, useRef } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
import axios from "axios";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IoIosRemoveCircle } from "react-icons/io";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../hooks/formatDate";
import DatePicker from "react-datepicker";
import { jsPDF } from "jspdf";       
import autoTable from "jspdf-autotable";

// Patch jsPDF manually
// autoTable(jsPDF);

const SelectCustomerLadger = ({ customer, selectedCustomerName }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const tableRef = useRef();
  const [customerList, setCustomerList] = useState([]);

  // Fetch customer list with dues
  useEffect(() => {
    api.get(`/customer`)
      .then(res => {
        setCustomerList(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Find selected customer due
  const selectedCustomer = customerList.find(
    cust => cust.customer_name === selectedCustomerName
  );
  const dueAmount = selectedCustomer && selectedCustomer.due
    ? parseFloat(selectedCustomer.due) || 0
    : 0;

  // filter date 
  const filteredLedger = customer.filter((entry) => {
    const entryDate = new Date(entry.working_date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    if (start && !end) {
      return entryDate === start;
    } else if (start && end) {
      return entryDate >= start && entryDate <= end;
    } else {
      return true;
    }
  });

  // Calculate totals including opening balance
  const totals = filteredLedger.reduce(
    (acc, item) => {
      acc.rent += toNumber(item.bill_amount || 0);
      acc.rec_amount += toNumber(item.rec_amount || 0);
      return acc;
    },
    { rent: 0, rec_amount: 0 }
  );
  // Now calculate due from total trip - advance - pay_amount
  totals.due = totals.rent - totals.rec_amount;

  const grandDue = totals.due + dueAmount;

  const totalRent = filteredLedger.reduce(
    (sum, entry) => sum + parseFloat(entry.rec_amount || 0),
    0
  );

  const customerName = filteredLedger[0]?.customer_name || "All Customers";


  //  Excel Export (Filtered Data)
  const exportToExcel = () => {
    const rows = filteredLedger.map((dt, index) => ({
      SL: index + 1,
      Date: tableFormatDate(dt.working_date),
      Customer: dt.customer_name,
      Load: dt.load_point || "--",
      Unload: dt.unload_point || "--",
      Vehicle: dt.vehicle_no || "--",
      Driver: dt.driver_name || "--",
      "Trip Rent": toNumber(dt.bill_amount || 0),
      Demurage: toNumber(dt.d_total || 0),
      "Bill Amount": toNumber(dt.bill_amount || 0) + toNumber(dt.d_total || 0),
      "Received Amount": toNumber(dt.rec_amount || 0),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Ledger");
    XLSX.writeFile(workbook, `${customerName}-Ledger.xlsx`);
  };

  //  PDF Export (Filtered Data
// const exportToPDF = () => {
//   const doc = new jsPDF("p", "pt", "a4");

//   // Prepare table rows
//   let cumulativeDue = dueAmount;
//   const rows = filteredLedger.map((dt, index) => {
//     const tripRent = toNumber(dt.bill_amount);
//     const receivedAmount = toNumber(dt.rec_amount);
//     const demurageTotal = toNumber(dt.d_total);
//     const billAmount = tripRent + demurageTotal;
//     cumulativeDue += billAmount - receivedAmount;

//     return [
//       index + 1,
//       tableFormatDate(dt.working_date),
//       dt.customer_name,
//       dt.load_point || "--",
//       dt.unload_point || "--",
//       dt.vehicle_no || "--",
//       dt.driver_name || "--",
//       tripRent.toFixed(2),
//       demurageTotal.toFixed(2),
//       billAmount.toFixed(2),
//       receivedAmount.toFixed(2),
//       cumulativeDue.toFixed(2),
//     ];
//   });

//   // Add totals row (first 7 columns empty for alignment)
//   rows.push([
//     "Total",
//     "", "", "", "", "", "",
//     totals.rent.toFixed(2),
//     "", "",
//     totals.rec_amount.toFixed(2),
//     totals.due.toFixed(2),
//   ]);

//   // Table headers
//   const headers = [
//     "SL.",
//     "Date",
//     "Customer",
//     "Load",
//     "Unload",
//     "Vehicle",
//     "Driver",
//     "Trip Rent",
//     "Demurage",
//     "Bill Amount",
//     "Received Amount",
//     "Due",
//   ];

//   // Add table
//   doc.autoTable({
//     head: [headers],
//     body: rows,
//     startY: 70,
//     styles: { fontSize: 8, cellPadding: 3 },
//     headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: "center" },
//     columnStyles: {
//       0: { halign: "center" }, // SL
//       1: { halign: "center" }, // Date
//       2: { halign: "left" },   // Customer
//       3: { halign: "left" },
//       4: { halign: "left" },
//       5: { halign: "left" },
//       6: { halign: "left" },
//       7: { halign: "right" },  // Trip Rent
//       8: { halign: "right" },  // Demurage
//       9: { halign: "right" },  // Bill Amount
//       10: { halign: "right" }, // Received Amount
//       11: { halign: "right" }, // Due
//     },
//     didParseCell: (data) => {
//       // Make totals row bold
//       if (data.row.index === rows.length - 1) {
//         data.cell.styles.fontStyle = "bold";
//       }
//     },
//   });

//   // Add title
//   doc.setFontSize(14);
//   doc.text(`${customerName} - Customer Ledger`, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
//   doc.setFontSize(10);
//   doc.text(
//     `Date Range: ${startDate ? tableFormatDate(startDate) : "All"} - ${endDate ? tableFormatDate(endDate) : "All"}`,
//     doc.internal.pageSize.getWidth() / 2,
//     45,
//     { align: "center" }
//   );

//   doc.save(`${customerName}-Ledger.pdf`);
// };

  //  Print (Filtered Data)
  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>${customerName} Ledger</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 5px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">${customerName} - Customer Ledger</h2>
          <h4 style="text-align:center;">Date Range: ${startDate ? tableFormatDate(startDate) : "All"} - ${endDate ? tableFormatDate(endDate) : "All"}</h4>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="md:p-4">
      <div className="w-[23rem] md:w-full overflow-x-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B]">
            {filteredLedger.length > 0
              ? filteredLedger[0].customer_name
              : "All Customers"} Ledger
          </h1>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex gap-2 text-gray-700">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow  transition-all duration-300"
            >
              <FaFileExcel /> Excel
            </button>
            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow  transition-all duration-300"
            >
              <FaFilePdf /> PDF
            </button> */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow transition-all duration-300"
            >
              <FaPrint /> Print
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 mb-5">
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
            <div className="w-xs">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-primary w-full text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center mt-16">Loading...</p>
        ) : (
          <div ref={tableRef}>
            <table className="min-w-full text-sm text-left text-gray-900">
              <thead className="bg-gray-100 text-gray-800 font-bold">
                <tr className="font-bold bg-gray-50">
                  <td colSpan={8} className="border border-black px-2 py-1 text-right">
                    Total
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.rent}
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.rec_amount}
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.due}
                  </td>
                </tr>
                <tr>
                  <th className="border px-2 py-1">SL.</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Load</th>
                  <th className="border px-2 py-1">Unload</th>
                  <th className="border px-2 py-1">Vehicle</th>
                  {/* <th className="border px-2 py-1">Driver</th> */}
                  <th className="border px-2 py-1">Trip Rent</th>
                  <th className="border px-2 py-1">Demurage</th>
                  <th className="border px-2 py-1">Bill Amount</th>
                  <th className="border px-2 py-1">Recieved Amount</th>
                  <th className="border border-gray-700 px-2 py-1">
                    {selectedCustomerName && (
                      <p className="text-sm font-medium text-gray-800">
                        Opening Amount: ৳{dueAmount?.toFixed(2)}
                      </p>
                    )}
                    Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let cumulativeDue = dueAmount; // Opening balance
                  return filteredLedger.map((item, idx) => {
                    const tripRent = toNumber(item.bill_amount || 0);
                    const receivedAmount = toNumber(item.rec_amount || 0);
                    const demurageTotal = toNumber(item.d_total)
                    const billAmount = tripRent + demurageTotal;
                    // মোট due হিসাব
                    cumulativeDue += billAmount;
                    cumulativeDue -= receivedAmount;

                    return (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">{tableFormatDate(item.working_date)}</td>
                        <td className="border px-2 py-1">{item.customer_name}</td>
                        <td className="border px-2 py-1">
                          {item.load_point || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.unload_point || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.vehicle_no || <span className="flex justify-center items-center">--</span>}
                        </td>
                        {/* <td className="border px-2 py-1">
                          {item.driver_name || <span className="flex justify-center items-center">--</span>}
                        </td> */}
                        <td className="border px-2 py-1">
                          {tripRent ? tripRent : "--"}
                        </td>
                        <td className="border px-2 py-1">
                          {demurageTotal ? demurageTotal : "--"}
                        </td>
                        <td className="border px-2 py-1">
                          {billAmount ? billAmount : "--"}
                        </td>
                        <td className="border px-2 py-1">
                          {receivedAmount ? receivedAmount : "--"}
                        </td>
                        <td className="border px-2 py-1">
                          {cumulativeDue}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>

              <tfoot>

                {/* <tr className="font-bold bg-blue-100">
    <td colSpan={9} className="border border-black px-2 py-1 text-right">
      Final Due (Opening Due +)
    </td>
    <td className="border border-black px-2 py-1 text-right text-black">
      ৳{grandDue?.toFixed(2)}
    </td>
  </tr> */}
              </tfoot>

            </table>

            {/* Pagination */}
            {/* {pageCount > 1 && (
              <div className="mt-4 flex justify-center">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={"flex items-center gap-1"}
                  pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
                  previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  breakClassName={"px-3 py-1"}
                  activeClassName={"bg-primary text-white border-primary"}
                  forcePage={currentPage}
                />
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCustomerLadger;