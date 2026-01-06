/**
 * App.jsx
 * Routes and layout for the application. Uses ProtectedRoute for role-based access control.
 */
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TellerDashboard from "./pages/TellerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminProducts from "./pages/AdminProducts";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Support from './pages/Support';
import ProtectedRoute from "./components/ProtectedRoute";
import PageNav from './components/PageNav'

function Layout(){
  // Determine the current route so we can hide the top navigation on the login page
  const location = useLocation()
  const hideNav = location && location.pathname === "/"

  // Layout component: renders `PageNav` (unless we're on the login page) and an Outlet
  // where matched child routes will render. This centralizes the shared layout.
  return (
    <div>
      {!hideNav && <PageNav />}
      <div className="container">
        <Outlet />
      </div>
    </div>
  )
}



function App() {
  // Application route table. ProtectedRoute wraps pages that require auth/roles.
  return (
    <Routes>
      <Route element={<Layout/>}>
      {/* Public login route */}
      <Route path="/" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teller"
        element={
          <ProtectedRoute allowedRoles={["teller"]}>
            <TellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
        <Route path="/products/:id" element={<ProtectedRoute allowedRoles={["client","teller","admin"]}><ProductDetails/></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={["client"]}><Cart/></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={["client"]}><Checkout/></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={["client"]}><Orders/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["client","teller","admin"]}><Profile/></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute allowedRoles={["client","teller","admin"]}><Support/></ProtectedRoute>} />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-product"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      </Route>
    </Routes>
  );
}

export default App;
