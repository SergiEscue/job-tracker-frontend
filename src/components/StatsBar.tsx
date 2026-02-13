type Props = {
  totalCount: number;
  filteredCount: number;
  withReminderCount: number;
  upcoming7dCount: number;
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="small">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

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
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 12,
      }}
    >
      <StatCard label="Total" value={totalCount} />
      <StatCard label="Mostrando" value={filteredCount} />
      <StatCard label="Con recordatorio" value={withReminderCount} />
      <StatCard label="Próximos 7 días" value={upcoming7dCount} />
    </div>
  );
}
