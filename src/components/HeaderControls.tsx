// src/components/HeaderControls.tsx
import { useRef } from "react";
import type { SortMode } from "../utils/filters";

type Props = {
  // filtros
  query: string;
  setQuery: (v: string) => void;
  tagFilter: string;
  setTagFilter: (v: string) => void;
  uniqueTags: string[];
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
  onlyReminders: boolean;
  setOnlyReminders: (v: boolean) => void;

  // acciones
  onCreate: () => void;
  onLoadExamples: () => void;
  onClearAll: () => void;

  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;

  // estados UI
  disableLoadExamples: boolean;
  disableExport: boolean;
};

export function HeaderControls({
  query,
  setQuery,
  tagFilter,
  setTagFilter,
  uniqueTags,
  sortMode,
  setSortMode,
  onlyReminders,
  setOnlyReminders,
  onCreate,
  onLoadExamples,
  onClearAll,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  disableLoadExamples,
  disableExport,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const btnClass = (disabled?: boolean, primary?: boolean) => {
    const base = ["btn"];
    if (primary) base.push("btn-primary");
    if (disabled) base.push("btn-disabled");
    return base.join(" ");
  };

  return (
    <div className="header">
      <div style={{ minWidth: 280 }}>
        <h1 className="title">Job Application Tracker</h1>
        <p className="subtitle">
          Organiza candidaturas, recordatorios y detalles de ofertas.
        </p>

        {/* Buscador */}
        <div style={{ position: "relative", marginTop: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por empresa, puesto o notas…"
            style={{
              width: "100%",
              padding: "10px 38px 10px 10px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "white",
            }}
          />
          {query.trim() ? (
            <button
              className="btn"
              onClick={() => setQuery("")}
              title="Limpiar búsqueda"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                padding: "6px 10px",
                borderRadius: 10,
                boxShadow: "none",
              }}
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "white",
              minWidth: 220,
            }}
            title="Filtrar por tecnología"
          >
            <option value="">Todas las tecnologías</option>
            {uniqueTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "white",
              minWidth: 220,
            }}
            title="Ordenar por fecha de aplicación"
          >
            <option value="fecha_desc">Fecha aplicación: más reciente</option>
            <option value="fecha_asc">Fecha aplicación: más antigua</option>
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={onlyReminders}
              onChange={(e) => setOnlyReminders(e.target.checked)}
            />
            Solo recordatorio
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions">
        <button className={btnClass(false, true)} onClick={onCreate}>
          + Nueva candidatura
        </button>

        <button
          className={btnClass(disableLoadExamples)}
          onClick={onLoadExamples}
          disabled={disableLoadExamples}
        >
          Cargar ejemplos
        </button>

        <button className={btnClass(false)} onClick={onClearAll}>
          Vaciar
        </button>

        <button
          className={btnClass(disableExport)}
          onClick={onExportCSV}
          disabled={disableExport}
          title="Exporta lo que ves (filtrado actual) a CSV para Excel"
        >
          Exportar CSV
        </button>

        <button
          className={btnClass(cannotExportJSON(disableExport))}
          onClick={onExportJSON}
          disabled={cannotExportJSON(disableExport)}
          title="Backup 1:1 en JSON (recomendado)"
        >
          Exportar JSON
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportJSON(f);
            // permitir re-importar el mismo archivo sin tener que cambiar nombre
            e.currentTarget.value = "";
          }}
        />

        <button className={btnClass(false)} onClick={() => fileRef.current?.click()}>
          Importar JSON
        </button>
      </div>
    </div>
  );
}

// Si no hay resultados (disableExport), el CSV se deshabilita.
// Para JSON backup, podríamos permitir exportar vacío, pero lo dejamos consistente.
function cannotExportJSON(disableExport: boolean) {
  return disableExport;
}
