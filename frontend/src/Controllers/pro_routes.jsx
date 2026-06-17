import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated === null) return null;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};
export default ProtectedRoute;
