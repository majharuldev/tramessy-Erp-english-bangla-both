import { FormProvider, useForm } from "react-hook-form"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { FiCalendar } from "react-icons/fi"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../../utils/axiosConfig"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

const CashDispatchForm = () => {
  const {t} = useTranslation();
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState([])
  const [employee, setEmployee] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const dateRef = useRef(null)
  const methods = useForm()

  // Fetch initial data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true)
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/fundTransfer/${id}`)
      const data = response.data.data

      // Set form values
      methods.reset({
        date: data.date,
        branch_name: data.branch_name, // Changed from 'branch' to 'branch_name'
        person_name: data.person_name,
        type: data.type,
        amount: data.amount,
        bank_name: data.bank_name || "",
        purpose: data.purpose,
        ref: data.ref || "",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error(t("Failed to load data"))
    } finally {
      setLoading(false)
    }
  }

  // select branch from api
  useEffect(() => {
    api.get(`/office`)
      .then((response) => setBranch(response.data.data))
      .catch((error) => console.error("Error fetching branch name:", error))
  }, [])

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // select branch from api
  useEffect(() => {
    api.get(`/employee`)
      .then((response) => setEmployee(response.data.data))
      .catch((error) => console.error("Error fetching employee name:", error))
  }, [])

  const employeeOptions = employee.map((dt) => ({
    value: dt.employee_name,
    label: dt.employee_name,
  }))

  const { handleSubmit, reset, register, control } = methods

  // generate ref id
  const generateRefId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let refId = ""
    for (let i = 0; i < 6; i++) {
      refId += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return refId
  }

  // post data on server
  const onSubmit = async (data) => {
    const refId = isEditing ? data.ref_id : generateRefId()
const formatDate = (date) => {
        if (!date) return null
        const parsed = new Date(date)
        return isNaN(parsed) ? null : format(parsed, "yyyy-MM-dd")
      }
    try {
     const payload = {
      ...data,
    }
    payload.date = formatDate(data.date)

    // যদি create হয়, নতুন ref_id generate করো
    if (!isEditing) {
      payload.ref_id = generateRefId()
    }
      // Use update or create endpoint based on mode
      const endpoint = isEditing
        ? `/fundTransfer/${id}`
        : `/fundTransfer`

      const method = isEditing ? "put" : "post"

      const response = await api[method](endpoint, payload)
      const responseData = response.data

      if (responseData.success) {
        toast.success(isEditing ? t("Fund transfer updated successfully") : t("Fund transfer created successfully"), {
          position: "top-right",
        })

        // Reset form if create, navigate back if edit
        if (isEditing) {
          navigate("/tramessy/account/CashDispatch") // Go back to previous page
        } else {
          reset()
          navigate("/tramessy/account/CashDispatch")
        }
      } else {
        toast.error(responseData.message || t("Operation failed"))
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error.response?.data?.message || error.message || t("Unknown error")
      toast.error(t("Server issue:") + errorMessage)
    }
  }

  if (loading) {
    return <div>{t("Loading")}...</div>
  }

  return (
    <div className="mt-5 p-2">
      <Toaster position="top-center" reverseOrder={false} />
     <div className="mx-auto p-6  rounded-md shadow-md border-t-2 border-primary">
       <h3 className="pb-4 text-primary font-semibold ">
        {isEditing ? t("Update Fund Transfer") : t("Create Fund Transfer")}
      </h3>
      <FormProvider {...methods} className="">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto  ">
          {/* Trip & Destination Section */}
          <div className=" ">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label={t("Date")}
                  type="date"
                  required={!isEditing}
                  inputRef={(e) => {
                    register("date").ref(e)
                    dateRef.current = e
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 rounded-r"
                      onClick={() => dateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-gray-700 cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label={`${t("Branch")} ${t("Name")}`}
                  required={!isEditing}
                  options={branchOptions}
                  control={control}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="person_name"
                  label={t("Person Name")}
                  required={!isEditing}
                  options={employeeOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="type"
                  label={t("Cash Type")}
                  required={!isEditing}
                  options={[
                    { value: "Cash", label: t("Cash") },
                    { value: "Bank", label: t("Bank") },
                    { value: "Card", label: t("Card") },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="amount" label={t("Amount")} type="number" required={!isEditing} />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bank_name" label={t("Bank Name")} required={!isEditing} />
              </div>
              <div className="w-full">
                <InputField name="purpose" label={t("Purpose")} required={!isEditing} />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>{isEditing ? t("Update") : t("Submit")}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
     </div>
    </div>
  )
}

export default CashDispatchForm
