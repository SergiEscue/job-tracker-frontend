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

  useEffect(() => {
    saveCandidaturas(candidaturas);
  }, [candidaturas]);

  function handleLoadExamples() {
    setCandidaturas(mockCandidaturas);
  }

  function handleClearAll() {
    clearCandidaturas();
    setCandidaturas([]);
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
          <button className="btn btn-primary" onClick={handleLoadExamples}>
            Cargar ejemplos
          </button>

          <button className="btn" onClick={handleClearAll}>
            Vaciar
          </button>

          <button className="btn btn-disabled" disabled>
            + Nueva candidatura (próximo)
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
              </div>
            </article>
          ))}
        </section>
      )}

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
    </div>
  );

}








