import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { getJwtRole, hasUserPermission } from "./utils/jwtUser.js";
// Components
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login"; 
import Overview from "./pages/Overview";
import Users from "./pages/Users";
import Painters from "./pages/Painters";
import Vendors from "./pages/Vendors";
import Designers from "./pages/Designers";
import DesignerDetails from "./pages/DesignerDetails";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Offers from "./pages/Offers";
import Coupons from "./pages/Coupons";
import Reviews from "./pages/Reviews";
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import Services from "./pages/Services";
import AuditLogs from "./pages/ActivityLog";
import VendorProfile from "./pages/VendorProfile";
import PainterDetails from "./pages/PainterDetails";
import UserDetails from "./pages/UserDetails";
import ProductDetails from "./pages/ProductDetails";
import OrderDetails from "./pages/OrderDetails";
import VisitDetails from "./pages/VisitDetails";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import SimulationsPage from "./pages/SimulationsPage";
import DesignsGallery from "./pages/DesignsGallery";
import MyDesigns from "./pages/MyDesigns";
import DesignDetail from "./pages/DesignDetail";
import DesignFormPage from "./pages/DesignFormPage";
import MyProfile from "./pages/MyProfile";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  return children;
};

/** تاجر الجملة: مسارات الكتالوج وطلباتي والفواتير والحساب فقط */
const VendorRouteGuard = ({ children }) => {
  const location = useLocation();
  if (getJwtRole() !== "vendor") return children;
  const path = location.pathname;
  const allowed =
    path === "/dashboard" ||
    path === "/products" ||
    path === "/orders" ||
    path === "/InvoicesPage" ||
    path === "/profile" ||
    path === "/settings" ||
    path.startsWith("/product/") ||
    path.startsWith("/orders/");
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
};
const PermissionRouteGuard = ({ children }) => {
  const location = useLocation();
  const role = getJwtRole();
  if (role === "admin" || role === "vendor") return children;
  const permissionByPath = {
    "/users": "manage_users",
    "/audit-logs": "view_reports",
    "/painters": "manage_users",
    "/vendors": "manage_users",
    "/designers": "manage_users",
    "/products": "manage_stock",
    "/InventoryPage": "manage_stock",
    "/categories": "manage_stock",
    "/orders": "manage_orders",
    "/offers": "edit_prices",
    "/coupons": "edit_prices",
    "/services": "color_tools",
    "/simulations": "color_tools",
  };
  const required =
    permissionByPath[location.pathname] ||
    (location.pathname.startsWith("/users/") ? "manage_users" : null) ||
    (location.pathname.startsWith("/painters/") ? "manage_users" : null) ||
    (location.pathname.startsWith("/vendors/") ? "manage_users" : null) ||
    (location.pathname.startsWith("/designers/") ? "manage_users" : null);
  if (required && !hasUserPermission(required)) return <Navigate to="/dashboard" replace />;
  return children;
};
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <VendorRouteGuard>
              <PermissionRouteGuard>
              <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto h-screen">
                  <Routes>
                    <Route path="/dashboard" element={<Overview />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/painters" element={<Painters />} />
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/vendors/:id" element={<VendorProfile />} />
                    <Route path="/designers" element={<Designers />} />
                    <Route path="/designers/:id" element={<DesignerDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<MyProfile />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/InventoryPage" element={<InventoryPage />} />
                    <Route path="/InvoicesPage" element={<InvoicesPage />} />
                    <Route path="/simulations" element={<SimulationsPage />} />
                    <Route path="/designs" element={<DesignsGallery />} />
                    <Route path="/designs/my" element={<MyDesigns />} />
                    <Route path="/designs/new" element={<DesignFormPage />} />
                    <Route path="/designs/:id" element={<DesignDetail />} />
                    <Route path="/designs/:id/edit" element={<DesignFormPage />} />
                    <Route path="/painters/:id" element={<PainterDetails />} />
                    <Route path="/users/:id" element={<UserDetails />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/visits/:id" element={<VisitDetails />} />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </main>
              </div>
              </PermissionRouteGuard>
              </VendorRouteGuard>
            </ProtectedRoute>
          }
        />

      
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
