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
    <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Job Tracker</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
            Seguimiento de candidaturas (sin inventarse estados cuando no hay
            respuesta).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleLoadExamples}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            Cargar ejemplos
          </button>

          <button
            onClick={handleClearAll}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            Vaciar
          </button>

          <button
            disabled
            style={{
              padding: "8px 12px",
              cursor: "not-allowed",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f0f0f0",
              opacity: 0.8,
            }}
          >
            + Nueva candidatura (próximo)
          </button>
        </div>
      </header>

      {candidaturas.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14 }}>
          No hay candidaturas aún. Pulsa <strong>Cargar ejemplos</strong> o añade
          una nueva (próximo paso).
        </p>
      ) : (
        <section
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(4, minmax(240px, 1fr))",
            alignItems: "start",
          }}
        >
          {candidaturas.map((c) => (
            <article
              key={c.id}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 14,
                padding: 10,
                background: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, lineHeight: 1.2 }}>
                    {c.empresa}
                  </h2>
                  <div style={{ marginTop: 2, fontSize: 13, opacity: 0.85 }}>
                    {c.puesto}
                  </div>
                </div>

                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  <div>
                    <strong>Aplicado:</strong> {formatISOToES(c.fechaAplicacion)}
                  </div>
                  <div>
                    <strong>Fuente:</strong> {c.fuente}
                  </div>
                  {c.enlaceOferta ? (
                    <div>
                      <a
                        href={c.enlaceOferta}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver oferta
                      </a>
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ opacity: 0.75 }}>Salario:</span>{" "}
                    <strong>{c.salario ?? "—"}</strong>
                  </div>

                  <div style={{ fontSize: 12 }}>
                    <span style={{ opacity: 0.75 }}>Recordatorio:</span>{" "}
                    <strong>{formatISOToES(c.recordatorio)}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Tecnologías</div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {c.tecnologiasTags.map((t) => (
                      <span
                        key={t}
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 999,
                          padding: "3px 8px",
                          fontSize: 12,
                          background: "#fafafa",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {c.tecnologiasNotas ? (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                      <em>{c.tecnologiasNotas}</em>
                    </div>
                  ) : null}
                </div>

                <details style={{ fontSize: 12 }}>
                  <summary style={{ cursor: "pointer" }}>
                    Ver requisitos / ofrecían / notas
                  </summary>

                  <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>Requisitos</div>
                      <pre
                        style={{
                          margin: "6px 0 0",
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          opacity: 0.9,
                        }}
                      >
                        {c.requisitos}
                      </pre>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700 }}>Qué ofrecían</div>
                      <pre
                        style={{
                          margin: "6px 0 0",
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          opacity: 0.9,
                        }}
                      >
                        {c.ofrecian}
                      </pre>
                    </div>

                    {c.notas ? (
                      <div>
                        <div style={{ fontWeight: 700 }}>Notas</div>
                        <div style={{ marginTop: 6, opacity: 0.9 }}>{c.notas}</div>
                      </div>
                    ) : null}

                    <div style={{ opacity: 0.85 }}>
                      <span>Último contacto:</span>{" "}
                      <strong>{formatISOToES(c.ultimoContacto)}</strong>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}




