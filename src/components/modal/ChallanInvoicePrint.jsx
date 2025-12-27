
import { forwardRef } from "react"

import logo from "../../assets/AJ_Logo.png"

const ChallanInvoicePrint = forwardRef(({ data }, ref) => {
  console.log(data)
  const {
    voucherNo,
    receiver,
    address,
    truckNo,
    driverName,
    licenseNo,
    loadingPoint,
    unloadingPoint,
    productDetails,
    route,
    rent
  } = data

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      ref={ref}
      className="text-sm p-4 bg-white w-[250mm] min-h-[297mm] text-black font-sans mx-auto"
    >
      <div className="flex items-center justify-center mb-3">
        <div className="flex items-center gap-3">
          <div>
            {/* <img src={logo} alt="" /> */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-600 mb-1 text-center">মেসার্স সৈনিক ট্রান্সপোর্ট এজেন্সি</h1>
            <p className="text-xs leading-tight text-center">
              অফিস:  ঢাকা।
              <br />
              মোবাইল নং- ০১********, ০১********
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          চালান নং: <span className="font-bold">{voucherNo}</span>
        </div>
        <div className="bg-cyan-500 text-white px-4 py-1 rounded text-sm font-bold">ট্রাক চালান</div>
        <div className="text-sm">
          তারিখ: <span className="font-bold">{currentDate}</span>
        </div>
      </div>

      <div className="border border-gray-700 mb-4">
        <div className="grid grid-cols-2 gap-0">
          {/* Left Column */}
          <div className="border-r border-gray-700 p-2 space-y-2">
            <div className="flex items-center">
              <span className="w-12 text-sm">প্রাপক:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{receiver}</span>
            </div>
            <div className="flex items-center">
              <span className="w-12 text-sm">বিবরণ:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{address}</span>
            </div>
            <div className="flex items-center">
              <span className="w-12 text-sm">প্রেরক:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{loadingPoint}</span>
            </div>
            <div className="flex items-center">
              <span className="w-12 text-sm">বিবরণ:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{unloadingPoint}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-2 space-y-2">
            <div className="flex items-center">
              <span className="w-16 text-sm">ট্রাক নং:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{truckNo}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm">চালকের নাম:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{driverName}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm">লাইসেন্স নং:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{licenseNo}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm">রুট:</span>
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{loadingPoint}</span> to
              <span className="flex-1 border-b border-gray-700 pb-1 ml-2 text-sm">{unloadingPoint}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-0 mb-4 border border-gray-700">
        <div className="w-16 border-r border-gray-700">
          <div className="border-b border-gray-700 bg-gray-50">
            <div className=" text-center text-sm font-bold">
              <div className=" p-2">সংখ্যা</div>
            </div>
          </div>

          <div className="text-xs">
            <div className=" min-h-[24px]">
              <div className=" p-1 flex items-center"></div>
            </div>
          </div>
        </div>
        {/* Left Side - Goods Description */}
        <div className="flex-1 border-r border-gray-700">
          <div className="border-b border-gray-700 p-2 bg-gray-50 text-sm font-bold">
            মালামালের বিবরণ: (কোটি/বস্তা/বাক্স/কেজি)
          </div>
          <div className="p-3 min-h-[200px]">
            <div className="mb-3 text-sm">
              <strong>জনাব,</strong>
            </div>
            <div className="mb-4 text-sm">
              <strong>সর্বমোট মালামাল:</strong>
            </div>
            <div className="mt-6 text-gray-900">
              <div className="text-sm font-medium">{productDetails}</div>
              <div className="text-xs text-gray-900 mt-3">জনাব,</div>
              <div className="text-xs mt-2">চালান অনুযায়ী মাল বুঝিয়া লইয়া রিসিভিং/বাকি ভাড়া ................... টাকা দিয়ে দিবেন।</div>
            </div>
          </div>
        </div>

        {/* Right Side - Cost Breakdown Table */}

        <div className="w-72">
          <div className="border-b border-gray-700 bg-gray-50">
            <div className="grid grid-cols-3 text-center text-sm font-bold">
              <div className="border-r border-gray-700 p-2">পরিমাণ</div>
              <div className="border-r border-gray-700 p-2">বিবরণ</div>
              <div className="p-2">টাকা</div>
            </div>
          </div>

          <div className="text-xs">
            {[
              { col1: "মালসহ ওজন", col2: "" },
              { col1: "", col2: "" },
              { col1: "খালি গাড়ি ওজন", col2: "" },
              { col1: "", col2: "ট্রাক ভাড়া" },
              { col1: "মোট মাল এর ওজন", col2: "অতিরিক্ত ভাড়া" },
              { col1: "", col2: "কমিশন" },
              { col1: "", col2: "মোট টাকা", col3: `${rent}` },
              { col1: "", col2: "অগ্রিম" },
              { col1: "", col2: "বাকি" },
            ].map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 border-b border-gray-300 min-h-[24px]"
              >
                <div className="border-r border-gray-700 p-1 flex items-center">
                  {row.col1}
                </div>
                <div className="border-r border-gray-700 p-1 flex items-center">
                  {row.col2}
                </div>
                <div className="p-1 flex items-center">{row.col3}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="text-xs mb-4 leading-relaxed">
        <p className="mb-2">
          <strong>বি: দ্র:</strong> উপরিউক্ত মাল পরিবহনের পৌঁছানো দায়িত্ব ট্রাক চালকের। গাড়ীতে মালিকের উপস্থিতি ছাড়া পরিবহন সংস্থা দায়ী নয়
          কোন ক্ষতির জন্য।
        </p>
        <p>গাড়ীর চালক ৭ সপ্তাহের মধ্যে অবশ্যই বিল পরিশোধ মাধ্যমে চালান ট্রাকমেট কর্তৃপক্ষের নিকট জমা দিতে হবে।</p>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mt-8">
        <div className="text-center">
          <div className="w-44 h-16 border border-gray-700 mb-2 bg-white"></div>
          <div className="text-xs">চালকের স্বাক্ষর/মালিকের স্বাক্ষর</div>
        </div>

        {/* <div className="text-center text-xs">
          <div className="mb-2">তারিখ: ২৩.০৬.০৬</div>
           <div className="border-b border-dotted">In Time:{startDate}</div>
          <div className="border-b border-dotted">Exit Time: {endDate}</div>
        </div> */}

        <div className="text-center">
          <div className="flex">
            <div className="text-right">
              <div className="text-xs">
                স্বাক্ষর: লোডিং প্রতিনিধি:
              </div>
              <div className="text-xs">
                ম্যানেজার:
              </div>
            </div>
            <div className="text-lg font-bold mb-2 border border-gray-700 w-56 h-16"></div>
          </div>
          <div className="text-xs">
            পক্ষে: মেসার্স এজে এন্টারপ্রাইজ
          </div>
        </div>
      </div>
    </div>
  )
})

ChallanInvoicePrint.displayName = "ChallanInvoicePrint"

export default ChallanInvoicePrint


