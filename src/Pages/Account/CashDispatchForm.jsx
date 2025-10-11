import { FormProvider, useForm } from "react-hook-form"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { FiCalendar } from "react-icons/fi"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../../utils/axiosConfig"

const CashDispatchForm = () => {
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
        remarks: data.remarks,
        ref: data.ref || "",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
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

    try {
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }

      if (!isEditing) {
        formData.append("ref_id", refId)
      }

      // Use update or create endpoint based on mode
      const endpoint = isEditing
        ? `/fundTransfer/${id}`
        : `/fundTransfer`

      const method = isEditing ? "put" : "post"

      const response = await api[method](endpoint, formData)
      const responseData = response.data

      if (responseData.success) {
        toast.success(isEditing ? "Fund transfer updated successfully" : "Fund transfer created successfully", {
          position: "top-right",
        })

        // For new entries, also create branch record
        // if (!isEditing) {
        //   const branchFormData = new FormData()
        //   branchFormData.append("date", data.date)
        //   branchFormData.append("cash_in", data.amount)
        //   branchFormData.append("branch_name", data.branch_name)
        //   branchFormData.append("remarks", data.ref)
        //   branchFormData.append("mode", data.type)
        //   branchFormData.append("ref_id", refId)

        //   await axios.post(`${import.meta.env.VITE_BASE_URL}/branch/create`, branchFormData)
        // }

        // Reset form if create, navigate back if edit
        if (isEditing) {
          navigate("/tramessy/account/CashDispatch") // Go back to previous page
        } else {
          reset()
          navigate("/tramessy/account/CashDispatch")
        }
      } else {
        toast.error(responseData.message || "Operation failed")
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      toast.error("Server issue: " + errorMessage)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="mt-5 p-2">
      <Toaster position="top-center" reverseOrder={false} />
     <div className="mx-auto p-6  rounded-md shadow-md border-t-2 border-primary">
       <h3 className="pb-4 text-primary font-semibold ">
        {isEditing ? "Edit Fund Transfer" : "Create Fund Transfer"}
      </h3>
      <FormProvider {...methods} className="">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto  ">
          {/* Trip & Destination Section */}
          <div className=" ">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
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
                  label="Branch Name"
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
                  label="Person Name"
                  required={!isEditing}
                  options={employeeOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="type"
                  label="Cash Type"
                  required={!isEditing}
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank", label: "Bank" },
                    { value: "Card", label: "Card" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="amount" label="Amount" type="number" required={!isEditing} />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bank_name" label="Bank Name" required={!isEditing} />
              </div>
              <div className="w-full">
                <InputField name="remarks" label="Note" required={!isEditing} />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>{isEditing ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
     </div>
    </div>
  )
}

export default CashDispatchForm
