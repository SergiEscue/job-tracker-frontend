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
  //onExportCSV: () => void;

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
  //onExportCSV,
  disableLoadExamples,
  disableExport,
}: Props) {
  return (
    <header className="header">
      <div>
        <h1 style={{ margin: 0 }}>Job Application Tracker</h1>
        <p className="subtitle" style={{ marginTop: 6 }}>
          Organiza candidaturas, recordatorios y detalles de ofertas.
        </p>
      </div>

      {/* Buscador */}
      <div style={{ minWidth: 280, flex: "1 1 320px", position: "relative" }}>
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "white",
          }}
          title="Mostrar solo candidaturas con recordatorio"
        >
          <input
            type="checkbox"
            checked={onlyReminders}
            onChange={(e) => setOnlyReminders(e.target.checked)}
          />
          <span style={{ fontSize: 13 }}>Solo recordatorio</span>
        </label>
      </div>

      {/* Acciones */}
      <div className="actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={onCreate}>
          + Nueva candidatura
        </button>

        <button
          className={`btn ${disableLoadExamples ? "btn-disabled" : "btn-primary"}`}
          onClick={onLoadExamples}
          disabled={disableLoadExamples}
          title={
            disableLoadExamples
              ? "Vacía la lista para cargar ejemplos"
              : "Cargar ejemplos"
          }
        >
          Cargar ejemplos
        </button>

        <button className="btn" onClick={onClearAll}>
          Vaciar
        </button>

        {/* <button className="btn" onClick={onExportCSV} disabled={disableExport}>
          Exportar CSV
        </button>*/}
      </div>
    </header>
  );
}
