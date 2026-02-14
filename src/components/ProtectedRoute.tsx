import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

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

  const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let role = "";
  let status = "";
  if (raw) {
    try {
      const stored = JSON.parse(raw) as { role?: string; status?: string } | null;
      role = stored?.role ? String(stored.role).split(",")[0]?.trim().toLowerCase() : "";
      status = stored?.status ? String(stored.status).toLowerCase() : "";
    } catch {
      role = "";
      status = "";
    }
  }

  if (status === "rejected") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    return <Navigate to="/signup" replace />;
  }

  if (role === "subscriber" && status === "pending" && location.pathname !== "/dashboard") {
    toast.error("Your account is pending approval.");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
