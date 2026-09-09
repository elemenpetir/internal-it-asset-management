import { Navigate } from "react-router-dom";
import { getRoleFromToken } from "../../utils/auth";

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    return <Navigate to="/login" replace />;
  }

  // B8: guard staff-only pages; employee gets redirected, no wasted 403 fetches
  if (roles && !roles.includes(getRoleFromToken())) {
    return <Navigate to="/" replace />;
  }

  return children;
}
