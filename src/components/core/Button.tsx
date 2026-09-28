import type { ButtonHTMLAttributes } from "react";

type ButtonVariants = "primary" | "danger" | "secondary";

interface ButtonProps {
  label?: string;
  variant?: ButtonVariants;
  leftAttachment?: React.ReactNode;
}

const Button: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
> = ({ label, leftAttachment, variant = "secondary", className, ...props }) => {
  return (
    <button {...props} className={`min-h-8 transition-colors cursor-pointer rounded-lg outline-none px-4 ${VARIANT_CLASSNAMES[variant]} ${className}`}>
      {leftAttachment}
      {label}
    </button>
  );
};

export default Button;

const VARIANT_CLASSNAMES: Record<ButtonVariants, string> = {
  primary: "bg-blue-600 hover:bg-blue-500 active:bg-blue-600 text-white",
  secondary: "",
  danger: "",
} as const;
