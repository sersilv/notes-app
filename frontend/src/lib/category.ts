import type { Category } from "@/lib/types";

export function getCategoryBorderColor(category: Category): string {
  return category.dot_color;
}

export function getCategoryBackgroundColor(category: Category): string {
  return `${category.dot_color}`;
}
