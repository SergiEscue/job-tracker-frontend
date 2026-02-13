import type { Candidatura } from "../types/candidatura";

export type SortMode = "fecha_desc" | "fecha_asc";

export function applyFiltersAndSort(args: {
  candidaturas: Candidatura[];
  query: string;
  tagFilter: string;
  onlyReminders: boolean;
  sortMode: SortMode;
}) {
  const { candidaturas, query, tagFilter, onlyReminders, sortMode } = args;

  const q = query.trim().toLowerCase();

  const filtered = candidaturas.filter((c) => {
    const matchesText =
      !q ||
      c.empresa.toLowerCase().includes(q) ||
      c.puesto.toLowerCase().includes(q) ||
      (c.notas ?? "").toLowerCase().includes(q);

    const matchesTag = !tagFilter || (c.tecnologiasTags ?? []).includes(tagFilter);

    const hasReminder = (c.recordatorio ?? "").trim().length > 0;
    const matchesReminder = !onlyReminders || hasReminder;

    return matchesText && matchesTag && matchesReminder;
  });

  const sorted = filtered.slice().sort((a, b) => {
    const da = a.fechaAplicacion || "";
    const db = b.fechaAplicacion || "";

    if (sortMode === "fecha_asc") return da.localeCompare(db);
    return db.localeCompare(da);
  });

  return { q, filtered, sorted };
}
