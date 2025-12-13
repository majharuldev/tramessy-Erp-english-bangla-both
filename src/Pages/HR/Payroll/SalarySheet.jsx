
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from "react-icons/fa6"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTruck } from "react-icons/fa"
import { useReactToPrint } from 'react-to-print';
import Pagination from '../../../components/Shared/Pagination';
import { BiEdit, BiPrinter } from "react-icons/bi"
import toast from 'react-hot-toast';
import api from '../../../../utils/axiosConfig';
import PaySlipPrint from '../HRM/PaySlipPrint';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toNumber from '../../../hooks/toNumber';
import { useNavigate, useParams } from "react-router-dom";
const SalarySheet = () => {
  const { id } = useParams();
  const [salarySheetApiData, setSalarySheetApiData] = useState([])
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlip, setSelectedSlip] = useState(null);
  const printRef = useRef();
  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp, sheet] = await Promise.all([
          api.get("/employee"),
          api.get(`/salarySheet/${id}`),
        ]);

        const activeEmp = emp.data.data.filter(
          (e) => e.status?.toLowerCase() === "active"
        );

        setEmployees(activeEmp);
        setSalarySheetApiData(sheet.data.items);
      } catch (err) {
        toast.error("Failed to load data");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(salarySheetApiData, "salary")

  // month yeayr options
  const currentYear = new Date().getFullYear();
  const monthsName = [
    { num: "01", name: "January" },
    { num: "02", name: "February" },
    { num: "03", name: "March" },
    { num: "04", name: "April" },
    { num: "05", name: "May" },
    { num: "06", name: "Jun" },
    { num: "07", name: "July" },
    { num: "08", name: "August" },
    { num: "09", name: "September" },
    { num: "10", name: "October" },
    { num: "11", name: "November" },
    { num: "12", name: "December" },
  ];
  const monthYearOptions = [];

  for (let y = currentYear; y <= currentYear + 10; y++) {
    monthsName.forEach((m) => {
      monthYearOptions.push({
        value: `${y}-${m.num}`,
        label: `${y}-${m.name}`
      });
    });
  }
  const months = [...new Set(salarySheetApiData.map((d) => d.working_day))];

  const getEmployee = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      map[emp.id] = emp.employee_name;
    });
    return map;
  }, [employees]);

  const filteredData = useMemo(() => {
    return salarySheetApiData.filter((item) => {
      const empName =
        getEmployee[item.employee_id]?.toLowerCase() || "";

      // const matchSearch = searchTerm
      //   ? empName.includes(searchTerm.toLowerCase())
      //   : true;

      const matchEmployee = selectedEmployee
        ? String(item.employee_id) === String(selectedEmployee)
        : true;

      const matchMonth = selectedMonth
        ? item.month === selectedMonth || true
        : true;

      return matchEmployee && matchMonth;
    });
  }, [salarySheetApiData, selectedEmployee, selectedMonth, getEmployee]);

  // payslip print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Salary Sheet",
    onAfterPrint: () => {
      console.log("[v0] Print completed, clearing selected slip")
      setSelectedSlip(null)
    },
  })

  const handlePrintClick = (item) => {
    console.log("[v0] Print button clicked for:", item.name)
    setSelectedSlip(item)
    // Give React time to render the component before printing
    setTimeout(() => {
      if (printRef.current) {
        console.log("[v0] Triggering print")
        handlePrint()
      } else {
        console.error("[v0] Print ref is null")
      }
    }, 100)
  }

// net pay
  const calculateNetPay = (row) => {
    const earnings = toNumber(row.e_total || 0);
    const deduction = toNumber(row.d_total || 0);
    return earnings - deduction;
  };

  // confirm status change modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [confirmId, setConfirmId] = useState(null);

const openConfirmModal = (id) => {
  setConfirmId(id);
  setIsConfirmModalOpen(true);
};

// const handleConfirmStatus = async () => {
//   try {
//     await api.put(`/salarySheet/salary-item/${confirmId}`, { status: "Paid", });

//     setSalarySheetApiData((prev) =>
//       prev.map((item) =>
//         item.id === confirmId ? { ...item, status: "Paid" } : item
//       )
//     );

//     toast.success("Status updated to Paid");
//   } catch (err) {
//     toast.error("Failed to update status");
//   } finally {
//     setIsConfirmModalOpen(false);
//     setConfirmId(null);
//   }
// };



const handleConfirmStatus = async () => {
  try {
    // Find the salary item to update
    const itemToUpdate = salarySheetApiData.find(item => item.id === confirmId);

    if (!itemToUpdate) {
      toast.error("Salary item not found");
      return;
    }

    // Prepare payload with status + other data
    const payload = {
      ...itemToUpdate,
      status: "Paid"
    };

    // Send PUT request
    await api.put(`/salary-item/${confirmId}`, payload);

    // Update local state
    setSalarySheetApiData((prev) =>
      prev.map((item) =>
        item.id === confirmId ? { ...item, status: "Paid" } : item
      )
    );

    toast.success("Status updated to Paid");
  } catch (err) {
    console.log(err);
    toast.error("Failed to update status");
  } finally {
    setIsConfirmModalOpen(false);
    setConfirmId(null);
  }
};

  const [currentPage, setCurrentPage] = useState([1])
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const grandTotal = useMemo(() => filteredData.reduce((sum, row) => sum + toNumber(row.e_total), 0), [filteredData]);
  const grandNetPay = useMemo(() => filteredData.reduce((sum, row) => sum + toNumber(calculateNetPay(row)), 0), [filteredData]);


  //   // Excel export
  const exportExcel = () => {
    const excelData = filteredData.map((row, index) => ({
      SL: index + 1,
      Name: getEmployee[row.employee_id],
      "Working Day": toNumber(row.working_day),
      Designation: row.designation,
      Basic: toNumber(row.basic),
      HouseRent: toNumber(row.house_rent),
      Conv: toNumber(row.conv),
      Medical: toNumber(row.medical),
      Allowance: toNumber(row.allown),
      Bonus: toNumber(row.bonous),
      "Earning Total": toNumber(row.e_total),
      Advance: toNumber(row.adv),
      Loan: toNumber(row.loan),
      "Deduction Total": toNumber(row.d_total),
      "Net Pay": calculateNetPay(row),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");
    XLSX.writeFile(workbook, "SalarySheet.xlsx");
  };

  // // Full filtered table print function
  const handlePrintTable = () => {
    const originalTable = document.getElementById("salary-table");
    if (!originalTable) return;

    // clone table (structure same থাকবে)
    const tableClone = originalTable.cloneNode(true);

    //  Action column hide
    tableClone.querySelectorAll(".action_column").forEach(el => el.remove());

    //  replace tbody with FULL data
    const tbody = tableClone.querySelector("tbody");
    tbody.innerHTML = filteredData
      .map((row, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="text-align:left">${getEmployee[row.employee_id] || "N/A"}</td>
          <td>${row.working_day}</td>
          <td>${row.designation}</td>
          <td>${row.basic?.toLocaleString() || 0}</td>
          <td>${row.house_rent?.toLocaleString() || 0}</td>
          <td>${row.conv?.toLocaleString() || 0}</td>
          <td>${row.medical?.toLocaleString() || 0}</td>
          <td>${row.allown?.toLocaleString() || 0}</td>
          <td>${row.bonous?.toLocaleString() || 0}</td>
          <td>${row.e_total?.toLocaleString() || 0}</td>
          <td>${row.adv?.toLocaleString() || 0}</td>
          <td>${row.loan?.toLocaleString() || 0}</td>
          <td>${row.d_total?.toLocaleString() || 0}</td>
          <td>${calculateNetPay(row).toLocaleString()}</td>
        </tr>
      `)
      .join("");

    const logo = "/logo.png";

    const printWindow = window.open("", "", "width=1200,height=800");

    printWindow.document.write(`
  <html>
  <head>
  <title>Salary Sheet</title>

  <style>
  @page {
    size: A4 landscape;
    margin: 140px 20px 40px 20px;
  }

  body {
    font-family: Arial;
    font-size: 11px;
  }

  .print-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  th, td {
    border: 1px solid #000;
    padding: 4px;
    text-align: center;
  }

  th {
    background: #f0f0f0;
  }
  </style>
  </head>

  <body>

  <!-- HEADER -->
  <!-- <div class="print-header">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px">
      <div>
        <img src="${logo}" width="60"/>
        <div><b>M/S A J ENTERPRISE</b></div>
      </div>
      <div style="text-align:center">
        <h2 style="margin:0">Salary Sheet</h2>
        <div style="font-size:11px">
          Razzak Plaza, Dhaka-1217
        </div>
      </div>
      <div style="width:60px"></div>
    </div>
  </div> -->

  ${tableClone.outerHTML}

  </body>
  </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className='p-2'>
      <div className=" w-full overflow-x-auto mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            {/* <FaTruck className="text-gray-800 text-2xl" /> */}
            Salary Sheet
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="flex flex-wrap text-gray-700 gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>

            {/* <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button> */}

            <button
              onClick={handlePrintTable}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>

          {/* <div className=" gap-2">
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-12 top-[11.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div> */}
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            {/* <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Month</option>
                {monthYearOptions.map((m, index) => (
                  <option key={index} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select> */}

            <select value={selectedEmployee} onChange={e => { setSelectedEmployee(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-2 rounded-md w-full">
              <option value="">-- Select Employee --</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.employee_name}</option>)}
            </select>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setSelectedEmployee("")
                  setSelectedMonth("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto" >
          <table id="salary-table" className="min-w-full border-collapse border border-gray-400 text-xs">
            <thead>

              {/* Sub header row for SL numbers - merged for names */}
              <tr className=" text-black text-center">
                <th className="border border-gray-400 px-2 py-1" rowSpan={2}>SL</th>
                <th className="border border-gray-400 px-2 py-1" colSpan={1} rowSpan={2}>
                  Name
                </th>
                <th className="border border-gray-400 px-2 py-1" rowSpan={3}>Working<br />DAY</th>
                <th className="border border-gray-400 px-2 py-1" rowSpan={3}>Designation</th>
                <th className="border border-gray-400 px-2 py-1 " colSpan={7} >
                  E A R N I N G S
                </th>
                <th className="border border-gray-400 px-2 py-1 " colSpan={3}>
                  D E D U C T I O N
                </th>
                {/* <th className="border border-gray-400 px-2 py-1">By CEO</th> */}
                <th className="border border-gray-400 px-2 py-1">Net Pay Half</th>
                <th className="border border-gray-400 px-2 py-1 action_column">Action</th>
              </tr>
              {/* Main header row */}
              <tr className=" text-black text-center">
                <th className="border border-gray-400 px-2 py-1">Basic</th>
                <th className="border border-gray-400 px-2 py-1">H/Rent</th>
                <th className="border border-gray-400 px-2 py-1">Conv</th>
                <th className="border border-gray-400 px-2 py-1">Medical</th>
                <th className="border border-gray-400 px-2 py-1">Allowan Ce/Ot</th>
                <th className="border border-gray-400 px-2 py-1">Bonus</th>
                <th className="border border-gray-400 px-2 py-1 ">Total</th>
                <th className="border border-gray-400 px-2 py-1">Advance</th>
                <th className="border border-gray-400 px-2 py-1">Loan</th>
                <th className="border border-gray-400 px-2 py-1">Total</th>
                <th className="border border-gray-400 px-2 py-1"></th>
                <th className="border border-gray-400 px-2 py-1 "></th>
                {/* <th className="border border-gray-400 px-2 py-1 "></th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={16} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) :
                currentItems.map((row, ind) => (
                  <tr key={ind} className="text-center hover:bg-gray-100">
                    <td className="border border-gray-400 px-2 py-1"> {indexOfFirstItem + ind + 1}</td>
                    <td className="border border-gray-400 px-2 py-1 text-left">{getEmployee[row.employee_id] || "N/A"}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.working_day}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.designation}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.basic?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.house_rent?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.conv?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.medical?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.allown?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.bonous?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1 font-semibold">
                      {row?.e_total?.toLocaleString()}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">{row?.adv?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.loan?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.d_total?.toLocaleString()}</td>
                    {/* <td className="border border-gray-400 px-2 py-1">C</td> */}
                    <td className="border border-gray-400 px-2 py-1  font-bold">
                      {calculateNetPay(row).toLocaleString()}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 action_column flex items-center gap-2">
                      <button
                        onClick={() => {
                          // setSelectedSlip(row);
                          handlePrintClick(row);
                        }}
                        className="flex items-center w-full px-3 py-1 text-sm text-gray-700 bg-white shadow rounded"
                      >
                        <BiPrinter className="mr-1 h-4 w-4" />
                        PaySlip
                      </button>
                     
                        <button
                          onClick={() => openConfirmModal(row.id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded shadow-md hover:bg-yellow-600"
                        >
                          {row?.status === "Paid" ? "Paid" : "Unpaid"}
                        </button>
                    
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className=" font-bold text-center">
                <td className="border border-gray-400 px-2 py-1" colSpan={10}>
                  Grand Total
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {grandTotal.toLocaleString()}
                </td>
                <td className="border border-gray-400 px-2 py-1" colSpan={3}></td>
                <td className="border border-gray-400 px-2 py-1">
                  {grandNetPay.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          {/* pagination */}
          {currentItems.length > 0 && totalPages >= 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          )}
        </div>
        {/* Hidden Component for Printing */}
        <div style={{ display: "none" }} >
          {selectedSlip &&
            <div ref={printRef}><PaySlipPrint data={selectedSlip} /></div>
          }
        </div>
      </div>
      {isConfirmModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[380px] rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Confirm Payment</h2>
      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to mark this salary as Paid?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsConfirmModalOpen(false)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmStatus}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

    </div>

  );
};

export default SalarySheet;