"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

interface CategoryDropdownProps {
  categories: Category[];
  selected: Category;
  onChange: (categoryId: number) => void;
}

export default function CategoryDropdown({
  categories,
  selected,
  onChange,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-[225px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-[6px] border border-brown-border bg-cream px-4 py-2 text-sm text-black hover:bg-brown/20 hover:cursor-pointer"
      >
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: selected.dot_color }}
        />
        <span className="flex-1 text-left">{selected.name}</span>
        <img
          src="/images/dropdown.png"
          alt=""
          className="h-4 w-4 shrink-0"
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-10 w-full rounded-[6px] bg-cream shadow-lg">
          {categories
            .filter((cat) => cat.id !== selected.id)
            .map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => {
                    onChange(cat.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-black hover:bg-brown/20 hover:cursor-pointer"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.dot_color }}
                  />
                  {cat.name}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
