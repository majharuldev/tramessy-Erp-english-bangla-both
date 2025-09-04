import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";

const SalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = dayjs().format("YYYY-MM");
  const previousMonth = dayjs().subtract(1, "month").format("YYYY-MM");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/trip/list`
        );
        const trips = res.data.data;

        // Filter by current and previous month
        const tripsCurrentMonth = trips.filter((trip) =>
          trip.date.startsWith(currentMonth)
        );
        const tripsPreviousMonth = trips.filter((trip) =>
          trip.date.startsWith(previousMonth)
        );

        // Group by customer for current month
        const groupByCustomer = (data) =>
          data.reduce((acc, trip) => {
            const customer = trip.customer || "Unknown";
            const rent = parseFloat(trip.total_rent) || 0;
            if (!acc[customer]) {
              acc[customer] = 0;
            }
            acc[customer] += rent;
            return acc;
          }, {});

        const currentSales = groupByCustomer(tripsCurrentMonth);
        const previousSales = groupByCustomer(tripsPreviousMonth);

        // Merge both datasets
        const allCustomers = new Set([
          ...Object.keys(currentSales),
          ...Object.keys(previousSales),
        ]);

        const formatted = Array.from(allCustomers).map((customer) => ({
          name: customer,
          "Monthly Sales": currentSales[customer] || 0,
          "Previous Month Sales": previousSales[customer] || 0,
        }));

        setChartData(formatted);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth, previousMonth]);

  if (loading) return <p>Loading chart...</p>;
  if (chartData.length === 0) return <p>No data for current month.</p>;
  console.log("chartData", chartData);
  return (
    <div className="bg-white rounded-xl mt-5 pt-5 border border-gray-200 shadow-md">
      <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 md:mx-5 pb-2">
        Monthly Sales Chart By Customer
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 50, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" scale="band" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Monthly Sales" barSize={30} fill="#413ea0">
            <LabelList
              dataKey="Monthly Sales"
              position="top"
              content={(props) => {
                const { x, y, value, index } = props;
                const customerName = chartData[index]?.name || "";
                return (
                  <text
                    x={x}
                    y={y - 25}
                    fill="#000"
                    fontSize={12}
                    textAnchor="middle"
                  >
                    <tspan x={x} dy="0">
                      {customerName}
                    </tspan>
                    <tspan
                      x={x}
                      dy="1.2em"
                    >{`${value.toLocaleString()} TK`}</tspan>
                  </text>
                );
              }}
            />
          </Bar>
          <Line
            type="monotone"
            dataKey="Previous Month Sales"
            stroke="#ff7300"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
