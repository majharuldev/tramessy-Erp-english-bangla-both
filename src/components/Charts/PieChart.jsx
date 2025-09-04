import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#50E6FF",
  "#6B8727",
  "#FF8042",
];
const MonthlyCustomerPieChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((res) => res.json())
      .then((response) => {
        const trips = response.data;
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // Filter trips of current month
        const filtered = trips.filter((trip) => {
          const tripDate = new Date(trip.date);
          return (
            tripDate.getFullYear() === currentYear &&
            tripDate.getMonth() + 1 === currentMonth
          );
        });
        // Count trips per customer
        const customerCount = {};
        filtered.forEach((trip) => {
          if (trip.customer) {
            customerCount[trip.customer] =
              (customerCount[trip.customer] || 0) + 1;
          }
        });
        // Convert to chart data
        const formattedData = Object.keys(customerCount).map((name) => ({
          name,
          value: customerCount[name],
        }));
        setChartData(formattedData);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md px-5 mr-5 border border-gray-200 cursor-pointer w-full">
      <h3 className="text-lg font-bold text-gray-700 text-center border-b border-gray-200 md:p-3 pb-2">
        Monthly Trip Chart By Customer
      </h3>
      <PieChart width={500} height={300}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} trips`, name]} />
        <Legend />
      </PieChart>
    </div>
  );
};

export default MonthlyCustomerPieChart;
