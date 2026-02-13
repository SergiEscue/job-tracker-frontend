import { useEffect, useState } from "react";
import type { Candidatura } from "./types/candidatura";
import { mockCandidaturas } from "./services/mockCandidaturas";
import {
  clearCandidaturas,
  loadCandidaturas,
  saveCandidaturas,
} from "./services/storageCandidaturas";

function formatISOToES(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function App() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>(() =>
    loadCandidaturas()
  );
  const [selected, setSelected] = useState<Candidatura | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const emptyForm: Omit<Candidatura, "id"> = {
    empresa: "",
    puesto: "",
    fechaAplicacion: new Date().toISOString().slice(0, 10), // hoy
    fuente: "LinkedIn",
    enlaceOferta: "",

    requisitos: "",
    ofrecian: "",

    tecnologiasTags: [],
    tecnologiasNotas: "",

    salario: "",
    notas: "",

    ultimoContacto: "",
    recordatorio: "",
  };

  const [form, setForm] = useState<Omit<Candidatura, "id">>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<Candidatura[] | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [lastDeleted, setLastDeleted] = useState<{
    item: Candidatura;
    index: number;
  } | null>(null);

  const [undoMode, setUndoMode] = useState<"clear" | "delete" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>(""); // "" = todas
  const [sortMode, setSortMode] = useState<"fecha_desc" | "fecha_asc">("fecha_desc");
  const [onlyReminders, setOnlyReminders] = useState(false);

  useEffect(() => {
    saveCandidaturas(candidaturas);
  }, [candidaturas]);

  useEffect(() => {
    if (undoSeconds <= 0) return;

    const t = setTimeout(() => setUndoSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [undoSeconds]);

  function deleteCandidatura(id: string) {
    const idx = candidaturas.findIndex((c) => c.id === id);
    if (idx === -1) return;

    const item = candidaturas[idx];

    // Guardamos info para deshacer
    setLastDeleted({ item, index: idx });
    setUndoMode("delete");
    setUndoSeconds(10);

    // Si estaba abierta en el modal, cerramos
    if (selected?.id === id) setSelected(null);

    // Borramos
    setCandidaturas((prev) => prev.filter((c) => c.id !== id));
  }

  function undoClear() {
    if (!lastBackup) return;
    setCandidaturas(lastBackup);
    setLastBackup(null);
    setUndoSeconds(0);
  }

  function undoAction() {
    if (undoMode === "clear" && lastBackup) {
      setCandidaturas(lastBackup);
    }

    if (undoMode === "delete" && lastDeleted) {
      setCandidaturas((prev) => {
        const copy = [...prev];
        copy.splice(lastDeleted.index, 0, lastDeleted.item);
        return copy;
      });
    }

    setUndoMode(null);
    setLastBackup(null);
    setLastDeleted(null);
    setUndoSeconds(0);
  }

  function handleLoadExamples() {
    if (candidaturas.length > 0) return;
    setCandidaturas(mockCandidaturas);
  }

  function handleClearAll() {
    setLastBackup(candidaturas);
    setUndoMode("clear");
    setUndoSeconds(10);
    clearCandidaturas();
    setCandidaturas([]);
  }

  function normalizeTags(raw: string) {
    return raw
      .split(/[,\n]/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function openCreate() {
    setError(null);
    setForm(emptyForm);
    setTagsInput("");
    setIsCreateOpen(true);
    setEditingId(null);
  }

  function closeCreate() {
    setIsCreateOpen(false);
  }

  function openEdit(c: Candidatura) {
    setError(null);

    // ✅ Cierra el modal de detalles para que no tape el formulario
    setSelected(null);

    setEditingId(c.id);

    const { id, ...rest } = c;

    setForm({
      ...emptyForm,
      ...rest,
      enlaceOferta: rest.enlaceOferta ?? "",
      tecnologiasNotas: rest.tecnologiasNotas ?? "",
      salario: rest.salario ?? "",
      notas: rest.notas ?? "",
      ultimoContacto: rest.ultimoContacto ?? "",
      recordatorio: rest.recordatorio ?? "",
    });

    setTagsInput((c.tecnologiasTags ?? []).join(", "));
    setIsCreateOpen(true);
  }

  function saveCandidatura() {
    if (!form.empresa.trim()) return setError("La empresa es obligatoria.");
    if (!form.puesto.trim()) return setError("El puesto es obligatorio.");
    if (!form.fechaAplicacion.trim())
      return setError("La fecha de aplicación es obligatoria.");

    const tags = normalizeTags(tagsInput);

    const base: Omit<Candidatura, "id"> = {
      ...form,
      tecnologiasTags: tags,
      enlaceOferta: form.enlaceOferta?.trim() || undefined,
      tecnologiasNotas: form.tecnologiasNotas?.trim() || undefined,
      salario: form.salario?.trim() || undefined,
      notas: form.notas?.trim() || undefined,
      ultimoContacto: form.ultimoContacto?.trim() || undefined,
      recordatorio: form.recordatorio?.trim() || undefined,
    };

    if (editingId) {
      setCandidaturas((prev) =>
        prev.map((c) => (c.id === editingId ? { id: editingId, ...base } : c))
      );

      if (selected?.id === editingId) {
        setSelected({ id: editingId, ...base });
      }
    } else {
      const nueva: Candidatura = {
        id: crypto.randomUUID(),
        ...base,
      };
      setCandidaturas((prev) => [nueva, ...prev]);
    }

    setIsCreateOpen(false);
    setEditingId(null);
  }

  const q = query.trim().toLowerCase();

  const filteredSorted = candidaturas
    .filter((c) => {
      // filtro texto
      const matchesText =
        !q ||
        c.empresa.toLowerCase().includes(q) ||
        c.puesto.toLowerCase().includes(q) ||
        (c.notas ?? "").toLowerCase().includes(q);

      // filtro tag
      const matchesTag = !tagFilter || (c.tecnologiasTags ?? []).includes(tagFilter);
      const hasReminder = (c.recordatorio ?? "").trim().length > 0;
      const matchesReminder = !onlyReminders || hasReminder;

      return matchesText && matchesTag && matchesReminder;
    })
    .slice() // copiamos antes de ordenar
    .sort((a, b) => {
      const da = a.fechaAplicacion || "";
      const db = b.fechaAplicacion || "";

      // ISO YYYY-MM-DD se puede comparar como string
      if (sortMode === "fecha_asc") return da.localeCompare(db);
      return db.localeCompare(da); // fecha_desc
    });

  const uniqueTags = Array.from(
    new Set(candidaturas.flatMap((c) => c.tecnologiasTags ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const totalCount = candidaturas.length;
  const filteredCount = filteredSorted.length;

  const withReminderCount = filteredSorted.filter((c) =>
    (c.recordatorio ?? "").trim()
  ).length;

  function daysUntil(iso?: string) {
    if (!iso) return Number.POSITIVE_INFINITY;
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = d.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  const upcoming7dCount = filteredSorted.filter(
    (c) => daysUntil(c.recordatorio) >= 0 && daysUntil(c.recordatorio) <= 7
  ).length;

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Job Tracker</h1>
          <p className="subtitle">Seguimiento de candidaturas</p>
        </div>

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
          <div
            style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
          >
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
              onChange={(e) => setSortMode(e.target.value as any)}
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
          </div>

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

        <div className="actions">
          <button
            className={`btn ${candidaturas.length === 0 ? "btn-primary" : "btn-disabled"}`}
            onClick={handleLoadExamples}
            disabled={candidaturas.length > 0}
            title={
              candidaturas.length > 0
                ? "Vacía la lista para cargar ejemplos"
                : "Cargar ejemplos"
            }
          >
            Cargar ejemplos
          </button>

          <button className="btn" onClick={handleClearAll}>
            Vaciar
          </button>

          <button className="btn btn-primary" onClick={openCreate}>
            + Nueva candidatura
          </button>
        </div>
      </header>

      <hr className="sep" />
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
          marginBottom: 12,
        }}
      >
        <div className="card">
          <div className="small">Total</div>
          <div style={{ fontSize: 22, fontWeight: 400 }}>{totalCount}</div>
        </div>

        <div className="card">
          <div className="small">Mostrando</div>
          <div style={{ fontSize: 22, fontWeight: 400 }}>{filteredCount}</div>
        </div>

        <div className="card">
          <div className="small">Con recordatorio</div>
          <div style={{ fontSize: 22, fontWeight: 400 }}>{withReminderCount}</div>
        </div>

        <div className="card">
          <div className="small">Próximos 7 días</div>
          <div style={{ fontSize: 22, fontWeight: 400 }}>{upcoming7dCount}</div>
        </div>
      </div>

      {candidaturas.length === 0 ? (
        <p style={{ margin: 0 }}>
          No hay candidaturas aún. Pulsa <strong>Cargar ejemplos</strong> o añade una
          nueva.
        </p>
      ) : filteredSorted.length === 0 ? (
        <p style={{ margin: 0 }}>
          No hay resultados para <strong>{query.trim()}</strong>.
        </p>
      ) : (
        <>
          {query.trim() ? (
            <p style={{ margin: "0 0 12px", opacity: 0.75, fontSize: 13 }}>
              Mostrando <strong>{filteredSorted.length}</strong> resultado(s) de{" "}
              <strong>{candidaturas.length}</strong>.
            </p>
          ) : null}

          <section className="grid">
            {filteredSorted.map((c) => (
              <article className="card" key={c.id}>
                <h2 className="card-title">{c.empresa}</h2>
                <div className="card-role">{c.puesto}</div>

                <div className="meta">
                  <div className="kv">
                    <strong>Aplicado:</strong> {formatISOToES(c.fechaAplicacion)}
                  </div>
                  <div className="kv">
                    <strong>Fuente:</strong> {c.fuente}
                  </div>
                  {c.enlaceOferta ? (
                    <div className="kv">
                      <a href={c.enlaceOferta} target="_blank" rel="noreferrer">
                        Ver oferta
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="meta">
                  <div className="kv">
                    <strong>Salario:</strong> {c.salario ?? "—"}
                  </div>
                  <div className="kv">
                    <strong>Recordatorio:</strong> {formatISOToES(c.recordatorio)}
                  </div>
                  <div className="kv">
                    <strong>Último contacto:</strong> {formatISOToES(c.ultimoContacto)}
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Tecnologías</div>
                  <div className="tags">
                    {c.tecnologiasTags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {c.tecnologiasNotas ? (
                    <div className="small" style={{ marginTop: 6 }}>
                      <em>{c.tecnologiasNotas}</em>
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <button className="btn" onClick={() => setSelected(c)}>
                    Ver detalles
                  </button>
                  <button className="btn" onClick={() => deleteCandidatura(c.id)}>
                    🗑️ Borrar
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {isCreateOpen ? (
        <div className="overlay" onClick={closeCreate}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {editingId ? "Editar candidatura" : "Nueva candidatura"}
                </h2>

                <p className="subtitle" style={{ marginTop: 6 }}>
                  Rellena los campos principales y los detalles de la oferta.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={closeCreate}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={saveCandidatura}>
                  {editingId ? "Guardar cambios" : "Guardar"}
                </button>
              </div>
            </div>

            <hr className="sep" />

            {error ? (
              <div
                style={{
                  border: "1px solid rgba(239,68,68,0.35)",
                  background: "rgba(239,68,68,0.08)",
                  padding: 10,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <strong style={{ fontSize: 13 }}>Error:</strong>{" "}
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              }}
            >
              {/* Columna izquierda */}
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Empresa *</span>
                  <input
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    placeholder="Ej: NovaSoft"
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Puesto *</span>
                  <input
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                    placeholder="Ej: Junior Full Stack (.NET + React)"
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      Fecha aplicación *
                    </span>
                    <input
                      type="date"
                      value={form.fechaAplicacion}
                      onChange={(e) =>
                        setForm({ ...form, fechaAplicacion: e.target.value })
                      }
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Fuente</span>
                    <select
                      value={form.fuente}
                      onChange={(e) =>
                        setForm({ ...form, fuente: e.target.value as any })
                      }
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <option>LinkedIn</option>
                      <option>InfoJobs</option>
                      <option>Web empresa</option>
                      <option>Recruiter</option>
                      <option>Otra</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Enlace oferta</span>
                  <input
                    value={form.enlaceOferta ?? ""}
                    onChange={(e) => setForm({ ...form, enlaceOferta: e.target.value })}
                    placeholder="https://..."
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Salario (texto libre)
                  </span>
                  <input
                    value={form.salario ?? ""}
                    onChange={(e) => setForm({ ...form, salario: e.target.value })}
                    placeholder="Ej: 25k–30k / según valía / no indicado"
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Último contacto</span>
                    <input
                      type="date"
                      value={form.ultimoContacto ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, ultimoContacto: e.target.value })
                      }
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Recordatorio</span>
                    <input
                      type="date"
                      value={form.recordatorio ?? ""}
                      onChange={(e) => setForm({ ...form, recordatorio: e.target.value })}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Columna derecha */}
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Tecnologías (tags, separadas por coma)
                  </span>
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ej: React, TypeScript, .NET, SQL"
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  />
                  <span className="small">
                    Las guardaremos como lista de tags para filtrar más adelante.
                  </span>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Tecnologías (notas)
                  </span>
                  <textarea
                    value={form.tecnologiasNotas ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, tecnologiasNotas: e.target.value })
                    }
                    placeholder="Ej: Plus Azure, Docker, CI/CD…"
                    rows={3}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Requisitos</span>
                  <textarea
                    value={form.requisitos}
                    onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                    placeholder="- React + TS\n- API REST\n- SQL\n- Git"
                    rows={5}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Qué ofrecían</span>
                  <textarea
                    value={form.ofrecian}
                    onChange={(e) => setForm({ ...form, ofrecian: e.target.value })}
                    placeholder="- Remoto/Híbrido\n- Formación\n- Jornada intensiva…"
                    rows={5}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Notas</span>
                  <textarea
                    value={form.notas ?? ""}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Ej: me llamaron, quedaron en responder, sensaciones…"
                    rows={4}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL */}
      {selected ? (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {selected.empresa} —{" "}
                  <span style={{ fontWeight: 500 }}>{selected.puesto}</span>
                </h2>
                <p className="subtitle" style={{ marginTop: 6 }}>
                  Aplicado: <strong>{formatISOToES(selected.fechaAplicacion)}</strong> ·
                  Fuente: <strong>{selected.fuente}</strong>
                  {selected.enlaceOferta ? (
                    <>
                      {" "}
                      ·{" "}
                      <a href={selected.enlaceOferta} target="_blank" rel="noreferrer">
                        Ver oferta
                      </a>
                    </>
                  ) : null}
                </p>
              </div>

              <button className="btn" onClick={() => setSelected(null)}>
                Cerrar
              </button>
              <button className="btn" onClick={() => openEdit(selected)}>
                ✏️ Editar
              </button>
            </div>

            <hr className="sep" />

            <div style={{ display: "grid", gap: 12 }}>
              <div className="meta" style={{ marginTop: 0 }}>
                <div className="kv">
                  <strong>Salario:</strong> {selected.salario ?? "—"}
                </div>
                <div className="kv">
                  <strong>Recordatorio:</strong> {formatISOToES(selected.recordatorio)}
                </div>
                <div className="kv">
                  <strong>Último contacto:</strong>{" "}
                  {formatISOToES(selected.ultimoContacto)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Tecnologías</div>
                <div className="tags" style={{ marginTop: 8 }}>
                  {selected.tecnologiasTags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                {selected.tecnologiasNotas ? (
                  <div className="small" style={{ marginTop: 6 }}>
                    <em>{selected.tecnologiasNotas}</em>
                  </div>
                ) : null}
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Requisitos</div>
                <pre
                  style={{
                    margin: "8px 0 0",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    opacity: 0.9,
                  }}
                >
                  {selected.requisitos}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Qué ofrecían</div>
                <pre
                  style={{
                    margin: "8px 0 0",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    opacity: 0.9,
                  }}
                >
                  {selected.ofrecian}
                </pre>
              </div>

              {selected.notas ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Notas</div>
                  <p style={{ margin: "8px 0 0", opacity: 0.9 }}>{selected.notas}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {undoSeconds > 0 ? (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "var(--shadow)",
              display: "flex",
              gap: 12,
              alignItems: "center",
              maxWidth: 680,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 13 }}>
              {undoMode === "delete"
                ? "Candidatura borrada."
                : "Candidaturas borradas."}{" "}
            </div>

            <button className="btn btn-primary" onClick={undoAction}>
              <div style={{ fontSize: 13 }}>
                <span style={{ opacity: 1 }}>Deshacer disponible {undoSeconds}s</span>
              </div>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
