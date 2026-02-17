type Props = {
  undoSeconds: number;
  undoMode: "clear" | "delete" | null;
  onUndo: () => void;
};

export function UndoToast({ undoSeconds, undoMode, onUndo }: Props) {
  if (undoSeconds <= 0 || !undoMode) return null;

  return (
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
          {undoMode === "clear" ? "Candidaturas borradas." : "Candidatura borrada."}{" "}
          <span style={{ opacity: 0.7 }}>Deshacer disponible {undoSeconds}s</span>
        </div>

        <button className="btn btn-primary" onClick={onUndo}>
          Deshacer
        </button>
      </div>
    </div>
  );
}
