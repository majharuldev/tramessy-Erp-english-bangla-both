import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../../utils/axiosConfig";

const AttendanceForm = () => {
  const [employee, setEmployee] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [attendance, setAttendance] = useState({});

  // Set today's date & load employee list
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setCurrentDate(formattedDate);

    const fetchEmployees = async () => {
      try {
        const res = await api.get(`/employee`);
        setEmployee(res.data.data); // axios -> res.data
      } catch (err) {
        console.error("Error loading employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  // Handle checkbox toggle
  const handleSelect = (id, type) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    toast.loading("Submitting attendance...", {
      id: "attendance",
      position: "top-right",
    });

    try {
      const existingRes = await api.get(
        `/attendence`
      );
      const existingData = existingRes.data;

      const alreadySubmittedIds = existingData.data
        .filter((item) => item.date === currentDate)
        .map((item) => String(item.employee_id));

      let submittedCount = 0;

      for (const empId of Object.keys(attendance)) {
        const status = attendance[empId];

        if (!status) continue;

        if (alreadySubmittedIds.includes(empId)) {
          toast.error(`Attendance already submitted for ID: ${empId}`, {
            position: "top-right",
          });
          continue;
        }

        const payload = {
          employee_id: empId,
          working_day: status === "present" ? 1 : 0,
          month: new Date(currentDate).getMonth() + 1,
        };

        const res = await api.post(
          `/attendence`, payload);

        const result = res.data;
        if (result.status === "Success") {
          submittedCount++;
        } else {
          toast.error(`Failed for ID: ${empId}`);
        }
      }

      if (submittedCount > 0) {
        toast.success("Attendance submitted successfully!", {
          id: "attendance",
          position: "top-right",
        });
        setAttendance({});
      } else {
        toast.dismiss("attendance");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        id: "attendance",
        position: "top-right",
      });
    }
  };

  return (
    <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
      <Toaster />
      <div className="md:flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
          Attendance Form
        </h1>
        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
          />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-900">
          <thead className="capitalize text-sm">
            <tr>
              <th className="border border-gray-700 px-2 py-1">SL.</th>
              <th className="border border-gray-700 px-2 py-1">
                Employee Name & Id
              </th>
              <th className="border border-gray-700 px-2 py-1 text-center">
                Present
              </th>
              <th className="border border-gray-700 px-2 py-1 text-center">
                Absent
              </th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {employee.map((emp, index) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-all">
                <td className="border border-gray-700 p-1 font-bold">
                  {index + 1}.
                </td>
                <td className="border border-gray-700 p-1">
                  {emp.full_name} - {emp.id}
                </td>
                <td className="border border-gray-700 p-1 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={attendance[emp.id] === "present"}
                    onChange={() => handleSelect(String(emp.id), "present")}
                  />
                </td>
                <td className="border border-gray-700 p-1 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={attendance[emp.id] === "absent"}
                    onChange={() => handleSelect(String(emp.id), "absent")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
          >
            Save Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
