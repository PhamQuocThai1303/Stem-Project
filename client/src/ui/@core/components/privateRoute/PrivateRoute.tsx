import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? element : <Navigate to="/login" />;
  // return element;
};

export default PrivateRoute;
