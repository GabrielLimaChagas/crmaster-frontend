import type { TextareaHTMLAttributes } from "react";
import { useFormContext, type FieldValues, type RegisterOptions } from "react-hook-form";
import Col from "./Col";

interface TextAreaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  options?: RegisterOptions<FieldValues, string>
}
const TextAreaInput: React.FC<TextAreaInputProps> = ({
  name,
  label,
  options,
  ...props
}) => {
  const { register } = useFormContext();
  return (
    <Col className="gap-2">
      <label className="text-neutral-600 text-xs" htmlFor={name}>
        {label}
      </label>
      <textarea
        {...props}
        className="border border-neutral-300 rounded-sm bg-white placeholder:text-neutral-300 px-2"
        id={name}
        {...register(name, options)}
      />
    </Col>
  );
};

export default TextAreaInput;
