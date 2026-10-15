import React, { type SelectHTMLAttributes } from "react";
import { useFormContext, type FieldValues, type RegisterOptions } from "react-hook-form";
import Col from "./Col";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue"> {
  name: string;
  label?: string;
  optionsList?: readonly SelectOption[] | SelectOption[];
  options?: RegisterOptions<FieldValues, string>;
  placeholderOption?: string;
  children?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  name,
  id,
  label,
  optionsList,
  options,
  placeholderOption,
  children,
  className = "",
  ...props
}) => {
  const formContext = useFormContext();
  const registration = formContext ? formContext.register(name, options) : {};

  return (
    <Col className="gap-2">
      {label && (
        <label className="text-neutral-600 text-xs font-medium" htmlFor={id || name}>
          {label}
        </label>
      )}
      <select
        id={id || name}
        className={`border border-neutral-300 rounded-sm bg-white text-neutral-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
        {...registration}
      >
        {placeholderOption && <option value="">{placeholderOption}</option>}
        {optionsList?.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
    </Col>
  );
};

export default Select;
