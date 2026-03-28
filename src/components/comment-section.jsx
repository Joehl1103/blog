import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useComments, createComment, deleteComment } from "@/hooks/use-comments";

/* Format a timestamptz value into a readable date string */
const formatCommentDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/* Shorten a UUID to a readable label */
const shortUserId = (id) => (id ? id.slice(0, 8) : "unknown");

/* Single comment display */
function CommentItem({ comment, currentUserId, onDelete }) {
  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="flex items-start justify-between gap-4 border border-border/70 bg-muted/20 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">{shortUserId(comment.user_id)}</span>
          <span>{formatCommentDate(comment.created_at)}</span>
        </div>
        <p className="text-sm text-foreground">{comment.body}</p>
      </div>

      {isOwner ? (
        <Button
          onClick={() => onDelete(comment.id)}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      ) : null}
    </div>
  );
}

/* Form for adding a new comment */
function CommentForm({ entryId, onCommentAdded }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const { error } = await createComment({ entryId, body: trimmed });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setBody("");
    setSubmitting(false);
    onCommentAdded();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Label htmlFor="comment-body">Add a comment</Label>
      <textarea
        className="w-full border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={submitting}
        id="comment-body"
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write your comment..."
        rows={3}
        value={body}
      />

      {errorMessage ? (
        <p className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <Button disabled={submitting || !body.trim()} type="submit">
        {submitting ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}

/* Main comment section — list + form */
export function CommentSection({ entryId }) {
  const { user } = useAuth();
  const { comments, loading, error, fetchComments } = useComments(entryId);

  /* Load comments when the entry ID is available */
  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  /* Delete a comment and refresh the list */
  const handleDelete = async (commentId) => {
    await deleteComment(commentId);
    void fetchComments();
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-foreground">
        Comments {!loading && comments.length > 0 ? `(${comments.length})` : ""}
      </h3>

      {/* Comment list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : error ? (
        <p className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : comments.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              key={comment.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Comment form or login prompt */}
      {user ? (
        <CommentForm entryId={entryId} onCommentAdded={fetchComments} />
      ) : (
        <p className="border border-border bg-muted/40 px-4 py-4 text-center text-sm text-muted-foreground">
          <Link className="font-medium text-foreground underline underline-offset-4" to="/login">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}
    </div>
  );
}
