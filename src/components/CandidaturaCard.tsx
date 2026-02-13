import type { Candidatura } from "../types/candidatura";
import { formatISOToES, reminderLabel } from "../utils/dates";

type Props = {
  c: Candidatura;
  onDetails: (c: Candidatura) => void;
  onDelete: (id: string) => void;
};

export function CandidaturaCard({ c, onDetails, onDelete }: Props) {
  const badge = reminderLabel(c.recordatorio);

  return (
    <article className="card">
      <h2 className="card-title">{c.empresa}</h2>
      <div className="card-role">{c.puesto}</div>

      {badge ? (
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "rgba(17, 24, 39, 0.03)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        </div>
      ) : null}

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
        <button className="btn" onClick={() => onDetails(c)}>
          Ver detalles
        </button>
        <button className="btn" onClick={() => onDelete(c.id)}>
          🗑️ Borrar
        </button>
      </div>
    </article>
  );
}
