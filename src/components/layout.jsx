import { LogIn, LogOut, PenSquare, ScrollText, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

const navLinkClassName = ({ isActive }) =>
  [
    "inline-flex items-center px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");

export function Layout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/entries");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,18,18,0.08),_transparent_35%),linear-gradient(180deg,_#f8f8f6_0%,_#ffffff_30%,_#f6f6f3_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border border-border/70 bg-background/90 shadow-lg shadow-black/5 backdrop-blur">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Portfolio CV Blog
                </p>
                <div className="space-y-1">
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                    Blog Editor
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Write, revise, and publish Supabase-backed entries from a
                    single React workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="border border-border/70 bg-muted/60 px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Session
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {user?.email ?? "Not signed in"}
                  </p>
                </div>

                {user ? (
                  <Button onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </Button>
                ) : (
                  <Button
                    className=""
                    onClick={() => navigate("/login")}
                    variant="secondary"
                  >
                    <LogIn className="mr-2 size-4" />
                    Log in
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <nav className="flex flex-wrap items-center gap-2">
              <NavLink className={navLinkClassName} to="/entries">
                <ScrollText className="mr-2 size-4" />
                Entries
              </NavLink>

              {user ? (
                <>
                  <NavLink className={navLinkClassName} to="/editor">
                    <PenSquare className="mr-2 size-4" />
                    Editor
                  </NavLink>
                  <NavLink className={navLinkClassName} to="/profile">
                    <User className="mr-2 size-4" />
                    Profile
                  </NavLink>
                </>
              ) : null}
            </nav>
          </div>
        </header>

        <div className="flex-1 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
