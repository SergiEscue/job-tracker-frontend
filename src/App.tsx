// src/App.tsx

import { mockCandidaturas } from "./services/mockCandidaturas";
import type { Candidatura } from "./types/candidatura";

// Función helper para convertir "YYYY-MM-DD" a "DD/MM/YYYY"
// Si no hay fecha, devolvemos "—"
function formatISOToES(iso?: string) {
  if (!iso) return "—";

  // Separamos por "-" y reordenamos
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso; // por si viene raro, lo mostramos tal cual

  return `${d}/${m}/${y}`;
}

export default function App() {
  return (
    // Contenedor principal: centrado, ancho máximo, padding
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" }}>
      
      {/* CABECERA: título + descripción + botón */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Job Tracker</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
            Seguimiento de candidaturas (en español, realista y sin inventarse estados).
          </p>
        </div>

        {/* Botón todavía no hace nada; más adelante abrirá un formulario */}
        <button style={{ padding: "10px 14px", cursor: "pointer" }}>
          + Nueva candidatura
        </button>
      </header>

      <hr style={{ margin: "16px 0" }} />

      {/* LISTA: aquí pintamos todas las candidaturas */}
      <section style={{ display: "grid", gap: 12 }}>
        
        {/* map() recorre el array y devuelve un <article> por cada candidatura */}
        {mockCandidaturas.map((c: Candidatura) => (
          <article
            key={c.id} // key obligatorio en listas para que React optimice el render
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 14,
              background: "white",
            }}
          >
            {/* FILA SUPERIOR: empresa/puesto + info derecha (salario/recordatorio) */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {c.empresa} — <span style={{ fontWeight: 500 }}>{c.puesto}</span>
                </h2>

                {/* Línea secundaria con fecha, fuente y link si existe */}
                <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
                  Aplicado: <strong>{formatISOToES(c.fechaAplicacion)}</strong> · Fuente: <strong>{c.fuente}</strong>

                  {/* Render condicional: si hay enlaceOferta, mostramos el link */}
                  {c.enlaceOferta ? (
                    <>
                      {" "}·{" "}
                      <a href={c.enlaceOferta} target="_blank" rel="noreferrer">
                        Ver oferta
                      </a>
                    </>
                  ) : null}
                </p>
              </div>

              {/* Columna derecha: salario + recordatorio */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14 }}>
                  <span style={{ opacity: 0.8 }}>Salario:</span> <strong>{c.salario ?? "—"}</strong>
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  <span style={{ opacity: 0.8 }}>Recordatorio:</span> <strong>{formatISOToES(c.recordatorio)}</strong>
                </div>
              </div>
            </div>

            {/* CUERPO: requisitos, ofrecían, tecnologías, notas, último contacto */}
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <strong>Requisitos</strong>

                {/* pre para respetar saltos de línea del texto */}
                <pre style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", fontFamily: "inherit", opacity: 0.9 }}>
                  {c.requisitos}
                </pre>
              </div>

              <div>
                <strong>Qué ofrecían</strong>
                <pre style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", fontFamily: "inherit", opacity: 0.9 }}>
                  {c.ofrecian}
                </pre>
              </div>

              <div>
                <strong>Tecnologías</strong>

                {/* Tags: recorremos tecnologiasTags y pintamos una “píldora” por tag */}
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.tecnologiasTags.map((t: string) => (
                    <span
                      key={t}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 13,
                        background: "#f7f7f7",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Texto extra de tecnologías: solo si existe */}
                {c.tecnologiasNotas ? (
                  <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
                    <em>{c.tecnologiasNotas}</em>
                  </p>
                ) : null}
              </div>

              {/* Notas: solo si hay */}
              {c.notas ? (
                <div>
                  <strong>Notas</strong>
                  <p style={{ margin: "6px 0 0", opacity: 0.9 }}>{c.notas}</p>
                </div>
              ) : null}

              {/* Último contacto: siempre mostramos, pero si no hay fecha -> "—" */}
              <div style={{ fontSize: 14, opacity: 0.85 }}>
                <span>Último contacto:</span> <strong>{formatISOToES(c.ultimoContacto)}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}


