import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* Fetch all comments for a given entry (public — no auth required) */
export function useComments(entryId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!entryId) {
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("comments")
      .select("id, body, user_id, created_at")
      .eq("entry_id", entryId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setComments(data);
    }

    setLoading(false);
  }, [entryId]);

  return { comments, loading, error, fetchComments };
}

/* Add a comment to an entry */
export async function createComment({ entryId, body }) {
  const { error } = await supabase
    .from("comments")
    .insert({ entry_id: entryId, body });

  return { error };
}

/* Update an existing comment */
export async function updateComment(id, { body }) {
  const { error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", id);

  return { error };
}

/* Delete a comment */
export async function deleteComment(id) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  return { error };
}
