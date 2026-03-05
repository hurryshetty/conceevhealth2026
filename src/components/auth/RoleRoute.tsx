import { Navigate } from "react-router-dom";
import { useAuth, AppRole, ROLE_HOME } from "@/hooks/useAuth";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  loginPath?: string;
}

const RoleRoute = ({ children, allowedRoles, loginPath = "/login" }: RoleRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to={loginPath} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? "/login"} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
