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
  }

  function closeCreate() {
    setIsCreateOpen(false);
  }

  function saveNewCandidatura() {
    // Validación mínima
    if (!form.empresa.trim()) return setError("La empresa es obligatoria.");
    if (!form.puesto.trim()) return setError("El puesto es obligatorio.");
    if (!form.fechaAplicacion.trim())
      return setError("La fecha de aplicación es obligatoria.");

    const tags = form.tecnologiasTags.length
      ? form.tecnologiasTags
      : normalizeTags(tagsInput);

    const nueva: Candidatura = {
      id: crypto.randomUUID(), // moderno y simple
      ...form,
      tecnologiasTags: tags,
      // Normalizamos strings vacíos a undefined opcionalmente (no es obligatorio)
      enlaceOferta: form.enlaceOferta?.trim() || undefined,
      tecnologiasNotas: form.tecnologiasNotas?.trim() || undefined,
      salario: form.salario?.trim() || undefined,
      notas: form.notas?.trim() || undefined,
      ultimoContacto: form.ultimoContacto?.trim() || undefined,
      recordatorio: form.recordatorio?.trim() || undefined,
    };

    // Añadimos arriba del todo (más reciente primero)
    setCandidaturas((prev) => [nueva, ...prev]);

    // Cerramos modal y listo
    setIsCreateOpen(false);
  }



  return (

    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Job Tracker</h1>
          <p className="subtitle">
            Seguimiento de candidaturas (realista y sin inventarse estados cuando
            no hay respuesta).
          </p>
        </div>

        <div className="actions">
          <button
            className={`btn ${candidaturas.length === 0 ? "btn-primary" : "btn-disabled"}`}
            onClick={handleLoadExamples}
            disabled={candidaturas.length > 0}
            title={candidaturas.length > 0 ? "Vacía la lista para cargar ejemplos" : "Cargar ejemplos"}
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

      {candidaturas.length === 0 ? (
        <p style={{ margin: 0 }}>
          No hay candidaturas aún. Pulsa <strong>Cargar ejemplos</strong> o añade
          una nueva (próximo paso).
        </p>
      ) : (
        <section className="grid">
          {candidaturas.map((c) => (
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
                  <strong>Recordatorio:</strong>{" "}
                  {formatISOToES(c.recordatorio)}
                </div>
                <div className="kv">
                  <strong>Último contacto:</strong>{" "}
                  {formatISOToES(c.ultimoContacto)}
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
                <h2 style={{ margin: 0, fontSize: 18 }}>Nueva candidatura</h2>
                <p className="subtitle" style={{ marginTop: 6 }}>
                  Rellena los campos principales y los detalles de la oferta.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={closeCreate}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={saveNewCandidatura}>
                  Guardar
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
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Puesto *</span>
                  <input
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                    placeholder="Ej: Junior Full Stack (.NET + React)"
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                </label>

                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Fecha aplicación *</span>
                    <input
                      type="date"
                      value={form.fechaAplicacion}
                      onChange={(e) => setForm({ ...form, fechaAplicacion: e.target.value })}
                      style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Fuente</span>
                    <select
                      value={form.fuente}
                      onChange={(e) => setForm({ ...form, fuente: e.target.value as any })}
                      style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
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
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Salario (texto libre)</span>
                  <input
                    value={form.salario ?? ""}
                    onChange={(e) => setForm({ ...form, salario: e.target.value })}
                    placeholder="Ej: 25k–30k / según valía / no indicado"
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                </label>

                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Último contacto</span>
                    <input
                      type="date"
                      value={form.ultimoContacto ?? ""}
                      onChange={(e) => setForm({ ...form, ultimoContacto: e.target.value })}
                      style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Recordatorio</span>
                    <input
                      type="date"
                      value={form.recordatorio ?? ""}
                      onChange={(e) => setForm({ ...form, recordatorio: e.target.value })}
                      style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
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
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                  <span className="small">
                    Las guardaremos como lista de tags para filtrar más adelante.
                  </span>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Tecnologías (notas)</span>
                  <textarea
                    value={form.tecnologiasNotas ?? ""}
                    onChange={(e) => setForm({ ...form, tecnologiasNotas: e.target.value })}
                    placeholder="Ej: Plus Azure, Docker, CI/CD…"
                    rows={3}
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)", resize: "vertical" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Requisitos</span>
                  <textarea
                    value={form.requisitos}
                    onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                    placeholder="- React + TS\n- API REST\n- SQL\n- Git"
                    rows={5}
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)", resize: "vertical" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Qué ofrecían</span>
                  <textarea
                    value={form.ofrecian}
                    onChange={(e) => setForm({ ...form, ofrecian: e.target.value })}
                    placeholder="- Remoto/Híbrido\n- Formación\n- Jornada intensiva…"
                    rows={5}
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)", resize: "vertical" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Notas</span>
                  <textarea
                    value={form.notas ?? ""}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Ej: me llamaron, quedaron en responder, sensaciones…"
                    rows={4}
                    style={{ padding: 10, borderRadius: 12, border: "1px solid var(--border)", resize: "vertical" }}
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
                  Aplicado:{" "}
                  <strong>{formatISOToES(selected.fechaAplicacion)}</strong> ·
                  Fuente: <strong>{selected.fuente}</strong>
                  {selected.enlaceOferta ? (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={selected.enlaceOferta}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver oferta
                      </a>
                    </>
                  ) : null}
                </p>
              </div>

              <button className="btn" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>

            <hr className="sep" />

            <div style={{ display: "grid", gap: 12 }}>
              <div className="meta" style={{ marginTop: 0 }}>
                <div className="kv">
                  <strong>Salario:</strong> {selected.salario ?? "—"}
                </div>
                <div className="kv">
                  <strong>Recordatorio:</strong>{" "}
                  {formatISOToES(selected.recordatorio)}
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
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Qué ofrecían
                </div>
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
                  <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
                    {selected.notas}
                  </p>
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
              {undoMode === "delete" ? "Candidatura borrada." : "Candidaturas borradas."}{" "}
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








