import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};
export default PublicRoute;
