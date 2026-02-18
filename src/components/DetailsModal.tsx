import type { Candidatura } from "../types/candidatura";
import { formatISOToES } from "../utils/dates";

type Props = {
  selected: Candidatura;
  onClose: () => void;
  onEdit: (c: Candidatura) => void;
  onDelete: (id: string) => void;
};

export function DetailsModal({ selected, onClose, onEdit, onDelete }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              {selected.empresa} — {selected.puesto}
            </h2>
            <p className="subtitle" style={{ marginTop: 6 }}>
              Aplicado: {formatISOToES(selected.fechaAplicacion)} · Fuente:{" "}
              {selected.fuente}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onEdit(selected)}>
              ✏️ Editar
            </button>
            <button className="btn" onClick={() => onDelete(selected.id)}>
              🗑️ Borrar
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <hr className="sep" />

        <div style={{ display: "grid", gap: 10 }}>
          {selected.enlaceOferta ? (
            <div className="kv">
              <strong>Enlace oferta:</strong>{" "}
              <a href={selected.enlaceOferta} target="_blank" rel="noreferrer">
                Abrir
              </a>
            </div>
          ) : null}

          <div className="kv">
            <strong>Salario:</strong> {selected.salario ?? "—"}
          </div>

          <div className="kv">
            <strong>Último contacto:</strong> {formatISOToES(selected.ultimoContacto)}
          </div>

          <div className="kv">
            <strong>Recordatorio:</strong> {formatISOToES(selected.recordatorio)}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Tecnologías</div>
            <div className="tags">
              {(selected.tecnologiasTags ?? []).map((t) => (
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

          {selected.requisitos ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Requisitos</div>
              <div className="box">{selected.requisitos}</div>
            </div>
          ) : null}

          {selected.ofrecian ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Qué ofrecían</div>
              <div className="box">{selected.ofrecian}</div>
            </div>
          ) : null}

          {selected.notas ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Notas</div>
              <div className="box">{selected.notas}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
