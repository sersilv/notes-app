"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryDropdown from "@/components/CategoryDropdown";
import { api } from "@/lib/api";
import {
  getCategoryBackgroundColor,
  getCategoryBorderColor,
} from "@/lib/category";
import { formatLastEdited } from "@/lib/dates";
import type { Category, Note } from "@/lib/types";

interface NoteEditorProps {
  noteId: number;
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastEdited, setLastEdited] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [noteData, cats] = await Promise.all([
          api.getNote(noteId),
          api.getCategories(),
        ]);
        setNote(noteData);
        setCategories(cats);
        setTitle(noteData.title);
        setContent(noteData.content);
        setLastEdited(noteData.last_edited);
      } catch {
        router.push("/notes");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [noteId, router]);

  const save = useCallback(
    async (updates: Partial<{ title: string; content: string; category_id: number }>) => {
      try {
        const updated = await api.updateNote(noteId, updates);
        setNote(updated);
        setLastEdited(updated.last_edited);
      } catch {
        // silently fail; user can retry by editing again
      }
    },
    [noteId]
  );

  function debouncedSave(
    updates: Partial<{ title: string; content: string; category_id: number }>
  ) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(updates), 500);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    debouncedSave({ title: value, content });
  }

  function handleContentChange(value: string) {
    setContent(value);
    debouncedSave({ title, content: value });
  }

  function handleCategoryChange(categoryId: number) {
    if (!note) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setNote({ ...note, category: cat });
    save({ category_id: categoryId });
  }

  if (loading || !note) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-brown-light">Loading...</p>
      </div>
    );
  }

  const borderColor = getCategoryBorderColor(note.category);
  const backgroundColor = getCategoryBackgroundColor(note.category);

  return (
    <div className="min-h-screen bg-cream px-8 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <CategoryDropdown
            categories={categories}
            selected={note.category}
            onChange={handleCategoryChange}
          />
          <button
            onClick={() => router.push("/notes")}
            className="transition-opacity hover:opacity-70"
            aria-label="Close note"
          >
            <img
              src="/images/close.png"
              alt="Close note"
              className="h-6 w-6 hover:cursor-pointer"
            />
          </button>
        </div>

        <div
          className="min-h-[70vh] rounded-3xl border-[3px] p-8 md:p-12"
          style={{
            backgroundColor: `${backgroundColor}80`,
            borderColor,
          }}
        >
          <p className="mb-8 text-right text-xs text-black">
            Last Edited: {formatLastEdited(lastEdited)}
          </p>

          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note Title"
            className="note-editor-title mb-6 w-full bg-transparent font-serif text-3xl font-bold text-black outline-none md:text-4xl"
          />

          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Pour your heart out..."
            className="note-editor-content w-full min-h-[50vh] resize-none bg-transparent font-sans text-base leading-relaxed text-black outline-none"
          />
        </div>
      </div>
    </div>
  );
}
