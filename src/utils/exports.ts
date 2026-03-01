// src/utils/exports.ts
import type { Candidatura } from "../types/candidatura";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * CSV Excel-friendly:
 * - Separador ';' (típico en ES)
 * - BOM UTF-8 para que Excel respete acentos
 */
function escapeCsvCell(value: string) {
  const needsQuotes = /[;"\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function exportCandidaturasToCSV(
  items: Candidatura[],
  opts?: { filename?: string }
) {
  const filename =
    opts?.filename ?? `job-tracker_${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    "ID",
    "Empresa",
    "Puesto",
    "Fecha aplicación",
    "Fuente",
    "Enlace oferta",
    "Salario",
    "Tecnologías (tags)",
    "Tecnologías (notas)",
    "Requisitos",
    "Qué ofrecían",
    "Último contacto",
    "Recordatorio",
    "Notas",
  ];

  const rows = items.map((c) => {
    const tags = (c.tecnologiasTags ?? []).join(", ");
    return [
      c.id ?? "",
      c.empresa ?? "",
      c.puesto ?? "",
      c.fechaAplicacion ?? "",
      c.fuente ?? "",
      c.enlaceOferta ?? "",
      c.salario ?? "",
      tags,
      c.tecnologiasNotas ?? "",
      c.requisitos ?? "",
      c.ofrecian ?? "",
      c.ultimoContacto ?? "",
      c.recordatorio ?? "",
      c.notas ?? "",
    ].map((v) => escapeCsvCell(String(v)));
  });

  // BOM + contenido
  const content =
    "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  downloadBlob(filename, blob);
}

export function exportCandidaturasToJSON(
  items: Candidatura[],
  opts?: { filename?: string }
) {
  const filename =
    opts?.filename ?? `job-tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;

  const content = JSON.stringify(
    {
      schema: "job-tracker:candidaturas@1",
      exportedAt: new Date().toISOString(),
      items,
    },
    null,
    2
  );

  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  downloadBlob(filename, blob);
}

/**
 * Import robusto:
 * - Acepta JSON con { items: [...] } o directamente [...]
 * - Normaliza campos opcionales y valida mínimos
 */
export function parseCandidaturasJSON(rawText: string): Candidatura[] {
  const parsed = JSON.parse(rawText) as unknown;

  const items = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" &&
        parsed !== null &&
        Array.isArray((parsed as any).items)
      ? (parsed as any).items
      : [];

  if (!Array.isArray(items)) return [];

  const out: Candidatura[] = [];

  for (const it of items) {
    if (!it || typeof it !== "object") continue;

    const obj = it as any;

    // mínimos
    if (
      typeof obj.id !== "string" ||
      typeof obj.empresa !== "string" ||
      typeof obj.puesto !== "string" ||
      typeof obj.fechaAplicacion !== "string" ||
      typeof obj.fuente !== "string" ||
      typeof obj.requisitos !== "string" ||
      typeof obj.ofrecian !== "string" ||
      !Array.isArray(obj.tecnologiasTags)
    ) {
      continue;
    }

    out.push({
      id: obj.id,
      empresa: obj.empresa,
      puesto: obj.puesto,
      fechaAplicacion: obj.fechaAplicacion,
      fuente: obj.fuente,
      enlaceOferta: typeof obj.enlaceOferta === "string" ? obj.enlaceOferta : undefined,
      requisitos: obj.requisitos,
      ofrecian: obj.ofrecian,
      tecnologiasTags: obj.tecnologiasTags.filter((x: any) => typeof x === "string"),
      tecnologiasNotas:
        typeof obj.tecnologiasNotas === "string" ? obj.tecnologiasNotas : undefined,
      salario: typeof obj.salario === "string" ? obj.salario : undefined,
      notas: typeof obj.notas === "string" ? obj.notas : undefined,
      ultimoContacto:
        typeof obj.ultimoContacto === "string" ? obj.ultimoContacto : undefined,
      recordatorio: typeof obj.recordatorio === "string" ? obj.recordatorio : undefined,
    });
  }

  return out;
}
