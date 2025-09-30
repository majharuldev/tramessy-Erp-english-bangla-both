import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { SlCalender } from "react-icons/sl";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../components/Shared/Pagination";
import api from "../../utils/axiosConfig";

const MonthlyStatement = () => {
  const [allData, setAllData] = useState([]); // Store all data
  const [filteredData, setFilteredData] = useState([]); // Store filtered data
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // For month filter
  const [availableMonths, setAvailableMonths] = useState([]); 

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
        api.get(`/trip`),
        api.get(`/purchase`),
        api.get(`/expense`)
      ]);

      // Only approved trips
const trips = (tripsRes.data?.data || []).filter(
  (trip) => trip.status === "Approved"
);
      const purchases = purchasesRes.data?.data || [];
      const expenses = expensesRes.data?.data || [];

      const monthlyData = {};

      const getMonthKey = date => dayjs(date).format("YYYY-MM");

      // Process all data
      trips.forEach(trip => {
        const month = getMonthKey(trip.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (trip.transport_type === "own_transport") {
          monthlyData[month].ownTripIncome += parseFloat(trip.total_rent) || 0;
          monthlyData[month].ownTripCost += 
            (parseFloat(trip.fuel_cost) || 0) +
            (parseFloat(trip.driver_commission) || 0) +
            (parseFloat(trip.food_cost) || 0) +
            (parseFloat(trip.parking_cost) || 0) +
            (parseFloat(trip.toll_cost) || 0) +
            (parseFloat(trip.feri_cost) || 0) +
            (parseFloat(trip.police_cost) || 0) +
            (parseFloat(trip.labor) || 0);
        } else if (trip.transport_type === "vendor_transport") {
          monthlyData[month].vendorTripIncome += parseFloat(trip.total_rent) || 0;
          monthlyData[month].vendorTripCost += parseFloat(trip.total_exp) || 0;
        }
      });

      purchases.forEach(purchase => {
        const month = getMonthKey(purchase.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }
        monthlyData[month].purchaseCost += parseFloat(purchase.purchase_amount) || 0;
      });

      expenses.forEach(expense => {
        const month = getMonthKey(expense.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (expense.payment_category === "Salary") {
          monthlyData[month].salaryExpense += parseFloat(expense.pay_amount) || 0;
        } else {
          monthlyData[month].officeExpense += parseFloat(expense.pay_amount) || 0;
        }
      });

      // Convert to array
      const result = Object.entries(monthlyData)
        .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
        .map(([month, values], index) => ({
          id: index + 1,
          month: dayjs(month).format("MMMM YYYY"),
          monthKey: month,
          ...values,
          totalExpense: 
            values.ownTripCost + 
            values.vendorTripCost + 
            values.purchaseCost + 
            values.salaryExpense + 
            values.officeExpense,
          netProfit: 
            (values.ownTripIncome + values.vendorTripIncome) - 
            (values.ownTripCost + values.vendorTripCost + values.purchaseCost + values.salaryExpense + values.officeExpense)
        }));

      setAllData(result);
      setFilteredData(result);
      
      // Set available months for dropdown
      const months = Object.keys(monthlyData).map(month => ({
        value: month,
        label: dayjs(month).format("MMMM YYYY")
      }));
      setAvailableMonths(months);
      
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply month filter
  useEffect(() => {
    if (selectedMonth) {
      const filtered = allData.filter(item => item.monthKey === selectedMonth);
      setFilteredData(filtered);
    } else {
      setFilteredData(allData);
    }
  }, [selectedMonth, allData]);

  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      "Month": item.month,
      "Own Trip Income": item.ownTripIncome,
      "Vendor Trip Income": item.vendorTripIncome,
      "Own Trip Cost": item.ownTripCost,
      "Vendor Trip Cost": item.vendorTripCost,
      "Purchase Cost": item.purchaseCost,
      "Salary Expense": item.salaryExpense,
      "Office Expense": item.officeExpense,
      "Total Expense": item.totalExpense,
      "Net Profit": item.netProfit
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Statement");
    XLSX.writeFile(workbook, "Monthly_Statement.xlsx");
  };

  // pdf
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Statement Report", 10, 10);
    
    autoTable(doc, {
      head: [
        ["Month", "Own Income", "Vendor Income", "Own Cost", "Vendor Cost", 
         "Purchases", "Salaries", "Office", "Total Expense", "Net Profit"]
      ],
      body: filteredData.map(item => [
        item.month,
        item.ownTripIncome.toFixed(2),
        item.vendorTripIncome.toFixed(2),
        item.ownTripCost.toFixed(2),
        item.vendorTripCost.toFixed(2),
        item.purchaseCost.toFixed(2),
        item.salaryExpense.toFixed(2),
        item.officeExpense.toFixed(2),
        item.totalExpense.toFixed(2),
        item.netProfit.toFixed(2)
      ]),
      startY: 20
    });
    
    doc.save("Monthly_Statement.pdf");
  };

  useEffect(() => {
    fetchData();
  }, []);

  // print
  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-table, .print-table * {
        visibility: visible;
      }
      .print-table {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
  const handlePrint = () => {
  const printContents = document.querySelector('.print-table').outerHTML;
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // To restore the original state
};

    // pagination
  const [currentPage, setCurrentPage] = useState([1])
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // Calculate totals
  const calculateTotal = (key) => {
    return filteredData.reduce((sum, item) => sum + (item[key] || 0), 0);
  };

  return (
    <div className="p-2">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <SlCalender className="text-lg" />
          Monthly Profit/loss Statement
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <FaFilter /> Filter
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
          <div className="relative w-full">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            >
              <option value="">All Months</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => {
                setSelectedMonth("");
                setCurrentPage(1);
              }}
              className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Clear 
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow rounded  hover:text-white transition-all duration-300 cursor-pointer"
        >
          <FaFileExcel /> Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  rounded hover:text-white transition-all duration-300 cursor-pointer"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-1 px-5 no-print hover:bg-primary bg-white  rounded shadow hover:text-white transition-all duration-300 cursor-pointer"
        >
          <FaPrint /> Print
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading data...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No data available for selected filter</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto rounded-md border border-gray-200 print-table">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-200 text-primary capitalize text-xs">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Own Trip Income</th>
                  <th className="p-2 border">Vendor Trip Income</th>
                  <th className="p-2 border">Own Trip Cost</th>
                  <th className="p-2 border">Vendor Trip Cost</th>
                  <th className="p-2 border">Purchase Cost</th>
                  <th className="p-2 border">Salary Expense</th>
                  <th className="p-2 border">Office Expense</th>
                  <th className="p-2 border">Total Expense</th>
                  <th className="p-2 border">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-400 text-center">{item.id}</td>
                    <td className="p-2 border border-gray-400">{item.month}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.ownTripIncome.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.vendorTripIncome.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.ownTripCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.vendorTripCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.purchaseCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.salaryExpense.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.officeExpense.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right  font-semibold">
                      {item.totalExpense.toFixed(2)}
                    </td>
                    <td className={`p-2 border border-gray-400 text-right font-semibold ${
                      item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.netProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-semibold">
                  <td className="p-2 border border-gray-400 text-center" colSpan={2}>Total</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('ownTripIncome').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('vendorTripIncome').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('ownTripCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('vendorTripCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('purchaseCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('salaryExpense').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('officeExpense').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('totalExpense').toFixed(2)}</td>
                  <td className={`p-2 border border-gray-400 text-right ${
                    calculateTotal('netProfit') >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateTotal('netProfit').toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            {/* pagination */}
               {currentItems.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
        </>
      )}
    </div>
    </div>
  );
};

export default MonthlyStatement;