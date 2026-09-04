
import { Route, Routes } from "react-router"
import Dashboard from "./pages/Dashboard"
import RootLayout from "./pages/RootLayout"
import ProductList from "./pages/ProductList"
import ProductForm from "./pages/ProductForm"
import { NAVIGATION_ROUTES } from "./consts/navigationRoutes"

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index path={NAVIGATION_ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={NAVIGATION_ROUTES.PRODUCTS} element={<ProductList />} />
        <Route path={NAVIGATION_ROUTES.NEW_PRODUCT} element={<ProductForm />} />
      </Route>
    </Routes>
  )
}

export default App
