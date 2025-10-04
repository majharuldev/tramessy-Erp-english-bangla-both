import OverViewCard from "../components/OverViewCard";
import StatisticsCard from "../components/StatisticsCard";
import PieChart from "../components/Charts/PieChart";
import SalesChart from "../components/Charts/SalesChart";
import ProfitLossChartCard from "../components/Charts/MonthlyProfitCart";

const Home = () => {
  return (
    <div className="p-2">
      <OverViewCard />
      <div className=" py-5">
        <div className="">
          <StatisticsCard />
        </div>
       
      </div>
       <div className=" grid grid-cols-1 md:grid-cols-2 gap-5">
         
          <ProfitLossChartCard/>
        </div>
      <SalesChart />
       {/* <PieChart /> */}
    </div>
  );
};

export default Home;
