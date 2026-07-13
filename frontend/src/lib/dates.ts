export function formatNoteDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) return "today";
  if (isSameDay(date, yesterday)) return "yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function formatLastEdited(isoDate: string): string {
  const date = new Date(isoDate);
  const formatted = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return formatted.replace(",", " at").replace(" AM", "am").replace(" PM", "pm");
}
