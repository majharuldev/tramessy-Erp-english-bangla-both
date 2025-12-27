
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
import { formatDate } from "../hooks/formatDate"
import DatePicker from "react-datepicker"
import { FiFilter } from "react-icons/fi"
import logo from "../assets/AJ_Logo.png"
import { useTranslation } from "react-i18next"
import toNumber from "../hooks/toNumber"
const TripList = () => {
  const {t} = useTranslation();
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
  const handleViewPrint = () => {
    const printContent = document.getElementById("printArea");
    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(btn => (btn.style.display = 'none'));
    const WindowPrint = window.open("", "", "width=900,height=650");
    WindowPrint.document.write(`
    <html>
      <head>
        <title>-</title>
        <style>
          /* --- FIX 1 : Proper margin (no cut on left/right) --- */
          @page { 
            size: A4;
            margin: 10mm; 
          }

          body {
            font-family: Arial, sans-serif;
            padding: 5px;
          }

          /* --- FIX 2 : Center Header (logo + address) --- */
         
          .print-header h2 {
            margin: 5px 0 0 0;
            font-size: 20px;
            font-weight: bold;
          }
          .print-header p {
            margin: 0;
            font-size: 12px;
            color: #444;
          }

          /* Print Layout Fix — Logo left, header centered */
.print-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.print-logo{
  text-align: left !important;
  flex: 1;
}
  .print-logo img{
  width: 80px !important;
}
.print-header-text {
  flex: 2;
  text-align: center !important;
}


          /* --- FIX 3 : Two-column grid with border in middle --- */
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border: 1px solid #ccc;   /* outer border */
          }

          .grid div {
            padding: 5px;
            border-bottom: 1px solid #ddd;
          }

          /* Middle vertical border */
          .grid div:nth-child(odd) {
            border-right: 1px solid #ddd;
          }

          /* Remove last row bottom border if odd/even mismatch */
          .grid div:last-child {
            border-bottom: none;
          }

          strong {
            color: #222;
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

    // Re-show hidden buttons
    setTimeout(() => {
      buttons.forEach(btn => (btn.style.display = ''));
    }, 500);
  };


  // Sort trips by date descending (latest first)
  const sortedTrips = [...trip].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))

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
      dt.load_point?.toLowerCase().includes(term) ||
      dt.unload_point?.toLowerCase().includes(term) ||
      dt.invoice_no?.toLowerCase().includes(term) ||
      dt.buyar_name?.toLowerCase().includes(term) ||
      dt.branch_name?.toLowerCase().includes(term) ||
      dt.vendor_name?.toLowerCase().includes(term) ||
      dt.challan?.toLowerCase().includes(term)
    )
  })

// EXPORT TRIPS TO EXCEL
const exportTripsToExcel = async () => {
  try {
    if (!filteredTripList || filteredTripList.length === 0) {
      toast.error("No filtered trip data found!");
      return;
    }

    // EXCEL HEADERS (INSIDE FUNCTION)
    const headers = [
      { label: "SL", key: "sl" },
      { label: "Date", key: "start_date" },
      { label: "Customer", key: "customer" },
      { label: "Driver", key: "driver_name" },
      { label: "Vehicle No", key: "vehicle_no" },
      { label: "Vendor Name", key: "vendor_name" },
      { label: "Load Point", key: "load_point" },
      { label: "Unload Point", key: "unload_point" },
      { label: "Trip Rent", key: "total_rent" },
      { label: "C.Demurrage", key: "d_total" },
      { label: "Food Cost", key: "food_cost" },
      { label: "Fuel Cost", key: "fuel_cost" },
      { label: "Challan Cost", key: "challan_cost" },
      { label: "Parking Cost", key: "parking_cost" },
      { label: "Night Gurad", key: "night_guard" },
      { label: "Toll Cost", key: "toll_cost" },
      { label: "Feri Cost", key: "feri_cost" },
      { label: "Police Cost", key: "police_cost" },
      { label: "Labour Cost", key: "labor" },
      { label: "Chada", key: "chada" },
      { label: "Additional Cost", key: "additional_cost" },
      { label: "Others Cost", key: "others_cost" },
      { label: "Total Trip Cost", key: "total_cost" },
      { label: "Profit", key: "profit" },
      { label: "Driver Advance", key: "driver_adv" },
      { label: "Buyer Name", key: "buyer_name" },
      { label: "Challan No", key: "challan" },
      { label: "Invoice No", key: "invoice_no" },
      { label: "Branch", key: "branch_name" },
      { label: "Additional load", key: "additional_load" },
      { label: "Transport Type", key: "transport_type" },
      { label: "Trip Type", key: "trip_type" },
      { label: "Vehicle Category", key: "vehicle_category" },
      { label: "Vehicle Size", key: "vehicle_size" },
      { label: "Product Details", key: "product_details" },
      { label: "Driver Mobile", key: "driver_mobile" },
      { label: "Helper Name", key: "helper_name" },
      { label: "Remarks", key: "remarks" },
    ];

    // PREPARE EXCEL DATA
    const excelData = filteredTripList.map((dt, index) => {
      const rent = toNumber(dt.total_rent || 0);
      const demurrage = toNumber(dt.d_total || 0);
      const expense =
        toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);

      return {
        sl: index + 1,
        start_date: dt.start_date || "",
        customer: (dt.customer || "") + " " + (dt.transport_type || ""),
        driver_name: dt.driver_name || "",
        vehicle_no: dt.vehicle_no || "",
        vendor_name: dt.vendor_name || "",
        load_point: dt.load_point || "",
        unload_point: dt.unload_point || "",
        total_rent: rent,
        d_total: demurrage,
        food_cost: toNumber(dt.food_cost),
        fuel_cost: toNumber(dt.fuel_cost),
        challan_cost: toNumber(dt.challan_cost),
        parking_cost: toNumber(dt.parking_cost),
        night_guard: toNumber(dt.night_guard),
        toll_cost: toNumber(dt.toll_cost),
        feri_cost: toNumber(dt.feri_cost),
        police_cost: toNumber(dt.police_cost),
        labor: toNumber(dt.labor),
        chada: toNumber(dt.chada),
        additional_cost: toNumber(dt.additional_cost),
        others_cost: toNumber(dt.others_cost),
        total_cost: expense,
        profit: rent + demurrage - expense,
        driver_adv: dt.driver_adv,
        buyer_name: dt.buyer_name,
        challan: toNumber(dt.challan),
        invoice_no: dt.invoice_no,
        branch_name: dt.branch_name,
        additional_load: dt.additional_load,
        transport_type: dt.transport_type,
        trip_type: dt.trip_type,
        vehicle_category: dt.vehicle_category,
        vehicle_size: dt.vehicle_size,
        product_details: dt.product_details,
        driver_mobile: dt.driver_mobile,
        helper_name: dt.helper_name,
        remarks: dt.remarks
      };
    });

    // TOTAL ROW
    const totalRow = {
      sl: "",
      start_date: "",
      customer: "TOTAL",
      driver_name: "",
      vehicle_no: "",
      vendor_name: "",
      load_point: "",
      unload_point: "",
      total_rent: 0,
       d_total: 0,
        food_cost: 0,
        fuel_cost: 0,
        challan_cost: 0,
        parking_cost: 0,
        night_guard: 0,
        toll_cost: 0,
        feri_cost: 0,
        police_cost: 0,
        labor: 0,
        chada: 0,
        additional_cost: 0,
        others_cost: 0,
      total_cost: 0,
      profit: 0,
      driver_adv: 0,
        buyer_name: "",
        challan: "",
        invoice_no: "",
        branch_name: "",
        additional_load: "",
        transport_type: "",
        trip_type: "",
        vehicle_category: "",
        vehicle_size: "",
        product_details: "",
        driver_mobile: "",
        helper_name: "",
        remarks: ""

    };

    excelData.forEach((row) => {
      totalRow.total_rent += row.total_rent || 0;
      totalRow.d_total += row.d_total || 0;
      totalRow.food_cost += row.food_cost || 0;
      totalRow.fuel_cost += row.fuel_cost || 0;
      totalRow.challan_cost += row.challan_cost || 0;
      totalRow.parking_cost += row.parking_cost || 0;
      totalRow.night_guard += row.night_guard || 0;
      totalRow.toll_cost += row.toll_cost || 0;
      totalRow.feri_cost += row.feri_cost || 0;
      totalRow.police_cost += row.police_cost || 0;
      totalRow.labor += row.labor || 0;
      totalRow.chada += row.chada || 0;
      totalRow.additional_cost += row.additional_cost || 0;
      totalRow.others_cost += row.others_cost || 0;
      totalRow.total_cost += row.total_cost || 0;
      totalRow.profit += row.profit || 0;
      totalRow.driver_adv += driver_adv || 0
    });

    excelData.push(totalRow);

    // CREATE WORKSHEET
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: headers.map((h) => h.key),
    });


    // SET HEADER LABELS
    headers.forEach((h, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      worksheet[cellAddress].v = h.label;
    });

    // CREATE & DOWNLOAD FILE
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Trips");

    XLSX.writeFile(workbook, "filtered_trip_report.xlsx");

    toast.success("Filtered trip data downloaded successfully!");
  } catch (error) {
    console.error("Excel export error:", error);
    toast.error("Failed to download Excel file!");
  }
};



  // print
  const printTripsTable = () => {
    const actionColumns = document.querySelectorAll(".action_column");
    actionColumns.forEach((col) => (col.style.display = "none"));

    const tableHTML = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#11375B; color:white;">
          <th>${t("SL")}</th>
          <th>${t("Date")}</th>
          <th>${t("Customer")}</th>
          <th>${t("Driver")}</th>
          <th>${t("Vehicle No")}</th>
          <th>${t("Load Point")}</th>
          <th>${t("Unload Point")}</th>
          <th>${t("TripRent")}</th>
          <th>${t("C.Demurrage")}</th>
          <th>${t("TripCost")}</th>
          <th>${t("Profit")}</th>
        </tr>
      </thead>
      <tbody>
        ${filteredTripList
        .map(
          (dt, index) =>{ 
             const rent = toNumber(dt.total_rent || 0);
  const demurrage = toNumber(dt.d_total || 0);
  const expense =
    toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);

  const profit = rent + demurrage - expense;
            return `
        <tr>
            <td>${index + 1}</td>
            <td>${dt.start_date}</td>
            <td>${(dt.customer || "") + " " + (dt.transport_type || "")}</td>
            <td>${dt.driver_name || ""}</td>
            <td>${dt.vehicle_no || ""}</td>
            <td>${dt.load_point}</td>
            <td>${dt.unload_point}</td>
            <td>${dt.total_rent}</td>
           <td>${dt.d_total || 0}</td>
        <td>${toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total ||0)}</td>
        <td>${profit}</td>
        </tr>
        `
        })
        .join("")}
      </tbody>
    </table>
  `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
    <head>
      <title>-</title>
      <style>
        @media print {
        @page {
  margin-top: 30px !important;
  margin: 50px;
}

          /* HEADER FIXED FOR ALL PAGES */
         .print-header {
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  padding: 10px 0;

  display: grid;
  grid-template-columns: 1fr auto 1fr; /*  PERFECT CENTER */
  align-items: center;
}
          
          /* CONTENT START BELOW HEADER */
          .content {
            margin-top: 10px; /* Adjust based on header height */
          }
          
          /* PAGE BREAK HANDLING */
          table {
            page-break-inside: auto;
          }
          tr {
  page-break-inside: auto !important;
}
        }

        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 0;
        }

        .header-title h1 {
          margin: 0;
          font-size: 22px;
          font-weight: bold;
        }
          .header-logo {
  justify-self: start;
  padding-left: 20px;
  text-align: left;
}

.header-logo img {
  width: 60px !important;
}
  .header-title {
  justify-self: center; /*  EXACT CENTER */
  text-align: center;
  transform: translate(-15%, -20%);
}

        .addr {
          font-size: 12px;
          color: #444;
          margin-top: 5px;
        }

        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        
        th, td { 
          border: 1px solid #000; 
          padding: 5px; 
          text-align: left;
        }

        thead th {
          background: #11375B !important;
          color: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .content {
          padding: 20px 0;
        }

        h3 {
          margin: 10px 0;
          text-align: center;
        }
          .print-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo{
  text-align: left !important;
  flex: 1;
}
  .header-logo img{
  width: 60px !important;
}
.header-title {
  flex: 2;
  text-align: center !important;
}
      </style>
       <script>
          window.onload = function() {
            window.print();
            window.onafterprint = window.close;
          }
        </script>
    </head>

    <body>
      <!-- FIXED HEADER FOR ALL PAGES -->
      <div class="content">
        <h3>Trip Report</h3>
        ${tableHTML}
      </div>

      <script>
        // Auto print after window opens
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);

    // Restore action columns
    setTimeout(() => {
      actionColumns.forEach((col) => (col.style.display = ""));
    }, 2000);
  };

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrip = filteredTripList.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTripList.length / itemsPerPage)

   // Filtered & paginated trips
  const totalTripRent = currentTrip.reduce((sum, dt) => sum + toNumber(dt.total_rent || 0), 0);
  const totalDemurrage = currentTrip.reduce((sum, dt) => sum + toNumber(dt.d_total || 0), 0);
  // const totalTripCost = currentTrip.reduce((sum, dt) => sum + toNumber(dt.total_exp || 0), 0);
  const totalTripCost = (currentTrip || []).reduce(
  (sum, dt) => sum + Number(dt.total_exp || 0) + Number(dt.v_d_total || 0),
  0
);
  const totalProfit = currentTrip.reduce((sum, dt) => {
    const rent = toNumber(dt.total_rent || 0);
    const demurrage = toNumber(dt.d_total || 0);
    const exp = toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);
    return sum + (rent + demurrage - exp);
  }, 0);

  if (loading) return <p className="text-center mt-16">{t("Loading")} {t("Trip")}...</p>

  return (
    <main className="p-2">
      <Toaster />
      <div className="relative w-sm md:w-full  overflow-x-auto mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 md:p-4 py-10  border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-2xl" />
            {t("Trip Records")}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary   text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> {t("Filter")}
            </button>
            <Link to="/tramessy/AddTripForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> {t("Trip")}
              </button>
            </Link>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-medium rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              {t("Excel")}
            </button>
            {/* <button
              onClick={exportTripsToPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              {t("PDF")}
            </button> */}
            <button
              onClick={printTripsTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              {t("Print")}
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
              placeholder={`${t("search")}...`}
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
              <option value="">{t("Customer")} {t("Select")}</option>
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
              <option value="">{t("All")} {t("Transport")}</option>
              <option value="own_transport">{t("Own Transport")}</option>
              <option value="vendor_transport">{t("Vendor Transport")}</option>
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
                <FiFilter /> {t("Clear")}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md z-50">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">{t("SL.")}</th>
                <th className="px-2 py-4">{t("Date")}</th>
                <th className="px-2 py-4">{t("TripNo")}</th>
                <th className="px-2 py-4">{t("Customer")}/{t("Transport")}</th>
                <th className="p-2">{t("Driver")}/{t("Vehicle No")}</th>
                {/* <th className="p-2">{t("Vendor")}</th> */}
                <th className="px-2 py-4">{t("Trip")}{t("&")}{t("Destination")}</th>
                <th className="px-2 py-4">{t("TripRent")}</th>
                <th className="p-2">{t("C.Demurrage")}</th>
                <th className="p-2">{t("TripCost")}</th>
                <th className="p-2">{t("Profit")}</th>
                <th className="p-2">{t("Status")}</th>
                <th className="p-2 action_column">{t("Action")}</th>
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
                  const totalRent = toNumber(dt.total_rent || 0);
                    const demurrage = toNumber(dt.d_total || 0);
                    const vendorDemurrage = toNumber(dt.v_d_total || 0);
                    const totalExpenses = toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);
                    const profit = (totalRent + demurrage) - totalExpenses;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-all border-b border-gray-300"
                      data-row={rowIndex}
                    >
                      <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                      <td className="p-2">{formatDate(dt?.start_date)}</td>
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
                       {/* <td className="p-2">
                        <p>
                          <strong className=""></strong> {dt.vendor_name}
                        </p>
                      </td> */}
                      <td className="p-2">
                        <p><strong>Load:</strong> {dt.load_point}</p>
                        <p><strong>Unload:</strong> {dt.unload_point}</p>
                      </td>

                      <td className="p-2">{isAdmin ? (dt.total_rent) : "hide"}</td>
                      <td className="p-2">{dt.d_total}</td>
                      <td className="p-2">{dt.transport_type === "vendor_transport"
                            ? totalExpenses 
                            : toNumber(dt.total_exp) 
                          }</td>
                      <td className="p-2">
                        {profit}
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
                                {((isAdmin || dt.status !== "Approved") ) && (<Link to={`/tramessy/UpdateTripForm/${dt.id}`} onClick={() => setOpenDropdown(null)}>
                                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaPen className="mr-2 text-[12px]" />
                                    {t("Edit")}
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
                                  {t("View")}
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
                                  {t("Challan")}
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
                                  <FaTrashAlt className="mr-2 h-4 w-3 text-red-500" /> {t("Delete")}  </button>
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
            <tfoot className="bg-gray-100 font-bold text-sm">
              <tr>
                <td className="p-2 text-center" colSpan="6">{t("Total")}</td>
                <td className="p-2">{totalTripRent}</td>
                <td className="p-2">{totalDemurrage}</td>
                <td className="p-2">{totalTripCost}</td>
                <td className="p-2">{totalProfit}</td>
                <td className="p-2"></td>
                <td className="p-2"></td>
              </tr>
            </tfoot>
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
              <p className="text-center text-gray-700 font-medium mb-6">{t("Are you sure you want to delete?")}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  {t("No")}
                </button>
                <button
                  onClick={() => handleDelete(selectedTripId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  {t("Yes")}
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
              <div className="flex items-center justify-between p-4 print-header-container">
                {/* <div className="print-logo">
                  <img src={logo} alt="" />
                  <div className="text-xs text-secondary">
                    <div className="font-bold">M/S A J ENTERPRISE</div>
                  </div>
                </div>
                <div className="text-center print-header-text">
                  <h1 className="text-2xl font-bold text-secondary mb-2">M/S AJ Enterprise</h1>
                  <div className="text-xs text-gray-700">
                    <div>Razzak Plaza, 11th Floor, Room No: J-12,</div>
                    <div>2 Sahid Tajuddin Sarani, Moghbazar, Dhaka-1217, Bangladesh</div>
                  </div>
                </div> */}
                <div></div>
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
                  <h3 className="text-lg font-bold border-b pb-2">{t("Trip")} {t("Information")}</h3>
                  <p className="text-sm text-gray-500">
                    {t("Created By")}: <span className="font-semibold">{selectedTrip.created_by || "N/A"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>{t("Trip")} {t("ID")}:</strong> {selectedTrip.id}</div>
                  <div><strong>{t("Trip Type")}:</strong> {selectedTrip.trip_type || "N/A"}</div>
                  <div><strong>{t("Customer")}:</strong> {selectedTrip.customer || "N/A"}</div>
                  <div><strong>{t("Trip")} {t("Start Date")}:</strong> {selectedTrip.start_date || "N/A"}</div>
                  <div><strong>{t("Trip")} {t("End Date")}:</strong> {selectedTrip.end_date || "N/A"}</div>
                  <div><strong>{t("Load Point")}:</strong> {selectedTrip.load_point || "N/A"}</div>
                  <div><strong>{t("Unload Point")}:</strong> {selectedTrip.unload_point || "N/A"}</div>
                  <div><strong>{t("Additional Load")}:</strong> {selectedTrip.additional_load || "N/A"}</div>
                  <div><strong>{t("Branch")}:</strong> {selectedTrip.branch_name || "N/A"}</div>
                  <div><strong>{t("Transport Type")}:</strong> {selectedTrip.transport_type || "N/A"}</div>
                  <div><strong>{t("Vehicle No")}:</strong> {selectedTrip.vehicle_no || "N/A"}</div>
                  <div><strong>{t("Vendor")} {t("Name")}:</strong> {selectedTrip.vendor_name || "N/A"}</div>
                  <div><strong>{t("Driver")} {t("Name")}:</strong> {selectedTrip.driver_name || "N/A"}</div>
                  <div><strong>{t("Helper")} {t("Name")}:</strong> {selectedTrip.helper_name || "N/A"}</div>
                  <div><strong>{t("Driver")} {t("Mobile")}:</strong> {selectedTrip.driver_mobile || "N/A"}</div>
                  <div><strong>{t("Product Details")}:</strong> {selectedTrip.product_details || "N/A"}</div>
                  <div><strong>{t("Invoice No")}:</strong> {selectedTrip.invoice_no || 0}</div>
                  <div><strong>{t("Buyar Name")}:</strong> {selectedTrip.buyar_name || "N/A"}</div>
                  <div><strong>{t("Challan No")}:</strong> {selectedTrip.challan || "N/A"}</div>
                </div>

                <h3 className="text-lg font-bold mt-3 mb-3 border-b">
                  {t("Expense Details")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>{t("Labour Cost")}:</strong> {selectedTrip.labor || 0}</div>
                  <div><strong>{t("Toll Cost")}:</strong> {selectedTrip.toll_cost || 0}</div>
                  <div><strong>{t("Fuel Cost")}:</strong> {selectedTrip.fuel_cost || 0}</div>
                  <div><strong>{t("Parking Cost")}:</strong> {selectedTrip.parking_cost || 0}</div>
                  <div><strong>{t("Night Guard")}:</strong> {selectedTrip.night_guard || 0}</div>
                  <div><strong>{t("Challan Cost")}:</strong> {selectedTrip.callan_cost || 0}</div>
                  <div><strong>{t("Others Cost")}:</strong> {selectedTrip.others_cost || 0}</div>
                  <div><strong>{t("Feri Cost")}:</strong> {selectedTrip.feri_cost || 0}</div>
                  <div><strong>{t("Police Cost")}:</strong> {selectedTrip.police_cost || 0}</div>
                  <div><strong>{t("Chada Cost")}:</strong> {selectedTrip.chada || 0}</div>
                  <div><strong>{t("Food Cost")}:</strong> {selectedTrip.food_cost || 0}</div>
                  <div><strong>{t("Additional Load Cost")}:</strong> {selectedTrip.additional_cost || 0}</div>
                  <div><strong>{t("Total Expense")}:</strong> {selectedTrip.total_exp || 0}</div>
                  <div><strong>{t("Driver Advance")}:</strong> {selectedTrip.driver_adv || 0}</div>
                  <div>{selectedTrip.transport_type === "vendor_transport" && (<><strong>{t("Vendor Rent")}:</strong>{selectedTrip.total_exp || 0}</>)}</div>
                </div>

                <h3 className="text-lg font-bold mt-3 border-b">
                  {t("Financial Summary")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>{t("Total Rent")}:</strong> { selectedTrip.total_rent || 0 }</div>
                  <div><strong>{t("Demurrage Days")}:</strong> {selectedTrip.d_day || 0}</div>
                  {/* <div><strong>{t("Demurrage Amount")}:</strong> {selectedTrip.d_amount || 0}</div> */}
                  <div><strong>{t("Total Demurrage")}:</strong> {selectedTrip.d_total || 0}</div>
                  <div><strong>{t("Profit")}:</strong>
                  { toNumber(selectedTrip.total_rent || 0) +
  toNumber(selectedTrip.d_total || 0) -
  (toNumber(selectedTrip.total_exp || 0) +
   toNumber(selectedTrip.v_d_total || 0))}
                  </div>
                  {/* <div><strong>{t("Status")}:</strong>
                    <span
                      className={`!ml-2 px-2 py-0.5 rounded text-white text-xs 
                ${selectedTrip.status === "Approved"
                          ? "bg-green-600"
                          : selectedTrip.status === "Rejected"
                            ? "bg-red-600"
                            : "bg-yellow-500"}`}
                    >
                      {selectedTrip.status}
                    </span>
                  </div> */}
                  <div className="">
                    <strong>{t("Remarks")}:</strong>
                    <p className="bg-gray-100 rounded-md p-2 text-sm">{selectedTrip.remarks || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 pb-2 no-print">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-1 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
                >
                  {t("Close")}
                </button>
                <button
                  onClick={handleViewPrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-green-600 text-white px-4 py-1 rounded-md shadow hover:opacity-90 transition"
                >
                  <BiPrinter size={18} /> {(t("Print"))}
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
                {t("Cancel")}
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

