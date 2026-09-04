import { ArchiveBoxIcon, BellIcon, CurrencyDollarIcon, DocumentTextIcon, Squares2X2Icon, UsersIcon } from "@heroicons/react/20/solid"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import Logo from "../../assets/crmaster.svg"
import Col from "../core/Col"
import Row from "../core/Row"

interface SidebarItemMenuProps {
  icon: React.FC<{ className: string }>
  label: string
  active?: boolean
  onClick?: () => void
}
const SidebarItemMenu: React.FC<SidebarItemMenuProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <Row className={`w-full px-2 py-2 gap-2 items-center rounded-lg cursor-pointer transition ${active ? "bg-blue-600 text-neutral-100" : "text-neutral-600 hover:bg-blue-50"}`} onClick={onClick}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Row>
  )
}


const MENU_ITEMS = [
  { id: "1", icon: Squares2X2Icon, label: "Dashboard" },
  { id: "2", icon: UsersIcon, label: "Clientes" },
  { id: "3", icon: DocumentTextIcon, label: "Orçamentos" },
  { id: "4", icon: CurrencyDollarIcon, label: "Vendas" },
  { id: "5", icon: ArchiveBoxIcon, label: "Produtos" },
  { id: "6", icon: BellIcon, label: "Notificações" }
]

interface SidebarProps {
  activeMenu?: string
  onChange?: (key: string) => void
}
const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onChange }) => {

  return (
    <Col className="w-50 bg-white px-2">
      <Col className="p-4">
        <img src={Logo} alt="logo" />
      </Col>
      <Col className="h-full">
        {MENU_ITEMS.map(props => <SidebarItemMenu key={props.id} {...props} active={activeMenu === props.label} onClick={() => onChange(props.label)} />)}
      </Col>
      <Col className="pb-2">
        <SidebarItemMenu icon={UserCircleIcon} label="Sua Área" active={activeMenu === "Sua Área"} onClick={() => onChange("Sua Área")} />
      </Col>
    </Col>
  )
}

export default Sidebar