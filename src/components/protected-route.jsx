import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

/**
 * Gates routes that require any authenticated user.
 * Redirects unauthenticated visitors to /login.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Card className="mx-auto max-w-xl border-border/70 bg-background/90 shadow-lg shadow-black/5">
        <CardContent className="px-6 py-14 text-center text-sm text-muted-foreground">
          Restoring your session...
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

/**
 * Gates routes that require the admin role.
 * - Unauthenticated visitors -> /login
 * - Authenticated non-admins -> /entries (they're logged in, just not authorized)
 */
export function AdminRoute() {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Card className="mx-auto max-w-xl border-border/70 bg-background/90 shadow-lg shadow-black/5">
        <CardContent className="px-6 py-14 text-center text-sm text-muted-foreground">
          Restoring your session...
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate replace to="/entries" />;
  }

  return <Outlet />;
}
