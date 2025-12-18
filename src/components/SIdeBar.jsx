import React, { useState } from "react";
import {
  FaBars,
  FaCarRear,
  FaChevronDown,
  FaChevronUp,
  FaBriefcase,
  FaUser,
  FaTruck,
  FaNewspaper,
} from "react-icons/fa6";
import { FaTruckPickup, FaUsersCog } from "react-icons/fa";
import { MdShop } from "react-icons/md";
import logo from "../assets/AJ_Logo.png";
// import avatar from "../assets/ms.png";
import { Link, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import { FaUsers } from "react-icons/fa";
import { PiUsersFour } from "react-icons/pi";
import { RiLuggageCartLine } from "react-icons/ri";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
   const {t} = useTranslation();
  const [openMenu, setOpenMenu] = useState({
    fleet: false,
    business: false,
    user: false,
  });

  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = useAdmin();

  return (
    <div className="overflow-y-scroll hide-scrollbar">
      <main>
        {/* Logo */}
        <div className="py-[9px] flex justify-center border-b border-gray-300">
          <Link to="/tramessy">
            <img src={logo} alt="Logo" className="w-10" />
            <div className="text-xs text-secondary">
              <div className="font-semibold">M/S A J ENTERPRISE</div>
            </div>
          </Link>
        </div>

        {/* Admin Info */}
        {/* <div className="p-3 border-b border-gray-300">
          <div className="bg-white p-2 rounded-md flex gap-2 items-center">
            <img
              src={avatar}
              alt="Admin Avatar"
              className="w-8 rounded-2xl drop-shadow"
            />
            <h3 className="text-primary font-semibold">Admin</h3>
          </div>
        </div> */}

        {/* Navigation */}
        <div className="mt-3 px-2">
          <ul className="space-y-3">
            {/* Dashboard */}
            <li
              className={`py-3 px-2 rounded-sm cursor-pointer ${isActive("/tramessy")
                  ? "text-gray-700 bg-gray-200"
                  : "text-gray-700 "
                }`}
            >
              <Link
                to="/tramessy"
                className="flex items-center gap-2 font-semibold"
              >
                <FaBars />
                <span className="ps-2">{t("dashboard")}</span>
              </Link>
            </li>
            <>

              <ul className=" text-sm mt-2">
                <li>
                  <Link
                    to="/tramessy/TripList"
                    className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/TripList")
                        ? "text-gray-700 bg-gray-200"
                        : "text-gray-700 hover:text-primary"
                      }`}
                  >
                    <FaTruckPickup />
                    <span>{t("Trip Management")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tramessy/CarList"
                    className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/CarList")
                        ? "text-gray-700 bg-gray-200"
                        : "text-gray-700 hover:text-primary"
                      }`}
                  >
                    <FaCarRear />
                    <span>{t("vehicles")} {t("info")}</span>
                  </Link>
                </li>

              </ul>

              {/* Fleet Management */}
              {/* <li className="text-gray-700 font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("fleet")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaCarRear />
                      <span>Fleet Management</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.fleet ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  
                </li> */}
              {/* Vendor management */}
              <li className="text-gray-700 font-medium rounded-sm">
                <div
                  onClick={() => toggleMenu("vendor")}
                  className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                >
                  <span className="flex items-center gap-2">
                    <FaUsers />
                    <span>{t("Vendor")} {t("Management")}</span>
                  </span>
                  <span
                    className={`transform transition-transform duration-900 ${openMenu.vendor ? "rotate-180" : ""
                      }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>

                <div
                  className={`transition-all duration-900 ease-in-out overflow-hidden ${openMenu.vendor ? "max-h-[100px]" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-3 px-2 text-sm mt-2">
                    <li>
                      <Link
                        to="/tramessy/VendorList"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/VendorList")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Vendor")} {t("info")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tramessy/RentList"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/RentList")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Rent Vehicle Info")}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              {/* Rent management */}
              {/* <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("rentVehicle")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaTruck />
                      <span>Rent Vehicle</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.rentVehicle ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.rentVehicle ? "max-h-[100px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/RentList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/RentList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Rent Vehicle List</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li> */}
              {/* HR management */}
              <li className="text-gray-700 font-medium rounded-sm">
                {/* HR main toggle */}
                <div
                  onClick={() => toggleMenu("hrManagement")}
                  className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900"
                >
                  <span className="flex items-center gap-2">
                    <FaUsersCog />
                    <span>{t("HR")}</span>
                  </span>
                  <span
                    className={`transform transition-transform duration-900 ${openMenu.hrManagement ? "rotate-180" : ""
                      }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>

                {/* Animate HR submenu */}
                <div
                  className={`transition-all duration-900 overflow-hidden px-1 ${openMenu.hrManagement ? "max-h-[700px]" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-2 px-2 text-sm mt-2">
                    <li>
                      {/* HRM toggle inside HR */}
                      {/* <div
                          onClick={() => toggleMenu("hrm")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                            
                            <span>HRM</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.hrm ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div> */}
                      {/* Animate HRM nested submenu */}
                      {/* <div
                          className={`transition-all duration-900 overflow-hidden ${
                            openMenu.hrm ? "max-h-[500px]" : "max-h-0"
                          }`}
                        > */}
                      <ul className="pl-6 space-y-2 mt-1">
                        <li>
                          <Link
                            to="/tramessy/HR/HRM/employee-list"
                            className={`flex gap-2 items-center block p-2 rounded-sm ${isActive("/tramessy/HR/HRM/employee-list")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            {t("Employee Information")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/DriverList"
                            className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/DriverList")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            <span>{t("Driver Information")}</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/HelperList"
                            className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/HelperList")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            <span>{t("Helper Info")}</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/HR/HRM/Office"
                            className={`flex gap-2 items-center p-2 rounded-sm ${isActive("/tramessy/HR/HRM/Office")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            {t("Office")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/HR/salary-dispatch"
                            className={`flex gap-2 items-center block p-2 rounded-sm ${isActive("/tramessy/HR/salary-dispatch")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            {t("Salary Expense")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/HR/HRM/office-expense"
                            className={`flex gap-2 items-center block p-2 rounded-sm ${isActive("/tramessy/HR/HRM/office-expense")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            {t("Office Expense")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/tramessy/HR/advance-requisition"
                            className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/HR/advance-requisition")
                                ? "text-gray-700 bg-gray-200"
                                : "text-gray-500 hover:text-primary"
                              }`}
                          >

                            <span>{t("Requisition")}</span>
                          </Link>
                        </li>
                      </ul>
                      {/* </div> */}
                    </li>
                  </ul>
                </div>

                {/* Animate HR submenu attendance*/}
                {/* <div
                    className={`transition-all duration-300 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                     
                        <div
                          onClick={() => toggleMenu("attendance")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                            
                            <span>Attendance</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.attendance ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div>
                       
                        <div
                          className={`transition-all duration-900 overflow-hidden px-1 ${
                            openMenu.attendance ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <ul className="pl-6 space-y-2 mt-1">
                            <li>
                              <Link
                                to="/tramessy/HR/Attendance/AttendanceList"
                                className={`block p-2 rounded-sm ${
                                  isActive(
                                    "/tramessy/HR/Attendance/AttendanceList"
                                  )
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                <span className="flex gap-2 items-center">
                                 
                                  <span>Attendance</span>
                                </span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div> */}
                {/* Animate HR submenu leave*/}
                {/* <div
                    className={`transition-all duration-300 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                      
                        <div
                          onClick={() => toggleMenu("leave")}
                          className="p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <li>
                            <Link
                              to="/tramessy/HR/HRM/Leave"
                              className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                isActive("/tramessy/HR/HRM/Leave")
                                  ? "text-white bg-primary"
                                  : "text-gray-500 hover:text-primary"
                              }`}
                            >
                              <div
                                className={`w-[6px] h-[6px] rounded-full bg-primary ${
                                  isActive("/tramessy/HR/HRM/Leave")
                                    ? "bg-white"
                                    : "bg-primary"
                                }`}
                              ></div>
                              <span>Leave Request</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tramessy/HR/HRM/MonthAttendance"
                              className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                isActive("/tramessy/HR/HRM/MonthAttendance")
                                  ? "text-white bg-primary"
                                  : "text-gray-500 hover:text-primary"
                              }`}
                            >
                              <div
                                className={`w-[6px] h-[6px] rounded-full bg-primary ${
                                  isActive("/tramessy/HR/HRM/MonthAttendance")
                                    ? "bg-white"
                                    : "bg-primary"
                                }`}
                              ></div>
                              <span>Month Attendance</span>
                            </Link>
                          </li>
                        </div>
                      </li>
                    </ul>
                  </div> */}
                {/* Animate HR submenu Payroll*/}
                <div
                  className={`transition-all duration-300 overflow-hidden px-1 ${openMenu.hrManagement ? "max-h-[400px]" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-2 px-2 text-sm mt-2">
                    <li>
                      <div
                        onClick={() => toggleMenu("payroll")}
                        className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                      >
                        <span className="flex gap-2 items-center">
                          <span>{t("Payroll")}</span>
                        </span>
                        <span
                          className={`transform transition-transform duration-900 ${openMenu.payroll ? "rotate-180" : ""
                            }`}
                        >
                          <FaChevronDown />
                        </span>
                      </div>

                      <div
                        className={`transition-all duration-900 overflow-hidden ${openMenu.payroll ? "max-h-[500px]" : "max-h-0"
                          }`}
                      >
                        <ul className="pl-6 space-y-2 mt-1">
                          <li>
                            <Link
                              to="/tramessy/HR/Payroll/Attendance"
                              className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/HR/Payroll/Attendance")
                                  ? "text-gray-700 bg-gray-200"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >

                              <span>{t("Attendance")}</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tramessy/HR/payroll/bonus"
                              className={`block p-2 rounded-sm ${isActive(
                                "/tramessy/HR/payroll/bonus"
                              )
                                  ? "text-gray-700 bg-gray-200"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >
                              {t("Bonus")}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tramessy/HR/Payroll/Advance-Salary"
                              className={`flex items-center gap-2 p-2 rounded-sm ${isActive(
                                "/tramessy/HR/Payroll/Advance-Salary"
                              )
                                  ? "text-gray-700 bg-gray-200"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >
                              {t("Salary Advance")}
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/tramessy/HR/payroll/loan"
                              className={`block p-2 rounded-sm ${isActive(
                                "/tramessy/HR/payroll/loan"
                              )
                                  ? "text-gray-700 bg-gray-200"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >
                              {t("Loan")}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tramessy/HR/payroll/generate-salary"
                              className={`flex items-center gap-2 p-2 rounded-sm ${isActive(
                                "/tramessy/HR/payroll/generate-salary"
                              )
                                  ? "text-gray-700 bg-gray-200"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >
                              {t("Generate Salary")}
                            </Link>
                          </li>
                          {/* <li>
                            <Link
                              to="/tramessy/HR/payrol/salary-sheet"
                              className={`block p-2 rounded-sm ${isActive("/HR/salary-sheet")
                                  ? "text-white bg-primary"
                                  : "text-gray-500 hover:text-primary"
                                }`}
                            >
                              Salary Sheet
                            </Link>
                          </li> */}
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Inventory management */}
              {/* <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("inventory")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900"
                  >
                    <span className="flex items-center gap-2">
                      <MdShop />
                      <span>Inventory</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.inventory ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.inventory ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/Inventory/Stockin"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/Stockin")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/Inventory/Stockin")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Stock in</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Inventory/StockOut"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/StockOut")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                         
                          <span>Stock Out</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Inventory/Inventory-supplier"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/Inventory-supplier")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/Inventory/Inventory-supplier")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Inventory Supplier</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li> */}
              {/* Purchase */}
              <li className="text-gray-700 font-medium rounded-sm">
                <div
                  onClick={() => toggleMenu("purchase")}
                  className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900 outline-none"
                >
                  <span className="flex items-center gap-2">
                    <RiLuggageCartLine />
                    <span>{t("Purchase")}</span>
                  </span>
                  <span
                    className={`transform transition-transform duration-900 ${openMenu.purchase ? "rotate-180" : ""
                      }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>

                {/* Dropdown container with smooth expand/collapse */}
                <div
                  className={`transition-all duration-900 ease-in-out overflow-hidden ${openMenu.purchase ? "max-h-[200px]" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-3 px-2 text-sm mt-2">
                    <li>
                      <Link
                        to="/tramessy/Purchase/maintenance"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Purchase/maintenance")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Maintenance")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tramessy/Purchase/official-product"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Purchase/official-product")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Official Products")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tramessy/Purchase/SupplierList"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Purchase/SupplierList")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Supplier")} {t("info")}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              {/* Customer */}
              <li className="text-gray-700 font-medium rounded-sm">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleMenu("customer")}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    toggleMenu("customer")
                  }
                  className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300 outline-none"
                >
                  <span className="flex items-center gap-2">
                    <PiUsersFour />
                    <span>{t("Customer")}</span>
                  </span>
                  <span
                    className={`transform transition-transform duration-500 ${openMenu.customer ? "rotate-180" : ""
                      }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>

                {/* Dropdown container with smooth expand/collapse */}
                <div
                  className={`transition-all duration-700 ease-in-out overflow-hidden ${openMenu.customer ? "max-h-[500px]" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-3 px-2 text-sm mt-2">
                    <li>
                      <Link
                        to="/tramessy/Customer"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Customer")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Customer")} {t("info")}</span>
                      </Link>
                    </li>
                    {isAdmin && <li>
                      <Link
                        to="/tramessy/route-pricing"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/route-pricing")
                            ? "text-gray-700 bg-gray-200"
                            : "text-gray-500 hover:text-primary"
                          }`}
                      >

                        <span>{t("Route Pricing")}</span>
                      </Link>
                    </li>}
                  </ul>
                </div>
              </li>
              {/* Business */}
              {isAdmin && (<>
                <li className="text-gray-700 font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("business")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      toggleMenu("business")
                    }
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300 outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <FaNewspaper />
                      <span>{t("Financial Report")}</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-500 ${openMenu.business ? "rotate-180" : ""
                        }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  {/* Dropdown container with smooth expand/collapse */}
                  <div
                    className={`transition-all duration-700 ease-in-out overflow-hidden ${openMenu.business ? "max-h-[500px]" : "max-h-0"
                      }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/DailyIncome"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/DailyIncome")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Daily Income")}</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/tramessy/monthly-statement"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/monthly-statement")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Monthly Profit/Loss")}</span>
                        </Link>
                      </li>
                      {/* <li>
                      <Link
                        to="/tramessy/Reports/Employee-Report"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                          isActive("/tramessy/Reports/Employee-Report")
                            ? "text-white bg-primary"
                            : "text-gray-500 hover:text-primary"
                        }`}
                      >
                        <div
                          className={`w-[6px] h-[6px] rounded-full ${
                            isActive("/tramessy/Reports/Employee-Report")
                              ? "bg-white"
                              : "bg-primary"
                          }`}
                        ></div>
                        <span>Employee Report</span>
                      </Link>
                    </li> */}
                      <li>
                        <Link
                          to="/tramessy/Reports/vehicle-report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Reports/vehicle-report")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Vehicle Report")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Reports/Driver-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Reports/Driver-Report")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Driver Report")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Reports/Fuel-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Reports/Fuel-Report")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Fuel Report")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Reports/Purchase-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/Reports/Purchase-Report")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Purchase Report")}</span>
                        </Link>
                      </li>
                      {/* <li>
                      <Link
                        to="/tramessy/DailyExpense"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                          isActive("/tramessy/DailyExpense")
                            ? "text-white bg-primary"
                            : "text-gray-500 hover:text-primary"
                        }`}
                      >
                        
                        <span>Daily Trip Expense</span>
                      </Link>
                    </li> */}
                      {/* <li>
                      <Link
                        to="/tramessy/Reports/Inventory-Report"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                          isActive("/tramessy/Reports/Inventory-Report")
                            ? "text-white bg-primary"
                            : "text-gray-500 hover:text-primary"
                        }`}
                      >
                        <div
                          className={`w-[6px] h-[6px] rounded-full ${
                            isActive("/tramessy/Reports/Inventory-Report")
                              ? "bg-white"
                              : "bg-primary"
                          }`}
                        ></div>
                        <span>Inventory Report</span>
                      </Link>
                    </li> */}
                      {/* <li>
                      <Link
                        to="/tramessy/Reports/Trip-Report"
                        className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                          isActive("/tramessy/Reports/Trip-Report")
                            ? "text-white bg-primary"
                            : "text-gray-500 hover:text-primary"
                        }`}
                      >
                        
                        <span>Trip Report</span>
                      </Link>
                    </li> */}
                    </ul>
                  </div>
                </li>
                {/* Accounts */}
                <li className="text-gray-700 font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("accounts")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaBriefcase />
                      <span>{t("Accounts")}</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${openMenu.accounts ? "rotate-180" : ""
                        }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${openMenu.accounts ? "max-h-[500px]" : "max-h-0"
                      }`}
                  >
                    {" "}
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/account/CashDispatch"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/CashDispatch")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Fund Transfer")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/PaymentList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/PaymentList")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Payment")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/PaymentReceive"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/PaymentReceive")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Payment Receive")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/vendor-payment"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/vendor-payment")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Vendor")} {t("Payment")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/SupplierLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/SupplierLedger")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >
                          {/* <div
                          className={`w-[6px] h-[6px] rounded-full bg-primary ${
                            isActive("/tramessy/account/SupplierLedger")
                              ? "bg-white"
                              : "bg-primary"
                          }`}
                        ></div> */}
                          <span>{t("Supplier")} {t("Ledger")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/DriverLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/DriverLedger")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Driver")} {t("Ledger")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/VendorLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/VendorLedger")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Vendor")} {t("Ledger")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/CustomerLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/CustomerLedger")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Customer")} {t("Ledger")}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/OfficeLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/account/OfficeLedger")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Office")} {t("Ledger")}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Billing Control */}
                <li className="text-gray-700 font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("billing")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <HiCurrencyBangladeshi className="text-xl" />
                      <span>{t("Billing")}</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${openMenu.billing ? "rotate-180" : ""
                        }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${openMenu.billing ? "max-h-[300px]" : "max-h-0"
                      }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/billing/bill"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/billing/bill")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("Bill")}</span>
                        </Link>
                      </li>

                    </ul>
                  </div>
                </li>
                {/* User Control */}
                <li className="text-gray-700 font-medium rounded-sm mb-10">
                  <div
                    onClick={() => toggleMenu("user")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaUser />
                      <span>{t("Users Control")}</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${openMenu.user ? "rotate-180" : ""
                        }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${openMenu.user ? "max-h-[100px]" : "max-h-0"
                      }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/AllUsers"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${isActive("/tramessy/AllUsers")
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-500 hover:text-primary"
                            }`}
                        >

                          <span>{t("All Users")}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </>)}
            </>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
