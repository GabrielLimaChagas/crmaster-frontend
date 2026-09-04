import type { HTMLAttributes } from "react";

interface IconButtonProps {
  icon?: React.ReactNode;
}

const IconButton: React.FC<
  HTMLAttributes<HTMLButtonElement> & IconButtonProps
> = ({ icon, ...props }) => {
  return (
    <button {...props} className="">
      {icon}
    </button>
  );
};

export default IconButton;
