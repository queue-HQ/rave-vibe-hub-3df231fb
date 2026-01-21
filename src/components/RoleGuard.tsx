import { Navigate } from "react-router-dom";
import { useUserProfile } from "@/context/UserProfileContext";

interface RoleGuardProps {
  allowed: string[];
  fallbackPath?: string;
  children: JSX.Element;
}

export default function RoleGuard({ allowed, fallbackPath = "/dashboard", children }: RoleGuardProps) {
  const { role, isLoading, hasTriedFetching } = useUserProfile();

  if (isLoading && !hasTriedFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!role) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
