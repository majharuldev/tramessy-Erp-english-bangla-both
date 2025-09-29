import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import api from "../../utils/axiosConfig";

const useMonthlyStatementData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
          api.get(`/trip`),
          api.get(`/purchase`),
          api.get(`/expense`)
        ]);

        const trips = tripsRes.data?.data || [];
        const purchases = purchasesRes.data?.data || [];
        const expenses = expensesRes.data?.data || [];

        const monthlyData = {};
        const getMonthKey = date => dayjs(date).format("YYYY-MM");

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

        // const result = Object.entries(monthlyData)
        //   .sort(([a], [b]) => dayjs(a).diff(dayjs(b)))
        //   .map(([month, values]) => ({
        //     month: dayjs(month).format("MMM YYYY"),
        //     ...values,
        //     totalExpense:
        //       values.ownTripCost +
        //       values.vendorTripCost +
        //       values.purchaseCost +
        //       values.salaryExpense +
        //       values.officeExpense,
        //     netProfit:
        //       (values.ownTripIncome + values.vendorTripIncome) -
        //       (values.ownTripCost +
        //         values.vendorTripCost +
        //         values.purchaseCost +
        //         values.salaryExpense +
        //         values.officeExpense)
        //   }));

        const currentYear = dayjs().year();

const result = Object.entries(monthlyData)
  .filter(([month]) => dayjs(month).year() === currentYear) 
  .sort(([a], [b]) => dayjs(a).diff(dayjs(b)))
  .map(([month, values]) => ({
    month: dayjs(month).format("MMM YYYY"),
    ...values,
    totalExpense:
      values.ownTripCost +
      values.vendorTripCost +
      values.purchaseCost +
      values.salaryExpense +
      values.officeExpense,
    netProfit:
      (values.ownTripIncome + values.vendorTripIncome) -
      (values.ownTripCost +
        values.vendorTripCost +
        values.purchaseCost +
        values.salaryExpense +
        values.officeExpense)
  }));


        setData(result);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useMonthlyStatementData;
