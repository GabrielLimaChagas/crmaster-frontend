import type { HTMLAttributes } from "react";

interface ButtonProps {
  label?: string;
  leftAttachment?: React.ReactNode;
}

const Button: React.FC<HTMLAttributes<HTMLButtonElement> & ButtonProps> = ({
  label,
  leftAttachment,
  ...props
}) => {
  return (
    <button {...props} className="">
      {leftAttachment}
      {label}
    </button>
  );
};

export default Button;
