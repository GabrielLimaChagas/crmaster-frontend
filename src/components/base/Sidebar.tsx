import {
  ArchiveBoxIcon,
  BellIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Logo from "../../assets/crmaster.svg";
import Col from "../core/Col";
import Row from "../core/Row";
import { useLocation, useNavigate } from "react-router";
import { NAVIGATION_ROUTES } from "../../consts/navigationRoutes";
import { useAuth } from "../../contexts/AuthContext";

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
  const { logout, user } = useAuth();

  return (
    <Col className="w-56 h-screen shrink-0 bg-white px-2 border-r border-neutral-200 justify-between overflow-hidden">
      <Col className="overflow-hidden">
        <Col className="p-4 shrink-0">
          <img src={Logo} alt="logo" />
        </Col>
        <Col className="overflow-y-auto gap-0.5">
          {MENU_ITEMS.map((props) => (
            <SidebarItemMenu
              key={props.path}
              {...props}
              active={pathname.includes(props.path)}
              onClick={() => navigate(props.path)}
            />
          ))}
        </Col>
      </Col>
      <Col className="pb-4 shrink-0 border-t border-neutral-100 pt-2 gap-1">
        <SidebarItemMenu
          icon={UserCircleIcon}
          label={user?.name ? user.name.split(" ")[0] : "Sua Área"}
          active={pathname.includes(NAVIGATION_ROUTES.PROFILE)}
          onClick={() => navigate(NAVIGATION_ROUTES.PROFILE)}
        />
        <Row
          className="w-full px-2 py-2 gap-2 items-center rounded-lg cursor-pointer transition text-red-600 hover:bg-red-50 text-sm font-medium"
          onClick={logout}
          title="Encerrar sessão"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          <span>Sair</span>
        </Row>
      </Col>
    </Col>
  );
};

export default Sidebar;
