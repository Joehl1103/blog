import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CommentSection } from "@/components/comment-section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchEntry } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";

const formatPublishedDate = (publishedAt) => {
  if (!publishedAt) {
    return "Unpublished";
  }

  return new Date(`${publishedAt}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function ViewPage() {
  const { entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEntry = async () => {
      setLoading(true);
      setErrorMessage("");

      const { entry, error } = await fetchEntry(entryId);

      if (!isMounted) {
        return;
      }

      if (error || !entry) {
        setEntry(null);
        setErrorMessage(error?.message || "Entry not found.");
        setLoading(false);
        return;
      }

      setEntry(entry);
      setLoading(false);
    };

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [entryId]);

  return (
    <Card className="mx-auto max-w-4xl border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="space-y-5 p-8 pb-0">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          to="/entries"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to entries
        </Link>

        {loading ? (
          <CardTitle>Loading entry...</CardTitle>
        ) : errorMessage ? (
          <CardTitle>Unable to load this entry</CardTitle>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {formatPublishedDate(entry?.published_at)}
            </p>
            <CardTitle className="text-4xl font-semibold tracking-tight">
              {entry?.title || "Untitled"}
            </CardTitle>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading entry content...</p>
        ) : errorMessage ? (
          <p className="border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : (
          <>
            <div
              className="tiptap-content border border-border/70 bg-muted/20"
              dangerouslySetInnerHTML={{ __html: entry?.content || "<p>No content.</p>" }}
            />

            <CommentSection entryId={entryId} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
