
import { useState } from "react"
import Sidebar from "./components/base/Sidebar"
import Row from "./components/core/Row"
import Col from "./components/core/Col"

function App() {
  const [active, setActive] = useState("")
  return (
    <Row className="flex bg-neutral-100 min-h-screen">
      <Sidebar activeMenu={active} onChange={setActive} />
      {active === "Dashboard" && <Col>Dashboard</Col>}
      {active === "Clientes" && <Col>Cliente</Col>}
    </Row>
  )
}

export default App
