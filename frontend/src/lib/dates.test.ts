import { describe, expect, it, vi, afterEach } from "vitest";
import { formatLastEdited, formatNoteDate } from "./dates";

describe("formatNoteDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "today" for the current date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:00"));

    expect(formatNoteDate("2026-07-11T08:30:00")).toBe("today");
  });

  it('returns "yesterday" for the previous day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:00"));

    expect(formatNoteDate("2026-07-10T20:00:00")).toBe("yesterday");
  });

  it("returns month and day without year for older dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:00"));

    expect(formatNoteDate("2026-06-12T10:00:00")).toBe("June 12");
  });
});

describe("formatLastEdited", () => {
  it("formats a full timestamp with date and time", () => {
    const result = formatLastEdited("2024-07-21T20:39:00");

    expect(result).toContain("July 21");
    expect(result).toContain("2024");
    expect(result.toLowerCase()).toMatch(/at \d/);
  });
});
