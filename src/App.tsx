
import { Route, Routes } from "react-router"
import Dashboard from "./pages/Dashboard"
import RootLayout from "./pages/RootLayout"

const NAVIGATION_ROUTES = {
  DASHBOARD: "/dashboard"
} as const

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index path={NAVIGATION_ROUTES.DASHBOARD} element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
