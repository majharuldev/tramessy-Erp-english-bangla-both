// import axios from "axios";
// import dayjs from "dayjs";
// import { useEffect, useState } from "react";
// import { HiOutlineBellAlert } from "react-icons/hi2";
// import api from "../../utils/axiosConfig";

// const StatisticsCard = () => {
//   const [expiringDocs, setExpiringDocs] = useState([]);

//   useEffect(() => {
//     const fetchVehicles = async () => {
//       try {
//         const response = await api.get(
//           `/vehicle`
//         );
//         const vehicles = response.data?.data || [];
//         const today = dayjs();
//         const expiring = [];

//         vehicles.forEach((vehicle) => {
//           ["fitness_date", "road_permit_date", "reg_date"].forEach(
//             (type) => {
//               const rawDate = vehicle[type];
//               if (rawDate) {
//                 const date = dayjs(rawDate);
//                 const remaining = date.diff(today, "day");

//                 if (date.isValid() && remaining >= 0 && remaining <= 7) {
//                   expiring.push({
//                     vehicle: `${vehicle.reg_zone}-${vehicle.reg_no}`,
//                     document: type
//                       .replace(/_/g, " ")
//                       .replace(/\b\w/g, (char) => char.toUpperCase()),
//                     expireDate: date.format("DD-MM-YYYY"),
//                     remaining,
//                   });
//                 }
//               }
//             }
//           );
//         });

//         setExpiringDocs(expiring);
//       } catch (error) {
//         console.error("Error fetching vehicles:", error);
//       }
//     };

//     fetchVehicles();
//   }, []);

//   return (
//     <div className="">
//       <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
//         <h3 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
//           Document Reminder
//         </h3>
//         {expiringDocs.length > 0 ? (
//           <div className="overflow-x-auto max-h-56 overflow-y-auto hide-scrollbar">
//             <table className="min-w-full text-sm text-left border border-gray-200">
//               <thead className="bg-gray-100 text-gray-700">
//                 <tr>
//                   <th className="p-2">SL.</th>
//                   <th className="p-2">Vehicle Number</th>
//                   <th className="p-2">Document</th>
//                   <th className="p-2">Remaining</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {expiringDocs.map((item, i) => (
//                   <tr
//                     key={i}
//                     className="text-gray-700 font-semibold text-sm border-b border-gray-200"
//                   >
//                     <td className="p-2">{i + 1}</td>
//                     <td className="p-2">{item.vehicle}</td>
//                     <td className="p-2">{item.document}</td>
//                     <td className="p-2">
//                       <span
//                         className={`px-2 py-1 rounded text-white text-xs font-semibold ${
//                           item.remaining === 0 ? "bg-red-500" : "bg-yellow-500"
//                         }`}
//                       >
//                         {item.remaining} {item.remaining === 1 ? "day" : "days"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="text-center text-gray-500">
//             <span className="text-9xl flex justify-center">
//               <HiOutlineBellAlert />
//             </span>
//             <p className="text-lg">No documents expiring soon.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StatisticsCard;

import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { HiOutlineBellAlert } from "react-icons/hi2";
import api from "../../utils/axiosConfig";

const StatisticsCard = () => {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get(
          `/api/vehicle`
        );
        const vehicles = response.data?.data || [];
        const today = dayjs();

        const expiring = [];
        const maintenance = [];

        vehicles.forEach((vehicle) => {
          // ---------- Document Expiry ----------
          ["fitness_date", "road_permit_date", "reg_date"].forEach(
            (type) => {
              const rawDate = vehicle[type];
              if (rawDate) {
                const date = dayjs(rawDate);
                const remaining = date.diff(today, "day");
                if (date.isValid() && remaining >= 0 && remaining <= 7) {
                  expiring.push({
                    vehicle: `${vehicle.reg_zone}-${vehicle.reg_no}`,
                    type: type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase()),
                    expireDate: date.format("DD-MM-YYYY"),
                    remaining,
                  });
                }
              }
            }
          );

          // ---------- Maintenance: Service ----------
          if (
            vehicle.last_service_km &&
            vehicle.service_interval_km &&
            vehicle.current_km
          ) {
            const kmSinceService = vehicle.current_km - vehicle.last_service_km;
            if (kmSinceService >= vehicle.service_interval_km - 500) {
              maintenance.push({
                vehicle: `${vehicle.reg_zone}-${vehicle.reg_number}`,
                type: "Service Due (KM)",
                expireDate: `${vehicle.current_km} km`,
                remaining: vehicle.service_interval_km - kmSinceService,
              });
            }
          }

          // ---------- Maintenance: Battery ----------
          if (vehicle.battery_change_date && vehicle.battery_life_months) {
            const batteryExpiry = dayjs(vehicle.battery_change_date).add(
              vehicle.battery_life_months,
              "month"
            );
            const remaining = batteryExpiry.diff(today, "day");
            if (remaining >= 0 && remaining <= 30) {
              maintenance.push({
                vehicle: `${vehicle.reg_zone}-${vehicle.reg_no}`,
                type: "Battery Change",
                expireDate: batteryExpiry.format("DD-MM-YYYY"),
                remaining,
              });
            }
          }

          // ---------- Maintenance: Tyre ----------
          if (vehicle.tyre_change_km && vehicle.current_km) {
            const remaining = vehicle.tyre_change_km - vehicle.current_km;
            if (remaining <= 500) {
              maintenance.push({
                vehicle: `${vehicle.reg_zone}-${vehicle.reg_no}`,
                type: "Tyre Change",
                expireDate: `${vehicle.current_km} km`,
                remaining,
              });
            }
          }
        });

        setExpiringDocs(expiring);
        setMaintenanceAlerts(maintenance);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  // Reusable Table Component
  const ReminderTable = ({ title, data, emptyText }) => (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">
        {title}
      </h3>
      {data.length > 0 ? (
        <div className="overflow-x-auto max-h-56 overflow-y-auto hide-scrollbar">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Vehicle</th>
                <th className="p-2">Type</th>
                <th className="p-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={i}
                  className="text-gray-700 font-semibold text-sm border-b border-gray-200"
                >
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{item.vehicle}</td>
                  <td className="p-2">{item.type}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                        item.remaining <= 0
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {item.remaining <= 0
                        ? "Expired"
                        : `${item.remaining} ${
                            item.remaining === 1 ? "day" : "days"
                          }`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <span className="text-9xl flex justify-center">
            <HiOutlineBellAlert />
          </span>
          <p className="text-lg">{emptyText}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Document Reminder */}
      <ReminderTable
        title="📄 Document Reminder"
        data={expiringDocs}
        emptyText="No documents expiring soon."
      />

      {/* Maintenance Reminder */}
      <ReminderTable
        title="🔧 Maintenance Reminder"
        data={maintenanceAlerts}
        emptyText="No maintenance alerts."
      />
    </div>
  );
};

export default StatisticsCard;

