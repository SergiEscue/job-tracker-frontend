type Props = {
  totalCount: number;
  filteredCount: number;
  withReminderCount: number;
  upcoming7dCount: number;
};

export function StatsBar({
  totalCount,
  filteredCount,
  withReminderCount,
  upcoming7dCount,
}: Props) {
  return (
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
        <div style={{ fontSize: 22, fontWeight: 800 }}>{totalCount}</div>
      </div>

      <div className="card">
        <div className="small">Mostrando</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{filteredCount}</div>
      </div>

      <div className="card">
        <div className="small">Con recordatorio</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{withReminderCount}</div>
      </div>

      <div className="card">
        <div className="small">Próximos 7 días</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{upcoming7dCount}</div>
      </div>
    </div>
  );
}
