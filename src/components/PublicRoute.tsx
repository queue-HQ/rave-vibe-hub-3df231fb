import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  if (isAuthenticated()) {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let role = "";
    if (raw) {
      try {
        const stored = JSON.parse(raw) as { role?: string } | null;
        role = stored?.role ? String(stored.role).split(",")[0]?.trim() : "";
      } catch {
        role = "";
      }
    }
    const destination = role === "administrator" ? "/editor" : role === "partner" ? "/partner" : "/dashboard";
    return <Navigate to={destination} replace />;
  }
  return children;
}
