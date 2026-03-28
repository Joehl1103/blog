import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEntry, fetchEntry, updateEntry } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";

const getPlainText = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function EditorPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [contentText, setContentText] = useState("");
  const [loadingEntry, setLoadingEntry] = useState(Boolean(entryId));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(entryId);

  useEffect(() => {
    let isMounted = true;

    const loadEntry = async () => {
      if (!entryId) {
        setTitle("");
        setContent("<p></p>");
        setContentText("");
        setLoadingEntry(false);
        setErrorMessage("");
        return;
      }

      setLoadingEntry(true);
      setErrorMessage("");

      const { entry, error } = await fetchEntry(entryId);

      if (!isMounted) {
        return;
      }

      if (error || !entry) {
        setTitle("");
        setContent("<p></p>");
        setContentText("");
        setErrorMessage(error?.message || "Unable to load this entry.");
        setLoadingEntry(false);
        return;
      }

      setTitle(entry.title || "");
      setContent(entry.content || "<p></p>");
      setContentText(getPlainText(entry.content || ""));
      setLoadingEntry(false);
    };

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [entryId]);

  const editorDescription = useMemo(
    () =>
      isEditing
        ? "Update an existing entry and publish the revised HTML back to Supabase."
        : "Compose a new entry with rich text formatting and publish it to Supabase.",
    [isEditing]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!contentText.trim()) {
      setErrorMessage("Add some content before publishing.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const payload = {
      content,
      title: title.trim(),
    };

    const { error } = isEditing
      ? await updateEntry(entryId, payload)
      : await createEntry(payload);

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    navigate("/entries");
  };

  return (
    <Card className="mx-auto max-w-5xl rounded-[2rem] border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="space-y-5 p-8 pb-4">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-fit rounded-full")}
          to="/entries"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to entries
        </Link>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {isEditing ? "Edit entry" : "Write a new entry"}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            {editorDescription}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-8 pt-2">
          <div className="space-y-2">
            <Label htmlFor="entry-title">Title</Label>
            <Input
              id="entry-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give this entry a clear title"
              value={title}
            />
          </div>

          {errorMessage ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {loadingEntry ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              Loading entry...
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Content</Label>
                <p className="text-xs text-muted-foreground">
                  Basic formatting: bold, italic, headings, lists, and quotes.
                </p>
              </div>

              <TiptapEditor
                disabled={isSaving}
                onChange={({ html, text }) => {
                  setContent(html);
                  setContentText(text);
                }}
                value={content}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-4 border-t border-border/70 p-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Content is stored as HTML so it can be rendered directly on the
            public view page.
          </p>

          <Button className="rounded-full" disabled={isSaving || loadingEntry} type="submit">
            <Save className="mr-2 size-4" />
            {isSaving ? "Saving..." : isEditing ? "Update entry" : "Publish entry"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
