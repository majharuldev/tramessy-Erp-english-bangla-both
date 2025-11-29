
import axios from "axios";
import { useEffect, useState } from "react";
import { FaFilter, FaUserSecret } from "react-icons/fa6";
import { InputField } from "../../components/Form/FormFields";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../../components/Button/BtnSubmit";
import useRefId from "../../hooks/useRef";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { format, parseISO } from "date-fns";
import Pagination from "../../components/Shared/Pagination";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../hooks/formatDate";
import DatePicker from "react-datepicker";
import toNumber from "../../hooks/toNumber";

const PaymentList = () => {
  const generateRefId = useRefId();
  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // search
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get(`/payments`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response?.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching payment data:", error);
        setLoading(false);
      });
  }, []);
 
  // Filter by date
  const filteredPayment = payment?.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return tripDate >= start && tripDate <= end;
    } else if (start) {
      return tripDate.toDateString() === start.toDateString();
    } else {
      return true;
    }
  });
  // search
  const filteredPaymentList = filteredPayment?.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return (
      dt.date?.toLowerCase().includes(term) ||
      dt.item_name?.toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.purchase_id?.toLowerCase().includes(term) ||
      dt.category?.toLowerCase().includes(term) ||
      dt.quantity?.toLowerCase().includes(term) ||
      dt.unit_price?.toLowerCase().includes(term) ||
      dt.total?.toLowerCase().includes(term) ||
      dt.due_amount?.toLowerCase().includes(term) ||
      dt.pay_amount?.toLowerCase().includes(term) ||
      dt.branch_name?.toLowerCase().includes(term)
    );
  });


// excel export
  // excel
  const exportToExcel = () => {
    const exportData = filteredPaymentList.map((dt, index) => {
      const item = dt.purchase?.items?.[0];
      const total = parseFloat(dt.total_amount) || 0;
      const paid = parseFloat(dt.pay_amount) || 0;
      const due = total - paid;
      
      let status = "Unpaid";
      if (due === 0) {
        status = "Paid";
      } else if (paid > 0 && due > 0) {
        status = "Partial";
      }

      return {
        "SL": index + 1,
        "Date": dt.date,
        "Supplier Name": dt.supplier_name,
        "Category": dt.category,
        "Item name": item?.item_name || "-",
        "Quantity": toNumber(item?.quantity) || "-",
        "Rate": toNumber(item?.unit_price) || "-",
        "Service charge": toNumber(dt.purchase?.service_charge) || 0,
        "Total Amount": toNumber(dt?.total_amount) || "-",
        "Pay Amount": toNumber(dt.pay_amount),
        "Due": due,
        "Status": status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "পেমেন্ট রিপোর্ট");
    
    // কলামের width অটো-সেট করার জন্য
    const maxWidth = exportData.reduce((widths, row) => {
      Object.keys(row).forEach((key, idx) => {
        const length = row[key]?.toString().length || 0;
        if (!widths[idx] || length > widths[idx]) {
          widths[idx] = length;
        }
      });
      return widths;
    }, []);
    
    worksheet['!cols'] = maxWidth.map(w => ({ width: w + 2 }));
    
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "পেমেন্ট_রিপোর্ট.xlsx");
  };


  // handle print
  // প্রিন্ট ফাংশন - টেবিলের মতোই ফরম্যাট
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    const tableRows = filteredPaymentList.map((dt, index) => {
      const item = dt.purchase?.items?.[0];
      const total = parseFloat(dt.total_amount) || 0;
      const paid = parseFloat(dt.pay_amount) || 0;
      const due = total - paid;
      
      let status = "Unpaid";
      if (due === 0) {
        status = "Paid";
      } else if (paid > 0 && due > 0) {
        status = "Partial";
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${tableFormatDate(dt.date)}</td>
          <td>${dt.supplier_name}</td>
          <td>${dt.category}</td>
          <td>${item?.item_name || "-"}</td>
          <td>${item?.quantity || "-"}</td>
          <td>${item?.unit_price || "-"}</td>
          <td>${dt.purchase?.service_charge || 0}</td>
          <td>${dt?.total_amount || "-"}</td>
          <td>${dt.pay_amount}</td>
          <td>${due}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
    <html>
      <head>
        <title>পেমেন্ট রিপোর্ট</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            direction: ltr;
          }
          h3 { 
            text-align: center; 
            margin-bottom: 20px;
            color: #11375B;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
          }
          th {
            background-color: #11375B;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 9px; }
          }
            thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>পেমেন্ট রিপোর্ট</h3>
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Item name</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Service Charge</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Due</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: center; font-size: 12px;">
          মোট রেকর্ড: ${filteredPaymentList.length}
        </div>
      </body>
    </html>
  `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
  // onsubmit
  const onSubmit = async (data) => {
    // const refId = generateRefId();

    // Validation
    if (!data.pay_amount || isNaN(data.pay_amount)) {
      toast.error("Invalid payment amount", { position: "top-right" });
      return;
    }

    if (data.pay_amount > data.due_amount) {
      toast.error("The payment amount cannot be more than the due amount", {
        position: "top-right",
      });
      return;
    }

    // Calculate updated amount
    const previousAmount = parseFloat(selectedPayment.pay_amount) || 0;
    const newAmount = parseFloat(data.pay_amount);
    const updatedAmount = previousAmount + newAmount;

    try {
      // Prepare the complete payment payload
      const paymentPayload = {
        supplier_name: selectedPayment.supplier_name,
        // category: selectedPayment.category,
        // item_name: selectedPayment.item_name,
        // quantity: selectedPayment.quantity,
        // unit_price: selectedPayment.unit_price,
        total_amount: selectedPayment.total_amount,
        pay_amount: updatedAmount,
        remarks: data.note || "Partial payment",
        // driver_name: selectedPayment.driver_name,
        branch_name: selectedPayment.branch_name,
        // vehicle_no: selectedPayment.vehicle_no,
        created_by: selectedPayment.created_by || "admin"
      };

      // 1. Update Payment
      const response = await api.put(
        `/payments/${selectedPayment.id}`,
        paymentPayload
      );

      if (response.data.success) {

        // Update UI state
        setPayment(prevList =>
          prevList.map(item =>
            item.id === selectedPayment.id
              ? {
                ...item,
                pay_amount: updatedAmount,
                due_amount: parseFloat(item.total_amount) - updatedAmount,
                status:
                  updatedAmount === 0
                    ? "Unpaid"
                    : updatedAmount >= parseFloat(item.total_amount)
                      ? "Paid"
                      : "Partial"
              }
              : item
          )
        );

        // Refresh payment list
        const refreshResponse = await api.get(
          `/payments`
        );
        if (refreshResponse.data.status === "Success") {
          setPayment(refreshResponse.data.data);
        }

        toast.success("Payment updated successfully!", {
          position: "top-right",
        });
        setShowModal(false);
        reset();
      } else {
        toast.error(response.data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("Payment update error:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating payment"
      );
    }
  };


  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPaymentList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(currentPayments.length / itemsPerPage);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;


  return (
    <div className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 ">
            <FaUserSecret className="text-gray-800 text-2xl" />
            Payment
          </h2>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>

            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button> */}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
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
              }}
              placeholder="Search list..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {showFilter && (
          <div className="md:flex gap-6 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                  setCurrentPage(1)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-1 py-4">SL.</th>
                <th className="px-1 py-4">Date</th>
                <th className="px-1 py-4">Supplier Name</th>
                <th className="px-1 py-4">Category</th>
                <th className="px-1 py-4">Item Name</th>
                <th className="px-1 py-4">Quantity</th>
                <th className="px-1 py-4">Unit Price</th>
                <th className="px-1 py-4">Service Charge</th>
                <th className="px-1 py-4">Total Amount</th>
                <th className="px-1 py-4">Pay Amount</th>
                <th className="px-1 py-4">Due Amount</th>
                <th className="px-1 py-4">Status</th>
                <th className="px-1 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {
                currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-gray-500 italic">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        No payment data found.
                      </div>
                    </td>
                  </tr>
                )
                  : (currentPayments?.map((dt, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-all border border-gray-200"
                    >
                      <td className="px-1 py-2 font-bold">{index + 1}</td>
                      <td className="px-1 py-2 ">{tableFormatDate(dt.date)}</td>

                      <td className="px-1 py-2">{dt.supplier_name}</td>
                      <td className="px-1 py-2">{dt.category}</td>
                      <td className="px-1 py-2">{dt?.purchase?.items?.map((item, i) => (
                      <div key={i}>{item.item_name}</div>
                    ))}</td>
                      <td className="px-1 py-2">{dt.purchase?.items.map((item, i) => (
                      <div key={i}>{item.quantity}</div>
                    ))}</td>
                      <td className="px-1 py-2">{dt.purchase?.items.map((item, i) => (
                      <div key={i}>{item.unit_price}</div>
                    ))}</td>
                    <td className="px-1 py-2">{dt.service_charge}</td>
                      <td className="px-1 py-2">{dt.total_amount}</td>
                      <td className="px-1 py-2">{dt.pay_amount}</td>
                      <td className="px-1 py-2">{dt.due_amount}</td>
                      <td className="px-1 py-2">
                        {(() => {
                          const total = parseFloat(dt.total_amount) || 0;
                          const paid = parseFloat(dt.pay_amount) || 0;
                          const due = total - paid;

                          let status = "Unpaid";
                          if (due === 0) {
                            status = "Paid";
                          } else if (paid > 0 && due > 0) {
                            status = "Partial";
                          }

                          return (
                            <select
                              value={status}
                              disabled
                              className="appearance-none text-xs font-semibold rounded-md px-2 py-1 border border-gray-300 bg-gray-100 text-gray-700"
                            >
                              <option value="Paid">Paid</option>
                              <option value="Unpaid">Unpaid</option>
                              <option value="Partial">Partial</option>
                            </select>
                          );
                        })()}
                      </td>

                      <td className="px-1 action_column">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              if (
                                parseFloat(dt.total_amount) - parseFloat(dt.pay_amount) <=
                                0
                              )
                                return;
                              setSelectedPayment(dt);
                              setShowModal(true);
                              reset({
                                due_amount: dt.total_amount - dt.pay_amount,
                                pay_amount: dt.pay_amount,
                                // note: dt.item_name,
                              });
                            }}
                            className={`px-1 py-1 rounded shadow-md transition-all cursor-pointer ${parseFloat(dt.total_amount) - parseFloat(dt.pay_amount) > 0
                              ? "text-primary hover:bg-primary hover:text-white"
                              : "text-green-700 bg-gray-200 cursor-not-allowed"
                              }`}
                            disabled={
                              parseFloat(dt.total_amount) - parseFloat(dt.pay_amount) <= 0
                            }
                          >
                            {parseFloat(dt.total_amount) - parseFloat(dt.pay_amount) > 0
                              ? "Pay Now"
                              : "Complete"}
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
        {currentPayments.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* modal start */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50  flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-[#11375B]">
              Update Payment
            </h2>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField
                  name="due_amount"
                  label="Due Amount"
                  required
                  readOnly
                />
                <InputField name="pay_amount" label="Pay Amount" required />
                <InputField name="note" label="Note" />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 px-4 rounded mt-4 hover:bg-primary hover:text-white cursor-pointer transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <BtnSubmit>Submit</BtnSubmit>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
      {/* modal end */}
    </div>
  );
};

export default PaymentList;