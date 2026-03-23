import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Components
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login"; 
import Overview from "./pages/Overview";
import Users from "./pages/Users";
import Painters from "./pages/Painters";
import Vendors from "./pages/Vendors";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import ColorsLibrary from "./pages/ColorsLibrary";
import Orders from "./pages/Orders";
import Offers from "./pages/Offers";
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
import CustomersPage from "./pages/CustomersPage";
import SimulationsPage from "./pages/SimulationsPage";
import DesignsGallery from "./pages/DesignsGallery";
import MyDesigns from "./pages/MyDesigns";
import DesignDetail from "./pages/DesignDetail";
import DesignFormPage from "./pages/DesignFormPage";
import VisitRequests from "./pages/VisitRequests";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
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
              <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto h-screen">
                  <Routes>
                    <Route path="/dashboard" element={<Overview />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/painters" element={<Painters />} />
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/vendors/:id" element={<VendorProfile />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/colors" element={<ColorsLibrary />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/InventoryPage" element={<InventoryPage />} />
                    <Route path="/InvoicesPage" element={<InvoicesPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
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
                    <Route path="/visit-requests" element={<VisitRequests />} />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

      
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
