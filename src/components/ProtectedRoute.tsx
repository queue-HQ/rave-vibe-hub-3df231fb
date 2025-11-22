import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const location = useLocation();

  if (!isAuthenticated()) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }
  return children;
}
