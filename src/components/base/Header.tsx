import Row from "../core/Row";

interface HeaderProps {
  title: string;
  rightAttachment?: React.ReactNode;
}
const Header: React.FC<HeaderProps> = ({ title, rightAttachment }) => {
  return (
    <Row className="bg-white w-full h-12 justify-between items-center px-4 shadow-md">
      <span>{title}</span>
      {rightAttachment}
    </Row>
  );
};

export default Header;
