import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* Fetch all entries (public — no auth required) */
export function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("entries")
      .select("id, title, published_at, user_id")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries(data);
    }

    setLoading(false);
  }, []);

  return { entries, loading, error, fetchEntries };
}

/* Fetch a single entry by ID */
export async function fetchEntry(id) {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  return { entry: data, error };
}

/* Create a new entry */
export async function createEntry({ title, content }) {
  const { error } = await supabase
    .from("entries")
    .insert({ title, content });

  return { error };
}

/* Update an existing entry */
export async function updateEntry(id, { title, content }) {
  const { error } = await supabase
    .from("entries")
    .update({ title, content })
    .eq("id", id);

  return { error };
}

/* Delete an entry by ID (admin-only — enforced by RLS) */
export async function deleteEntry(id) {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  return { error };
}
