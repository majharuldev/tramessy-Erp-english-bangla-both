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
const SalarySheet = () => {
  const [employees, setEmployees] = useState([]);
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [attendences, setAttendences] = useState([]);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const printRef = useRef();
  const printTableRef = useRef();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loanData, setLoanData] = useState([]);
  const [bonusData, setBonusData] = useState([]);

  // Fetch all API data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, salaryRes, attRes, loanRes, bonusRes] = await Promise.all([
          api.get('/employee'),
          api.get('/salaryAdvanced'),
          api.get('/attendence'),
           api.get('/loan'),
        api.get('/bonous'),
        ]);

        // setEmployees(empRes.data.data || []);
         if (empRes.data?.success) {
        //  active employee filter
        const activeEmployees = empRes.data.data.filter(
          (employee) => employee.status?.toLowerCase() === "active"
        );
        setEmployees(activeEmployees);
      }
        setSalaryAdvances(salaryRes.data.data || []);
        setAttendences(attRes.data.data || []);
        setLoanData(loanRes.data.data || []); 
      setBonusData(bonusRes.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch data");
        console.error(err);
      } finally {
      setLoading(false); // stop loading
    }

    };

    fetchData();
  }, []);

  
  // Merge data for salary sheet
// useEffect(() => {
//   if (employees.length === 0) return;

//   const merged = employees.map((emp) => {
//     const empSalary = salaryAdvances.find(s => s.employee_id == emp.id) || {};
//     const empAttend = attendences.find(a => a.employee_id == emp.id) || {};

//     // বর্তমান মাস নির্ধারণ
//     const monthYear =
//       empAttend?.month ||
//       empSalary?.salary_month ||
//       new Date().toISOString().slice(0, 7);

//     //  loan শুধুমাত্র ঐ মাসেরটিই দেখাবে
//     // const empLoans = loanData.filter(l => {
//     //   if (l.employee_id != emp.id) return false;
//     //   const loanMonth = l.date?.slice(0, 7);
//     //   return loanMonth === monthYear;
//     // });
//     const empLoans = loanData.filter(l => {
//       if (l.employee_id !== emp.id) return false;
//       const loanMonth = l.date?.slice(0, 7);
//       return loanMonth === monthYear && Number(l.adjustment) > 0;
//     });

//     //  যদি ঐ মাসে একাধিক loan থাকে, সবগুলোর monthly_deduction যোগ করো
//     const totalLoanDeduction = empLoans.reduce(
//       (sum, l) => sum + Number(l.monthly_deduction || 0),
//       0
//     );

//     //  Bonus হিসাব
//     const empBonus = bonusData
//       .filter(b => b.employee_id == emp.id && b.status === "Completed")
//       .reduce((sum, b) => sum + Number(b.amount), 0);

//     //  Salary অংশ
//     const basic = emp.basic ? Number(emp.basic) : 0;
//     const rent = emp.house_rent ? Number(emp.house_rent) : 0;
//     const conv = emp.conv ? Number(emp.conv) : 0;
//     const medical = emp.medical ? Number(emp.medical) : 0;
//     const allowance = emp.allowan ? Number(emp.allowan) : 0;
//     const totalEarnings = basic + rent + conv + medical + allowance + empBonus;

//     //  Deduction হিসাব
//     const advance = empSalary.amount ? Number(empSalary.amount) : 0;
//     const loanDeduction = totalLoanDeduction;
//     const deductionTotal = advance + loanDeduction;
//     const netPay = totalEarnings - deductionTotal;

//     //  Return merged data row
//     return {
//       empId: emp.id,
//       name: emp.employee_name,
//       designation: emp.designation || "",
//       days: empAttend.working_day || "",
//       monthYear,
//       basic,
//       rent,
//       conv,
//       medical,
//       allowance,
//       bonus: empBonus,
//       total: basic + rent + conv + medical + allowance + empBonus,
//       advance,
//       monthly_deduction: loanDeduction,
//       deductionTotal,
//       netPay
//     };
//   });

//   setData(merged);
// }, [employees, salaryAdvances, attendences, loanData, bonusData]);

useEffect(() => {
  if (employees.length === 0) return;

  const merged = employees.map((emp) => {
    const empSalary = salaryAdvances.find(s => s.employee_id == emp.id) || {};
    const empAttend = attendences.find(a => a.employee_id == emp.id) || {};

    const monthYear =
      empAttend?.month ||
      empSalary?.salary_month ||
      new Date().toISOString().slice(0, 7);

    const empLoans = loanData.filter(l => {
      if (l.employee_id !== emp.id) return false;

      const loanStartMonth = l.date?.slice(0, 7);
      let adjustmentLeft = Number(l.adjustment || 0);

      // Monthly deduction cannot be more than remaining adjustment
      let deductionThisMonth = Math.min(adjustmentLeft, Number(l.monthly_deduction || 0));

      // Deduction will apply only if adjustment > 0
      return deductionThisMonth > 0 && loanStartMonth <= monthYear;
    });

    const totalLoanDeduction = empLoans.reduce((sum, l) => {
      let adjustmentLeft = Number(l.adjustment || 0);
      let deductionThisMonth = Math.min(adjustmentLeft, Number(l.monthly_deduction || 0));
      return sum + deductionThisMonth;
    }, 0);

    // Bonus calculation
    const empBonus = bonusData
      .filter(b => b.employee_id == emp.id && b.status === "Completed")
      .reduce((sum, b) => sum + Number(b.amount), 0);

    // Salary components
    const basic = emp.basic ? Number(emp.basic) : 0;
    const rent = emp.house_rent ? Number(emp.house_rent) : 0;
    const conv = emp.conv ? Number(emp.conv) : 0;
    const medical = emp.medical ? Number(emp.medical) : 0;
    const allowance = emp.allowan ? Number(emp.allowan) : 0;
    const totalEarnings = basic + rent + conv + medical + allowance + empBonus;

    const advance = empSalary.amount ? Number(empSalary.amount) : 0;
    const deductionTotal = advance + totalLoanDeduction;
    const netPay = totalEarnings - deductionTotal;

    return {
      empId: emp.id,
      name: emp.employee_name,
      designation: emp.designation || "",
      days: empAttend.working_day || "",
      monthYear,
      basic,
      rent,
      conv,
      medical,
      allowance,
      bonus: empBonus,
      total: totalEarnings,
      advance,
      monthly_deduction: totalLoanDeduction,
      deductionTotal,
      netPay
    };
  });

  setData(merged);
}, [employees, salaryAdvances, attendences, loanData, bonusData]);


    // Month options
  const months = [...new Set(data.map(d => d.monthYear))]; 
  // Filtered data based on dropdowns
  const filteredData = useMemo(() => {
    return data
      .filter(row => (selectedMonth ? row.monthYear === selectedMonth : true))
      .filter(row => (selectedEmployee ? row.empId === Number(selectedEmployee) : true))
      .sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  }, [data, selectedMonth, selectedEmployee]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const grandTotal = useMemo(() => filteredData.reduce((sum, row) => sum + row.total, 0), [filteredData]);
  const grandNetPay = useMemo(() => filteredData.reduce((sum, row) => sum + row.netPay, 0), [filteredData]);

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

  // Excel export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");
    XLSX.writeFile(workbook, "SalarySheet.xlsx");
  };

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Designation', 'Days', 'Basic', 'H/Rent', 'Conv', 'Medical', 'Allowance', 'Total', 'Advance', 'NetPay']],
      body: filteredData.map(d => [d.name, d.designation, toNumber(d.days), toNumber(d.basic), toNumber(d.rent), toNumber(d.conv), toNumber(d.medical), toNumber( d.allowance), toNumber(d.total), toNumber(d.advance), toNumber(d.netPay)]),
    });
    doc.save('SalarySheet.pdf');
  };
// Full filtered table print function
const handlePrintTable = () => {
  // Get the table element
  const table = document.getElementById('salary-table');
  if (!table) return;

  // Clone the table to remove unwanted columns (Action)
  const clone = table.cloneNode(true);

  // Remove Action column from header
  const headerRow = clone.querySelector('thead tr:last-child'); // last header row
  if (headerRow) {
    const actionTh = headerRow.querySelector('th:last-child');
    if (actionTh) actionTh.remove();
  }
  // Remove Action column from all header rows
  clone.querySelectorAll('thead tr').forEach(tr => {
    const ths = tr.querySelectorAll('th');
    ths.forEach(th => {
      if (th.innerText.toLowerCase().includes('action')) {
        th.remove();
      }
    });
  });

  // Remove Action column from each body row
  clone.querySelectorAll('tbody tr').forEach(tr => {
    const actionTd = tr.querySelector('td:last-child');
    if (actionTd) actionTd.remove();
  });

  // Remove pagination if exists
  const pag = document.querySelector('.pagination');
  if (pag) pag.remove();

  // Open new window for print
  const newWin = window.open('', '', 'width=900,height=700');
  newWin.document.write(`
    <html>
      <head>
        <title>Salary Sheet</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #333; padding: 4px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h3>Salary Sheet</h3>
        ${clone.outerHTML}
      </body>
    </html>
  `);
  newWin.document.close();
  newWin.focus();
  newWin.print();
  newWin.close();
};


  return (
    <div className='p-2'>
      <div className="w-[24rem] md:w-full max-w-7xl overflow-hidden overflow-x-auto mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            {/* <FaTruck className="text-gray-800 text-2xl" /> */}
            Salary Sheet
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <Link to="/tramessy/AddSallaryExpenseForm">
            <button onClick={() => showModal()} className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> Add
            </button>
            </Link> */}
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

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>

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
           <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-2 rounded-md w-full">
              <option value="">-- Select Month --</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

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
                <th className="border border-gray-400 px-2 py-1">By CEO</th>
                <th className="border border-gray-400 px-2 py-1">Net Pay Half</th>
                <th className="border border-gray-400 px-2 py-1">Action</th>
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
                <th className="border border-gray-400 px-2 py-1 "></th>
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
                currentItems.map((row, i) => (
                  <tr key={i} className="text-center hover:bg-gray-100">
                    <td className="border border-gray-400 px-2 py-1">{i + 1}</td>
                    <td className="border border-gray-400 px-2 py-1 text-left">{row.name}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.days}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.designation}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.basic?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.rent?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.conv?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.medical?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.allowance?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.bonus?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1 font-semibold">
                      {row?.total?.toLocaleString()}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">{row?.advance?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.monthly_deduction?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.deductionTotal?.toLocaleString()}</td>
                    <td className="border border-gray-400 px-2 py-1">C</td>
                    <td className="border border-gray-400 px-2 py-1  font-bold">
                      {row?.netPay?.toLocaleString()}
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
                <td className="border border-gray-400 px-2 py-1" colSpan={4}></td>
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
    </div>

  );
};

export default SalarySheet;