import { Route, Routes } from "react-router";
import { NAVIGATION_ROUTES } from "./consts/navigationRoutes";
import Dashboard from "./pages/Dashboard";
import RootLayout from "./pages/RootLayout";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import CustomerForm from "./pages/CustomerForm";
import CustomerList from "./pages/CustomerList";
import PreSaleList from "./pages/PreSaleList";
import PreSaleForm from "./pages/PreSaleForm";
import SaleList from "./pages/SaleList";
import SaleForm from "./pages/SaleForm";
import Profile from "./pages/Profile";
import NotificationList from "./pages/NotificationList";
import NewCompany from "./pages/NewCompany";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        <Route path={NAVIGATION_ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={NAVIGATION_ROUTES.PRODUCTS} element={<ProductList />} />
        <Route path={NAVIGATION_ROUTES.NEW_PRODUCT} element={<ProductForm />} />
        <Route
          path={NAVIGATION_ROUTES.EDIT_PRODUCT}
          element={<ProductForm />}
        />
        <Route path={NAVIGATION_ROUTES.CUSTOMERS} element={<CustomerList />} />
        <Route
          path={NAVIGATION_ROUTES.NEW_CUSTOMER}
          element={<CustomerForm />}
        />
        <Route
          path={NAVIGATION_ROUTES.EDIT_CUSTOMER}
          element={<CustomerForm />}
        />
        <Route path={NAVIGATION_ROUTES.PRE_SALES} element={<PreSaleList />} />
        <Route
          path={NAVIGATION_ROUTES.NEW_PRE_SALE}
          element={<PreSaleForm />}
        />
        <Route
          path={NAVIGATION_ROUTES.EDIT_PRE_SALE}
          element={<PreSaleForm />}
        />
        <Route path={NAVIGATION_ROUTES.SALES} element={<SaleList />} />
        <Route path={NAVIGATION_ROUTES.NEW_SALE} element={<SaleForm />} />
        <Route path={NAVIGATION_ROUTES.EDIT_SALE} element={<SaleForm />} />
        <Route path={NAVIGATION_ROUTES.PROFILE} element={<Profile />} />
        <Route
          path={NAVIGATION_ROUTES.NOTIFICATIONS}
          element={<NotificationList />}
        />
      </Route>
      <Route
        path={NAVIGATION_ROUTES.ADMIN_NEW_COMPANY}
        element={<NewCompany />}
      />
    </Routes>
  );
}

export default App;
