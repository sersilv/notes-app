"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySidebar from "@/components/CategorySidebar";
import EmptyState from "@/components/EmptyState";
import NewNoteButton from "@/components/NewNoteButton";
import NoteCard from "@/components/NoteCard";
import { api, getToken } from "@/lib/api";
import type { Category, Note } from "@/lib/types";

export default function NotesDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (categoryId: number | null) => {
    const [cats, notesData] = await Promise.all([
      api.getCategories(),
      api.getNotes(categoryId ?? undefined),
    ]);
    setCategories(cats);
    setNotes(notesData);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.push("/signup");
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const [cats, notesData] = await Promise.all([
          api.getCategories(),
          api.getNotes(selectedCategoryId ?? undefined),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setNotes(notesData);
        }
      } catch {
        if (!cancelled) router.push("/signup");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [router, selectedCategoryId]);

  async function handleNewNote() {
    setCreating(true);
    setError("");
    try {
      const note = await api.createNote(selectedCategoryId ?? undefined);
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create note");
      setCreating(false);
    }
  }

  function handleSelectCategory(id: number | null) {
    setSelectedCategoryId(id);
    setLoading(true);
    loadData(id).finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-brown-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-8">
      <div className="mx-auto flex max-w-6xl gap-12">
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        <main className="flex flex-1 flex-col pt-8">
          <div className="mb-8 flex flex-col items-end gap-2">
            <NewNoteButton onClick={handleNewNote} loading={creating} />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {notes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
