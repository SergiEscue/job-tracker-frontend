import { useEffect, useState } from "react";
import type { Candidatura } from "./types/candidatura";
import { mockCandidaturas } from "./services/mockCandidaturas";
import {
  clearCandidaturas,
  loadCandidaturas,
  saveCandidaturas,
} from "./services/storageCandidaturas";

import { daysUntil, formatISOToES, reminderLabel } from "./utils/dates";
import { applyFiltersAndSort, type SortMode } from "./utils/filters";
import { CandidaturaCard } from "./components/CandidaturaCard";
import { StatsBar } from "./components/StatsBar";
import { HeaderControls } from "./components/HeaderControls";
import { UndoToast } from "./components/UndoToast";
import { DetailsModal } from "./components/DetailsModal";
import { FormModal } from "./components/FormModal";

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
  const [sortMode, setSortMode] = useState<SortMode>("fecha_desc");

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

  const { sorted: filteredSorted } = applyFiltersAndSort({
    candidaturas,
    query,
    tagFilter,
    onlyReminders,
    sortMode,
  });

  const uniqueTags = Array.from(
    new Set(candidaturas.flatMap((c) => c.tecnologiasTags ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const totalCount = candidaturas.length;
  const filteredCount = filteredSorted.length;

  const withReminderCount = filteredSorted.filter(
    (c) => (c.recordatorio ?? "").trim().length > 0
  ).length;

  const upcoming7dCount = filteredSorted.filter((c) => {
    const days = daysUntil(c.recordatorio);
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="container">
      <HeaderControls
        query={query}
        setQuery={setQuery}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        uniqueTags={uniqueTags}
        sortMode={sortMode}
        setSortMode={setSortMode}
        onlyReminders={onlyReminders}
        setOnlyReminders={setOnlyReminders}
        onCreate={openCreate}
        onLoadExamples={handleLoadExamples}
        onClearAll={handleClearAll}
        //onExportCSV={exportToCSV}
        disableLoadExamples={candidaturas.length > 0}
        disableExport={filteredSorted.length === 0}
      />

      <hr className="sep" />
      <StatsBar
        totalCount={totalCount}
        filteredCount={filteredCount}
        withReminderCount={withReminderCount}
        upcoming7dCount={upcoming7dCount}
      />

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
              <CandidaturaCard
                key={c.id}
                c={c}
                onDetails={setSelected}
                onDelete={deleteCandidatura}
              />
            ))}
          </section>
        </>
      )}

      <FormModal
        isOpen={isCreateOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        tagsInput={tagsInput}
        setTagsInput={setTagsInput}
        error={error}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingId(null);
        }}
        onSave={saveCandidatura}
      />

      {/* MODAL */}
      {selected ? (
        <DetailsModal
          selected={selected}
          onClose={() => setSelected(null)}
          onEdit={openEdit}
          onDelete={deleteCandidatura}
        />
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
            <UndoToast
              undoSeconds={undoSeconds}
              undoMode={undoMode}
              onUndo={undoAction}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
