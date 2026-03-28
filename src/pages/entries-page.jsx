import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PencilLine, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useEntries } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";

const formatPublishedDate = (publishedAt) => {
  if (!publishedAt) {
    return "Draft";
  }

  return new Date(`${publishedAt}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function EntriesPage() {
  const { user } = useAuth();
  const { entries, loading, error, fetchEntries } = useEntries();

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  return (
    <Card className="border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="flex flex-col gap-4 p-8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Latest entries
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Browse everything in the blog. Signed-in owners can jump directly
            into editing from here.
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className=""
            onClick={() => void fetchEntries()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          {user ? (
            <Link className={cn(buttonVariants())} to="/editor">
              <PencilLine className="mr-2 size-4" />
              New entry
            </Link>
          ) : (
            <Link
              className={cn(buttonVariants({ variant: "secondary" }))}
              to="/login"
            >
              Log in to write
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-2">
        {loading ? (
          <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            Loading entries...
          </p>
        ) : null}

        {!loading && error ? (
          <p className="border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {!loading && !error && entries.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No entries yet.
          </p>
        ) : null}

        {!loading && !error && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isOwner = user?.id === entry.user_id;

              return (
                <article
                  className="flex flex-col gap-4 border border-border/70 bg-muted/30 p-5 transition-transform hover:-translate-y-0.5 hover:bg-muted/45 sm:flex-row sm:items-center sm:justify-between"
                  key={entry.id}
                >
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {formatPublishedDate(entry.published_at)}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">
                      {entry.title || "Untitled"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isOwner ? (
                      <Link
                        className={cn(buttonVariants({ variant: "outline" }))}
                        to={`/editor/${entry.id}`}
                      >
                        Edit
                      </Link>
                    ) : null}

                    <Link
                      className={cn(buttonVariants())}
                      to={`/view/${entry.id}`}
                    >
                      View entry
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
