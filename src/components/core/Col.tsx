interface ColProps {
  children?: React.ReactNode
  className?: string
}

const Col: React.FC<ColProps> = ({ children, className }) => <div className={`flex flex-col ${className}`}>{children}</div>

export default Col