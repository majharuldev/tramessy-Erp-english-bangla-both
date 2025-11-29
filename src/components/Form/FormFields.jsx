import { Controller, useFormContext } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

import CreatableSelect from "react-select/creatable";

// select
export const SelectField = ({
  name,
  label,
  required,
  options,
  control,
  placeholder,
  defaultValue,
  onSelectChange,
  isCreatable = true,
  isMulti = false,
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label || name} is required` : false }}

        render={({ field: { onChange, value, ref } }) => {
          const SelectComponent = isCreatable ? CreatableSelect : Select;

          // Correct getValue for existing + creatable
          const getValue = () => {
            if (!value) return isMulti ? [] : null;

            if (isMulti) {
              return value.map((val) => {
                return (
                  options.find((opt) => opt.value === val) || { value: val, label: val }
                );
              });
            } else {
              return (
                options.find((opt) => opt.value === value) || { value, label: value }
              );
            }
          };

          return (
            <SelectComponent
              inputRef={ref}
              isMulti={isMulti}
              value={getValue()}
              // onChange={(selectedOption) => {
              //   const selectedValue = selectedOption?.value || "";
              //   onChange(selectedValue);
              //   if (onSelectChange) {
              //     onSelectChange(selectedOption);
              //   }
              // }}
              onChange={(selectedOption) => {
                if (isMulti) {
                  const selectedValues = selectedOption
                    ? selectedOption.map((opt) => opt.value)
                    : [];
                  onChange(selectedValues);
                  onSelectChange?.(selectedOption);
                } else {
                  const selectedValue = selectedOption?.value || "";
                  onChange(selectedValue);
                  onSelectChange?.(selectedOption);
                }
              }}
              options={options}
              placeholder={placeholder || `Select ${label}`}
              defaultValue={defaultValue}
              className="text-sm hide-scrollbar"
              menuPortalTarget={document.body}
              classNamePrefix="react-select"
              isClearable
              // Add these props for better creatable experience
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              onCreateOption={(inputValue) => {
                onChange(inputValue);
                // Also add the new option to the options array for display
                // This is optional but provides better UX
                if (onSelectChange) {
                  onSelectChange({ value: inputValue, label: inputValue });
                }
              }}
            />
          );
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// // input
import { parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";

export const InputField = ({
  name,
  label,
  type,
  value,
  placeholder = "",
  defaultValue,
  required = false,
  inputRef,
  icon,
  readOnly = false,
}) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  //  If type="date" → Use react-datepicker
  if (type === "date") {
    return (
      <div className="mb-4 ">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue || null}
            rules={{
              required: required ? `${label || name} is required` : false,
            }}
            render={({ field }) => (
              <DatePicker
                id={name}
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText={placeholder || `Select ${label || name}`}
                className={`mt-1 text-sm border border-gray-300 px-3 py-2 rounded outline-none ${icon ? "pr-12" : ""
                  } ${readOnly ? "bg-gray-200" : "bg-white"} w-full`}
                readOnly={readOnly}
                ref={(el) => {
                  if (inputRef) inputRef(el);
                }}
                wrapperClassName="w-full" //  important for full width
              />
            )}
          />

          {/* {icon && ( */}
          <span className="absolute inset-y-0 right-0 flex items-center justify-center  px-3 rounded-r cursor-pointer">
            <FiCalendar />
          </span>
          {/* )} */}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // If not date → Default Input Logic
  const { ref, ...rest } = register(name, {
    required: required ? `${label || name} is required` : false,
  });

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          type={type}
          placeholder={placeholder || `Enter ${label || name}`}
          defaultValue={defaultValue}
          value={value}
          readOnly={readOnly}
          {...rest}
          ref={(el) => {
            ref(el);
            if (inputRef) inputRef(el);
          }}
          className={`remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded outline-none ${icon ? "pr-10" : ""
            } ${readOnly ? "bg-gray-200" : "bg-white"}`}
        />
        {icon && icon}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};


// text area
const TextAreaField = ({
  name,
  label,
  required = false,
  placeholder = ""
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={name}
        rows={2}
        {...register(name, {
          required: required ? `${label || name} is required` : false,
        })}
        placeholder={placeholder || `Enter ${label || name}`} // 👈 placeholder
        className="w-full border border-gray-300 p-2 rounded text-sm"
      />

      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default TextAreaField;

