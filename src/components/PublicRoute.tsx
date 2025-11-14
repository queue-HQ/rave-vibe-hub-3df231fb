import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
