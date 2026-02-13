export function formatISOToES(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function daysUntil(iso?: string) {
  if (!iso) return Number.POSITIVE_INFINITY;

  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = d.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function reminderLabel(iso?: string) {
  const days = daysUntil(iso);
  if (days === 0) return "🔥 Hoy";
  if (days === 1) return "⏰ Mañana";
  if (days >= 2 && days <= 7) return "📌 Próximo";
  return null;
}
