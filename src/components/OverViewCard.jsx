import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import api from "../../utils/axiosConfig";
import toNumber from "../hooks/toNumber";
import useAdmin from "../hooks/useAdmin";
const OverViewCard = () => {
  const [tripCost, setTripCost] = useState(0);
  const [tripCommission, setTripCommission] = useState(0);
  const [tripLabor, setTripLabor] = useState(0);
  const [tripOtherCost, setTripOtherCost] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [otherExpense, setOtherExpense] = useState(0);
  const [totalTodayExpense, setTotalTodayExpense] = useState(0);
  const [totalDispatch, setTotalDispatch] = useState(0);
  const [totalReceiveAmount, setTotalReceiveAmount] = useState(0);
  const today = dayjs().format("YYYY-MM-DD");
  const [todayTripCount, setTodayTripCount] = useState(0);
  const [tripExpense, setTripExpense] = useState(0);
  const [purchaseExpense, setPurchaseExpense] = useState(0);
  const [officeExpense, setOfficeExpense] = useState(0);
  const [salaryExpense, setSalaryExpense] = useState(0);
  const isAdmin = useAdmin();
  useEffect(() => {
    fetchTripData();
    fetchPurchaseData();
    fetchOfficeAndSalaryExpense();
  }, [today]);

  // daily trip
  useEffect(() => {
    api
      .get(`/trip`)
      .then((res) => {
        const allTrips = res.data;
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        // Only today's approved trips
        const todayApprovedTrips = allTrips.filter(
          (trip) => trip.start_date === today && trip.status === "Approved"
        );
        // Set today's trip count
        setTodayTripCount(todayApprovedTrips.length);
      });
  }, []);

  // daily sales
  useEffect(() => {
    api
      .get(`/trip`)
      .then((response) => {
        const data = response.data;
        const today = new Date().toISOString().split("T")[0];
        const sale = data
          .filter((item) => item.start_date === today && item.status === "Approved")
          .reduce((sum, trip) => sum + toNumber(trip.total_rent || 0), 0);

        setDailySales(sale);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
      });
  }, []);

  // daily expense
  // trip expense
  const fetchTripData = async () => {
    try {
      const res = await api.get("/trip")
      const total = res.data
        .filter((item) => item.start_date === today)
        .reduce((sum, item) => {
          return sum + toNumber(item.total_exp)
        }, 0)
      setTripExpense(total)
    } catch (error) {
      console.error("Trip fetch error:", error)
    }
  }
// daily purchase expense
  const fetchPurchaseData = async () => {
    try {
      const res = await api.get("/purchase")
      const total = res.data.data
        .filter((p) => p.date === today)
        .reduce((sum, p) => {
          const purchaseAmount = toNumber(p.purchase_amount)
          return sum + purchaseAmount
        }, 0)
      setPurchaseExpense(total)
    } catch (error) {
      console.error("Purchase fetch error:", error)
    }
  }
// office and salary expense
  const fetchOfficeAndSalaryExpense = async () => {
    try {
      const res = await api.get("/expense")
      let office = 0
      let salary = 0
      res.data.forEach((item) => {
        if (item.date === today) {
          if (item.payment_category === "Utility") {
            office += toNumber(item.amount)
          }
          if (item.payment_category === "Salary") {
            salary += toNumber(item.amount)
          }
        }
      })
      setOfficeExpense(office)
      setSalaryExpense(salary)
    } catch (error) {
      console.error("Expense fetch error:", error)
    }
  }

  const totalExpense = tripExpense + purchaseExpense + officeExpense + salaryExpense;

  // daily cash dispatch
  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        const response = await api.get(
          `/fundTransfer`
        );
        const data = response.data?.data || [];
        const total = data
          .filter((item) => dayjs(item.date).format("YYYY-MM-DD") === today)
          .reduce((sum, item) => sum + toNumber(item.amount || 0), 0);

        setTotalDispatch(total);
      } catch (error) {
        console.error("Failed to fetch dispatch data:", error);
      }
    };
    fetchDispatch();
  }, [today]);
  // daily receive amount
  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const response = await api.get(
          `/payment-recieve`
        );
        const data = response.data?.data || [];
        const total = data
          .filter((item) => dayjs(item.date).format("YYYY-MM-DD") === today)
          .reduce((sum, item) => sum + toNumber(item.amount || 0), 0);
        setTotalReceiveAmount(total);
      } catch (error) {
        console.error("Failed to fetch receive amount data:", error);
      }
    };
    fetchAmount();
  }, [today]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* daily trip */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Daily Trip
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Today Trip</span>-<span> {todayTripCount}</span>
            </div>
          </div>
        </div>
        {/* Sales */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Daily Sales
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Total Sale</span>-
              <span>{isAdmin? (dailySales.toLocaleString()) :  "Hide"} TK</span>
            </div>
          </div>
        </div>
        {/* Daily cash dispatch */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Daily Cash Dispatch
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Total Dispatch</span>-
              <span>{totalDispatch.toLocaleString()} TK</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
        {/* Daily receive amount */}
        <div className="col-span-1 bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Daily Receive Amount
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Receive Amount</span>-
              <span>{totalReceiveAmount.toLocaleString()} TK</span>
            </div>
          </div>
        </div>
        {/* Daily Expense Summary */}
        <div className="col-span-2 bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-1 mb-3">
            📋 Daily Expense Summary
          </h3>

          {/* Header */}
          <div className="grid grid-cols-2 text-sm font-semibold text-gray-700 bg-gray-100 py-1.5 px-3 rounded-md">
            <div>Expense Type</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Row */}
          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>Trip Expense</div>
            <div className="text-right">{tripExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>Purchase Expense</div>
            <div className="text-right">{purchaseExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>Office Expense</div>
            <div className="text-right">{officeExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>Salary Expense</div>
            <div className="text-right">{salaryExpense}</div>
          </div>

          {/* Total */}
          <div className="grid grid-cols-2 text-sm font-bold py-2 px-3 mt-1">
            <div>Total Expense</div>
            <div className="text-right">{totalExpense}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverViewCard;
