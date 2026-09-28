import { useFormContext, type FieldValues, type RegisterOptions } from "react-hook-form";
import Col from "./Col";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  options?: RegisterOptions<FieldValues, string>
}
const Input: React.FC<InputProps> = ({
  name,
  label,
  options,
  type = "text",
  ...props
}) => {
  const { register } = useFormContext();
  return (
    <Col className="gap-2">
      <label className="text-neutral-600 text-xs" htmlFor={name}>
        {label}
      </label>
      <input
        {...props}
        className="border border-neutral-300 rounded-sm bg-white placeholder:text-neutral-300 px-2"
        id={name}
        type={type}
        {...register(name, options)}
      />
    </Col>
  );
};

export default Input;
