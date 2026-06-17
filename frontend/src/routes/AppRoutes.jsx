import { Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "../components/Login";
import { AuthProvider } from "../context/auth-context";
import ActiveDevices from "../pages/ActiveDevices";

import ProtectedRoute from "../Controllers/pro_routes";
import PublicRoute from "./publicRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActiveDevices />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
export default AppRoutes;
