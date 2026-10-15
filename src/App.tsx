import { Route, Routes, Navigate } from "react-router";
import { NAVIGATION_ROUTES } from "./consts/navigationRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import PluginRouteGuard from "./components/auth/PluginRouteGuard";

import Login from "./pages/Login";
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
    <AuthProvider>
      <Routes>
        {/* Rota pública de Login (redireciona para / se já estiver autenticado) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path={NAVIGATION_ROUTES.LOGIN} element={<Login />} />
        </Route>

        {/* Rotas protegidas (redirecionam para /login se não houver sessão ativa) */}
        <Route element={<ProtectedRoute />}>
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
            <Route element={<PluginRouteGuard plugin="notifications_plugin" />}>
              <Route
                path={NAVIGATION_ROUTES.NOTIFICATIONS}
                element={<NotificationList />}
              />
              <Route
                path={NAVIGATION_ROUTES.NOTIFICATIONS_EN}
                element={<NotificationList />}
              />
            </Route>
          </Route>
          <Route
            path={NAVIGATION_ROUTES.ADMIN_NEW_COMPANY}
            element={<NewCompany />}
          />
        </Route>

        {/* Rota de fallback para redirecionar caminhos desconhecidos */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
