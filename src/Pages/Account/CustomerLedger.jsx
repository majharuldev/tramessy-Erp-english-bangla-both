
import { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useEffect, useState } from "react";
import SelectCustomerLadger from "./SelectCustomerLedger";
import api from "../../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const CustomerLedger = () => {
  const {t} = useTranslation();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errorCustomers, setErrorCustomers] = useState(null);

  useEffect(() => {
    api.get(`/customerLedger`)
      .then((res) => {
        if (res.data.status === "Success") {
          setCustomers(res.data.data);
        }
        setLoadingCustomers(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setErrorCustomers("Failed to fetch customers.");
        setLoadingCustomers(false);
      });
  }, []);

  const customerNames = [...new Set(customers.map((d) => d.customer_name))];
  const filteredCustomer = selectedCustomer
    ? customers.filter((d) => d.customer_name === selectedCustomer)
    : customers;

  return (
    <main className="overflow-hidden mt-3">
      <Toaster />
      <div className="w-[24rem] md:w-full max-w-7xl overflow-x-auto mx-auto border border-gray-200 p-2 py-10 md:p-4 rounded-md">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            {t("Customer")} {t("Ledger")} {selectedCustomer && `: ${selectedCustomer}`}
          </h1>
          <div className="mt-3 md:mt-0 w-full md:w-72">
            <div className="relative w-full">
              <label className="text-gray-700 text-sm font-semibold">
               {t("Customer")} 
              </label>
              <select
                id="customer-select"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">{t("All")} {t("Customer")}</option>
                {loadingCustomers ? (
                  <option disabled>{t("Loading")} {t("Customer")}...</option>
                ) : errorCustomers ? (
                  <option disabled>{errorCustomers}</option>
                ) : (
                  customerNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))
                )}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>
        </div>

        <SelectCustomerLadger customer={filteredCustomer} selectedCustomerName={selectedCustomer}/>
      </div>
    </main>
  );
};

export default CustomerLedger;