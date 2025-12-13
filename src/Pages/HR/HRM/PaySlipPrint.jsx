// Helper: convert number to words (English, supports up to millions)
const numberToWords = (num) => {
  if (num === null || num === undefined) return ""
  if (num === 0) return "zero"
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ]
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  const g = ["", "thousand", "million", "billion"]

  const makeGroup = (n) => {
    let str = ""
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " hundred"
      n = n % 100
      if (n) str += " "
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)]
      if (n % 10) str += " " + a[n % 10]
    } else if (n > 0) {
      str += a[n]
    }
    return str
  }

  let i = 0
  const words = []
  while (num > 0) {
    const chunk = num % 1000
    if (chunk) {
      let chunkWords = makeGroup(chunk)
      if (g[i]) chunkWords += " " + g[i]
      words.unshift(chunkWords.trim())
    }
    num = Math.floor(num / 1000)
    i++
  }
  return words.join(" ")
}
import logo from "../../../assets/AJ_Logo.png"
import React, { forwardRef } from "react";
import toNumber from "../../../hooks/toNumber"
const PaySlipPrint = forwardRef(({ data }, ref) => {
  const calculateNetPay = (data) => {
    const earnings = toNumber(data.e_total || 0);
    const deduction = toNumber(data.d_total || 0);
    return earnings - deduction;
  };

  return (
    <div ref={ref} className="max-w-4xl mx-auto bg-white p-8 font-sans text-sm">
      {/* Header Section */}
      <div className="border-2 border-gray-700">
        {/* Company Header */}
        <div className="flex items-center justify-between p-4">
          <div className="">
            {/* Logo */}
            <img src={logo} alt="" />
            <div className="text-xs text-secondary">
              <div className="font-bold">M/S A J ENTERPRISE</div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary mb-2">M/S AJ Enterprise</h1>
            <div className="text-xs text-gray-700">
              <div>Razzak Plaza, 11th Floor, Room No: J-12,</div>
              <div>2 Sahid Tajuddin Sarani, Moghbazar, Dhaka-1217, Bangladesh</div>
            </div>
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>

        {/* Pay Slip Title */}
        <div className="text-center py-3 px-28">
          <h2 className="text-xl font-bold italic border-b-2 border-gray-700">Salary Pay Slip</h2>
        </div>

        {/* table info */}
        <div className="border border-gray-700 mx-10">
          {/* Employee Information */}
          <div className="border-b border-black">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100 w-32">Employee ID</td>
                  <td className="border-r border-black p-2 w-40">{data.id}</td>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100 w-32">Employee Name</td>
                  <td className="p-2">{data.name}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">Designation</td>
                  <td className="border-r border-black p-2">{data.designation}</td>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">Month/Year</td>
                  <td className="p-2">{data.monthYear}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Earnings and Deductions */}
          <div className="border-y border-black">
            <table className="w-full">
              <tbody>
                <tr>
                  <td colSpan={2} className="border-r border-black p-2 text-center font-bold bg-gray-100 w-1/4">Earnings</td>
                  {/* <td className="border-r border-black p-2 text-center font-bold bg-gray-100 w-1/4"></td> */}
                  <td colSpan={2} className=" p-2 text-center font-bold bg-gray-100 w-1/4">Deductions</td>
                  {/* <td className="p-2 text-center font-bold bg-gray-100 w-1/4"></td> */}
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Basic</td>
                  <td className="border-r border-black p-2 text-right">{data?.basic}</td>
                  <td className="border-r border-black p-2 font-semibold">Advance</td>
                  <td className="p-2 text-right">{data?.adv}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">House Rent</td>
                  <td className="border-r border-black p-2 text-right">{data?.house_rent}</td>
                  <td className="border-r border-black p-2 font-semibold rounded-full border  mx-2 text-center">
                    Loan
                  </td>
                  <td className="p-2 text-right">{data?.loan}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Medical</td>
                  <td className="border-r border-black p-2 text-right">{data?.medical}</td>
                  <td className="border-r border-black p-2 font-semibold rounded-full border mx-2 text-center">
                    Tax
                  </td>
                  <td className="p-2 text-right">{data?.tax}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Convance</td>
                  <td className="border-r border-black p-2 text-right">{data?.conv}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Allowance</td>
                  <td className="border-r border-black p-2 text-right">{data?.allown}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Bonus</td>
                  <td className="border-r border-black p-2 text-right">{data?.bonous}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-t border-r border-black bg-gray-100">
                  <td className="border-r border-black p-2 font-bold">Total Addition</td>
                  <td className="border-r border-black p-2 text-right font-bold"> {data?.e_total}</td>
                  <td className="border-r border-black p-2 font-bold">Total Deductions</td>
                  <td className=" border-black p-2 text-right font-bold">{data?.d_total}.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary */}
          <div className="border-l border-black">
            <table className="w-full">
              <tbody>
                <tr className="border-t border-black">
                  <td className=" p-2 font-bold bg-gray-100 w-1/4">Net Salary</td>
                  <td className="p-2 text-center font-bold text-lg"> {calculateNetPay(data)} </td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-t border-black">
                  <td className=" p-2 font-bold bg-gray-100">Salary in Words:</td>
                  <td className="p-2 font-semibold">{numberToWords(calculateNetPay(data)).toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Payment Method and Signatures */}
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="mb-2 font-semibold">Salary Paid by:</div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Cheque</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="mb-2">Employee Signature</div>
                <div className="border-b border-black w-64 h-8"></div>
              </div>
              <div>
                <div className="mb-2">Authorized</div>
                <div className="border-b border-black w-64 h-8"></div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
})

export default PaySlipPrint;
