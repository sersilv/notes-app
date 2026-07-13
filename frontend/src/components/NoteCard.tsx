"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { formatNoteDate } from "@/lib/dates";
import {
  getCategoryBackgroundColor,
  getCategoryBorderColor,
} from "@/lib/category";
import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [titleLineCount, setTitleLineCount] = useState(1);

  const displayTitle = note.title || "Note Title";
  const displayContent = note.content || "Pour your heart out...";

  const borderColor = getCategoryBorderColor(note.category);
  const backgroundColor = getCategoryBackgroundColor(note.category);

  const isLongTitle = titleLineCount > 1;
  const exceedsFiveLines = titleLineCount > 5;

  useLayoutEffect(() => {
    const card = cardRef.current;
    const measurer = measureRef.current;
    if (!card || !measurer) return;

    const measure = () => {
      measurer.style.width = `${card.clientWidth - 40}px`;
      const lineHeight = parseFloat(getComputedStyle(measurer).lineHeight);
      if (!lineHeight) return;
      setTitleLineCount(Math.max(1, Math.round(measurer.scrollHeight / lineHeight)));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [displayTitle]);

  return (
    <Link
      ref={cardRef}
      href={`/notes/${note.id}`}
      className="relative flex h-64 cursor-default flex-col overflow-hidden rounded-2xl border-[3px] p-5 transition-shadow hover:shadow-md"
      style={{
        backgroundColor: `${backgroundColor}80`,
        borderColor,
      }}
    >
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-5 top-0 whitespace-normal font-inria-serif text-[24px] font-bold leading-tight break-words"
      >
        {displayTitle}
      </span>

      <div className="mb-3 flex shrink-0 items-center gap-2 font-inter text-xs text-black">
        <span className="font-bold">{formatNoteDate(note.last_edited)}</span>
        <span>{note.category.name}</span>
      </div>

      {isLongTitle ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <h3
            className={`note-card-title mb-2 font-inria-serif text-[24px] font-bold leading-[1.15] break-words text-black ${
              exceedsFiveLines
                ? "min-h-0 flex-1 note-card-title-clamp-5"
                : "shrink-0"
            }`}
          >
            {displayTitle}
          </h3>

          <p className="note-card-content note-card-content-clamp-2 shrink-0 font-inter text-black">
            {displayContent}
          </p>
        </div>
      ) : (
        <>
          <h3 className="note-card-title mb-2 shrink-0 font-inria-serif text-[24px] font-bold leading-tight break-words text-black">
            {displayTitle}
          </h3>

          <p className="note-card-content note-card-content-clamp-6 min-h-0 flex-1 font-inter text-black">
            {displayContent}
          </p>
        </>
      )}
    </Link>
  );
}
