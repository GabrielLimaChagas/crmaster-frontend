import {
  ArchiveBoxIcon,
  BellIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Logo from "../../assets/crmaster.svg";
import Col from "../core/Col";
import Row from "../core/Row";
import { useLocation, useNavigate } from "react-router";
import { NAVIGATION_ROUTES } from "../../consts/navigationRoutes";

interface SidebarItemMenuProps {
  icon: React.FC<{ className: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}
const SidebarItemMenu: React.FC<SidebarItemMenuProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
}) => {
  return (
    <Row
      className={`w-full px-2 py-2 gap-2 items-center rounded-lg cursor-pointer transition ${active ? "bg-blue-600 text-neutral-100" : "text-neutral-600 hover:bg-blue-50"}`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Row>
  );
};

const MENU_ITEMS = [
  {
    path: NAVIGATION_ROUTES.DASHBOARD,
    icon: Squares2X2Icon,
    label: "Dashboard",
  },
  { path: NAVIGATION_ROUTES.CUSTOMERS, icon: UsersIcon, label: "Clientes" },
  {
    path: NAVIGATION_ROUTES.PRE_SALES,
    icon: DocumentTextIcon,
    label: "Orçamentos",
  },
  { path: NAVIGATION_ROUTES.SALES, icon: CurrencyDollarIcon, label: "Vendas" },
  { path: NAVIGATION_ROUTES.PRODUCTS, icon: ArchiveBoxIcon, label: "Produtos" },
  {
    path: NAVIGATION_ROUTES.NOTIFICATIONS,
    icon: BellIcon,
    label: "Notificações",
  },
];

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <Col className="w-50 bg-white px-2 border-r border-neutral-200">
      <Col className="p-4">
        <img src={Logo} alt="logo" />
      </Col>
      <Col className="h-full">
        {MENU_ITEMS.map((props) => (
          <SidebarItemMenu
            key={props.path}
            {...props}
            active={pathname.includes(props.path)}
            onClick={() => navigate(props.path)}
          />
        ))}
      </Col>
      <Col className="pb-2">
        <SidebarItemMenu
          icon={UserCircleIcon}
          label="Sua Área"
          active={pathname.includes(NAVIGATION_ROUTES.PROFILE)}
          onClick={() => navigate(NAVIGATION_ROUTES.PROFILE)}
        />
      </Col>
    </Col>
  );
};

export default Sidebar;
