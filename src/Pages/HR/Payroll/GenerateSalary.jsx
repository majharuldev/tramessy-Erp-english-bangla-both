import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from "react-icons/fa6"
import { FaFileExcel, FaFilePdf, FaFilter, FaPen, FaPrint, FaTrashAlt, FaTruck } from "react-icons/fa"
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
import { useForm } from 'react-hook-form';
import { tableFormatDate } from '../../../hooks/formatDate';
import { GrView } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthProvider';
const GenerateSalary = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [deleteId, setDeleteId] = useState(null);
  const {user} = useContext(AuthContext)
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedSlip, setSelectedSlip] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [mergedData, setMergedData] = useState([]);

  const [salarySheetApiData, setSalarySheetApiData] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
const [updateMonth, setUpdateMonth] = useState("");
const [selectedSheet, setSelectedSheet] = useState(null);

  const [loading, setLoading] = useState(true);
  const methods = useForm();
  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp, adv, att, loan, bonus, sheet] = await Promise.all([
          api.get("/employee"),
          api.get("/salaryAdvanced"),
          api.get("/attendence"),
          api.get("/loan"),
          api.get("/bonous"),
          api.get("/salarySheet"),
        ]);

        const activeEmp = emp.data.data.filter(
          (e) => e.status?.toLowerCase() === "active"
        );

        setEmployees(activeEmp);
        setSalaryAdvances(adv.data.data);
        setAttendances(att.data.data);
        setLoanData(loan.data.data);
        setBonusData(bonus.data.data);
        setSalarySheetApiData(sheet.data.data);
      } catch (err) {
        toast.error("Failed to load data");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Merge & prepare salary sheet
  // useEffect(() => {
  //   if (employees.length === 0) return;

  //   const result = employees.map((emp) => {
  //     const empSalary = salaryAdvances.find((s) => s.employee_id == emp.id) || {};
  //     const empAtt = attendances.find((a) => a.employee_id == emp.id) || {};

  //     const month =
  //       empAtt?.month ||
  //       empSalary?.salary_month ||
  //       new Date().toISOString().slice(0, 7);

  //     const empLoans = loanData.filter((l) => {
  //       if (l.employee_id != emp.id) return false;

  //       const loanMonth = l.date?.slice(0, 7);
  //       let remain = toNumber(l.adjustment);
  //       let deduct = Math.min(remain, toNumber(l.monthly_deduction));

  //       return deduct > 0 && loanMonth <= month;
  //     });

  //     const loanTotal = empLoans.reduce((sum, l) => {
  //       let remain = toNumber(l.adjustment);
  //       let deduct = Math.min(remain, toNumber(l.monthly_deduction));
  //       return sum + deduct;
  //     }, 0);

  //     const totalBonus = bonusData
  //       .filter((b) => b.employee_id == emp.id && b.status === "Completed")
  //       .reduce((sum, b) => sum + toNumber(b.amount), 0);

  //     const basic = Number(emp.basic || 0);
  //     const rent = Number(emp.house_rent || 0);
  //     const conv = Number(emp.conv || 0);
  //     const medical = Number(emp.medical || 0);
  //     const allowance = Number(emp.allowan || 0);

  //     const earnings = basic + rent + conv + medical + allowance + totalBonus;

  //     const advance = Number(empSalary.amount || 0);
  //     const deductionTotal = advance + loanTotal;

  //     const netPay = earnings - deductionTotal;

  //     return {
  //       employee_id: emp.id,
  //       employee_name: emp.employee_name,
  //       designation: emp.designation,
  //       working_day: empAtt.working_day,
  //       month,
  //       basic,
  //       rent,
  //       conv,
  //       medical,
  //       allowance,
  //       bonus: totalBonus,
  //       total: earnings,
  //       advance,
  //       loan: loanTotal,
  //       net_pay: netPay,
  //       status: "Unpaid",
  //     };
  //   });

  //   setMergedData(result);
  // }, [employees, salaryAdvances, attendances, loanData, bonusData]);

  const openDeleteModal = (id) => {
  setDeleteId(id);
  setIsDeleteModalOpen(true);
};

const handleConfirmDelete = async () => {
  try {
    await api.delete(`/salarySheet/${deleteId}`);

    // UI update
    setSalarySheetApiData((prev) =>
      prev.filter((item) => item.id !== deleteId)
    );

    toast.success("Salary sheet deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete salary sheet");
  } finally {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  }
};


  const generateSalaryForMonth = (selectedMonth) => {
  if (!selectedMonth) return [];

  return employees.map((emp) => {
    const empId = String(emp.id);

    /* ================= ATTENDANCE ================= */
    const attendance = attendances.find(
      (a) =>
        String(a.employee_id) === empId &&
        a.month === selectedMonth
    );

    const workingDay = attendance
      ? toNumber(attendance.working_day || 0)
      : 0;

    /* ================= ADVANCE SALARY ================= */
    const advanceRecord = salaryAdvances.find(
      (a) =>
        String(a.employee_id) === empId &&
        a.salary_month === selectedMonth
    );

    // advance = full amount deduct
    const advance = advanceRecord
      ? toNumber(advanceRecord.amount || 0)
      : 0;

    /* ================= BONUS ================= */
    const bonus = bonusData
      .filter(
        (b) =>
          String(b.employee_id) === empId &&
          b.month_of === selectedMonth // month match
          //  status filter বাদ
      )
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    /* ================= LOAN ================= */
    const employeeLoans = loanData.filter(
      (l) => String(l.employee_id) === empId
    );

    let loanDeduction = 0;

    employeeLoans.forEach((loan) => {
      const loanStartMonth = loan.date?.slice(0, 7); // YYYY-MM

      if (loanStartMonth <= selectedMonth) {
        const remaining = toNumber(loan.adjustment || 0);
        const monthly = toNumber(loan.monthly_deduction || 0);

        if (remaining > 0) {
          loanDeduction += Math.min(remaining, monthly);
        }
      }
    });

    /* ================= SALARY PARTS ================= */
    const basic = toNumber(emp.basic || 0);
    const house_rent = toNumber(emp.house_rent || 0);
    const conv = toNumber(emp.conv || 0);
    const medical = toNumber(emp.medical || 0);
    const allowan = toNumber(emp.allowan || 0);

    /* ================= TOTAL ================= */
    const earnings =
      basic + house_rent + conv + medical + allowan + bonus;

    const deductions = advance + loanDeduction;

    const netPay = earnings - deductions;

    /* ================= FINAL OBJECT ================= */
    return {
      employee_id: emp.id,
      designation: emp.designation,
      working_day: workingDay,

      basic,
      house_rent,
      conv,
      medical,
      allown: allowan,     
      bonous: bonus,       
      status: "Unpaid",
      e_total: earnings,
      adv: advance,
      loan: loanDeduction,
      d_total: deductions,
      net_pay: netPay,
      month: selectedMonth,
    };
  });
};


// handleUpdate
  const handleUpdateClick = (item) => {
  setSelectedSheet(item);
  setUpdateMonth(item.generate_month || "");
  setIsUpdateModalOpen(true);
};

const handleUpdateGenerateSalary = async () => {
  if (!updateMonth) {
    toast.error("Please select month");
    return;
  }

  try {
    const updatedSalaryData = generateSalaryForMonth(updateMonth);

    await api.put(`/salarySheet/${selectedSheet.id}`, {
      generate_date: selectedSheet.generate_date,
      generate_month: updateMonth,
      items: updatedSalaryData,
    });

    toast.success("Salary updated successfully");

    setIsUpdateModalOpen(false);
    setSelectedSheet(null);

    // refresh list
    const res = await api.get("/salarySheet");
    setSalarySheetApiData(res.data.data);
  } catch (error) {
    toast.error("Failed to update salary");
    console.log(error);
  }
};


  // Send merged salary sheet to API
  const handleGenerate = async () => {
    if (!selectedMonth) {
      toast.error("Please select a month");
      return;
    }

    const dataToSend = generateSalaryForMonth(selectedMonth);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await api.post("/salarySheet", {
        generate_date: today,
        generate_month: selectedMonth,
        items: dataToSend,
      });

      toast.success("Salary generated successfully");
      setSalarySheetApiData((prev) =>
  prev.filter((item) => item.id !== deleteId)
);
       setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to generate salary");
    }
  };


  // Update status Paid
  const updateStatus = async (id) => {
    if (!window.confirm("Mark this salary as PAID?")) return;

    try {
      await api.patch(`/salarySheet/${id}`, { status: "Paid" });

      setSalarySheetApiData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Paid" } : item
        )
      );

      toast.success("Status Updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

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

  const filteredData = salarySheetApiData.filter((item) => {
    return (
      (selectedMonth ? item.working_day === selectedMonth : true) &&
      (selectedEmployee ? item.employee_id == selectedEmployee : true)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const grandTotal = useMemo(() => filteredData.reduce((sum, row) => sum + row.total, 0), [filteredData]);
  const grandNetPay = useMemo(() => filteredData.reduce((sum, row) => sum + row.netPay, 0), [filteredData]);

  //   // Excel export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");
    XLSX.writeFile(workbook, "SalarySheet.xlsx");
  };

  //   // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Designation', 'Days', 'Basic', 'H/Rent', 'Conv', 'Medical', 'Allowance', 'Total', 'Advance', 'NetPay']],
      body: filteredData.map(d => [d.name, d.designation, toNumber(d.days), toNumber(d.basic), toNumber(d.rent), toNumber(d.conv), toNumber(d.medical), toNumber(d.allowance), toNumber(d.total), toNumber(d.advance), toNumber(d.netPay)]),
    });
    doc.save('SalarySheet.pdf');
  };
  // // Full filtered table print function
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
      <div className=" w-full overflow-x-auto mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            {/* <FaTruck className="text-gray-800 text-2xl" /> */}
            Salary Sheet
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="">
              {/* <select
                {...methods.register("month_of", { required: "Month is required" })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Month</option>

                {monthYearOptions.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select> */}
              <select
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
              </select>
            </div>
            <button
              onClick={handleGenerate}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Generate Salary Sheet
            </button>
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Month</th>
                <th className="p-2">Generate By</th>
                {/* <th className="p-2">Status</th> */}
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                    <td className="p-2">{tableFormatDate(item.generate_date)}</td>
                    <td className="p-2">{item.generate_month} ৳</td>
                    <td className="p-2">{item.generate_by}</td>
                    {/* <td className="p-2">{item.status}</td> */}
                    <td className="p-2 flex gap-2 items-center">
                      { <button
                      onClick={() => handleUpdateClick(item)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaPen className="text-[12px]" />
                      </button>}
                      <Link to={`/tramessy/HR/payrol/salary-sheet/${item.id}`}><button
                        onClick={() => handleEdit(item)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <GrView className="text-[12px]" />
                      </button></Link>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* update modal */}
        {isUpdateModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[400px] rounded-lg shadow-lg p-5">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Update Salary Sheet
      </h2>

      {/* Month Select */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Select Month
        </label>
        <select
          value={updateMonth}
          onChange={(e) => setUpdateMonth(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Month</option>
          {monthYearOptions.map((m, i) => (
            <option key={i} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

    {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsUpdateModalOpen(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateGenerateSalary}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Update & Generate Salary
        </button>
      </div>
    </div>
  </div>
)}

   {/* delete modal */}
      {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[380px] rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Confirm Delete
      </h2>

      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to delete this salary sheet?
        <br />
        <span className="text-red-500 font-medium">
          This action cannot be undone.
        </span>
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
          }}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
)}
        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          </div>
        )}
      </div>
    </div>

  );
};

export default GenerateSalary;