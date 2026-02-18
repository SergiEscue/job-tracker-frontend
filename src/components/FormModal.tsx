import type { Candidatura } from "../types/candidatura";

type FormState = Omit<Candidatura, "id">;

type Props = {
  isOpen: boolean;
  editingId: string | null;

  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;

  tagsInput: string;
  setTagsInput: (v: string) => void;

  error: string | null;

  onClose: () => void;
  onSave: () => void;
};

export function FormModal({
  isOpen,
  editingId,
  form,
  setForm,
  tagsInput,
  setTagsInput,
  error,
  onClose,
  onSave,
}: Props) {
  if (!isOpen) return null;

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
          <h2 style={{ margin: 0, fontSize: 18 }}>
            {editingId ? "Editar candidatura" : "Nueva candidatura"}
          </h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={onSave}>
              {editingId ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </div>

        {error ? (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "rgba(239, 68, 68, 0.06)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <hr className="sep" />

        {/* Form */}
        <div className="form-shell">
          <div className="form-section">
            <p className="form-section-title">Datos básicos</p>

            <div className="form-grid-2">
              <label className="form-field">
                <span className="form-label">Empresa *</span>
                <input
                  className="form-input"
                  value={form.empresa}
                  onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}
                  placeholder="Ej: NovaSoft"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Puesto *</span>
                <input
                  className="form-input"
                  value={form.puesto}
                  onChange={(e) => setForm((p) => ({ ...p, puesto: e.target.value }))}
                  placeholder="Ej: Frontend React"
                />
              </label>
            </div>

            <div className="form-grid-3" style={{ marginTop: 12 }}>
              <label className="form-field">
                <span className="form-label">Fecha aplicación *</span>
                <input
                  className="form-input"
                  type="date"
                  value={form.fechaAplicacion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fechaAplicacion: e.target.value }))
                  }
                />
              </label>

              <label className="form-field">
                <span className="form-label">Fuente</span>
                <select
                  className="form-select"
                  value={form.fuente}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fuente: e.target.value as any }))
                  }
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="InfoJobs">InfoJobs</option>
                  <option value="Web empresa">Web empresa</option>
                  <option value="Referido">Referido</option>
                  <option value="Otra">Otra</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">Enlace oferta</span>
                <input
                  className="form-input"
                  value={form.enlaceOferta ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, enlaceOferta: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-title">Oferta</p>

            <div className="form-grid-2">
              <label className="form-field">
                <span className="form-label">Salario</span>
                <input
                  className="form-input"
                  value={form.salario ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, salario: e.target.value }))}
                  placeholder="Ej: 30k–40k / según valía"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Tecnologías (tags)</span>
                <input
                  className="form-input"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ej: React, TypeScript, .NET"
                />
                <span className="form-hint">Separadas por coma.</span>
              </label>
            </div>

            <label className="form-field" style={{ marginTop: 12 }}>
              <span className="form-label">Notas tecnologías</span>
              <textarea
                className="form-textarea"
                value={form.tecnologiasNotas ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tecnologiasNotas: e.target.value }))
                }
                rows={2}
                placeholder="Ej: pedían Redux, testing, etc."
              />
            </label>

            <label className="form-field" style={{ marginTop: 12 }}>
              <span className="form-label">Requisitos</span>
              <textarea
                className="form-textarea"
                value={form.requisitos ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, requisitos: e.target.value }))}
                rows={3}
                placeholder="Copia aquí requisitos de la oferta…"
              />
            </label>

            <label className="form-field" style={{ marginTop: 12 }}>
              <span className="form-label">Qué ofrecían</span>
              <textarea
                className="form-textarea"
                value={form.ofrecian ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, ofrecian: e.target.value }))}
                rows={3}
                placeholder="Beneficios, horario, modalidad…"
              />
            </label>
          </div>

          <div className="form-section">
            <p className="form-section-title">Seguimiento</p>

            <div className="form-grid-2">
              <label className="form-field">
                <span className="form-label">Último contacto</span>
                <input
                  className="form-input"
                  type="date"
                  value={form.ultimoContacto ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ultimoContacto: e.target.value }))
                  }
                />
              </label>

              <label className="form-field">
                <span className="form-label">Recordatorio</span>
                <input
                  className="form-input"
                  type="date"
                  value={form.recordatorio ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recordatorio: e.target.value }))
                  }
                />
              </label>
            </div>

            <label className="form-field" style={{ marginTop: 12 }}>
              <span className="form-label">Notas</span>
              <textarea
                className="form-textarea"
                value={form.notas ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                rows={3}
                placeholder="Seguimiento, impresiones, próximos pasos…"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
