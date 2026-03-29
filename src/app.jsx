import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { AdminRoute } from "@/components/protected-route";

const EditorPage = lazy(() =>
  import("@/pages/editor-page").then((module) => ({
    default: module.EditorPage,
  }))
);
const EntriesPage = lazy(() =>
  import("@/pages/entries-page").then((module) => ({
    default: module.EntriesPage,
  }))
);
const LoginPage = lazy(() =>
  import("@/pages/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);
const ProfilePage = lazy(() =>
  import("@/pages/profile-page").then((module) => ({
    default: module.ProfilePage,
  }))
);
const ViewPage = lazy(() =>
  import("@/pages/view-page").then((module) => ({
    default: module.ViewPage,
  }))
);

function RouteFallback() {
  return (
    <Card className="mx-auto max-w-xl border-border/70 bg-background/90 shadow-lg shadow-black/5">
      <CardContent className="px-6 py-14 text-center text-sm text-muted-foreground">
        Loading page...
      </CardContent>
    </Card>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate replace to="/entries" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/view/:entryId" element={<ViewPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/:entryId" element={<EditorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/entries" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
