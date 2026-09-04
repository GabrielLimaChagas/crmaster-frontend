import type { HTMLAttributes } from "react"

const Row: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => <div {...props} className={`flex flex-row ${className}`}>{children}</div>

export default Row