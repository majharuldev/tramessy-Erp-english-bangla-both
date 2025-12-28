import React, { createRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";

const FileUploadWithPreview = ({ field, name, accept = "*" }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = createRef();

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      field.onChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    field.onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative mt-1 w-full space-y-2">
      <input
        id={name}
        name={name}
        type="file"
        ref={(e) => {
          field.ref(e);
          fileInputRef.current = e;
        }}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />

      <div
        onClick={handleIconClick}
        className="text-sm border border-gray-300 ps-2 rounded flex items-center justify-between cursor-pointer"
      >
        <span className="text-sm text-gray-500">ছবি বাচাই করুন</span>
        <span className="text-xl text-white bg-primary px-4 py-[9px] rounded-r-md">
          <MdOutlineFileUpload />
        </span>
      </div>

      {previewUrl && (
        <div className="relative w-fit">
          <img
            src={previewUrl}
            alt="Uploaded Preview"
            className="mt-2 max-h-40 rounded border border-gray-200"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
          >
            <IoMdClose />
          </button>
        </div>
      )}
    </div>
  );
};

const ReusableForm = ({ children, onSubmit }) => {
  const { handleSubmit, control } = useForm();
  const {t} = useTranslation()

  const enhanceChildren = (children) =>
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      // Recursively enhance nested children
      if (child.props?.children) {
        return React.cloneElement(child, {
          children: enhanceChildren(child.props.children),
        });
      }

      // Handle datepicker inputs
      if (
        child.props?.name &&
        child.props.type === "text" &&
        child.props["data-datepicker"]
      ) {
        return (
          <Controller
            control={control}
            name={child.props.name}
            defaultValue={null}
            render={({ field }) => {
              const dateRef = createRef();

              return (
                <div className="relative w-full">
                  <DatePicker
                    {...field}
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    placeholderText={child.props.placeholder}
                    dateFormat="dd-MM-yyyy"
                    className={`${child.props.className || ""}`}
                    wrapperClassName="w-full"
                    ref={dateRef}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                  <span
                    onClick={() => dateRef.current?.setOpen(true)}
                    className="absolute top-1 right-0 text-xl text-white bg-primary px-4 py-[9px] rounded-r-md cursor-pointer hover:bg-secondary transition-all duration-300"
                  >
                    <HiMiniCalendarDateRange />
                  </span>
                </div>
              );
            }}
          />
        );
      }

      // Handle file inputs with upload icon and preview
      if (child.props?.name && child.props.type === "file") {
        return (
          <Controller
            name={child.props.name}
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <FileUploadWithPreview
                field={field}
                name={child.props.name}
                accept={child.props.accept}
              />
            )}
          />
        );
      }

      // Handle standard form fields
      if (
        child.props?.name &&
        (child.type === "input" ||
          child.type === "select" ||
          child.type === "textarea")
      ) {
        return (
          <Controller
            name={child.props.name}
            control={control}
            defaultValue={child.props.defaultValue || ""}
            render={({ field }) =>
              React.cloneElement(child, {
                ...field,
                checked:
                  child.props.type === "checkbox" ? field.value : undefined,
              })
            }
          />
        );
      }

      return child;
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {enhanceChildren(children)}

      <div className="flex justify-center mt-10">
        <button
          type="submit"
          className="font-semibold uppercase text-sm bg-primary text-white px-16 py-2 rounded hover:bg-primary cursor-pointer transition-all duration-700"
        >
          {t("Login")}
        </button>
      </div>
    </form>
  );
};

export default ReusableForm;
