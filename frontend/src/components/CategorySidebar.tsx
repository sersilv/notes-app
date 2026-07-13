import type { Category } from "@/lib/types";

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export default function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-56 shrink-0 pt-8">
      <button
        onClick={() => onSelectCategory(null)}
        className="mb-6 text-left text-lg font-bold text-black transition-colors hover:cursor-pointer"
      >
        All Categories
      </button>
      <ul className="flex flex-col gap-4">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`flex w-full items-center justify-between text-left transition-colors text-black ${selectedCategoryId === cat.id && "font-bold"} hover:cursor-pointer`}
            >
              <span className="flex items-center gap-3">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.dot_color }}
                />
                {cat.name}
              </span>
              <span className="text-sm">{cat.note_count}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
