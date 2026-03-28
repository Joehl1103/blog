import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

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
