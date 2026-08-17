import { Navigate } from "react-router";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children , role="USER" }) => {
  const { user } = useSelector(state => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children;
};

export default ProtectedRoute;
