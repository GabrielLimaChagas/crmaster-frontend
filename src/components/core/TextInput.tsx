import { useFormContext } from "react-hook-form";
import Col from "./Col";

interface TextInputProps {
  name: string;
  label?: string;
  placeholder?: string;
}
const TextInput: React.FC<TextInputProps> = ({ name, label, placeholder }) => {
  const { register } = useFormContext();
  return (
    <Col className="gap-2">
      <label className="text-neutral-600 text-xs" htmlFor={name}>
        {label}
      </label>
      <input
        className="border border-neutral-300 rounded-sm bg-white placeholder:text-neutral-300 px-2"
        id={name}
        placeholder={placeholder}
        {...register(name)}
      />
    </Col>
  );
};

export default TextInput;
