import { Outlet } from "react-router"
import Sidebar from "../components/base/Sidebar"
import Row from "../components/core/Row"

const RootLayout = () => {
  return (
    <Row className="flex bg-neutral-100 min-h-screen">
      <Sidebar activeMenu={"1"} />
      <Outlet />
    </Row>
  )
}

export default RootLayout